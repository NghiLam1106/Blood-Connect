# ========================
# visualizer.py — Vẽ & lưu biểu đồ kết quả
# ========================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay


# Màu sắc cho từng model khi vẽ ROC
_ROC_COLORS = {
    "Logistic Regression": "steelblue",
    "Random Forest":       "darkorange",
    "XGBoost":             "green",
}


def plot_confusion_matrix(
    y_test,
    y_pred,
    best_name: str,
    save_path: str = "confusion_matrix.png",
) -> None:
    """Vẽ confusion matrix của model tốt nhất và lưu thành file ảnh."""
    cm   = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=["Không donate (0)", "Donate (1)"],
    )
    fig, ax = plt.subplots(figsize=(6, 5))
    disp.plot(ax=ax, colorbar=False, cmap="Blues")
    ax.set_title(f"Confusion Matrix — {best_name}")
    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.close()
    print(f"\n(Đã lưu: {save_path})")


def plot_roc_curves(
    results: dict,
    save_path: str = "roc_curve.png",
) -> None:
    """Vẽ ROC curve của cả 3 model trên cùng một biểu đồ và lưu file ảnh."""
    fig, ax = plt.subplots(figsize=(7, 5))
    for name, r in results.items():
        color = _ROC_COLORS.get(name, "gray")
        ax.plot(
            r["fpr"], r["tpr"], lw=2, color=color,
            label=f"{name} (AUC={r['auc']:.3f})",
        )
    ax.plot([0, 1], [0, 1], "k--", lw=1, label="Random baseline")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curve — So sánh 3 Models")
    ax.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.close()
    print(f"(Đã lưu: {save_path})")


def plot_feature_importance(
    best_model,
    best_name: str,
    feature_cols: list,
    save_path: str = "feature_importance.png",
) -> None:
    """
    Vẽ feature importance của model tốt nhất.
    Hỗ trợ cả tree-based model (feature_importances_) và linear model (coef_).
    """
    if hasattr(best_model, "feature_importances_"):
        importances = best_model.feature_importances_
    elif hasattr(
        getattr(best_model, "steps", [("", best_model)])[-1][1],
        "feature_importances_",
    ):
        importances = best_model.steps[-1][1].feature_importances_
    else:
        importances = np.abs(best_model.steps[-1][1].coef_[0])

    feat_series = pd.Series(importances, index=feature_cols).sort_values(ascending=True)
    fig, ax = plt.subplots(figsize=(7, 5))
    feat_series.plot(kind="barh", ax=ax, color="steelblue")
    ax.set_title(f"Feature Importance — {best_name}")
    ax.set_xlabel("Importance")
    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.close()
    print(f"(Đã lưu: {save_path})")
