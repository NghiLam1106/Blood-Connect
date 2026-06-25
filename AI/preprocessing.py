import numpy as np
import pandas as pd

from config import (
    RECENCY_RECENT_DAYS,
    RECENCY_MODERATE_DAYS,
    RECENCY_INACTIVE_DAYS,
    NUMERIC_COLS,
    INT_COLS,
)


# ========================
# 1. Phân loại "độ gần đây" của lần hiến máu cuối (recency)
# ========================
def add_recency_features(df: pd.DataFrame) -> pd.DataFrame:
    days = df["last_donation_days"]

    before = len(df)
    df = df[days >= RECENCY_RECENT_DAYS].copy()
    dropped = before - len(df)
    if dropped:
        print(
            f"Loại {dropped} dòng có last_donation_days < {RECENCY_RECENT_DAYS} "
            f"(không đủ điều kiện hiến)."
        )

    days = df["last_donation_days"]
    conditions = [
        days < RECENCY_MODERATE_DAYS,
        (days >= RECENCY_MODERATE_DAYS) & (days < RECENCY_INACTIVE_DAYS),
        days >= RECENCY_INACTIVE_DAYS,
    ]
    choices = ["recent", "moderate", "inactive"]
    category = np.select(conditions, choices, default="recent")

    df["recency_recent"]   = category == "recent"
    df["recency_moderate"] = category == "moderate"
    df["recency_inactive"] = category == "inactive"
    return df


# ========================
# 2. Oversample class thiểu số (label=1 — Donate)
# ========================
def oversample_minority(
    df: pd.DataFrame,
    target_ratio: float = 0.6,
    noise_frac: float = 0.03,
    random_state: int = 42,
) -> pd.DataFrame:
    """
    Tăng tỉ lệ class Donate (label=1) bằng bootstrap resampling + nhiễu Gauss nhẹ
    trên các cột numeric, KHÔNG xóa bớt dữ liệu thật của class 0.
    """
    rng = np.random.default_rng(random_state)

    pos = df[df["label"] == 1].copy()
    neg = df[df["label"] == 0].copy()

    n_pos, n_neg = len(pos), len(neg)
    if n_pos == 0 or n_neg == 0:
        print("⚠ Một trong hai class rỗng — bỏ qua oversample.")
        return df

    n_pos_target = int(round(n_neg * target_ratio / (1 - target_ratio)))
    n_to_add = n_pos_target - n_pos

    if n_to_add <= 0:
        print(f"Class 1 đã chiếm tỉ lệ >= {target_ratio:.0%}, không cần oversample.")
        return df

    print(f"Oversample class 1: {n_pos} -> {n_pos_target} (+{n_to_add} mẫu bootstrap)")

    sampled = pos.sample(n=n_to_add, replace=True, random_state=random_state).reset_index(drop=True)

    stds = pos[NUMERIC_COLS].std()
    for col in NUMERIC_COLS:
        noise = rng.normal(0, stds[col] * noise_frac, size=len(sampled))
        sampled[col] = sampled[col] + noise
        if col in INT_COLS:
            sampled[col] = sampled[col].round().astype(int)
        else:
            sampled[col] = sampled[col].round(4)

    # Clip về khoảng giá trị hợp lý
    sampled["age"]                = sampled["age"].clip(lower=18)
    sampled["weight"]             = sampled["weight"].clip(lower=42)
    sampled["distance_km"]        = sampled["distance_km"].clip(lower=0)
    sampled["response_rate"]      = sampled["response_rate"].clip(0, 1)
    sampled["last_donation_days"] = sampled["last_donation_days"].clip(lower=84)

    new_pos = pd.concat([pos, sampled], ignore_index=True)
    new_df  = pd.concat([new_pos, neg], ignore_index=True)
    new_df  = new_df.sample(frac=1, random_state=random_state).reset_index(drop=True)
    return new_df
