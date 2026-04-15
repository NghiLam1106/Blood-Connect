from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.metrics import (
    classification_report, accuracy_score,
    confusion_matrix, ConfusionMatrixDisplay,
    roc_curve, auc
)


# ========================
# 1. Load dataset
# ========================
def load_dataset(path: str) -> pd.DataFrame:
    file_path = Path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"Dataset not found: {file_path}")

    df = pd.read_csv(file_path)

    # Clean column names
    df.columns = [col.strip() for col in df.columns]

    # Check label
    if "label" not in df.columns:
        raise ValueError("Dataset phải có cột 'label'")

    # Bỏ urgency (xử lý ở tầng threshold riêng, không đưa vào model)
    if "urgency" in df.columns:
        df = df.drop(columns=["urgency"])

    # Filter donor chưa đủ điều kiện (xử lý ở tầng query CSDL)
    if "last_donation_days" in df.columns:
        df = df[df["last_donation_days"] >= 56].copy()

        # Encode last_donation_days thành category
        def encode_recency(days):
            if days < 120:   return "recent"
            elif days < 365: return "moderate"
            else:            return "inactive"

        df["donation_recency"] = df["last_donation_days"].apply(encode_recency)

        # One-hot encode — đảm bảo đủ 3 cột dù data thiếu 1 nhóm
        recency_dummies = pd.get_dummies(df["donation_recency"], prefix="recency")
        for col in ["recency_recent", "recency_moderate", "recency_inactive"]:
            if col not in recency_dummies.columns:
                recency_dummies[col] = False

        df = pd.concat(
            [df.drop(columns=["last_donation_days", "donation_recency"]), recency_dummies],
            axis=1
        )

    # Convert numeric
    feature_cols = [col for col in df.columns if col != "label"]
    df[feature_cols] = df[feature_cols].apply(pd.to_numeric, errors="coerce")
    df["label"] = pd.to_numeric(df["label"], errors="coerce")

    # Drop lỗi
    df = df.dropna().reset_index(drop=True)
    df["label"] = df["label"].astype(int)

    return df


# ========================
# MAIN
# ========================
def main():
    # Load data
    data = load_dataset("donor_dataset.csv")

    print("\n=== Data sample ===")
    print(data.head())

    # Features
    feature_cols = [col for col in data.columns if col != "label"]
    X = data[feature_cols]
    y = data["label"]

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train
    model = LogisticRegression(
        max_iter=1000,
        class_weight="balanced"
    )

    model.fit(X_train_scaled, y_train)

    # Predict
    y_pred = model.predict(X_test_scaled)

    # ========================
    # Evaluation
    # ========================
    print("\n=== Model Evaluation ===")
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print(classification_report(y_test, y_pred))

    # --- 1. Confusion Matrix ---
    print("\n=== Confusion Matrix ===")
    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Không donate (0)", "Donate (1)"])
    fig, ax = plt.subplots(figsize=(6, 5))
    disp.plot(ax=ax, colorbar=False, cmap="Blues")
    ax.set_title("Confusion Matrix")
    plt.tight_layout()
    plt.savefig("confusion_matrix.png", dpi=150)
    plt.close()
    print(cm)
    print("(Đã lưu: confusion_matrix.png)")

    # --- 2. ROC Curve + AUC ---
    print("\n=== ROC Curve & AUC ===")
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    fpr, tpr, thresholds = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)

    fig, ax = plt.subplots(figsize=(6, 5))
    ax.plot(fpr, tpr, color="steelblue", lw=2, label=f"ROC curve (AUC = {roc_auc:.3f})")
    ax.plot([0, 1], [0, 1], color="gray", linestyle="--", lw=1, label="Random baseline")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curve")
    ax.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig("roc_curve.png", dpi=150)
    plt.close()
    print(f"AUC Score: {roc_auc:.4f}")
    print("(Đã lưu: roc_curve.png)")

    # --- 3. Cross-Validation (5-fold) ---
    print("\n=== Cross-Validation (5-fold) ===")
    cv_pipeline = make_pipeline(
        StandardScaler(),
        LogisticRegression(max_iter=1000, class_weight="balanced")
    )
    cv_scores = cross_val_score(cv_pipeline, X, y, cv=5, scoring="roc_auc")
    print(f"AUC mỗi fold : {np.round(cv_scores, 4)}")
    print(f"AUC trung bình: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # ========================
    # Feature importance
    # ========================
    print("\n=== Feature Importance ===")
    feature_names = X.columns
    coefficients = model.coef_[0]

    for name, coef in zip(feature_names, coefficients):
        print(f"{name:<25}: {coef:>8.4f}")

    # ========================
    # Save model
    # ========================
    joblib.dump(model, "donor_model.pkl")
    joblib.dump(scaler, "scaler.pkl")

    print("\nModel saved successfully!")


# ========================
# RUN
# ========================
if __name__ == "__main__":
    main()
