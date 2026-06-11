from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt

from sklearn.base import clone
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    classification_report, accuracy_score,
    confusion_matrix, ConfusionMatrixDisplay,
    roc_curve, auc
)
from xgboost import XGBClassifier


# ========================
# 1. Load dataset
# ========================
def load_dataset(path: str) -> pd.DataFrame:
    file_path = Path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"Dataset not found: {file_path}")

    df = pd.read_csv(file_path)
    df.columns = [col.strip() for col in df.columns]

    if "label" not in df.columns:
        raise ValueError("Dataset phải có cột 'label'")

    # --- Loại recency columns nếu còn sót trong dataset ---
    recency_cols = ["recency_recent", "recency_moderate", "recency_inactive"]
    df = df.drop(columns=[c for c in recency_cols if c in df.columns])

    # --- Lọc last_donation_days < 56 (chưa đủ thời gian hiến lại) ---
    # NOTE: weight < 45 KHÔNG lọc ở đây — đó là business rule,
    # nên được validate ở service layer (NestJS) trước khi gọi model.
    if "last_donation_days" in df.columns:
        df = df[df["last_donation_days"] >= 56].copy()

    # --- Encode gender ---
    if "gender" in df.columns:
        gender_dummies = pd.get_dummies(df["gender"], prefix="gender")
        for col in ["gender_Female", "gender_Male", "gender_Other"]:
            if col not in gender_dummies.columns:
                gender_dummies[col] = False
        df = pd.concat([df.drop(columns=["gender"]), gender_dummies], axis=1)

    # --- Convert numeric ---
    feature_cols = [col for col in df.columns if col != "label"]
    df[feature_cols] = df[feature_cols].apply(pd.to_numeric, errors="coerce")
    df["label"] = pd.to_numeric(df["label"], errors="coerce")

    df = df.dropna().reset_index(drop=True)
    df["label"] = df["label"].astype(int)

    return df


# ========================
# MAIN
# ========================
def main():
    data = load_dataset("donor_dataset.csv")

    print("\n=== Data sample ===")
    print(data.head())
    print("\nColumns:", list(data.columns))
    print("Shape  :", data.shape)
    print("Label dist:", data["label"].value_counts().to_dict())

    # Tính mean age từ dataset để dùng làm giá trị mặc định khi thiếu dữ liệu
    age_default = int(round(data["age"].mean())) if "age" in data.columns else 30
    print(f"\nAge default (mean): {age_default}")

    feature_cols = [col for col in data.columns if col != "label"]
    X = data[feature_cols]
    y = data["label"]

    neg_count = (y == 0).sum()
    pos_count = (y == 1).sum()
    ratio = neg_count / pos_count
    print(f"\nClass ratio (0:1): {ratio:.4f}")
    # scale_pos_weight bị bỏ: ratio 1.75:1 là mất cân bằng nhẹ,
    # dùng scale_pos_weight sẽ làm giảm precision class 1 không cần thiết.

    # Split — test set tách ra trước, không dùng trong CV
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ========================
    # Cross-Validation (chạy TRƯỚC khi fit final, chỉ trên train set)
    # ========================
    print("\n=== Cross-Validation (5-fold, chỉ trên X_train) ===")
    cv_model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1
    )
    cv_scores = cross_val_score(cv_model, X_train, y_train, cv=5, scoring="roc_auc")
    print(f"AUC mỗi fold : {np.round(cv_scores, 4)}")
    print(f"AUC trung bình: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # ========================
    # Train final model trên toàn bộ X_train
    # ========================
    model = clone(cv_model)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    # ========================
    # Evaluation
    # ========================
    print("\n=== Model Evaluation (XGBoost) ===")
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print(classification_report(y_test, y_pred))

    # --- 1. Confusion Matrix ---
    print("\n=== Confusion Matrix ===")
    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=["Không donate (0)", "Donate (1)"]
    )
    fig, ax = plt.subplots(figsize=(6, 5))
    disp.plot(ax=ax, colorbar=False, cmap="Blues")
    ax.set_title("Confusion Matrix — XGBoost")
    plt.tight_layout()
    plt.savefig("confusion_matrix.png", dpi=150)
    plt.close()
    print(cm)
    print("(Đã lưu: confusion_matrix.png)")

    # --- 2. ROC Curve + AUC ---
    print("\n=== ROC Curve & AUC ===")
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)

    fig, ax = plt.subplots(figsize=(6, 5))
    ax.plot(fpr, tpr, color="steelblue", lw=2, label=f"ROC curve (AUC = {roc_auc:.3f})")
    ax.plot([0, 1], [0, 1], color="gray", linestyle="--", lw=1, label="Random baseline")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curve — XGBoost")
    ax.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig("roc_curve.png", dpi=150)
    plt.close()
    print(f"AUC Score: {roc_auc:.4f}")
    print("(Đã lưu: roc_curve.png)")

    # --- 3. Feature Importance ---
    print("\n=== Feature Importance ===")
    feat_series = pd.Series(model.feature_importances_, index=feature_cols)
    for name, imp in feat_series.sort_values(ascending=False).items():
        print(f"{name:<30}: {imp:.4f}")

    fig, ax = plt.subplots(figsize=(7, 5))
    feat_series.sort_values(ascending=True).plot(kind="barh", ax=ax, color="steelblue")
    ax.set_title("Feature Importance — XGBoost")
    ax.set_xlabel("Importance")
    plt.tight_layout()
    plt.savefig("feature_importance.png", dpi=150)
    plt.close()
    print("(Đã lưu: feature_importance.png)")

    # ========================
    # Save model
    # ========================
    joblib.dump(model, "donor_model.pkl")
    joblib.dump(feature_cols, "feature_cols.pkl")
    joblib.dump(age_default, "age_default.pkl")

    print("\nModel saved successfully!")
    print("Files: donor_model.pkl | feature_cols.pkl | age_default.pkl")


# ========================
# RUN
# ========================
if __name__ == "__main__":
    main()
