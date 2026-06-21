from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt

from sklearn.base import clone
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
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

    # --- Bỏ các cột không dùng nếu có ---
    for col in ["urgency", "id"]:
        if col in df.columns:
            df = df.drop(columns=[col])

    # --- Loại recency columns nếu còn sót trong dataset ---
    recency_cols = ["recency_recent", "recency_moderate", "recency_inactive"]
    df = df.drop(columns=[c for c in recency_cols if c in df.columns])

    # --- last_donation_days: dataset v5 đã lọc sẵn >= 56, giữ nguyên ---
    # NOTE: weight < 45 KHÔNG lọc ở đây — đó là business rule,
    # được validate ở service layer (NestJS/main.py) trước khi gọi model.
    if "last_donation_days" not in df.columns:
        raise ValueError("Dataset phải có cột 'last_donation_days'")

    # --- Encode gender → one-hot (Male / Female / Other) ---
    if "gender" not in df.columns:
        raise ValueError("Dataset phải có cột 'gender'")

    gender_dummies = pd.get_dummies(df["gender"], prefix="gender")
    for col in ["gender_Female", "gender_Male", "gender_Other"]:
        if col not in gender_dummies.columns:
            gender_dummies[col] = False
    df = pd.concat([df.drop(columns=["gender"]), gender_dummies], axis=1)

    # --- Convert numeric, bỏ null ---
    feature_cols = [col for col in df.columns if col != "label"]
    df[feature_cols] = df[feature_cols].apply(pd.to_numeric, errors="coerce")
    df["label"] = pd.to_numeric(df["label"], errors="coerce")
    df = df.dropna().reset_index(drop=True)
    df["label"] = df["label"].astype(int)

    # --- Sắp xếp cột khớp với thứ tự inference trong main.py ---
    ordered_features = [
        "age", "weight", "distance_km", "response_rate",
        "last_donation_days",
        "gender_Female", "gender_Male", "gender_Other",
    ]
    missing = [c for c in ordered_features if c not in df.columns]
    if missing:
        raise ValueError(f"Thiếu cột sau khi xử lý: {missing}")

    df = df[ordered_features + ["label"]]
    return df


# ========================
# 1b. Oversample class thiểu số (label=1 — Donate)
# ========================
def oversample_minority(
    df: pd.DataFrame,
    target_ratio: float = 0.6,
    noise_frac: float = 0.03,
    random_state: int = 42,
) -> pd.DataFrame:
    """
    Tăng tỉ lệ class Donate (label=1) bằng bootstrap resampling + nhiễu Gauss nhẹ
    trên các cột numeric, KHÔNG xóa bớt dữ liệu thật của class 0 (giữ toàn bộ dataset gốc).

    target_ratio: tỉ lệ mong muốn của label=1 trên tổng (ví dụ 0.6 = 60% donate, 40% không donate)
    noise_frac  : độ lớn nhiễu = noise_frac * std của từng cột numeric, tránh nhân bản y nguyên
    """
    rng = np.random.default_rng(random_state)

    pos = df[df["label"] == 1].copy()
    neg = df[df["label"] == 0].copy()

    n_pos, n_neg = len(pos), len(neg)
    if n_pos == 0 or n_neg == 0:
        print("⚠ Một trong hai class rỗng — bỏ qua oversample.")
        return df

    # n_pos_target / (n_pos_target + n_neg) = target_ratio
    n_pos_target = int(round(n_neg * target_ratio / (1 - target_ratio)))
    n_to_add = n_pos_target - n_pos

    if n_to_add <= 0:
        print(f"Class 1 đã chiếm tỉ lệ >= {target_ratio:.0%}, không cần oversample.")
        return df

    print(f"Oversample class 1: {n_pos} -> {n_pos_target} (+{n_to_add} mẫu bootstrap)")

    numeric_cols = [
        c for c in ["age", "weight", "distance_km", "response_rate", "last_donation_days"]
        if c in pos.columns
    ]
    int_cols = [c for c in ["age", "weight", "last_donation_days"] if c in numeric_cols]

    sampled = pos.sample(n=n_to_add, replace=True, random_state=random_state).reset_index(drop=True)

    stds = pos[numeric_cols].std()
    for col in numeric_cols:
        noise = rng.normal(0, stds[col] * noise_frac, size=len(sampled))
        sampled[col] = sampled[col] + noise
        if col in int_cols:
            sampled[col] = sampled[col].round().astype(int)
        else:
            sampled[col] = sampled[col].round(4)

    # Clip về khoảng giá trị hợp lý
    if "age" in sampled.columns:
        sampled["age"] = sampled["age"].clip(lower=18)
    if "weight" in sampled.columns:
        sampled["weight"] = sampled["weight"].clip(lower=40)
    if "distance_km" in sampled.columns:
        sampled["distance_km"] = sampled["distance_km"].clip(lower=0)
    if "response_rate" in sampled.columns:
        sampled["response_rate"] = sampled["response_rate"].clip(0, 1)
    if "last_donation_days" in sampled.columns:
        sampled["last_donation_days"] = sampled["last_donation_days"].clip(lower=0)

    new_pos = pd.concat([pos, sampled], ignore_index=True)
    new_df = pd.concat([new_pos, neg], ignore_index=True)
    new_df = new_df.sample(frac=1, random_state=random_state).reset_index(drop=True)

    return new_df


# ========================
# 2. Train & evaluate một model
# ========================
def evaluate_model(name, model, X_train, X_test, y_train, y_test):
    """
    CV chạy chỉ trên X_train (tránh data leakage),
    sau đó fit final model trên toàn bộ X_train và đánh giá trên X_test.
    """
    cv_model = clone(model)
    cv_scores = cross_val_score(cv_model, X_train, y_train, cv=5, scoring="roc_auc")

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)

    print(f"\n{'='*50}")
    print(f"  {name}")
    print(f"{'='*50}")
    print(f"  Accuracy      : {acc:.4f}")
    print(f"  AUC (test)    : {roc_auc:.4f}")
    print(f"  CV AUC / fold : {np.round(cv_scores, 4)}")
    print(f"  CV AUC mean   : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print(classification_report(y_test, y_pred))

    return dict(
        model=model, acc=acc, auc=roc_auc,
        cv_mean=cv_scores.mean(), cv_std=cv_scores.std(),
        fpr=fpr, tpr=tpr, y_pred=y_pred
    )


# ========================
# MAIN
# ========================
def main():
    data = load_dataset("donor_dataset.csv")

    print("\n=== Data sample (trước oversample) ===")
    print(data.head())
    print("\nColumns:", list(data.columns))
    print("Shape  :", data.shape)
    print("Label dist:", data["label"].value_counts().to_dict())

    # Tính mean age từ dataset GỐC (trước oversample) để age_default phản ánh đúng dữ liệu thật
    age_default = int(round(data["age"].mean())) if "age" in data.columns else 30
    print(f"\nAge default (mean, dữ liệu gốc): {age_default}")

    # --- Oversample class Donate (label=1) lên 60:40, giữ toàn bộ dữ liệu gốc ---
    data = oversample_minority(data, target_ratio=0.6, noise_frac=0.03, random_state=42)

    print("\n=== Data sample (sau oversample) ===")
    print("Shape  :", data.shape)
    print("Label dist:", data["label"].value_counts().to_dict())
    print("Label %  :", (data["label"].value_counts(normalize=True) * 100).round(2).to_dict())

    feature_cols = [col for col in data.columns if col != "label"]
    X = data[feature_cols]
    y = data["label"]

    neg_count = (y == 0).sum()
    pos_count = (y == 1).sum()
    print(f"\nClass ratio (0:1) = {neg_count/pos_count:.4f}")

    # Split — test set tách ra trước, không tham gia CV
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ========================
    # Định nghĩa 3 models
    # ========================
    lr_model = make_pipeline(
        StandardScaler(),
        LogisticRegression(max_iter=1000, class_weight="balanced")
    )
    rf_model = RandomForestClassifier(
        n_estimators=200, max_depth=8,
        class_weight="balanced", random_state=42, n_jobs=-1
    )
    xgb_model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1
    )

    # ========================
    # Train & evaluate (CV chỉ trên X_train)
    # ========================
    results = {}
    results["Logistic Regression"] = evaluate_model(
        "Logistic Regression", lr_model, X_train, X_test, y_train, y_test
    )
    results["Random Forest"] = evaluate_model(
        "Random Forest", rf_model, X_train, X_test, y_train, y_test
    )
    results["XGBoost"] = evaluate_model(
        "XGBoost", xgb_model, X_train, X_test, y_train, y_test
    )

    # ========================
    # Tổng hợp kết quả
    # ========================
    print("\n" + "="*50)
    print("  TỔNG HỢP KẾT QUẢ")
    print("="*50)
    print(f"{'Model':<25} {'Accuracy':>10} {'AUC':>8} {'CV AUC':>10}")
    print("-"*55)
    for name, r in results.items():
        print(f"{name:<25} {r['acc']:>10.4f} {r['auc']:>8.4f} {r['cv_mean']:>8.4f}±{r['cv_std']:.4f}")

    best_name = max(results, key=lambda k: results[k]["auc"])
    print(f"\n→ Best model: {best_name} (AUC = {results[best_name]['auc']:.4f})")

    # ========================
    # Confusion Matrix — best model
    # ========================
    best_pred = results[best_name]["y_pred"]
    cm = confusion_matrix(y_test, best_pred)
    disp = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=["Không donate (0)", "Donate (1)"]
    )
    fig, ax = plt.subplots(figsize=(6, 5))
    disp.plot(ax=ax, colorbar=False, cmap="Blues")
    ax.set_title(f"Confusion Matrix — {best_name}")
    plt.tight_layout()
    plt.savefig("confusion_matrix.png", dpi=150)
    plt.close()
    print(f"\n(Đã lưu: {'confusion_matrix.png'})")

    # ========================
    # ROC Curves — cả 3 model
    # ========================
    colors = {
        "Logistic Regression": "steelblue",
        "Random Forest":       "darkorange",
        "XGBoost":             "green",
    }
    fig, ax = plt.subplots(figsize=(7, 5))
    for name, r in results.items():
        ax.plot(r["fpr"], r["tpr"], lw=2, color=colors[name],
                label=f"{name} (AUC={r['auc']:.3f})")
    ax.plot([0, 1], [0, 1], "k--", lw=1, label="Random baseline")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curve — So sánh 3 Models")
    ax.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig("roc_curve.png", dpi=150)
    plt.close()
    print(f"(Đã lưu: {'roc_curve.png'})")

    # ========================
    # Feature Importance — best model
    # ========================
    best_model = results[best_name]["model"]
    if hasattr(best_model, "feature_importances_"):
        importances = best_model.feature_importances_
    elif hasattr(getattr(best_model, "steps", [("", best_model)])[-1][1], "feature_importances_"):
        importances = best_model.steps[-1][1].feature_importances_
    else:
        importances = np.abs(best_model.steps[-1][1].coef_[0])

    feat_series = pd.Series(importances, index=feature_cols).sort_values(ascending=True)
    fig, ax = plt.subplots(figsize=(7, 5))
    feat_series.plot(kind="barh", ax=ax, color="steelblue")
    ax.set_title(f"Feature Importance — {best_name}")
    ax.set_xlabel("Importance")
    plt.tight_layout()
    plt.savefig("feature_importance.png", dpi=150)
    plt.close()
    print(f"(Đã lưu: {'feature_importance.png'})")

    # ========================
    # Save model tốt nhất
    # ========================
    joblib.dump(best_model,   "donor_model.pkl")
    joblib.dump(feature_cols, "feature_cols.pkl")
    joblib.dump(age_default,  "age_default.pkl")

    print(f"\nModel saved successfully!")
    print(f"Files: donor_model.pkl | feature_cols.pkl | age_default.pkl")
    print(f"Feature cols: {feature_cols}")


# ========================
# RUN
# ========================
if __name__ == "__main__":
    main()
