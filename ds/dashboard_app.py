"""
BUDU — SpendBehavior Analyzer Dashboard
Coding Camp 2026 · DBS Foundation · Tim CC26-PSU268

Palette (static):
  CREAM   #FFF6DE
  TEAL    #8BDFDD
  ORANGE  #F48F68
  YELLOW  #FFE394
Font: Poppins
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from scipy.stats import mannwhitneyu, spearmanr
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from datetime import datetime, timedelta

# ─────────────────────────────────────────────
# PAGE CONFIG
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="BUDU — SpendBehavior Analyzer",
    page_icon="💸",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─────────────────────────────────────────────
# STATIC PALETTE
# ─────────────────────────────────────────────
CREAM   = "#FFF6DE"
TEAL    = "#8BDFDD"
ORANGE  = "#F48F68"
YELLOW  = "#FFE394"

TEAL_DARK   = "#3ABAB8"
ORANGE_DARK = "#D9602E"
YELLOW_DARK = "#D4A800"
CREAM_DARK  = "#E8D8A0"

TEXT_MAIN   = "#3D2F00"
TEXT_MUTED  = "#8C7A3A"
CARD_BG     = "#FFFDF4"

PALETTE = [TEAL, ORANGE, YELLOW, "#F0C8A0", "#B8EDEC",
           "#FBD07A", "#F7B39E", "#D4F5F4", "#FBD9C9", "#EFE6C0"]

PERSONA_COLORS = {
    "Rational Spender":  TEAL,
    "Emotional Spender": YELLOW,
    "Impulsive Spender": ORANGE,
}
PERSONA_ICONS = {
    "Rational Spender":  "🟢",
    "Emotional Spender": "🟡",
    "Impulsive Spender": "🔴",
}

# ─────────────────────────────────────────────
# CUSTOM CSS  (Poppins + static palette)
# ─────────────────────────────────────────────
st.markdown(f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

html, body, [class*="css"] {{
    font-family: 'Poppins', sans-serif !important;
    background-color: {CREAM};
    color: {TEXT_MAIN};
}}

/* ── main area ── */
.main .block-container {{
    background-color: {CREAM};
    padding: 1.5rem 2rem;
}}

/* ── sidebar ── */
[data-testid="stSidebar"] {{
    background-color: {CARD_BG} !important;
    border-right: 2px solid {CREAM_DARK} !important;
}}
[data-testid="stSidebar"] h1,
[data-testid="stSidebar"] h2,
[data-testid="stSidebar"] h3,
[data-testid="stSidebar"] p,
[data-testid="stSidebar"] label {{
    color: {TEXT_MAIN} !important;
    font-family: 'Poppins', sans-serif !important;
}}
[data-testid="stSidebar"] .stRadio label {{
    color: {TEXT_MAIN} !important;
    font-weight: 500;
}}

/* ── metric cards ── */
[data-testid="metric-container"] {{
    background-color: {CARD_BG};
    border: 1.5px solid {CREAM_DARK};
    border-radius: 14px;
    padding: 14px 16px;
    transition: box-shadow .2s, transform .2s;
}}
[data-testid="metric-container"]:hover {{
    box-shadow: 0 6px 20px rgba(244,143,104,.2);
    transform: translateY(-3px);
}}
[data-testid="stMetricValue"] {{
    font-weight: 800 !important;
    color: {TEXT_MAIN} !important;
    font-size: 1.5rem !important;
}}
[data-testid="stMetricLabel"] {{
    color: {TEXT_MUTED} !important;
    font-weight: 600 !important;
    font-size: 0.78rem !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}}
[data-testid="stMetricDelta"] {{
    color: {TEAL_DARK} !important;
    font-weight: 600 !important;
}}

/* ── tabs ── */
.stTabs [data-baseweb="tab-list"] {{
    background-color: {CARD_BG};
    border-radius: 12px 12px 0 0;
    gap: 4px;
    padding: 6px 8px 0;
    border-bottom: 2px solid {CREAM_DARK};
}}
.stTabs [data-baseweb="tab"] {{
    border-radius: 10px 10px 0 0;
    font-weight: 600;
    font-size: 0.85rem;
    color: {TEXT_MUTED};
    padding: 8px 18px;
    background: transparent;
    font-family: 'Poppins', sans-serif !important;
}}
.stTabs [aria-selected="true"] {{
    color: {TEXT_MAIN} !important;
    background-color: {YELLOW} !important;
    border-bottom: 3px solid {ORANGE} !important;
}}

/* ── buttons ── */
button[kind="primary"],
.stDownloadButton > button {{
    border-radius: 10px !important;
    font-weight: 700 !important;
    background-color: {ORANGE} !important;
    color: white !important;
    border: none !important;
    font-family: 'Poppins', sans-serif !important;
    transition: transform .2s !important;
}}
button[kind="primary"]:hover {{
    transform: translateY(-2px) !important;
    background-color: {ORANGE_DARK} !important;
}}

/* ── section title ── */
.section-title {{
    font-size: 1.05rem;
    font-weight: 700;
    color: {TEXT_MAIN};
    padding: 6px 14px;
    border-left: 4px solid {ORANGE};
    background: linear-gradient(90deg, rgba(244,143,104,.12) 0%, transparent 100%);
    border-radius: 0 8px 8px 0;
    margin-bottom: 1rem;
}}

/* ── info boxes ── */
.insight-box {{
    background-color: #FFF0E3;
    border-left: 4px solid {ORANGE};
    border-radius: 0 10px 10px 0;
    padding: 12px 16px;
    margin: 10px 0;
    color: #5C2A00;
    font-weight: 500;
    font-size: 0.88rem;
}}
.success-box {{
    background-color: #E8FAFB;
    border-left: 4px solid {TEAL};
    border-radius: 0 10px 10px 0;
    padding: 12px 16px;
    margin: 10px 0;
    color: #0A3A39;
    font-weight: 500;
    font-size: 0.88rem;
}}
.warn-box {{
    background-color: #FFFBE8;
    border-left: 4px solid {YELLOW_DARK};
    border-radius: 0 10px 10px 0;
    padding: 12px 16px;
    margin: 10px 0;
    color: #4A3400;
    font-weight: 500;
    font-size: 0.88rem;
}}
.danger-box {{
    background-color: #FFF0E3;
    border-left: 4px solid {ORANGE_DARK};
    border-radius: 0 10px 10px 0;
    padding: 12px 16px;
    margin: 10px 0;
    color: #5C1400;
    font-weight: 500;
    font-size: 0.88rem;
}}

/* ── persona card ── */
.persona-card {{
    background-color: {CARD_BG};
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 10px;
    border: 1.5px solid {CREAM_DARK};
    transition: transform .2s, box-shadow .2s;
}}
.persona-card:hover {{
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,.08);
}}

/* ── user profile card ── */
.user-profile-card {{
    background-color: {CARD_BG};
    border-radius: 20px;
    padding: 28px;
    border: 1.5px solid {CREAM_DARK};
    position: relative;
    overflow: hidden;
    margin-bottom: 16px;
}}
.user-profile-card::after {{
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, {TEAL}, {YELLOW}, {ORANGE});
}}

/* ── stat badge ── */
.stat-badge {{
    display: inline-block;
    background-color: rgba(139,223,221,.15);
    color: {TEAL_DARK};
    border: 1px solid rgba(139,223,221,.4);
    border-radius: 10px;
    padding: 4px 12px;
    font-size: 0.8rem;
    font-weight: 600;
    margin: 3px;
}}

/* ── hr ── */
hr {{ border-color: {CREAM_DARK}; margin: 1.5rem 0; }}

/* ── dataframe ── */
.stDataFrame {{ border-radius: 12px; overflow: hidden; }}

/* ── selectbox / multiselect ── */
div[data-testid="stSelectbox"] > div,
div[data-testid="stMultiSelect"] > div {{
    border-radius: 10px;
    background-color: {CARD_BG};
    border-color: {CREAM_DARK};
}}
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────
RANDOM_SEED          = 42
NIGHT_START          = 20
ANOMALY_STD_FACTOR   = 1.5
SMALL_TXN_MULTIPLIER = 0.5
FREQ_MONTH_THRESH    = 10
IMPULSE_THRESHOLD    = 0.55
M_LBL = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]

np.random.seed(RANDOM_SEED)

SEGMENTS = {
    "E": {
        "label": "Kelas E (Miskin)", "pct_pop": 0.15,
        "income_range": (800_000, 1_500_000), "spending_ratio": (0.85, 0.98),
        "txn_per_month": (8, 20), "txn_amount_dist": "low",
        "payment_methods": {"Tunai": 0.55, "GoPay": 0.25, "OVO": 0.12, "DANA": 0.08},
        "categories": {
            "Sembako & Kebutuhan Pokok": 0.40, "Transportasi": 0.20,
            "Pulsa & Data": 0.15, "Makanan & Minuman": 0.15,
            "Kesehatan": 0.05, "Pendidikan": 0.05,
        },
        "city_tier": {"Desa": 0.45, "Kota Kecil": 0.40, "Kota Besar": 0.15},
        "age_range": (18, 55), "weekend_boost": 1.05, "night_prob": 0.08, "impulse_base": 0.15,
    },
    "D": {
        "label": "Kelas D (Menengah Bawah)", "pct_pop": 0.25,
        "income_range": (1_500_000, 3_000_000), "spending_ratio": (0.75, 0.92),
        "txn_per_month": (15, 35), "txn_amount_dist": "low_mid",
        "payment_methods": {"Tunai": 0.30, "GoPay": 0.30, "OVO": 0.20, "DANA": 0.12, "Transfer Bank": 0.08},
        "categories": {
            "Sembako & Kebutuhan Pokok": 0.28, "Makanan & Minuman": 0.22,
            "Transportasi": 0.18, "Pulsa & Data": 0.12, "Fashion & Pakaian": 0.08,
            "Kesehatan": 0.06, "Pendidikan": 0.04, "Hiburan": 0.02,
        },
        "city_tier": {"Desa": 0.20, "Kota Kecil": 0.45, "Kota Besar": 0.35},
        "age_range": (18, 50), "weekend_boost": 1.15, "night_prob": 0.15, "impulse_base": 0.25,
    },
    "C": {
        "label": "Kelas C (Menengah)", "pct_pop": 0.35,
        "income_range": (3_000_000, 7_000_000), "spending_ratio": (0.60, 0.82),
        "txn_per_month": (25, 60), "txn_amount_dist": "mid",
        "payment_methods": {"GoPay": 0.25, "OVO": 0.20, "Kartu Debit": 0.20,
                            "Transfer Bank": 0.15, "DANA": 0.12, "Tunai": 0.08},
        "categories": {
            "Makanan & Minuman": 0.25, "Belanja Online": 0.18,
            "Sembako & Kebutuhan Pokok": 0.15, "Fashion & Pakaian": 0.10,
            "Transportasi": 0.10, "Hiburan": 0.08,
            "Kesehatan & Kecantikan": 0.06, "Pulsa & Data": 0.05, "Pendidikan": 0.03,
        },
        "city_tier": {"Kota Kecil": 0.30, "Kota Besar": 0.55, "Metropolitan": 0.15},
        "age_range": (18, 45), "weekend_boost": 1.30, "night_prob": 0.25, "impulse_base": 0.40,
    },
    "B": {
        "label": "Kelas B (Menengah Atas)", "pct_pop": 0.18,
        "income_range": (7_000_000, 20_000_000), "spending_ratio": (0.45, 0.70),
        "txn_per_month": (40, 90), "txn_amount_dist": "mid_high",
        "payment_methods": {"Kartu Kredit": 0.30, "Kartu Debit": 0.25, "GoPay": 0.18,
                            "Transfer Bank": 0.15, "OVO": 0.08, "ShopeePay": 0.04},
        "categories": {
            "Makanan & Minuman": 0.22, "Belanja Online": 0.18, "Fashion & Pakaian": 0.12,
            "Hiburan": 0.10, "Transportasi": 0.09, "Kecantikan & Perawatan": 0.08,
            "Elektronik": 0.07, "Restoran & Kafe": 0.07, "Olahraga & Gym": 0.04, "Travel & Hotel": 0.03,
        },
        "city_tier": {"Kota Besar": 0.45, "Metropolitan": 0.55},
        "age_range": (22, 50), "weekend_boost": 1.50, "night_prob": 0.35, "impulse_base": 0.55,
    },
    "A": {
        "label": "Kelas A (Kaya)", "pct_pop": 0.07,
        "income_range": (20_000_000, 150_000_000), "spending_ratio": (0.25, 0.55),
        "txn_per_month": (50, 150), "txn_amount_dist": "high",
        "payment_methods": {"Kartu Kredit": 0.45, "Transfer Bank": 0.30,
                            "Kartu Debit": 0.15, "GoPay": 0.10},
        "categories": {
            "Restoran & Kafe": 0.18, "Travel & Hotel": 0.15, "Fashion & Pakaian": 0.13,
            "Elektronik": 0.10, "Kecantikan & Perawatan": 0.08, "Hiburan": 0.08,
            "Belanja Online": 0.08, "Olahraga & Gym": 0.07,
            "Investasi & Asuransi": 0.07, "Properti & Renovasi": 0.06,
        },
        "city_tier": {"Metropolitan": 0.75, "Kota Besar": 0.25},
        "age_range": (25, 60), "weekend_boost": 1.70, "night_prob": 0.45, "impulse_base": 0.65,
    },
}

TXN_AMOUNT_PARAMS = {
    "low":      {"mean":    60_000, "min":   5_000, "max":    200_000},
    "low_mid":  {"mean":   150_000, "min":  10_000, "max":    500_000},
    "mid":      {"mean":   300_000, "min":  20_000, "max":  1_500_000},
    "mid_high": {"mean":   600_000, "min":  50_000, "max":  5_000_000},
    "high":     {"mean": 2_000_000, "min": 100_000, "max": 50_000_000},
}

SEASON_BOOST = {
    1:1.05, 2:0.90, 3:0.95, 4:1.00, 5:1.25,
    6:1.35, 7:1.10, 8:0.95, 9:0.90,
    10:0.95, 11:1.05, 12:1.30,
}

KOTA_INDONESIA = [
    {"kota":"Jakarta",    "tier":"Metropolitan", "lat":-6.2088, "long":106.8456},
    {"kota":"Surabaya",   "tier":"Metropolitan", "lat":-7.2575, "long":112.7521},
    {"kota":"Bandung",    "tier":"Metropolitan", "lat":-6.9175, "long":107.6191},
    {"kota":"Medan",      "tier":"Metropolitan", "lat": 3.5952, "long": 98.6722},
    {"kota":"Semarang",   "tier":"Kota Besar",  "lat":-6.9932, "long":110.4203},
    {"kota":"Makassar",   "tier":"Kota Besar",  "lat":-5.1477, "long":119.4327},
    {"kota":"Tangerang",  "tier":"Kota Besar",  "lat":-6.1784, "long":106.6319},
    {"kota":"Bekasi",     "tier":"Kota Besar",  "lat":-6.2383, "long":106.9756},
    {"kota":"Yogyakarta", "tier":"Kota Besar",  "lat":-7.7956, "long":110.3695},
    {"kota":"Malang",     "tier":"Kota Besar",  "lat":-7.9666, "long":112.6326},
    {"kota":"Denpasar",   "tier":"Kota Besar",  "lat":-8.6705, "long":115.2126},
    {"kota":"Bogor",      "tier":"Kota Besar",  "lat":-6.5971, "long":106.8060},
    {"kota":"Pekanbaru",  "tier":"Kota Kecil",  "lat": 0.5335, "long":101.4498},
    {"kota":"Balikpapan", "tier":"Kota Kecil",  "lat":-1.2379, "long":116.8529},
    {"kota":"Desa Maju",  "tier":"Desa",        "lat":-7.0,    "long":110.0},
]

# ─────────────────────────────────────────────
# PLOTLY LAYOUT HELPER
# ─────────────────────────────────────────────
def budu_layout(**kwargs):
    """Return a dict of Plotly layout kwargs with BUDU static palette."""
    base = dict(
        paper_bgcolor=CREAM,
        plot_bgcolor=CREAM,
        font=dict(family="Poppins, sans-serif", color=TEXT_MAIN),
        margin=dict(t=30, b=10, l=10, r=10),
        colorway=PALETTE,
    )
    base.update(kwargs)
    return base

def style_axis(fig):
    """Apply light grid styling to all axes."""
    fig.update_xaxes(
        showgrid=True, gridcolor=CREAM_DARK, gridwidth=0.5,
        zeroline=False, tickfont=dict(family="Poppins", color=TEXT_MUTED),
    )
    fig.update_yaxes(
        showgrid=True, gridcolor=CREAM_DARK, gridwidth=0.5,
        zeroline=False, tickfont=dict(family="Poppins", color=TEXT_MUTED),
    )
    return fig

# ─────────────────────────────────────────────
# DATA GENERATION
# ─────────────────────────────────────────────
@st.cache_data(show_spinner="⚙️ Membuat dataset dummy Indonesia...")
def load_data():
    np.random.seed(RANDOM_SEED)
    N_USERS        = 1_000
    N_TRANSACTIONS = 50_000

    seg_keys  = list(SEGMENTS.keys())
    seg_probs = [SEGMENTS[s]["pct_pop"] for s in seg_keys]
    user_list = []

    for i in range(N_USERS):
        seg_key = np.random.choice(seg_keys, p=seg_probs)
        seg     = SEGMENTS[seg_key]
        kota_pool = [k for k in KOTA_INDONESIA if k["tier"] in seg["city_tier"]]
        if not kota_pool:
            kota_pool = KOTA_INDONESIA
        kota_w = np.array([seg["city_tier"].get(k["tier"], 0.01) for k in kota_pool], dtype=float)
        kota_w /= kota_w.sum()
        kota    = kota_pool[np.random.choice(len(kota_pool), p=kota_w)]
        income  = np.random.randint(*seg["income_range"])
        user_list.append({
            "user_id":          f"BUDU{i+1:05d}",
            "nama":             f"User {i+1}",
            "segmen":           seg_key,
            "segmen_label":     seg["label"],
            "usia":             np.random.randint(*seg["age_range"]),
            "gender":           np.random.choice(["L", "P"]),
            "kota":             kota["kota"],
            "tier_kota":        kota["tier"],
            "lat":              round(kota["lat"]  + np.random.uniform(-0.15, 0.15), 4),
            "long":             round(kota["long"] + np.random.uniform(-0.15, 0.15), 4),
            "pendapatan_bulan": income,
            "pekerjaan":        "Karyawan",
        })
    df_users = pd.DataFrame(user_list)

    DATE_START = datetime(2023, 1, 1)
    user_txn_target = {}
    for u in user_list:
        seg = SEGMENTS[u["segmen"]]
        user_txn_target[u["user_id"]] = int(np.random.uniform(*seg["txn_per_month"]) * 24)

    total_gen  = sum(user_txn_target.values())
    scale      = N_TRANSACTIONS / total_gen
    user_txn_target = {uid: max(5, int(v * scale)) for uid, v in user_txn_target.items()}

    tx_list = []
    for u in user_list:
        uid     = u["user_id"]
        seg_key = u["segmen"]
        seg     = SEGMENTS[seg_key]
        n_txn   = user_txn_target[uid]
        cat_keys  = list(seg["categories"].keys())
        cat_probs = np.array(list(seg["categories"].values()), dtype=float)
        cat_probs /= cat_probs.sum()
        pay_keys  = list(seg["payment_methods"].keys())
        pay_probs = np.array(list(seg["payment_methods"].values()), dtype=float)
        pay_probs /= pay_probs.sum()
        p = TXN_AMOUNT_PARAMS[seg["txn_amount_dist"]]

        for _ in range(n_txn):
            txn_date = DATE_START + timedelta(
                days=np.random.randint(0, 730),
                hours=int(np.random.choice(range(24))),
                minutes=np.random.randint(0, 60),
            )
            category = np.random.choice(cat_keys, p=cat_probs)
            payment  = np.random.choice(pay_keys,  p=pay_probs)
            raw = np.random.lognormal(np.log(p["mean"]), 0.7)
            raw = np.clip(raw, p["min"], p["max"])
            if category in ["Travel & Hotel","Elektronik","Properti & Renovasi",
                            "Investasi & Asuransi","Restoran & Kafe"]:
                raw *= np.random.uniform(1.5, 3.5)
            elif category in ["Pulsa & Data","Sembako & Kebutuhan Pokok","Transportasi"]:
                raw *= np.random.uniform(0.3, 0.7)
            amount = max(1_000, round(raw * SEASON_BOOST.get(txn_date.month, 1.0) / 100) * 100)
            fraud_p = {"E":0.003,"D":0.005,"C":0.008,"B":0.012,"A":0.018}.get(seg_key, 0.005)
            tx_list.append({
                "txn_id":         f"TXN{len(tx_list)+1:07d}",
                "user_id":        uid,
                "date":           txn_date,
                "amount":         int(amount),
                "category":       category,
                "payment_method": payment,
                "segmen":         seg_key,
                "segmen_label":   seg["label"],
                "gender":         u["gender"],
                "usia":           u["usia"],
                "kota":           u["kota"],
                "tier_kota":      u["tier_kota"],
                "pendapatan_bulan": u["pendapatan_bulan"],
                "user_lat":       u["lat"],
                "user_long":      u["long"],
                "is_weekend":     int(txn_date.weekday() >= 5),
                "is_night":       int(txn_date.hour >= NIGHT_START),
                "is_fraud":       int(np.random.random() < fraud_p),
                "month":          txn_date.month,
                "hour":           txn_date.hour,
                "day_of_week":    txn_date.weekday(),
                "quarter":        (txn_date.month - 1) // 3 + 1,
                "is_month_start": int(txn_date.day <= 5),
                "is_month_end":   int(txn_date.day >= 25),
            })

    df_tx = pd.DataFrame(tx_list)
    df_tx["date"]      = pd.to_datetime(df_tx["date"])
    df_tx["above_avg"] = (df_tx["amount"] > df_tx["amount"].mean()).astype(int)
    return df_users, df_tx


@st.cache_data(show_spinner="🔬 Menghitung fitur user & persona...")
def build_user_features(_df_tx, _df_users):
    df = _df_tx.copy()
    if "above_avg" not in df.columns:
        df["above_avg"] = (df["amount"] > df["amount"].mean()).astype(int)

    uf = df.groupby("user_id").agg(
        total_spending_idr = ("amount",     "sum"),
        avg_txn_idr        = ("amount",     "mean"),
        median_txn_idr     = ("amount",     "median"),
        max_txn_idr        = ("amount",     "max"),
        txn_count          = ("amount",     "count"),
        std_amount_idr     = ("amount",     "std"),
        weekend_ratio      = ("is_weekend", "mean"),
        night_ratio        = ("is_night",   "mean"),
        fraud_ratio        = ("is_fraud",   "mean"),
        unique_categories  = ("category",   "nunique"),
        active_months      = ("month",      "nunique"),
        above_avg_ratio    = ("above_avg",  "mean"),
    ).reset_index()

    # Spike ratio
    spike_rows = []
    for uid, grp in df.sort_values("date").groupby("user_id"):
        roll = grp["amount"].rolling(7, min_periods=1).mean().shift(1).fillna(grp["amount"].mean())
        spikes = int((grp["amount"] > 2 * roll).sum())
        spike_rows.append({"user_id": uid,
                           "spike_count": spikes,
                           "spike_ratio": spikes / max(len(grp), 1)})
    uf = uf.merge(pd.DataFrame(spike_rows), on="user_id", how="left")

    uf["std_amount_idr"] = uf["std_amount_idr"].fillna(0)
    uf["spending_cov"]   = (uf["std_amount_idr"] / uf["avg_txn_idr"].replace(0, np.nan)).fillna(0)
    uf["impulse_score"]  = (
        uf["weekend_ratio"]   * 0.35 +
        uf["night_ratio"]     * 0.30 +
        uf["above_avg_ratio"] * 0.20 +
        uf["spike_ratio"]     * 0.15
    ).clip(0, 1).round(4)

    def _persona(s):
        if s >= IMPULSE_THRESHOLD: return "Impulsive Spender"
        elif s >= 0.30:            return "Emotional Spender"
        return "Rational Spender"
    uf["spending_persona"] = uf["impulse_score"].apply(_persona)

    demo_cols = [c for c in ["user_id","segmen","segmen_label","usia","gender",
                             "kota","tier_kota","pendapatan_bulan","nama","pekerjaan"]
                 if c in _df_users.columns]
    uf = uf.merge(_df_users[demo_cols], on="user_id", how="left")

    if "pendapatan_bulan" in uf.columns:
        uf["spending_ratio"] = (
            uf["total_spending_idr"] / (uf["pendapatan_bulan"].replace(0, np.nan) * 24)
        ).fillna(0).clip(0, 5)

    if "usia" in uf.columns:
        uf["age_group"] = pd.cut(
            uf["usia"].fillna(25),
            bins=[0, 24, 34, 44, 100],
            labels=["18-24","25-34","35-44","45+"],
        ).astype(str)

    dom_pay = (df.groupby("user_id")["payment_method"]
               .agg(lambda x: x.mode().iloc[0] if len(x) > 0 else "Unknown")
               .reset_index().rename(columns={"payment_method":"dominant_payment"}))
    uf = uf.merge(dom_pay, on="user_id", how="left")

    uf[uf.select_dtypes(include="number").columns] = (
        uf.select_dtypes(include="number").fillna(0)
    )
    return uf


@st.cache_data(show_spinner="🤖 Menjalankan K-Means clustering...")
def run_clustering(_uf):
    FEAT = [c for c in ["total_spending_idr","avg_txn_idr","median_txn_idr",
                        "txn_count","std_amount_idr","weekend_ratio","night_ratio",
                        "unique_categories","impulse_score","spending_cov",
                        "above_avg_ratio","spike_ratio","active_months"] if c in _uf.columns]
    X        = _uf[FEAT].fillna(0).values
    scaler   = StandardScaler()
    Xs       = scaler.fit_transform(X)

    inertias, sil_scores = [], []
    for k in range(2, 9):
        km  = KMeans(n_clusters=k, random_state=42, n_init=10)
        lbl = km.fit_predict(Xs)
        inertias.append(km.inertia_)
        sil_scores.append(silhouette_score(Xs, lbl))

    best_k = list(range(2, 9))[sil_scores.index(max(sil_scores))]
    labels = KMeans(n_clusters=3, random_state=42, n_init=10).fit_predict(Xs)
    pca    = PCA(n_components=2, random_state=42)
    Xp     = pca.fit_transform(Xs)

    return labels, Xp, {
        "k_vals": list(range(2, 9)), "inertias": inertias,
        "sil_scores": sil_scores, "best_k": best_k,
        "pca_var": float(pca.explained_variance_ratio_.sum()),
    }, FEAT


# ─────────────────────────────────────────────
# LOAD DATA
# ─────────────────────────────────────────────
df_users, df_tx = load_data()
user_features = build_user_features(df_tx, df_users)
cluster_labels, pca_coords, cluster_results, feat_cols = run_clustering(user_features)
user_features["cluster"] = cluster_labels

# Map clusters → persona via impulse rank
stats_c = user_features.groupby("cluster")["impulse_score"].mean().sort_values()
sorted_c = stats_c.index.tolist()
TIER = ["Rational Spender", "Emotional Spender", "Impulsive Spender"]
cmap = {sorted_c[0]: TIER[0], sorted_c[-1]: TIER[2]}
for c in sorted_c[1:-1]:
    cmap[c] = TIER[1]
user_features["spending_persona"] = user_features["cluster"].map(cmap)

# ─────────────────────────────────────────────
# SIDEBAR
# ─────────────────────────────────────────────
with st.sidebar:
    st.markdown(f"""
    <div style='text-align:center;padding:16px 0 8px;'>
      <span style='font-size:2rem;'>💸</span><br>
      <span style='font-size:1.2rem;font-weight:800;color:{TEXT_MAIN};'>BUDU</span><br>
      <span style='font-size:0.75rem;color:{TEXT_MUTED};font-weight:600;'>SpendBehavior Analyzer</span>
    </div>
    <hr/>
    """, unsafe_allow_html=True)

    menu = st.radio("📌 Navigasi", [
        "🏠 Overview",
        "📊 EDA & Business Questions",
        "🧪 A/B Testing",
        "👥 Clustering & Persona",
        "🔎 User Deep Dive",
        "📖 Data Dictionary",
    ])

    st.markdown("<hr/>", unsafe_allow_html=True)
    st.markdown(f"""
    <div style='background:{CARD_BG};padding:14px;border-radius:12px;
                border:1.5px solid {CREAM_DARK};font-size:0.8rem;'>
      <b style='color:{TEXT_MAIN};'>👥 Tim CC26-PSU268</b><br>
      <span style='color:{TEXT_MUTED};'>Coding Camp 2026 · DBS Foundation</span><hr/>
      <b style='color:{TEXT_MAIN};'>🧠 Data Science</b>
      <ul style='color:{TEXT_MUTED};margin:4px 0 8px 16px;'>
        <li>Dwi Cahyawati</li><li>Mutia Saniya Rahma</li>
      </ul>
      <b style='color:{TEXT_MAIN};'>🤖 AI Engineer</b>
      <ul style='color:{TEXT_MUTED};margin:4px 0 8px 16px;'>
        <li>Aliya Shahira</li><li>Khalisha Rana Putri</li>
      </ul>
      <b style='color:{TEXT_MAIN};'>💻 Full-Stack Dev</b>
      <ul style='color:{TEXT_MUTED};margin:4px 0 0 16px;'>
        <li>Hamzah Hudzairah</li><li>Berton Adiwidya Wibowo</li>
      </ul>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<hr/>", unsafe_allow_html=True)
    st.caption(f"Dataset: {len(df_users):,} user · {len(df_tx):,} transaksi")
    st.caption(f"Periode: {df_tx['date'].min():%b %Y} – {df_tx['date'].max():%b %Y}")

    available_segs = sorted(df_tx["segmen"].dropna().unique().tolist())
    seg_filter = st.multiselect(
        "Filter Segmen (Global)",
        options=["A","B","C","D","E"],
        default=available_segs,
    )

# ─────────────────────────────────────────────
# GLOBAL FILTER
# ─────────────────────────────────────────────
df_f  = df_tx[df_tx["segmen"].isin(seg_filter)] if "segmen" in df_tx.columns else df_tx.copy()
uf_f  = user_features[user_features["segmen"].isin(seg_filter)].copy()

# ─────────────────────────────────────────────
# HEADER BANNER
# ─────────────────────────────────────────────
st.markdown(f"""
<div style='background:linear-gradient(135deg,{ORANGE} 0%,{YELLOW} 55%,{TEAL} 100%);
            border-radius:20px;padding:36px 40px;margin-bottom:28px;
            position:relative;overflow:hidden;'>
  <div style='position:absolute;top:-50px;right:-50px;width:200px;height:200px;
              background:rgba(255,255,255,.15);border-radius:50%;'></div>
  <h1 style='font-family:Poppins,sans-serif;font-size:2rem;font-weight:800;
             color:{TEXT_MAIN};margin:0 0 6px;letter-spacing:-0.3px;'>
    💸 BUDU — SpendBehavior Analyzer
  </h1>
  <p style='font-family:Poppins,sans-serif;color:#5C4400;font-size:0.9rem;margin:0;'>
    Coding Camp 2026 · DBS Foundation · Tim CC26-PSU268 &nbsp;|&nbsp; Dataset Dummy Indonesia (IDR)
  </p>
  <div style='margin-top:14px;display:flex;flex-wrap:wrap;gap:8px;'>
    {"".join(f'<span style="background:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.6);border-radius:20px;padding:4px 14px;font-size:0.8rem;font-weight:700;color:{TEXT_MAIN};">{b}</span>'
             for b in [f"👤 {len(df_users):,} User",
                       f"💳 {len(df_tx):,} Transaksi",
                       f"💰 Rp {df_tx['amount'].sum()/1e9:.1f} Miliar IDR",
                       f"📅 {df_tx['date'].min():%b %Y} – {df_tx['date'].max():%b %Y}",
                       "🗂️ 5 Segmen Sosio-Ekonomi"])}
  </div>
</div>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════
# ██  OVERVIEW  ██
# ══════════════════════════════════════════════
if menu == "🏠 Overview":
    st.markdown('<p class="section-title">📌 Ringkasan Utama</p>', unsafe_allow_html=True)

    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("Total User",      f"{len(df_users):,}",                    "5 Segmen")
    c2.metric("Total Transaksi", f"{len(df_tx):,}",                       "24 Bulan")
    c3.metric("Total Spending",  f"Rp {df_tx['amount'].sum()/1e9:.1f}M",  "Miliar IDR")
    c4.metric("Avg Transaksi",   f"Rp {df_tx['amount'].mean():,.0f}",     "per txn")
    imp_pct = (uf_f["spending_persona"] == "Impulsive Spender").mean() * 100
    c5.metric("Impulsive Spender", f"{imp_pct:.1f}%", "≥ score 0.55", delta_color="inverse")

    st.markdown("---")
    col_a, col_b = st.columns(2)

    with col_a:
        st.markdown('<p class="section-title">👤 Distribusi Segmen Sosio-Ekonomi</p>', unsafe_allow_html=True)
        seg_count = (df_users[df_users["segmen"].isin(seg_filter)]
                     .groupby("segmen_label").size().reset_index(name="Jumlah"))
        fig = px.pie(seg_count, names="segmen_label", values="Jumlah",
                     color_discrete_sequence=PALETTE, hole=0.4)
        fig.update_traces(textposition="outside", textinfo="percent+label",
                          textfont=dict(family="Poppins", color=TEXT_MAIN))
        fig.update_layout(**budu_layout(showlegend=False, height=320,
                                        margin=dict(t=10, b=10, l=10, r=10)))
        st.plotly_chart(fig, use_container_width=True)

    with col_b:
        st.markdown('<p class="section-title">🏙️ Distribusi Tier Kota</p>', unsafe_allow_html=True)
        tier_count = (df_users[df_users["segmen"].isin(seg_filter)]
                      ["tier_kota"].value_counts().reset_index())
        tier_count.columns = ["Tier", "Jumlah"]
        fig = px.bar(tier_count, x="Tier", y="Jumlah",
                     color="Tier", color_discrete_sequence=PALETTE, text_auto=True)
        fig.update_traces(textfont=dict(family="Poppins"))
        fig.update_layout(**budu_layout(showlegend=False, height=320))
        style_axis(fig)
        st.plotly_chart(fig, use_container_width=True)

    st.markdown("---")
    st.markdown('<p class="section-title">🏷️ Top Kategori Pengeluaran (IDR)</p>', unsafe_allow_html=True)
    cat_spend = (df_f.groupby("category")["amount"].sum()
                 .sort_values(ascending=False).reset_index())
    cat_spend["amount_M"] = cat_spend["amount"] / 1e6
    fig = px.bar(cat_spend, x="category", y="amount_M",
                 color="amount_M", color_continuous_scale=[TEAL, YELLOW, ORANGE],
                 text=cat_spend["amount_M"].apply(lambda x: f"Rp {x:.1f}M"),
                 labels={"amount_M":"Total (Juta IDR)", "category":"Kategori"})
    fig.update_traces(textposition="outside", textfont=dict(family="Poppins"))
    fig.update_layout(**budu_layout(coloraxis_showscale=False, showlegend=False,
                                    height=380, xaxis_tickangle=-30))
    style_axis(fig)
    st.plotly_chart(fig, use_container_width=True)

    col_c, col_d = st.columns(2)
    with col_c:
        st.markdown('<p class="section-title">📅 Tren Spending Bulanan</p>', unsafe_allow_html=True)
        monthly = (df_f.groupby("month")["amount"].sum()
                   .reset_index().sort_values("month"))
        monthly["month_name"] = monthly["month"].apply(lambda m: M_LBL[m-1])
        monthly["amount_M"]   = monthly["amount"] / 1e6
        fig = px.area(monthly, x="month_name", y="amount_M",
                      color_discrete_sequence=[ORANGE],
                      labels={"amount_M":"Total (Juta IDR)", "month_name":"Bulan"})
        fig.update_traces(line=dict(width=3), fillcolor=f"rgba(244,143,104,0.2)")
        fig.update_layout(**budu_layout(height=300))
        style_axis(fig)
        st.plotly_chart(fig, use_container_width=True)

    with col_d:
        st.markdown('<p class="section-title">💳 Metode Pembayaran</p>', unsafe_allow_html=True)
        pay_count = df_f["payment_method"].value_counts().reset_index()
        pay_count.columns = ["Metode", "Frekuensi"]
        fig = px.pie(pay_count.head(8), names="Metode", values="Frekuensi",
                     color_discrete_sequence=PALETTE, hole=0.3)
        fig.update_traces(textfont=dict(family="Poppins"))
        fig.update_layout(**budu_layout(height=300, margin=dict(t=10, b=10)))
        st.plotly_chart(fig, use_container_width=True)


# ══════════════════════════════════════════════
# ██  EDA & BUSINESS QUESTIONS  ██
# ══════════════════════════════════════════════
elif menu == "📊 EDA & Business Questions":
    st.subheader("🔍 6 Business Questions SMART")
    tabs = st.tabs(["Q1 Money Leak","Q2 Weekend Pattern","Q3 Monthly Anomaly",
                    "Q4 Silent Drain","Q5 Payment Spearman","Q6 Impulsive Profile"])

    # ── Q1 ──
    with tabs[0]:
        st.markdown("#### 💰 Q1: Kategori mana yang menyumbang ≥30% total pengeluaran?")
        st.markdown('<div class="insight-box">📌 Tujuan: Identifikasi kategori utama penyumbang spending untuk fitur <b>Money Leak Warning</b> BUDU.</div>', unsafe_allow_html=True)
        cs = df_f.groupby("category")["amount"].sum().sort_values(ascending=False).reset_index()
        cs["pct"]            = cs["amount"] / cs["amount"].sum() * 100
        cs["cumulative_pct"] = cs["pct"].cumsum()
        top_cats = cs[cs["pct"] >= 2].copy()

        col1, col2 = st.columns([3, 1])
        with col1:
            fig = make_subplots(specs=[[{"secondary_y": True}]])
            fig.add_trace(go.Bar(x=top_cats["category"], y=top_cats["pct"],
                                 name="% Spending",
                                 marker=dict(color=PALETTE[:len(top_cats)]),
                                 text=top_cats["pct"].apply(lambda x: f"{x:.1f}%"),
                                 textposition="outside"), secondary_y=False)
            fig.add_trace(go.Scatter(x=top_cats["category"], y=top_cats["cumulative_pct"],
                                     name="Kumulatif %",
                                     line=dict(color=ORANGE, width=2.5),
                                     mode="lines+markers"), secondary_y=True)
            fig.update_layout(**budu_layout(height=380, xaxis_tickangle=-25))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)
        with col2:
            st.markdown("**Top 5 Kategori:**")
            for _, row in cs.head(5).iterrows():
                st.markdown(f"**{row['category']}**")
                st.progress(int(min(row["pct"], 100)))
                st.caption(f"Rp {row['amount']/1e6:.1f}M ({row['pct']:.1f}%)")
        top2 = cs.head(2)["pct"].sum()
        if top2 >= 30:
            st.markdown(f'<div class="warn-box">⚠️ 2 kategori teratas menyumbang <b>{top2:.1f}%</b> total spending.</div>', unsafe_allow_html=True)

    # ── Q2 ──
    with tabs[1]:
        st.markdown("#### 📅 Q2: Apakah rata-rata transaksi weekend ≥20% lebih tinggi dari weekday?")
        wknd = df_f.groupby("is_weekend")["amount"].agg(["mean","median","count"]).reset_index()
        wknd["label"] = wknd["is_weekend"].map({0:"Weekday", 1:"Weekend"})
        avg_wknd = wknd.loc[wknd["is_weekend"]==1,"mean"].values[0]
        avg_wkdy = wknd.loc[wknd["is_weekend"]==0,"mean"].values[0]
        diff_pct = (avg_wknd - avg_wkdy) / avg_wkdy * 100

        col1, col2 = st.columns(2)
        with col1:
            fig = px.bar(wknd, x="label", y="mean",
                         color="label",
                         color_discrete_map={"Weekday": TEAL, "Weekend": ORANGE},
                         text=wknd["mean"].apply(lambda x: f"Rp {x:,.0f}"),
                         labels={"mean":"Rata-rata (IDR)","label":""})
            fig.update_traces(textposition="outside", textfont=dict(family="Poppins"))
            fig.update_layout(**budu_layout(showlegend=False, height=320))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)
        with col2:
            sample = df_f.sample(min(5000, len(df_f)), random_state=42).copy()
            sample["Tipe Hari"] = sample["is_weekend"].map({0:"Weekday", 1:"Weekend"})
            fig = px.violin(sample, x="Tipe Hari", y="amount", color="Tipe Hari",
                            color_discrete_map={"Weekday": TEAL, "Weekend": ORANGE},
                            box=True, labels={"Tipe Hari":"","amount":"Amount (IDR)"})
            fig.update_layout(**budu_layout(showlegend=False, height=320))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)

        col_m1, col_m2, col_m3 = st.columns(3)
        col_m1.metric("Avg Weekday", f"Rp {avg_wkdy:,.0f}")
        col_m2.metric("Avg Weekend", f"Rp {avg_wknd:,.0f}")
        col_m3.metric("Perbedaan",   f"{diff_pct:.1f}%")
        if diff_pct >= 20:
            st.markdown(f'<div class="warn-box">⚠️ Weekend <b>{diff_pct:.1f}%</b> lebih tinggi. BUDU aktifkan notifikasi Jumat malam.</div>', unsafe_allow_html=True)

    # ── Q3 ──
    with tabs[2]:
        st.markdown("#### 📈 Q3: Bulan apa total pengeluaran melebihi mean + 1.5×SD?")
        monthly = df_f.groupby("month")["amount"].agg(total="sum", count="count").reset_index()
        thr = monthly["total"].mean() + ANOMALY_STD_FACTOR * monthly["total"].std()
        monthly["anomaly"] = monthly["total"] > thr

        col1, col2 = st.columns(2)
        with col1:
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=monthly["month"], y=monthly["total"]/1e6,
                mode="lines+markers", line=dict(color=TEAL_DARK, width=3), name="Total Spending"))
            fig.add_hline(y=thr/1e6, line_dash="dash", line_color=ORANGE,
                          annotation_text=f"Threshold (mean+{ANOMALY_STD_FACTOR}σ)",
                          annotation_font=dict(family="Poppins", color=ORANGE))
            anom = monthly[monthly["anomaly"]]
            fig.add_trace(go.Scatter(
                x=anom["month"], y=anom["total"]/1e6,
                mode="markers", marker=dict(color=ORANGE, size=12), name="Anomali"))
            fig.update_layout(**budu_layout(height=360,
                xaxis=dict(tickmode="array", tickvals=list(range(1,13)), ticktext=M_LBL)))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)
        with col2:
            fig = px.bar(monthly, x="month", y="count",
                         color=monthly["anomaly"].map({True:ORANGE, False:TEAL}),
                         color_discrete_map="identity",
                         text="count",
                         labels={"count":"Jumlah Transaksi"})
            fig.update_traces(textposition="outside", textfont=dict(family="Poppins"))
            fig.update_layout(**budu_layout(showlegend=False, height=360,
                xaxis=dict(tickmode="array", tickvals=list(range(1,13)), ticktext=M_LBL)))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)

        anom_names = [M_LBL[m-1] for m in anom["month"].tolist()]
        if anom_names:
            st.markdown(f'<div class="warn-box">⚠️ Bulan anomali: <b>{", ".join(anom_names)}</b> | Threshold: Rp {thr/1e6:.1f} juta/bulan</div>', unsafe_allow_html=True)

    # ── Q4 ──
    with tabs[3]:
        st.markdown("#### 🚰 Q4: Kategori mana yang bocor diam-diam (kecil, frekuensi tinggi)?")
        small_lim = df_f["amount"].median() * SMALL_TXN_MULTIPLIER
        df_small  = df_f[df_f["amount"] <= small_lim]
        n_months  = max(df_f["month"].nunique(), 1)
        leak = (df_small.groupby("category")
                .agg(total_idr=("amount","sum"), freq=("amount","count"), avg_idr=("amount","mean"))
                .assign(freq_monthly=lambda x: x["freq"] / n_months)
                .sort_values("total_idr", ascending=False).reset_index())
        display_leak = leak[leak["freq_monthly"] >= FREQ_MONTH_THRESH]
        if display_leak.empty:
            display_leak = leak.head(10)

        col1, col2 = st.columns(2)
        with col1:
            fig = px.bar(display_leak.head(10), x="total_idr", y="category",
                         orientation="h",
                         color="total_idr",
                         color_continuous_scale=[YELLOW, ORANGE],
                         text=display_leak.head(10)["total_idr"].apply(lambda x: f"Rp {x/1e6:.1f}M"),
                         labels={"total_idr":"Akumulasi (IDR)","category":""})
            fig.update_traces(textposition="outside", textfont=dict(family="Poppins"))
            fig.update_layout(**budu_layout(coloraxis_showscale=False, height=380))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)
        with col2:
            fig = px.scatter(display_leak, x="freq_monthly", y="avg_idr",
                             size="total_idr", color="category",
                             color_discrete_sequence=PALETTE, text="category",
                             labels={"freq_monthly":"Frekuensi/Bulan","avg_idr":"Avg Nilai (IDR)"})
            fig.update_traces(textposition="top center", textfont=dict(size=9, family="Poppins"))
            fig.update_layout(**budu_layout(showlegend=False, height=380))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)
        st.markdown(f'<div class="warn-box">⚠️ Batas transaksi "kecil": ≤ Rp {small_lim:,.0f} | Total bocor: <b>Rp {df_small["amount"].sum()/1e9:.2f}M IDR</b></div>', unsafe_allow_html=True)

    # ── Q5 ──
    with tabs[4]:
        st.markdown("#### 💳 Q5: Apakah metode pembayaran berkorelasi dengan nilai transaksi? (Spearman ρ ≥ 0.3)")
        pay = (df_f.groupby("payment_method")["amount"]
               .agg(total="sum", count="count", avg="mean")
               .sort_values("total", ascending=False).reset_index())
        pay_enc = df_f["payment_method"].astype("category").cat.codes
        rho, pval = spearmanr(pay_enc, df_f["amount"])

        cm1, cm2, cm3 = st.columns(3)
        cm1.metric("Spearman ρ", f"{rho:.4f}")
        cm2.metric("P-value",    f"{pval:.4f}")
        cm3.metric("Kekuatan",   "Signifikan (≥0.3)" if abs(rho) >= 0.3 else "Lemah (<0.3)")

        col1, col2, col3 = st.columns(3)
        for ax_col, col_key, lbl, fmt in [
            (col1, "total", "Total (Juta IDR)",     lambda x: f"{x/1e6:.1f}M"),
            (col2, "count", "Frekuensi",             lambda x: f"{x:,}"),
            (col3, "avg",   "Rata-rata (Ribu IDR)", lambda x: f"{x/1e3:.0f}K"),
        ]:
            fig = px.bar(pay, x="payment_method", y=col_key, color="payment_method",
                         color_discrete_sequence=PALETTE,
                         text=pay[col_key].apply(fmt))
            fig.update_traces(textposition="outside", textfont=dict(family="Poppins"))
            fig.update_layout(**budu_layout(showlegend=False, height=350,
                                            xaxis_tickangle=-20, title=lbl))
            style_axis(fig)
            ax_col.plotly_chart(fig, use_container_width=True)

        if abs(rho) >= 0.3:
            st.markdown(f'<div class="success-box">✅ Korelasi signifikan (ρ = {rho:.2f}) — BUDU sesuaikan konteks warning berdasarkan metode pembayaran.</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="warn-box">ℹ️ Korelasi lemah (ρ = {rho:.2f} < 0.3).</div>', unsafe_allow_html=True)

    # ── Q6 ──
    with tabs[5]:
        st.markdown(f"#### ⚡ Q6: Berapa proporsi user dengan impulse_score ≥ {IMPULSE_THRESHOLD}?")
        n_imp = (uf_f["impulse_score"] >= IMPULSE_THRESHOLD).sum()
        n_tot = len(uf_f)
        st.markdown(f'<div class="warn-box">📌 Q6 Answer: <b>{n_imp}/{n_tot} pengguna = {n_imp/n_tot*100:.1f}%</b> Impulsive Spender</div>', unsafe_allow_html=True)

        persona_dist = uf_f["spending_persona"].value_counts().reset_index()
        persona_dist.columns = ["Persona","Count"]
        col1, col2 = st.columns(2)
        with col1:
            fig = px.pie(persona_dist, names="Persona", values="Count",
                         color="Persona",
                         color_discrete_map=PERSONA_COLORS, hole=0.45)
            fig.update_traces(textfont=dict(family="Poppins"))
            fig.update_layout(**budu_layout(height=320))
            st.plotly_chart(fig, use_container_width=True)
        with col2:
            imp_profile = uf_f.groupby("spending_persona").agg(
                avg_impulse=("impulse_score","mean"),
                avg_spend=("total_spending_idr","mean"),
                avg_weekend_r=("weekend_ratio","mean"),
                avg_night_r=("night_ratio","mean"),
                count=("user_id","count"),
            ).reset_index()
            st.dataframe(imp_profile.set_index("spending_persona"), use_container_width=True)

        fig = px.box(uf_f, x="segmen", y="impulse_score",
                     color="spending_persona",
                     color_discrete_map=PERSONA_COLORS,
                     category_orders={"segmen":["E","D","C","B","A"]},
                     labels={"segmen":"Segmen","impulse_score":"Impulse Score"})
        fig.add_hline(y=IMPULSE_THRESHOLD, line_dash="dash", line_color=ORANGE,
                      annotation_text=f"Threshold Impulsive ({IMPULSE_THRESHOLD})",
                      annotation_font=dict(family="Poppins"))
        fig.add_hline(y=0.30, line_dash="dot", line_color=YELLOW_DARK,
                      annotation_text="Threshold Emotional (0.30)",
                      annotation_font=dict(family="Poppins"))
        fig.update_layout(**budu_layout(height=380))
        style_axis(fig)
        st.plotly_chart(fig, use_container_width=True)


# ══════════════════════════════════════════════
# ██  A/B TESTING  ██
# ══════════════════════════════════════════════
elif menu == "🧪 A/B Testing":
    st.subheader("🧪 A/B Test: Weekend vs Weekday Spending")
    st.markdown("Menggunakan **Mann-Whitney U Test** (non-parametric). H0: tidak ada perbedaan. H1: pengeluaran weekend ≥20% lebih tinggi.")

    grp_w = df_f[df_f["is_weekend"] == 1]["amount"]
    grp_d = df_f[df_f["is_weekend"] == 0]["amount"]
    u_stat, p_val = mannwhitneyu(grp_w, grp_d, alternative="greater")
    pct_diff = (grp_w.mean() - grp_d.mean()) / grp_d.mean() * 100
    alpha = 0.05

    c1,c2,c3,c4,c5 = st.columns(5)
    c1.metric("Mann-Whitney U", f"{u_stat:,.0f}")
    c2.metric("P-value",        f"{p_val:.6f}")
    c3.metric("Avg Weekend",    f"Rp {grp_w.mean():,.0f}")
    c4.metric("Avg Weekday",    f"Rp {grp_d.mean():,.0f}")
    c5.metric("Selisih",        f"{pct_diff:.1f}%")

    if p_val < alpha and pct_diff >= 20:
        st.markdown(f'<div class="success-box">✅ <b>TOLAK H0</b> — signifikan (p={p_val:.6f}) DAN selisih {pct_diff:.1f}% ≥ 20%. BUDU aktifkan Smart Warning Jumat malam.</div>', unsafe_allow_html=True)
    elif p_val < alpha:
        st.markdown(f'<div class="warn-box">⚠️ Signifikan statistik tapi selisih {pct_diff:.1f}% &lt; 20%.</div>', unsafe_allow_html=True)
    else:
        st.markdown(f'<div class="insight-box">ℹ️ Gagal tolak H0 (p={p_val:.4f} ≥ {alpha})</div>', unsafe_allow_html=True)

    col1, col2 = st.columns(2)
    with col1:
        sample = df_f.sample(min(8000, len(df_f)), random_state=42).copy()
        sample["Tipe Hari"] = sample["is_weekend"].map({0:"Weekday", 1:"Weekend"})
        fig = px.violin(sample, x="Tipe Hari", y="amount", color="Tipe Hari",
                        color_discrete_map={"Weekday": TEAL, "Weekend": ORANGE},
                        box=True, labels={"amount":"Amount (IDR)","Tipe Hari":""})
        fig.update_layout(**budu_layout(showlegend=False, height=380))
        style_axis(fig)
        st.plotly_chart(fig, use_container_width=True)
    with col2:
        day_names = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"]
        daily = df_f.groupby("day_of_week")["amount"].mean().reset_index()
        daily["day"]        = daily["day_of_week"].map(dict(enumerate(day_names)))
        daily["is_weekend"] = daily["day_of_week"].isin([5, 6])
        fig = px.bar(daily, x="day", y="amount",
                     color=daily["is_weekend"].map({False: TEAL, True: ORANGE}),
                     color_discrete_map="identity",
                     text=daily["amount"].apply(lambda x: f"Rp {x/1000:.0f}K"),
                     labels={"amount":"Avg Amount (IDR)","day":"Hari"})
        fig.update_traces(textposition="outside", textfont=dict(family="Poppins"))
        fig.update_layout(**budu_layout(showlegend=False, height=380))
        style_axis(fig)
        st.plotly_chart(fig, use_container_width=True)

    seg_ab = df_f.groupby(["segmen","is_weekend"])["amount"].mean().reset_index()
    seg_ab["Tipe Hari"] = seg_ab["is_weekend"].map({0:"Weekday", 1:"Weekend"})
    fig = px.bar(seg_ab, x="segmen", y="amount", color="Tipe Hari", barmode="group",
                 color_discrete_map={"Weekday": TEAL, "Weekend": ORANGE},
                 labels={"amount":"Avg Amount (IDR)","segmen":"Segmen"},
                 category_orders={"segmen":["E","D","C","B","A"]},
                 text=seg_ab["amount"].apply(lambda x: f"Rp {x/1000:.0f}K"))
    fig.update_traces(textposition="outside",
                      textfont=dict(size=9, family="Poppins"))
    fig.update_layout(**budu_layout(height=360))
    style_axis(fig)
    st.plotly_chart(fig, use_container_width=True)


# ══════════════════════════════════════════════
# ██  CLUSTERING & PERSONA  ██
# ══════════════════════════════════════════════
elif menu == "👥 Clustering & Persona":
    st.subheader("👥 Spending Persona — K-Means Clustering")
    st.markdown("Elbow Method + Silhouette + PCA Visualization. K final = 3.")

    persona_desc = {
        "Rational Spender":  "Konsisten, terkontrol, jarang spike. Impulse score < 0.30.",
        "Emotional Spender": "Tidak konsisten, spending_cov tinggi. Impulse score 0.30–0.55.",
        "Impulsive Spender": "Weekend & malam tinggi, banyak spike. Impulse score ≥ 0.55.",
    }
    persona_counts = uf_f["spending_persona"].value_counts()
    total_uf = len(uf_f)
    cols = st.columns(3)
    for i, name in enumerate(["Rational Spender","Emotional Spender","Impulsive Spender"]):
        cnt = persona_counts.get(name, 0)
        pct = cnt / total_uf * 100 if total_uf > 0 else 0
        clr = PERSONA_COLORS[name]
        with cols[i]:
            st.markdown(f"""
            <div class="persona-card" style="border-left:5px solid {clr};background:{clr}15;">
              <div style="font-size:1.8rem;">{PERSONA_ICONS[name]}</div>
              <div style="font-size:1rem;font-weight:700;color:{clr};">{name}</div>
              <div style="font-size:2rem;font-weight:800;color:{TEXT_MAIN};">{cnt}</div>
              <div style="color:{TEXT_MUTED};font-size:0.82rem;">{pct:.1f}% dari {total_uf} user</div>
              <hr style="border-color:{clr}30;margin:8px 0;"/>
              <div style="font-size:0.8rem;color:{TEXT_MUTED};">{persona_desc[name]}</div>
            </div>
            """, unsafe_allow_html=True)

    col_e, col_s = st.columns(2)
    with col_e:
        fig = px.line(x=cluster_results["k_vals"], y=cluster_results["inertias"],
                      markers=True, labels={"x":"K","y":"Inertia"},
                      color_discrete_sequence=[ORANGE])
        fig.update_traces(line=dict(width=3), marker=dict(size=9))
        fig.update_layout(**budu_layout(title="Elbow Method", height=300))
        style_axis(fig)
        st.plotly_chart(fig, use_container_width=True)
    with col_s:
        fig = px.line(x=cluster_results["k_vals"], y=cluster_results["sil_scores"],
                      markers=True, labels={"x":"K","y":"Silhouette Score"},
                      color_discrete_sequence=[TEAL])
        fig.update_traces(line=dict(width=3), marker=dict(size=9))
        fig.update_layout(**budu_layout(title="Silhouette Score", height=300))
        style_axis(fig)
        st.plotly_chart(fig, use_container_width=True)

    st.markdown(f'<div class="success-box">✅ K terbaik (Silhouette): <b>{cluster_results["best_k"]}</b> ({max(cluster_results["sil_scores"]):.4f}) | Dashboard menggunakan K=3 sesuai notebook</div>', unsafe_allow_html=True)

    pca_df = pd.DataFrame(pca_coords, columns=["PC1","PC2"])
    pca_df["Persona"] = user_features["spending_persona"]
    pca_df["Impulse"] = user_features["impulse_score"].clip(lower=0.001)
    if "segmen" in user_features.columns:
        pca_df["Segmen"] = user_features["segmen"]
        pca_df = pca_df[pca_df["Segmen"].isin(seg_filter)]

    fig = px.scatter(pca_df, x="PC1", y="PC2", color="Persona",
                     color_discrete_map=PERSONA_COLORS,
                     size="Impulse", opacity=0.75,
                     labels={"PC1":f"PC1 ({cluster_results['pca_var']*100:.1f}% var)", "PC2":"PC2"})
    fig.update_layout(**budu_layout(title="PCA — Spending Personality Map", height=450))
    style_axis(fig)
    st.plotly_chart(fig, use_container_width=True)

    col_r1, col_r2 = st.columns(2)
    with col_r1:
        seg_persona = uf_f.groupby(["segmen","spending_persona"]).size().reset_index(name="count")
        fig = px.bar(seg_persona, x="segmen", y="count", color="spending_persona",
                     barmode="stack", color_discrete_map=PERSONA_COLORS,
                     category_orders={"segmen":["E","D","C","B","A"]},
                     labels={"count":"Jumlah User","segmen":"Segmen"})
        fig.update_layout(**budu_layout(title="Persona per Segmen", height=360))
        style_axis(fig)
        st.plotly_chart(fig, use_container_width=True)
    with col_r2:
        fig = px.histogram(uf_f, x="impulse_score", color="spending_persona",
                           nbins=40, color_discrete_map=PERSONA_COLORS,
                           barmode="overlay", opacity=0.75)
        fig.add_vline(x=IMPULSE_THRESHOLD, line_dash="dash", line_color=ORANGE,
                      annotation_text=f"Impulsive ({IMPULSE_THRESHOLD})",
                      annotation_font=dict(family="Poppins"))
        fig.add_vline(x=0.30, line_dash="dot", line_color=YELLOW_DARK,
                      annotation_text="Emotional (0.30)",
                      annotation_font=dict(family="Poppins"))
        fig.update_layout(**budu_layout(title="Impulse Score Distribution", height=360))
        style_axis(fig)
        st.plotly_chart(fig, use_container_width=True)

    st.dataframe(
        uf_f.groupby("spending_persona").agg(
            Jumlah_User=("user_id","count"),
            Avg_Impulse=("impulse_score","mean"),
            Avg_TotalSpend=("total_spending_idr","mean"),
            Avg_TxnCount=("txn_count","mean"),
            Avg_WeekendR=("weekend_ratio","mean"),
            Avg_NightR=("night_ratio","mean"),
            Avg_SpikeR=("spike_ratio","mean"),
        ).round(3),
        use_container_width=True,
    )


# ══════════════════════════════════════════════
# ██  USER DEEP DIVE  ██
# ══════════════════════════════════════════════
elif menu == "🔎 User Deep Dive":
    st.subheader("🔎 User Deep Dive — Analisis Per Pengguna")

    col_f1, col_f2, col_f3 = st.columns([2, 2, 1])
    with col_f1:
        df_users_s = df_users.sort_values("user_id").copy()
        df_users_s["label"] = df_users_s["user_id"] + " — " + df_users_s["nama"]
        uid_map    = dict(zip(df_users_s["label"], df_users_s["user_id"]))
        query = st.text_input("🔍 Cari nama/ID", placeholder="Contoh: User 1, BUDU00001")
        if query:
            matched = df_users_s[df_users_s["label"].str.contains(query, case=False, na=False)]
        else:
            matched = df_users_s
        options = matched["label"].tolist()
        if not options:
            st.warning("Pengguna tidak ditemukan.")
            st.stop()
        selected_label = st.selectbox("Pilih pengguna", options=options)
        selected_uid   = uid_map[selected_label]

    with col_f2:
        date_min = df_tx["date"].min().date()
        date_max = df_tx["date"].max().date()
        date_range_sel = st.date_input("📅 Rentang tanggal",
                                       value=(date_min, date_max),
                                       min_value=date_min, max_value=date_max)
        if isinstance(date_range_sel, (list, tuple)) and len(date_range_sel) == 2:
            d_start, d_end = date_range_sel
        else:
            d_start, d_end = date_min, date_max

    with col_f3:
        st.markdown("####")
        show_raw = st.toggle("Tampilkan tabel transaksi", value=False)

    u_tx = df_tx[
        (df_tx["user_id"] == selected_uid) &
        (df_tx["date"].dt.date >= d_start) &
        (df_tx["date"].dt.date <= d_end)
    ].copy().sort_values("date")

    if u_tx.empty:
        st.warning(f"Tidak ada transaksi untuk {selected_uid} di rentang tanggal yang dipilih.")
        st.stop()

    u_profile = user_features[user_features["user_id"] == selected_uid]
    u_demo    = df_users[df_users["user_id"] == selected_uid]

    persona = u_profile["spending_persona"].values[0] if len(u_profile) > 0 else "Unknown"
    impulse = float(u_profile["impulse_score"].values[0]) if len(u_profile) > 0 else 0.0
    p_color = PERSONA_COLORS.get(persona, TEXT_MUTED)
    p_icon  = PERSONA_ICONS.get(persona, "⚪")

    def _get(df, col, default="–"):
        return df[col].values[0] if (len(df) > 0 and col in df.columns) else default

    nama_val    = _get(u_demo, "nama",        selected_uid)
    gender_val  = _get(u_demo, "gender",      "–")
    usia_val    = _get(u_demo, "usia",         "–")
    kota_val    = _get(u_demo, "kota",         "–")
    tier_val    = _get(u_demo, "tier_kota",    "–")
    pekrj_val   = _get(u_demo, "pekerjaan",    "–")
    segmen_val  = _get(u_demo, "segmen_label", "–")
    income_val  = int(_get(u_demo, "pendapatan_bulan", 0))
    gender_icon = "👩" if str(gender_val) == "P" else "👨"

    st.markdown("---")
    col_card, col_stats = st.columns([1, 2])

    with col_card:
        st.markdown(f"""
        <div class="user-profile-card">
          <div style="font-size:2.5rem;margin-bottom:8px;">{gender_icon}</div>
          <div style="font-size:1.2rem;font-weight:800;color:{TEXT_MAIN};">{nama_val}</div>
          <div style="color:{TEXT_MUTED};font-size:0.82rem;margin-bottom:10px;">{selected_uid}</div>
          <div>
            <span class="stat-badge">🎂 {usia_val} tahun</span>
            <span class="stat-badge">⚥ {gender_val}</span>
          </div>
          <div style="margin-top:6px;">
            <span class="stat-badge">📍 {kota_val}</span>
            <span class="stat-badge">🏙️ {tier_val}</span>
          </div>
          <div style="margin-top:6px;">
            <span class="stat-badge">💼 {pekrj_val}</span>
          </div>
          <div style="margin-top:6px;margin-bottom:14px;">
            <span class="stat-badge">📊 {segmen_val}</span>
          </div>
          <div style="background:{p_color}20;border-radius:12px;padding:12px;text-align:center;
                      border:1.5px solid {p_color}50;">
            <div style="font-size:1.5rem;">{p_icon}</div>
            <div style="font-weight:700;color:{p_color};font-size:0.9rem;">{persona}</div>
            <div style="color:{TEXT_MUTED};font-size:0.78rem;">Impulse Score: {impulse:.4f}</div>
          </div>
          <div style="margin-top:12px;color:{TEXT_MUTED};font-size:0.82rem;">
            💰 Pendapatan: <b>Rp {income_val:,.0f}/bln</b>
          </div>
        </div>
        """, unsafe_allow_html=True)

    with col_stats:
        total_spend = u_tx["amount"].sum()
        avg_txn     = u_tx["amount"].mean()
        n_txn       = len(u_tx)
        n_cat       = u_tx["category"].nunique()
        fraud_n     = u_tx["is_fraud"].sum() if "is_fraud" in u_tx.columns else 0
        night_pct   = u_tx["is_night"].mean() * 100 if "is_night" in u_tx.columns else 0
        weekend_pct = u_tx["is_weekend"].mean() * 100 if "is_weekend" in u_tx.columns else 0
        max_txn     = u_tx["amount"].max()
        spend_ratio = (total_spend / (income_val * 24) * 100) if income_val > 0 else 0

        r1c1, r1c2, r1c3 = st.columns(3)
        r1c1.metric("💸 Total Spending",   f"Rp {total_spend/1e6:.2f}M",   f"{n_txn} transaksi")
        r1c2.metric("📊 Rata-rata/Txn",    f"Rp {avg_txn:,.0f}",           f"Max Rp {max_txn:,.0f}")
        r1c3.metric("🏷️ Kategori",         f"{n_cat} kategori",             f"Fraud: {fraud_n} txn")

        r2c1, r2c2, r2c3 = st.columns(3)
        r2c1.metric("🌙 Transaksi Malam",  f"{night_pct:.1f}%",   "Jam ≥20:00")
        r2c2.metric("📅 Transaksi Weekend", f"{weekend_pct:.1f}%", "Sabtu & Minggu")
        r2c3.metric("📈 Spending Ratio",   f"{spend_ratio:.1f}%", "dari pendapatan (24 bln)")

        if persona == "Impulsive Spender":
            st.markdown('<div class="danger-box">🔴 <b>Smart Warning: AKTIF</b> — Impulsive Spender. BUDU kirim notifikasi Jumat malam & weekend cap.</div>', unsafe_allow_html=True)
        elif persona == "Emotional Spender":
            st.markdown('<div class="warn-box">🟡 <b>Smart Warning: SEDANG</b> — Emotional Spender. BUDU kirim Weekly Reflection setiap Minggu malam.</div>', unsafe_allow_html=True)
        else:
            st.markdown('<div class="success-box">🟢 <b>Smart Warning: RENDAH</b> — Rational Spender. BUDU kirim insight dan tips investasi bulanan.</div>', unsafe_allow_html=True)

    st.markdown("---")
    tab1, tab2, tab3, tab4 = st.tabs([
        "📊 Kategori & Spending",
        "📅 Pola Waktu",
        "💳 Metode Pembayaran",
        "📈 Tren Bulanan",
    ])

    with tab1:
        col1, col2 = st.columns(2)
        cat_user = (u_tx.groupby("category")["amount"]
                    .agg(total="sum", count="count", avg="mean")
                    .sort_values("total", ascending=False).reset_index())
        cat_user["pct"] = cat_user["total"] / cat_user["total"].sum() * 100
        with col1:
            fig = px.pie(cat_user, names="category", values="total",
                         color_discrete_sequence=PALETTE, hole=0.35,
                         title=f"Distribusi Spending — {nama_val}")
            fig.update_traces(textposition="outside", textinfo="percent+label",
                              textfont=dict(family="Poppins"))
            fig.update_layout(**budu_layout(height=380))
            st.plotly_chart(fig, use_container_width=True)
        with col2:
            fig = px.bar(cat_user, x="total", y="category", orientation="h",
                         color="total",
                         color_continuous_scale=[CREAM_DARK, TEAL, ORANGE],
                         text=cat_user["total"].apply(lambda x: f"Rp {x/1e3:.0f}K"),
                         labels={"total":"Total (IDR)","category":"Kategori"})
            fig.update_traces(textposition="outside", textfont=dict(family="Poppins"))
            fig.update_layout(**budu_layout(coloraxis_showscale=False, height=380,
                                            yaxis={"categoryorder":"total ascending"}))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)

        st.markdown("#### 📊 Distribusi Nilai Transaksi")
        col_d1, col_d2 = st.columns(2)
        with col_d1:
            fig = px.histogram(u_tx, x="amount", nbins=30,
                               color_discrete_sequence=[TEAL],
                               labels={"amount":"Amount (IDR)","count":"Frekuensi"})
            fig.add_vline(x=u_tx["amount"].mean(), line_dash="dash", line_color=ORANGE,
                          annotation_text=f"Mean: Rp {u_tx['amount'].mean():,.0f}",
                          annotation_font=dict(family="Poppins"))
            fig.add_vline(x=u_tx["amount"].median(), line_dash="dot", line_color=YELLOW_DARK,
                          annotation_text=f"Median: Rp {u_tx['amount'].median():,.0f}",
                          annotation_font=dict(family="Poppins"))
            fig.update_layout(**budu_layout(height=300))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)
        with col_d2:
            bins_idr = [0, 50_000, 200_000, 500_000, 1_000_000, float("inf")]
            lbl_idr  = ["<50k","50k-200k","200k-500k","500k-1jt",">1jt"]
            u_tx["_bucket"] = pd.cut(u_tx["amount"], bins=bins_idr, labels=lbl_idr)
            bk = u_tx["_bucket"].value_counts().reindex(lbl_idr, fill_value=0).reset_index()
            bk.columns = ["Bucket","Count"]
            fig = px.bar(bk, x="Bucket", y="Count",
                         color="Bucket", color_discrete_sequence=PALETTE, text="Count")
            fig.update_traces(textposition="outside", textfont=dict(family="Poppins"))
            fig.update_layout(**budu_layout(showlegend=False, height=300))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)

    with tab2:
        col1, col2 = st.columns(2)
        with col1:
            hourly_u = u_tx.groupby("hour")["amount"].agg(total="sum", count="count", avg="mean").reset_index()
            fig = go.Figure()
            fig.add_trace(go.Bar(x=hourly_u["hour"], y=hourly_u["count"],
                                 name="Frekuensi", marker_color=TEAL, yaxis="y"))
            fig.add_trace(go.Scatter(x=hourly_u["hour"], y=hourly_u["avg"]/1e3,
                                     name="Avg Amount (ribu IDR)",
                                     line=dict(color=ORANGE, width=2.5),
                                     mode="lines+markers", yaxis="y2"))
            fig.add_vrect(x0=20, x1=23, fillcolor=ORANGE, opacity=0.08,
                          annotation_text="Malam", annotation_position="top left",
                          annotation_font=dict(family="Poppins"))
            fig.update_layout(**budu_layout(
                height=350, title="Pola Spending per Jam",
                xaxis=dict(title="Jam", tickmode="linear", dtick=2),
                yaxis=dict(title="Jumlah Transaksi"),
                yaxis2=dict(title="Avg Amount (ribu IDR)", overlaying="y", side="right"),
                legend=dict(orientation="h", y=-0.25),
            ))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)
        with col2:
            day_names = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"]
            daily_u = u_tx.groupby("day_of_week")["amount"].agg(avg="mean", count="count").reset_index()
            daily_u["day_name"] = daily_u["day_of_week"].map(dict(enumerate(day_names)))
            daily_u["is_wknd"]  = daily_u["day_of_week"].isin([5, 6])
            fig = px.bar(daily_u, x="day_name", y="avg",
                         color=daily_u["is_wknd"].map({False: TEAL, True: ORANGE}),
                         color_discrete_map="identity",
                         text=daily_u["avg"].apply(lambda x: f"Rp {x/1e3:.0f}K"),
                         labels={"avg":"Avg Amount (IDR)","day_name":"Hari"},
                         category_orders={"day_name": day_names})
            fig.update_traces(textposition="outside", textfont=dict(family="Poppins"))
            fig.update_layout(**budu_layout(showlegend=False, height=350, title="Pola per Hari"))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)

        wknd_u = u_tx[u_tx["is_weekend"]==1]["amount"]
        wkdy_u = u_tx[u_tx["is_weekend"]==0]["amount"]
        if len(wknd_u) > 0 and len(wkdy_u) > 0:
            diff_u = (wknd_u.mean() - wkdy_u.mean()) / wkdy_u.mean() * 100
            cw1, cw2, cw3 = st.columns(3)
            cw1.metric("Avg Weekday", f"Rp {wkdy_u.mean():,.0f}", f"{len(wkdy_u)} txn")
            cw2.metric("Avg Weekend", f"Rp {wknd_u.mean():,.0f}", f"{len(wknd_u)} txn")
            cw3.metric("Selisih", f"{diff_u:.1f}%",
                       "⬆️ Impulsif di weekend" if diff_u > 20 else "Normal")

    with tab3:
        col1, col2 = st.columns(2)
        pay_u = (u_tx.groupby("payment_method")["amount"]
                 .agg(total="sum", count="count", avg="mean")
                 .sort_values("total", ascending=False).reset_index())
        with col1:
            fig = px.pie(pay_u, names="payment_method", values="count",
                         color_discrete_sequence=PALETTE, hole=0.4,
                         title="Frekuensi per Metode")
            fig.update_traces(textposition="outside", textinfo="percent+label",
                              textfont=dict(family="Poppins"))
            fig.update_layout(**budu_layout(height=360))
            st.plotly_chart(fig, use_container_width=True)
        with col2:
            fig = px.bar(pay_u, x="payment_method", y="total",
                         color="payment_method", color_discrete_sequence=PALETTE,
                         text=pay_u["total"].apply(lambda x: f"Rp {x/1e3:.0f}K"),
                         labels={"total":"Total (IDR)","payment_method":"Metode"})
            fig.update_traces(textposition="outside", textfont=dict(family="Poppins"))
            fig.update_layout(**budu_layout(showlegend=False, height=360, title="Total per Metode"))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)
        dom_pay = pay_u.iloc[0]["payment_method"]
        st.markdown(f'<div class="insight-box">💳 Metode dominan <b>{nama_val}</b>: <b>{dom_pay}</b> (berdasarkan total spending)</div>', unsafe_allow_html=True)

    with tab4:
        col1, col2 = st.columns(2)
        monthly_u = (u_tx.groupby("month")["amount"]
                     .agg(total="sum", count="count", avg="mean")
                     .reset_index().sort_values("month"))
        monthly_u["month_name"] = monthly_u["month"].apply(lambda m: M_LBL[m-1])
        if len(monthly_u) > 2:
            thr_u = monthly_u["total"].mean() + ANOMALY_STD_FACTOR * monthly_u["total"].std()
            monthly_u["anomaly"] = monthly_u["total"] > thr_u
        else:
            monthly_u["anomaly"] = False
            thr_u = monthly_u["total"].max()

        with col1:
            fig = go.Figure()
            fig.add_trace(go.Bar(
                x=monthly_u["month_name"], y=monthly_u["total"]/1e3,
                name="Total (ribu IDR)",
                marker_color=monthly_u["anomaly"].map({True: ORANGE, False: TEAL}).tolist()))
            fig.add_trace(go.Scatter(
                x=monthly_u["month_name"], y=monthly_u["avg"]/1e3,
                name="Avg/Txn", line=dict(color=YELLOW_DARK, width=2.5, dash="dot"),
                mode="lines+markers", yaxis="y2"))
            fig.add_hline(y=thr_u/1e3, line_dash="dash", line_color=ORANGE, opacity=0.5,
                          annotation_text="Threshold", annotation_font=dict(family="Poppins"))
            fig.update_layout(**budu_layout(
                height=380, title="Tren Bulanan",
                yaxis=dict(title="Total (ribu IDR)"),
                yaxis2=dict(title="Avg/Txn (ribu IDR)", overlaying="y", side="right"),
                legend=dict(orientation="h", y=-0.25),
            ))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)

        with col2:
            top_cats_u = u_tx.groupby("category")["amount"].sum().nlargest(5).index
            cat_month  = (u_tx[u_tx["category"].isin(top_cats_u)]
                          .groupby(["month","category"])["amount"].sum().reset_index())
            cat_month["month_name"] = cat_month["month"].apply(lambda m: M_LBL[m-1])
            fig = px.line(cat_month, x="month_name", y="amount", color="category",
                          color_discrete_sequence=PALETTE, markers=True,
                          labels={"amount":"Total (IDR)","month_name":"Bulan","category":"Kategori"},
                          title="Spending Kategori per Bulan")
            fig.update_layout(**budu_layout(height=380))
            style_axis(fig)
            st.plotly_chart(fig, use_container_width=True)

        u_sorted = u_tx.sort_values("date").copy()
        u_sorted["rolling_7"] = u_sorted["amount"].rolling(7, min_periods=1).mean()
        u_sorted["spike_flag"] = u_sorted["amount"] > u_sorted["rolling_7"] * 2
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=u_sorted["date"], y=u_sorted["amount"]/1e3, mode="markers",
            name="Transaksi",
            marker=dict(size=6, color=u_sorted["spike_flag"].map({True: ORANGE, False: TEAL}).tolist(), opacity=0.7)))
        fig.add_trace(go.Scatter(
            x=u_sorted["date"], y=u_sorted["rolling_7"]/1e3, mode="lines",
            name="Rolling Mean 7 Txn", line=dict(color=YELLOW_DARK, width=2.5)))
        fig.update_layout(**budu_layout(
            height=320, title="Timeline Transaksi & Rolling 7 Txn",
            xaxis_title="Tanggal", yaxis_title="Amount (ribu IDR)",
            legend=dict(orientation="h", y=-0.25),
        ))
        style_axis(fig)
        st.plotly_chart(fig, use_container_width=True)
        n_spikes = u_sorted["spike_flag"].sum()
        if n_spikes > 0:
            st.markdown(f'<div class="warn-box">⚠️ Terdeteksi <b>{n_spikes} spike transaksi</b> (>2× rolling mean 7 txn). Ditandai oranye di grafik.</div>', unsafe_allow_html=True)

    if show_raw:
        st.markdown("---")
        st.markdown("#### 📋 Riwayat Transaksi Lengkap")
        display_cols = [c for c in ["txn_id","date","amount","category",
                                     "payment_method","is_weekend","is_night","is_fraud"]
                        if c in u_tx.columns]
        st.dataframe(
            u_tx[display_cols].sort_values("date", ascending=False).reset_index(drop=True),
            use_container_width=True, height=400,
        )
        csv_bytes = u_tx[display_cols].to_csv(index=False).encode("utf-8")
        st.download_button(
            label=f"⬇️ Download transaksi {selected_uid} (.csv)",
            data=csv_bytes,
            file_name=f"budu_{selected_uid}_transactions.csv",
            mime="text/csv",
        )


# ══════════════════════════════════════════════
# ██  DATA DICTIONARY  ██
# ══════════════════════════════════════════════
elif menu == "📖 Data Dictionary":
    st.subheader("📖 Data Dictionary — BUDU Dataset")
    tab_d = st.tabs(["Segmen","Kolom Transaksi","Fitur Temporal","User Features","Spending Persona"])

    with tab_d[0]:
        st.dataframe(pd.DataFrame([
            {"Segmen":"E","Label":"Kelas E (Miskin)",        "% Pop":"15%","Income/Bulan":"Rp 800rb–1,5jt","Metode Dominan":"Tunai 55%",        "Kota":"Desa / Kota Kecil"},
            {"Segmen":"D","Label":"Kelas D (Menengah Bawah)","% Pop":"25%","Income/Bulan":"Rp 1,5–3jt",   "Metode Dominan":"GoPay 30%",        "Kota":"Kota Kecil / Besar"},
            {"Segmen":"C","Label":"Kelas C (Menengah)",      "% Pop":"35%","Income/Bulan":"Rp 3–7jt",     "Metode Dominan":"GoPay/OVO/Debit",  "Kota":"Kota Besar"},
            {"Segmen":"B","Label":"Kelas B (Menengah Atas)", "% Pop":"18%","Income/Bulan":"Rp 7–20jt",    "Metode Dominan":"Kartu Kredit 30%", "Kota":"Kota Besar/Metropolitan"},
            {"Segmen":"A","Label":"Kelas A (Kaya)",          "% Pop":"7%", "Income/Bulan":"Rp 20–150jt",  "Metode Dominan":"Kartu Kredit 45%", "Kota":"Metropolitan"},
        ]), use_container_width=True, hide_index=True)

    with tab_d[1]:
        st.dataframe(pd.DataFrame([
            {"Kolom":"txn_id",           "Tipe":"string",   "Satuan":"-",      "Deskripsi":"ID unik transaksi"},
            {"Kolom":"user_id",          "Tipe":"string",   "Satuan":"-",      "Deskripsi":"ID unik pengguna BUDU"},
            {"Kolom":"date",             "Tipe":"datetime", "Satuan":"-",      "Deskripsi":"Tanggal & jam transaksi"},
            {"Kolom":"amount",           "Tipe":"int",      "Satuan":"IDR",    "Deskripsi":"Nilai transaksi dalam Rupiah"},
            {"Kolom":"category",         "Tipe":"string",   "Satuan":"-",      "Deskripsi":"Kategori utama pengeluaran"},
            {"Kolom":"payment_method",   "Tipe":"string",   "Satuan":"-",      "Deskripsi":"Metode pembayaran"},
            {"Kolom":"segmen",           "Tipe":"string",   "Satuan":"-",      "Deskripsi":"Kode segmen E/D/C/B/A"},
            {"Kolom":"pendapatan_bulan", "Tipe":"int",      "Satuan":"IDR",    "Deskripsi":"Pendapatan bulanan user"},
            {"Kolom":"is_fraud",         "Tipe":"int",      "Satuan":"0/1",    "Deskripsi":"Label fraud (1=fraud)"},
        ]), use_container_width=True, hide_index=True)

    with tab_d[2]:
        st.dataframe(pd.DataFrame([
            {"Fitur":"month",        "Tipe":"int", "Deskripsi":"Bulan 1-12",          "Dipakai":"EDA, Model"},
            {"Fitur":"day_of_week",  "Tipe":"int", "Deskripsi":"0=Senin … 6=Minggu",  "Dipakai":"EDA, Model"},
            {"Fitur":"hour",         "Tipe":"int", "Deskripsi":"Jam 0-23",             "Dipakai":"EDA, Model"},
            {"Fitur":"is_weekend",   "Tipe":"0/1", "Deskripsi":"1 jika Sabtu/Minggu", "Dipakai":"Model, A/B Test"},
            {"Fitur":"is_night",     "Tipe":"0/1", "Deskripsi":"1 jika jam ≥20",      "Dipakai":"Model, Warning"},
            {"Fitur":"is_month_start","Tipe":"0/1","Deskripsi":"1 jika tgl 1-5",      "Dipakai":"Model"},
            {"Fitur":"is_month_end", "Tipe":"0/1", "Deskripsi":"1 jika tgl 25-31",    "Dipakai":"Model"},
        ]), use_container_width=True, hide_index=True)

    with tab_d[3]:
        st.dataframe(pd.DataFrame([
            {"Fitur":"total_spending_idr", "Satuan":"IDR",   "Deskripsi":"Total pengeluaran sepanjang periode"},
            {"Fitur":"avg_txn_idr",        "Satuan":"IDR",   "Deskripsi":"Rata-rata nilai transaksi"},
            {"Fitur":"txn_count",          "Satuan":"count", "Deskripsi":"Jumlah total transaksi"},
            {"Fitur":"weekend_ratio",      "Satuan":"0-1",   "Deskripsi":"Proporsi transaksi di weekend"},
            {"Fitur":"night_ratio",        "Satuan":"0-1",   "Deskripsi":"Proporsi transaksi malam ≥20:00"},
            {"Fitur":"above_avg_ratio",    "Satuan":"0-1",   "Deskripsi":"Proporsi transaksi di atas rata-rata global"},
            {"Fitur":"spike_ratio",        "Satuan":"0-1",   "Deskripsi":"Proporsi transaksi spike (>2× rolling mean 7)"},
            {"Fitur":"spending_cov",       "Satuan":"ratio", "Deskripsi":"Koefisien variasi (std/mean)"},
            {"Fitur":"impulse_score",      "Satuan":"0-1",   "Deskripsi":"Skor impulsivitas — lihat formula"},
            {"Fitur":"active_months",      "Satuan":"count", "Deskripsi":"Jumlah bulan aktif"},
            {"Fitur":"fraud_ratio",        "Satuan":"0-1",   "Deskripsi":"Proporsi transaksi fraud"},
        ]), use_container_width=True, hide_index=True)

    with tab_d[4]:
        st.markdown(f"""
| Label | Impulse Score | Karakteristik | Smart Warning |
|---|---|---|---|
| **Rational Spender** | < 0.30 | Konsisten, terkontrol | 🔵 Rendah – insight informatif |
| **Emotional Spender** | 0.30–0.55 | Fluktuatif, spending_cov tinggi | 🟡 Sedang – Weekly Reflection |
| **Impulsive Spender** | ≥ 0.55 | Weekend/malam tinggi, spike tinggi | 🔴 Tinggi – notifikasi Jumat malam |

**Formula Impulse Score:**
```
impulse_score = (weekend_ratio × 0.35)
              + (night_ratio   × 0.30)
              + (above_avg_ratio × 0.20)
              + (spike_ratio   × 0.15)
```
        """)

    st.markdown("---")
    st.markdown("#### 🔎 Preview Transaksi (50 baris pertama)")
    preview_cols = [c for c in ["txn_id","user_id","date","amount","category",
                                 "payment_method","segmen","gender","usia","kota",
                                 "is_weekend","is_night","is_fraud","month","hour"]
                    if c in df_f.columns]
    st.dataframe(df_f[preview_cols].head(50), use_container_width=True)

    st.markdown("#### 👤 Preview User Features (50 baris pertama)")
    preview_uf = [c for c in ["user_id","segmen","segmen_label","usia","gender","kota",
                               "pendapatan_bulan","txn_count","total_spending_idr",
                               "avg_txn_idr","impulse_score","spending_persona",
                               "weekend_ratio","night_ratio","above_avg_ratio","spike_ratio"]
                  if c in uf_f.columns]
    st.dataframe(uf_f[preview_uf].head(50), use_container_width=True)