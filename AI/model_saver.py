import joblib


def save_artifacts(
    best_model,
    feature_cols: list,
    age_default: int,
    model_path: str  = "donor_model.pkl",
    feat_path: str   = "feature_cols.pkl",
    age_path: str    = "age_default.pkl",
) -> None:
    """
    Lưu 3 file artifact cần thiết cho inference:
      - donor_model.pkl   : model đã được fit
      - feature_cols.pkl  : danh sách tên feature (đúng thứ tự)
      - age_default.pkl   : giá trị age mặc định (mean của dataset gốc)
    """
    joblib.dump(best_model,   model_path)
    joblib.dump(feature_cols, feat_path)
    joblib.dump(age_default,  age_path)

    print(f"\nModel saved successfully!")
    print(f"Files: {model_path} | {feat_path} | {age_path}")
    print(f"Feature cols: {feature_cols}")
