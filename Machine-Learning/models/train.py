import pandas as pd
import joblib
from pathlib import Path
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

# -----------------------------
# CONFIG
# -----------------------------
DATA_PATH = "data.csv"                       # your dataset
MODEL_DIR = Path("models")                   # folder to save models
VERSION = "1"                                 # version number

MODEL_DIR.mkdir(exist_ok=True)

# Output paths
RF_MODEL_PATH = MODEL_DIR / f"rf_model-v{VERSION}.pkl"
XGB_MODEL_PATH = MODEL_DIR / f"xgb_model-v{VERSION}.pkl"
SCALER_PATH = MODEL_DIR / f"scaler-v{VERSION}.pkl"
ENCODER_PATH = MODEL_DIR / f"label_encoder-v{VERSION}.pkl"


# -----------------------------
# LOAD DATA
# -----------------------------
print("[INFO] Loading data...")
df = pd.read_csv(DATA_PATH)

if "label" not in df.columns:
    raise ValueError("Dataset must contain a column named 'label'")

X = df.drop("label", axis=1)
y = df["label"]


# -----------------------------
# PREPROCESS
# -----------------------------
print("[INFO] Scaling features + encoding labels...")

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)


# -----------------------------
# TRAIN RANDOM FOREST
# -----------------------------
print("[INFO] Training Random Forest...")
rf_model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    random_state=42
)
rf_model.fit(X_scaled, y_encoded)


# -----------------------------
# TRAIN XGBOOST
# -----------------------------
print("[INFO] Training XGBoost...")

xgb_model = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.9,
    colsample_bytree=0.9,
    objective="multi:softmax"
)
xgb_model.fit(X_scaled, y_encoded)


# -----------------------------
# SAVE MODELS
# -----------------------------
print("[INFO] Saving models...")

joblib.dump(rf_model, RF_MODEL_PATH)
joblib.dump(xgb_model, XGB_MODEL_PATH)
joblib.dump(scaler, SCALER_PATH)
joblib.dump(encoder, ENCODER_PATH)

print("\n[✔] Training complete!")
print("[✔] Saved models:")
print(f" - {RF_MODEL_PATH}")
print(f" - {XGB_MODEL_PATH}")
print(f" - {SCALER_PATH}")
print(f" - {ENCODER_PATH}")
