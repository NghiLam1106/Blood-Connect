import numpy as np

from sklearn.base import clone
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    roc_curve,
    auc,
)
from xgboost import XGBClassifier


# ========================
# Định nghĩa 3 models
# ========================
def get_models() -> dict:
    """
    Trả về dict các model chưa được fit.
    Key là tên model, value là instance model.
    """
    lr_model = make_pipeline(
        StandardScaler(),
        LogisticRegression(max_iter=1000, class_weight="balanced"),
    )
    rf_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    xgb_model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )
    return {
        "Logistic Regression": lr_model,
        "Random Forest":       rf_model,
        "XGBoost":             xgb_model,
    }


# ========================
# Train & evaluate một model
# ========================
def evaluate_model(name, model, X_train, X_test, y_train, y_test) -> dict:
    """
    CV chạy chỉ trên X_train (tránh data leakage),
    sau đó fit final model trên toàn bộ X_train và đánh giá trên X_test.

    Returns:
        dict chứa: model, acc, auc, cv_mean, cv_std, fpr, tpr, y_pred
    """
    cv_model  = clone(model)
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
        model=model,
        acc=acc,
        auc=roc_auc,
        cv_mean=cv_scores.mean(),
        cv_std=cv_scores.std(),
        fpr=fpr,
        tpr=tpr,
        y_pred=y_pred,
    )
