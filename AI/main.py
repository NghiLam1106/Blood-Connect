from datetime import datetime
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
# Load model & scaler
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "donor_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")

model = None
scaler = None

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Đã load thành công model và scaler!")
except Exception as e:
    print(f"❌ Lỗi khi load model/scaler: {e}")


# =========================
# Request Models
# =========================
class DonorData(BaseModel):
    id: int
    last_donation_days: Optional[int] = Field(alias="lastDonation")
    response_rate: float = Field(alias="responseRate")
    distance_km: float = Field(alias="distance")


class BatchPredictionRequest(BaseModel):
    urgency: int
    donors: List[DonorData]


# =========================
# Config
# =========================
URGENCY_THRESHOLDS = {
    1: 0.30,
    2: 0.45,
    3: 0.55,
    4: 0.65,
    5: 0.75,
}

MAX_DISTANCE = 20


# =========================
# Helper Functions
# =========================
def encode_recency(last_donation_days):
    if last_donation_days is None:
        return None

    if last_donation_days < 56:
        return None

    if last_donation_days < 120:
        cat = "recent"
    elif last_donation_days < 365:
        cat = "moderate"
    else:
        cat = "inactive"

    return {
        "recency_recent": cat == "recent",
        "recency_moderate": cat == "moderate",
        "recency_inactive": cat == "inactive",
    }


def prepare_features_batch(donors_raw):
    rows = []
    valid_donors = []
    skipped = []

    for d in donors_raw:
        recency = encode_recency(d["last_donation_days"])

        if recency is None:
            skipped.append(d)
            continue

        valid_donors.append(d)

        rows.append({
            "distance_km": d["distance_km"],
            "response_rate": d["response_rate"],
            "recency_recent": recency["recency_recent"],
            "recency_moderate": recency["recency_moderate"],
            "recency_inactive": recency["recency_inactive"],
        })

    if skipped:
        ids = ", ".join(str(d["id"]) for d in skipped)
        print(f"⚠️ Loại {len(skipped)} donor chưa đủ điều kiện: {ids}")

    return pd.DataFrame(rows), valid_donors


def get_donors_to_notify(predictions, urgency):
    if urgency not in URGENCY_THRESHOLDS:
        raise ValueError("urgency phải từ 1 đến 5")

    threshold = URGENCY_THRESHOLDS[urgency]

    eligible = [
        (donor_id, prob)
        for donor_id, prob in predictions
        if prob >= threshold
    ]

    return sorted(eligible, key=lambda x: x[1], reverse=True)


def compute_matching_scores(donors_raw, notify_ids, probs):
    filtered = [d for d in donors_raw if d["id"] in notify_ids]

    for d in filtered:
        d["probability"] = probs[d["id"]]
        d["distance_score"] = max(0, 1 - d["distance_km"] / MAX_DISTANCE)

        d["matching_score"] = (
            0.50 * d["probability"]
            + 0.30 * d["distance_score"]
            + 0.20 * d["response_rate"]
        )

    return sorted(filtered, key=lambda x: x["matching_score"], reverse=True)


# =========================
# API
# =========================
@app.post("/predict")
def predict(request: BatchPredictionRequest):
    if model is None or scaler is None:
        raise HTTPException(status_code=500, detail="Model chưa được load!")

    try:
        donors_raw = [donor.model_dump(by_alias=False) for donor in request.donors]

        features_df, valid_donors = prepare_features_batch(donors_raw)

        if len(valid_donors) == 0:
            return {
                "urgency": request.urgency,
                "total_donors": len(donors_raw),
                "total_eligible": 0,
                "notified_donors_count": 0,
                "results": []
            }

        features_scaled = scaler.transform(features_df)
        raw_probs = model.predict_proba(features_scaled)[:, 1]

        prob_map = {
            donor["id"]: float(prob)
            for donor, prob in zip(valid_donors, raw_probs)
        }

        predictions = list(prob_map.items())

        notify_list = get_donors_to_notify(predictions, request.urgency)
        notify_ids = {did for did, _ in notify_list}

        ranked = compute_matching_scores(valid_donors, notify_ids, prob_map)

        return {
            "results": ranked,
            "urgency": request.urgency,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi dự đoán: {str(e)}")


# =========================
# Run Server
# =========================
if __name__ == "__main__":
    print("🚀 Server chạy tại: http://127.0.0.1:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
