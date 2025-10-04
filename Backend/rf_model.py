import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "stressLevel_rf.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

rf_model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

def predict_rf(features: list):
    features_scaled = scaler.transform([features])
    prediction = rf_model.predict(features_scaled)
    return int(prediction[0])
