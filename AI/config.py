
# -------------------------------------------------------------------
# Ngưỡng phân loại "độ gần đây" của lần hiến máu cuối (recency)
#   < RECENCY_RECENT_DAYS                                     -> chưa đủ thời gian phục hồi
#   [RECENCY_RECENT_DAYS, RECENCY_MODERATE_DAYS)              -> "recent"
#   [RECENCY_MODERATE_DAYS, RECENCY_INACTIVE_DAYS)            -> "moderate"
#   >= RECENCY_INACTIVE_DAYS                                  -> "inactive"
# -------------------------------------------------------------------
RECENCY_RECENT_DAYS: int   = 84
RECENCY_MODERATE_DAYS: int = 120
RECENCY_INACTIVE_DAYS: int = 365

# -------------------------------------------------------------------
# Các cột bắt buộc phải có trong dataset đầu vào
# -------------------------------------------------------------------
REQUIRED_COLS: set = {
    "label", "last_donation_days", "gender",
    "age", "weight", "distance_km", "response_rate",
}

# -------------------------------------------------------------------
# Thứ tự cột feature — phải khớp với inference trong main.py
# -------------------------------------------------------------------
ORDERED_FEATURES: list = [
    "age", "weight", "distance_km", "response_rate",
    "last_donation_days",
    "recency_recent", "recency_moderate", "recency_inactive",
    "gender_Female", "gender_Male", "gender_Other",
]

# -------------------------------------------------------------------
# Cột numeric và cột integer dùng khi oversampling
# -------------------------------------------------------------------
NUMERIC_COLS: list = ["age", "weight", "distance_km", "response_rate", "last_donation_days"]
INT_COLS: list     = ["age", "weight", "last_donation_days"]
