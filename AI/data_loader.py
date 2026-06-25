from pathlib import Path

import pandas as pd

from config import REQUIRED_COLS, ORDERED_FEATURES
from preprocessing import add_recency_features


def load_dataset(path: str) -> pd.DataFrame:
    file_path = Path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"Dataset not found: {file_path}")

    df = pd.read_csv(file_path)
    df.columns = [col.strip() for col in df.columns]

    missing_required = REQUIRED_COLS - set(df.columns)
    if missing_required:
        raise ValueError(f"Dataset phải có các cột: {missing_required}")

    # --- Encode gender → one-hot (Male / Female / Other) ---
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

    # --- Lọc + encode recency từ last_donation_days ---
    df = add_recency_features(df)

    # --- Sắp xếp cột khớp với thứ tự inference trong main.py ---
    df = df[ORDERED_FEATURES + ["label"]]
    return df
