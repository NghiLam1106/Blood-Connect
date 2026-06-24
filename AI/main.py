from datetime import datetime, date
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import uvicorn
import os
from typing import List, Optional

app = FastAPI(
    title="Blood Donor AI Model API",
    description="API nạp dữ liệu vào mô hình đã train để dự đoán",
    version="1.0"
)

# =========================
# Load model & feature_cols
# =========================
BASE_DIR          = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH        = os.path.join(BASE_DIR, "donor_model.pkl")
FEATURE_COLS_PATH = os.path.join(BASE_DIR, "feature_cols.pkl")
AGE_DEFAULT_PATH  = os.path.join(BASE_DIR, "age_default.pkl")

model        = None
feature_cols = None
age_default  = 30  # fallback nếu chưa có age_default.pkl

try:
    model        = joblib.load(MODEL_PATH)
    feature_cols = joblib.load(FEATURE_COLS_PATH)
    age_default  = joblib.load(AGE_DEFAULT_PATH)
    print(f"✅ Đã load thành công model, feature_cols, age_default={age_default}!")
except Exception as e:
    print(f"❌ Lỗi khi load model/feature_cols/age_default: {e}")


# =========================
# Request Models
# =========================
class DonorData(BaseModel):
    id: int
    # Alias khớp với tên field NestJS gửi lên (camelCase)
    last_donation_days: Optional[int] = Field(alias="lastDonation")
    response_rate: float               = Field(alias="responseRate")
    distance_km: float                 = Field(alias="distance")
    gender: str                        = Field(alias="gender")
    # weight/age giữ Optional phòng NestJS không gửi
    weight: Optional[int]              = Field(alias="weight", default=None)
    age: Optional[int]                 = Field(alias="age",    default=None)
    # Nhóm máu người hiến và nhóm máu yêu cầu
    blood_type: Optional[str]          = Field(alias="bloodType", default=None)
    required_blood_type: Optional[str] = Field(alias="requiredBloodType", default=None)

    model_config = {"populate_by_name": True}  # cho phép dùng cả tên gốc lẫn alias


class BatchPredictionRequest(BaseModel):
    urgency: int
    donors: List[DonorData]


# =========================
# Config
# =========================
URGENCY_THRESHOLDS = {
    1: 0.30,
    2: 0.40,
    3: 0.50,
    4: 0.60,
    5: 0.70,
}

# Ngưỡng cân nặng tối thiểu theo quy định hiến máu (kg)
MIN_WEIGHT_KG = 42

# Khoảng cách tối đa dùng để tính điểm khoảng cách
MAX_DISTANCE_KM = 20


# =========================
# Helper Functions
# =========================
def encode_recency(last_donation_days: Optional[int]) -> Optional[dict]:
  if last_donation_days is None:
      cat = "inactive"  # lần đầu hiến máu, chưa có hồ sơ → xếp inactive
  elif last_donation_days < 84:
      return None     # chưa đủ 84 ngày phục hồi → loại
  elif last_donation_days < 120:
      cat = "recent"
  elif last_donation_days < 365:
      cat = "moderate"
  else:
      cat = "inactive"

  return {
      "recency_recent":   cat == "recent",
      "recency_moderate": cat == "moderate",
      "recency_inactive": cat == "inactive",
  }


def normalize_gender(gender) -> str:
    if not gender:
        return "Other"
    g = str(gender).strip().capitalize()
    return g if g in ("Male", "Female", "Other") else "Other"


def encode_gender(gender: str) -> dict:
    """One-hot encode gender, khớp với feature_cols khi train."""
    g = normalize_gender(gender)
    return {
        "gender_Female": g == "Female",
        "gender_Male":   g == "Male",
        "gender_Other":  g == "Other",
    }


def prepare_features_batch(donors_raw: list):
    rows         = []
    valid_donors = []
    skipped      = []

    for d in donors_raw:
        # --- Kiểm tra cân nặng ---
        if d["weight"] is None or d["weight"] < MIN_WEIGHT_KG:
            skipped.append({
                **d,
                "reason": f"Cân nặng không đủ điều kiện ({d['weight']} kg < {MIN_WEIGHT_KG} kg)"
            })
            continue

        last_days = d["last_donation_days"]
        recency = encode_recency(last_days)
        if recency is None:
            skipped.append({
                **d,
                "reason": f"Chưa đủ 84 ngày kể từ lần hiến gần nhất ({last_days} ngày)"
            })
            continue

        valid_donors.append(d)
        gender_enc = encode_gender(d.get("gender", "Other"))

        # age=None → dùng age_default (mean từ dataset lúc train), tránh dtype object gây lỗi XGBoost
        age = d.get("age")
        age = int(age) if age is not None else age_default

        rows.append({
            "age"               : age,
            "weight"            : int(d["weight"]),
            "distance_km"       : float(d["distance_km"]),
            "response_rate"     : float(d["response_rate"]),
            "last_donation_days": int(last_days) if last_days is not None else 9999,  # sentinel cho người lần đầu hiến
            "recency_recent"    : bool(recency["recency_recent"]),
            "recency_moderate"  : bool(recency["recency_moderate"]),
            "recency_inactive"  : bool(recency["recency_inactive"]),
            "gender_Female"     : bool(gender_enc["gender_Female"]),
            "gender_Male"       : bool(gender_enc["gender_Male"]),
            "gender_Other"      : bool(gender_enc["gender_Other"]),
        })

    if skipped:
        ids = ", ".join(str(d["id"]) for d in skipped)
        print(f"⚠️ Loại {len(skipped)} donor không đủ điều kiện: IDs [{ids}]")

    if not rows:
        return pd.DataFrame(), valid_donors, skipped

    df = pd.DataFrame(rows)

    # Đảm bảo thứ tự và kiểu cột khớp chính xác với lúc train
    if feature_cols:
        df = df.reindex(columns=feature_cols, fill_value=0)

    # Ép kiểu tường minh để XGBoost không báo lỗi object dtype
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].astype(float)

    return df, valid_donors, skipped


def filter_by_matching_score(scored_donors: list, urgency: int) -> list:
    """Lọc donor theo matching_score >= threshold tương ứng với urgency."""
    if urgency not in URGENCY_THRESHOLDS:
        raise ValueError("urgency phải từ 1 đến 5")

    threshold = URGENCY_THRESHOLDS[urgency]
    return [
        d for d in scored_donors
        if d["matching_score"] >= threshold
    ]


# Bảng tương thích nhóm máu: BLOOD_COMPAT[donor][recipient]
# 1.0 = tương thích hoàn toàn, 0.5 = có thể dùng nhưng không lý tưởng, 0.0 = không tương thích
BLOOD_COMPAT = {
    "O-":  {"O-": 1.0, "O+": 0.5, "A-": 0.5, "A+": 0.5, "B-": 0.5, "B+": 0.5, "AB-": 0.5, "AB+": 0.5},
    "O+":  {"O-": 0.0, "O+": 1.0, "A-": 0.0, "A+": 0.5, "B-": 0.0, "B+": 0.5, "AB-": 0.0, "AB+": 0.5},
    "A-":  {"O-": 0.0, "O+": 0.0, "A-": 1.0, "A+": 0.5, "B-": 0.0, "B+": 0.0, "AB-": 0.5, "AB+": 0.5},
    "A+":  {"O-": 0.0, "O+": 0.0, "A-": 0.0, "A+": 1.0, "B-": 0.0, "B+": 0.0, "AB-": 0.0, "AB+": 0.5},
    "B-":  {"O-": 0.0, "O+": 0.0, "A-": 0.0, "A+": 0.0, "B-": 1.0, "B+": 0.5, "AB-": 0.5, "AB+": 0.5},
    "B+":  {"O-": 0.0, "O+": 0.0, "A-": 0.0, "A+": 0.0, "B-": 0.0, "B+": 1.0, "AB-": 0.0, "AB+": 0.5},
    "AB-": {"O-": 0.0, "O+": 0.0, "A-": 0.0, "A+": 0.0, "B-": 0.0, "B+": 0.0, "AB-": 1.0, "AB+": 0.5},
    "AB+": {"O-": 0.0, "O+": 0.0, "A-": 0.0, "A+": 0.0, "B-": 0.0, "B+": 0.0, "AB-": 0.0, "AB+": 1.0},
}


def get_blood_compatibility_score(donor_blood: Optional[str], required_blood: Optional[str]) -> float:
    """Trả về điểm tương thích nhóm máu [0.0, 1.0].
    Nếu thiếu thông tin nhóm máu → trả về 0.5 (trung lập)."""
    if not donor_blood or not required_blood:
        return 0.5
    donor_blood    = donor_blood.strip().upper().replace("POSITIVE", "+").replace("NEGATIVE", "-")
    required_blood = required_blood.strip().upper().replace("POSITIVE", "+").replace("NEGATIVE", "-")
    return BLOOD_COMPAT.get(donor_blood, {}).get(required_blood, 0.0)


def compute_matching_scores(donors_raw: list, probs: dict) -> list:
    """Tính matching_score cho tất cả valid donors (chưa lọc threshold)."""
    for d in donors_raw:
        prob              = probs[d["id"]]
        distance_score    = max(0.0, 1.0 - d["distance_km"] / MAX_DISTANCE_KM)
        blood_compat      = get_blood_compatibility_score(
            d.get("blood_type"), d.get("required_blood_type")
        )

        d["probability"]         = round(prob, 4)
        d["distance_score"]      = round(distance_score, 4)
        d["blood_compat_score"]  = round(blood_compat, 4)
        d["matching_score"]      = round(
            0.45 * prob
            + 0.25 * distance_score
            + 0.15 * d["response_rate"]
            + 0.15 * blood_compat,
            4,
        )

    return sorted(donors_raw, key=lambda x: x["matching_score"], reverse=True)


# =========================
# API Endpoints
# =========================
@app.post("/predict")
def predict(request: BatchPredictionRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model chưa được load!")

    try:
        # model_dump(by_alias=False) → luôn ra snake_case (last_donation_days, distance_km, ...)
        donors_raw = [donor.model_dump(by_alias=False) for donor in request.donors]

        print(f"📥 Nhận {len(donors_raw)} donor, urgency={request.urgency}")

        features_df, valid_donors, skipped = prepare_features_batch(donors_raw)
        print(f"✅ Hợp lệ: {len(valid_donors)}, Bị loại: {len(skipped)}")

        if not valid_donors:
            return {
                "urgency"              : request.urgency,
                "total_input"          : len(donors_raw),
                "total_eligible"       : 0,
                "notified_donors_count": 0,
                "skipped_donors"       : skipped,
                "results"              : [],
            }

        raw_probs = model.predict_proba(features_df)[:, 1]

        prob_map = {
            donor["id"]: float(prob)
            for donor, prob in zip(valid_donors, raw_probs)
        }

        all_scored = compute_matching_scores(valid_donors, prob_map)

        ranked = filter_by_matching_score(all_scored, request.urgency)

        return {
            "urgency"              : request.urgency,
            "total_input"          : len(donors_raw),
            "total_eligible"       : len(valid_donors),
            "notified_donors_count": len(ranked),
            "skipped_donors"       : skipped,
            "results"              : ranked,
        }

    except Exception as e:
        import traceback
        print(f"❌ LỖI CHI TIẾT:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi dự đoán: {str(e)}")


# =========================
# Run Server
# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Server chạy tại môi trường Production ở port: {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port)
