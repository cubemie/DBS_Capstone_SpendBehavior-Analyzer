# ============================================================
# BUDU — SpendBehavior Analyzer Dashboard
# Coding Camp 2026 · DBS Foundation · Tim CC26-PSU268
# ============================================================

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

# ==========================================
# PAGE CONFIG
# ==========================================
st.set_page_config(
    page_title="BUDU — SpendBehavior Analyzer",
    page_icon="💸",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==========================================
# CUSTOM CSS  — ORANGE THEME
# ==========================================
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    /* ── Base typography ── */
    html, body, [class*="css"] {
        font-family: 'DM Sans', sans-serif;
    }
    
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Sora', sans-serif !important;
    }
    
    /* ── Page background ── */
    .main {
        background-color: #FFF6DE;
    }
    
    .block-container {
        padding: 1.5rem 2rem;
    }
    
    /* ── Sidebar ── */
    [data-testid="stSidebar"] {
        background: #F48F68;
    }
    
    [data-testid="stSidebar"] .stRadio label {
        color: #FFF6DE !important;
        font-weight: 500;
        font-family: 'DM Sans', sans-serif;
    }
    
    [data-testid="stSidebar"] h1,
    [data-testid="stSidebar"] h2,
    [data-testid="stSidebar"] h3,
    [data-testid="stSidebar"] p {
        color: white !important;
        text-align: center;
    }
    
    [data-testid="stSidebar"] .stMarkdown {
        color:  #FFF6DE;
        text-align: center;
    }
    
    /* ── Sidebar BUDU Brand ── */
    [data-testid="stSidebar"] .stMarkdown h2 {
        font-family: 'Sora', sans-serif !important;
        font-size: 1.8rem !important;
        font-weight: 800 !important;
        letter-spacing: -0.5px;
        color: white !important;
        text-align: center;
    }
    
    /* ── Metric Cards ── */
    [data-testid="metric-container"] {
        background: white;
        border-radius: 16px;
        padding: 18px 22px;
        border: 1px solid #FFE394;
        box-shadow: 0 1px 10px rgba(244,143,104,0.10);
        transition: all 0.2s ease;
    }
    
    [data-testid="metric-container"]:hover {
        box-shadow: 0 4px 20px rgba(244,143,104,0.18);
        transform: translateY(-2px);
    }
    
    [data-testid="stMetricValue"] {
        font-weight: 700;
        color: #8C5A44;
        font-family: 'Inter', sans-serif;
        font-size: 1.9rem;
        line-height: 1.1;
        letter-spacing: -1px;
        white-space: nowrap;
    }
    
    [data-testid="stMetricLabel"] {
        color: #A56A4F;
        font-weight: 600;
        font-size: 0.82rem;
    }
    
    /* ── Section Title ── */
    .section-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #8C5A44;
        font-family: 'Sora', sans-serif;
        margin-bottom: 0.5rem;
        padding-left: 10px;
        border-left: 4px solid #F48F68;
    }
    
    /* ── Persona Card ── */
    .persona-card {
        border-radius: 14px;
        padding: 18px 16px;
        margin-bottom: 8px;
        transition: transform 0.15s;
        background: white;
    }
    
    .persona-card:hover {
        transform: translateY(-2px);
    }
    
    /* ── Insight Box ── */
    .insight-box {
        background: linear-gradient(
            135deg,
            #FFF8EE,
            #FFE8D9
        );
        border-left: 4px solid #F48F68;
        border-radius: 12px;
        padding: 14px 18px;
        margin: 10px 0;
        color: #8C5A44;
        font-weight: 500;
    }
    
    /* ── Warning Box ── */
    .warn-box {
        background: linear-gradient(
            135deg,
            #FFF6DE,
            #FFE9B8
        );
        border-left: 4px solid #FFE394;
        border-radius: 12px;
        padding: 14px 18px;
        margin: 10px 0;
        color: #8C5A44;
        font-weight: 500;
    }
    
    /* ── Success Box ── */
    .success-box {
        background: linear-gradient(
            135deg,
            #E8FAF9,
            #D4F4F2
        );
        border-left: 4px solid #8BDFDD;
        border-radius: 12px;
        padding: 14px 18px;
        margin: 10px 0;
        color: #4E6E6D;
        font-weight: 500;
    }
    
    /* ── Danger Box ── */
    .danger-box {
        background: linear-gradient(
            135deg,
            #FFF0EC,
            #FFD8CC
        );
        border-left: 4px solid #F48F68;
        border-radius: 12px;
        padding: 14px 18px;
        margin: 10px 0;
        color: #8C5A44;
        font-weight: 500;
    }
    
    /* ── User Profile Card ── */
    .user-profile-card {
        background: white;
        border-radius: 20px;
        padding: 24px;
        border: 1px solid #FFE394;
        box-shadow: 0 4px 24px rgba(244,143,104,0.12);
        margin-bottom: 16px;
    }
    
    /* ── User Name ── */
    .user-profile-name {
        font-family: 'Poppins', sans-serif !important;
        font-size: 2rem;
        font-weight: 700;
        color: #8C5A44;
        line-height: 1.1;
        letter-spacing: -0.5px;
    }
    
    /* ── User Badge ── */
    .user-stat-badge {
        display: inline-block;
        background: #FFF6DE;
        color: #F48F68;
        border-radius: 10px;
        padding: 5px 12px;
        font-size: 0.82rem;
        font-weight: 600;
        margin: 3px 3px;
    }
    
    /* ── Tabs ── */
    .stTabs [data-baseweb="tab-list"] {
        gap: 6px;
        background: #FFF6DE;
        border-radius: 12px;
        padding: 6px;
    }
    
    .stTabs [data-baseweb="tab"] {
        border-radius: 8px;
        font-weight: 600;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.88rem;
        letter-spacing: 0.01em;
        color: #8C5A44;
        padding: 8px 14px;
        white-space: nowrap;
        background: transparent;
        border: none;
    }
    
    .stTabs [aria-selected="true"] {
        color: white !important;
        background: #F48F68 !important;
        border-radius: 8px;
    }
    
    /* ── Expander ── */
    .streamlit-expanderHeader {
        font-weight: 600;
        color: #8C5A44;
        font-family: 'Sora', sans-serif;
    }
    
    /* ── Divider ── */
    hr {
        border-color: #FFE394;
        margin: 1.2rem 0;
    }
    
    /* ── Header Banner ── */
    .header-banner {
        background: #F48F68;
        border-radius: 20px;
        padding: 30px 36px;
        margin-bottom: 24px;
        color: white;
    }
    
    .header-banner h1 {
        color: white;
        font-size: 2.2rem;
        font-weight: 800;
        margin-bottom: 6px;
        font-family: 'Sora', sans-serif;
        line-height: 1.15;
        letter-spacing: -1px;
    }
    
    .header-banner p {
        color: #FFF6DE;
        font-size: 0.95rem;
        margin: 0;
    }
    
    /* ── Gauge Label ── */
    .gauge-label {
        font-size: 0.78rem;
        color: #8C5A44;
        text-align: center;
        margin-top: 4px;
    }
    
    </style>
    """, unsafe_allow_html=True)

# ==========================================
# CONSTANTS
# ==========================================
RANDOM_SEED          = 42
NIGHT_START          = 20
ANOMALY_STD_FACTOR   = 1.5
SMALL_TXN_MULTIPLIER = 0.5
FREQ_MONTH_THRESH    = 10
IMPULSE_THRESHOLD    = 0.55
PRIMARY, ACCENT, WARN = '#E89B7A', '#8BDFDD', '#EF4444'
PALETTE = [ '#F48F68', '#8BDFDD', '#FFE394', '#F7B7A3', '#FFD6B8', '#A8E6E3', '#F6CFC2', '#E9C46A']

np.random.seed(RANDOM_SEED)

SEGMENTS = {
    'E': {
        'label': 'Kelas E (Miskin)', 'pct_pop': 0.15,
        'income_range': (800_000, 1_500_000), 'spending_ratio': (0.85, 0.98),
        'txn_per_month': (8, 20), 'txn_amount_dist': 'low',
        'payment_methods': {'Tunai': 0.55, 'GoPay': 0.25, 'OVO': 0.12, 'DANA': 0.08},
        'categories': {
            'Sembako & Kebutuhan Pokok': 0.40, 'Transportasi': 0.20,
            'Pulsa & Data': 0.15, 'Makanan & Minuman': 0.15,
            'Kesehatan': 0.05, 'Pendidikan': 0.05,
        },
        'city_tier': {'Desa': 0.45, 'Kota Kecil': 0.40, 'Kota Besar': 0.15},
        'age_range': (18, 55), 'weekend_boost': 1.05, 'night_prob': 0.08, 'impulse_base': 0.15,
    },
    'D': {
        'label': 'Kelas D (Menengah Bawah)', 'pct_pop': 0.25,
        'income_range': (1_500_000, 3_000_000), 'spending_ratio': (0.75, 0.92),
        'txn_per_month': (15, 35), 'txn_amount_dist': 'low_mid',
        'payment_methods': {'Tunai': 0.30, 'GoPay': 0.30, 'OVO': 0.20,
                            'DANA': 0.12, 'Transfer Bank': 0.08},
        'categories': {
            'Sembako & Kebutuhan Pokok': 0.28, 'Makanan & Minuman': 0.22,
            'Transportasi': 0.18, 'Pulsa & Data': 0.12, 'Fashion & Pakaian': 0.08,
            'Kesehatan': 0.06, 'Pendidikan': 0.04, 'Hiburan': 0.02,
        },
        'city_tier': {'Desa': 0.20, 'Kota Kecil': 0.45, 'Kota Besar': 0.35},
        'age_range': (18, 50), 'weekend_boost': 1.15, 'night_prob': 0.15, 'impulse_base': 0.25,
    },
    'C': {
        'label': 'Kelas C (Menengah)', 'pct_pop': 0.35,
        'income_range': (3_000_000, 7_000_000), 'spending_ratio': (0.60, 0.82),
        'txn_per_month': (25, 60), 'txn_amount_dist': 'mid',
        'payment_methods': {'GoPay': 0.25, 'OVO': 0.20, 'Kartu Debit': 0.20,
                            'Transfer Bank': 0.15, 'DANA': 0.12, 'Tunai': 0.08},
        'categories': {
            'Makanan & Minuman': 0.25, 'Belanja Online': 0.18,
            'Sembako & Kebutuhan Pokok': 0.15, 'Fashion & Pakaian': 0.10,
            'Transportasi': 0.10, 'Hiburan': 0.08,
            'Kesehatan & Kecantikan': 0.06, 'Pulsa & Data': 0.05, 'Pendidikan': 0.03,
        },
        'city_tier': {'Kota Kecil': 0.30, 'Kota Besar': 0.55, 'Metropolitan': 0.15},
        'age_range': (18, 45), 'weekend_boost': 1.30, 'night_prob': 0.25, 'impulse_base': 0.40,
    },
    'B': {
        'label': 'Kelas B (Menengah Atas)', 'pct_pop': 0.18,
        'income_range': (7_000_000, 20_000_000), 'spending_ratio': (0.45, 0.70),
        'txn_per_month': (40, 90), 'txn_amount_dist': 'mid_high',
        'payment_methods': {'Kartu Kredit': 0.30, 'Kartu Debit': 0.25,
                            'GoPay': 0.18, 'Transfer Bank': 0.15,
                            'OVO': 0.08, 'ShopeePay': 0.04},
        'categories': {
            'Makanan & Minuman': 0.22, 'Belanja Online': 0.18,
            'Fashion & Pakaian': 0.12, 'Hiburan': 0.10, 'Transportasi': 0.09,
            'Kecantikan & Perawatan': 0.08, 'Elektronik': 0.07,
            'Restoran & Kafe': 0.07, 'Olahraga & Gym': 0.04, 'Travel & Hotel': 0.03,
        },
        'city_tier': {'Kota Besar': 0.45, 'Metropolitan': 0.55},
        'age_range': (22, 50), 'weekend_boost': 1.50, 'night_prob': 0.35, 'impulse_base': 0.55,
    },
    'A': {
        'label': 'Kelas A (Kaya)', 'pct_pop': 0.07,
        'income_range': (20_000_000, 150_000_000), 'spending_ratio': (0.25, 0.55),
        'txn_per_month': (50, 150), 'txn_amount_dist': 'high',
        'payment_methods': {'Kartu Kredit': 0.45, 'Transfer Bank': 0.30,
                            'Kartu Debit': 0.15, 'GoPay': 0.10},
        'categories': {
            'Restoran & Kafe': 0.18, 'Travel & Hotel': 0.15,
            'Fashion & Pakaian': 0.13, 'Elektronik': 0.10,
            'Kecantikan & Perawatan': 0.08, 'Hiburan': 0.08,
            'Belanja Online': 0.08, 'Olahraga & Gym': 0.07,
            'Investasi & Asuransi': 0.07, 'Properti & Renovasi': 0.06,
        },
        'city_tier': {'Metropolitan': 0.75, 'Kota Besar': 0.25},
        'age_range': (25, 60), 'weekend_boost': 1.70, 'night_prob': 0.45, 'impulse_base': 0.65,
    },
}

TXN_AMOUNT_PARAMS = {
    'low':      {'mean':  60_000,   'min':   5_000, 'max':   200_000},
    'low_mid':  {'mean': 150_000,   'min':  10_000, 'max':   500_000},
    'mid':      {'mean': 300_000,   'min':  20_000, 'max': 1_500_000},
    'mid_high': {'mean': 600_000,   'min':  50_000, 'max': 5_000_000},
    'high':     {'mean': 2_000_000, 'min': 100_000, 'max':50_000_000},
}

SEASON_BOOST = {
    1: 1.05, 2: 0.90, 3: 0.95, 4: 1.00, 5: 1.25,
    6: 1.35, 7: 1.10, 8: 0.95, 9: 0.90,
    10: 0.95, 11: 1.05, 12: 1.30,
}

KOTA_INDONESIA = [
    {'kota': 'Jakarta',     'tier': 'Metropolitan', 'populasi': 10_500_000, 'lat': -6.2088, 'long': 106.8456},
    {'kota': 'Surabaya',    'tier': 'Metropolitan', 'populasi': 2_900_000,  'lat': -7.2575, 'long': 112.7521},
    {'kota': 'Bandung',     'tier': 'Metropolitan', 'populasi': 2_400_000,  'lat': -6.9175, 'long': 107.6191},
    {'kota': 'Medan',       'tier': 'Metropolitan', 'populasi': 2_200_000,  'lat': 3.5952,  'long': 98.6722},
    {'kota': 'Semarang',    'tier': 'Kota Besar',   'populasi': 1_700_000,  'lat': -6.9932, 'long': 110.4203},
    {'kota': 'Makassar',    'tier': 'Kota Besar',   'populasi': 1_500_000,  'lat': -5.1477, 'long': 119.4327},
    {'kota': 'Palembang',   'tier': 'Kota Besar',   'populasi': 1_600_000,  'lat': -2.9761, 'long': 104.7754},
    {'kota': 'Tangerang',   'tier': 'Kota Besar',   'populasi': 2_000_000,  'lat': -6.1784, 'long': 106.6319},
    {'kota': 'Depok',       'tier': 'Kota Besar',   'populasi': 2_100_000,  'lat': -6.4025, 'long': 106.7942},
    {'kota': 'Bekasi',      'tier': 'Kota Besar',   'populasi': 2_500_000,  'lat': -6.2383, 'long': 106.9756},
    {'kota': 'Yogyakarta',  'tier': 'Kota Besar',   'populasi': 420_000,    'lat': -7.7956, 'long': 110.3695},
    {'kota': 'Solo',        'tier': 'Kota Besar',   'populasi': 550_000,    'lat': -7.5755, 'long': 110.8243},
    {'kota': 'Malang',      'tier': 'Kota Besar',   'populasi': 870_000,    'lat': -7.9666, 'long': 112.6326},
    {'kota': 'Denpasar',    'tier': 'Kota Besar',   'populasi': 930_000,    'lat': -8.6705, 'long': 115.2126},
    {'kota': 'Bogor',       'tier': 'Kota Besar',   'populasi': 1_100_000,  'lat': -6.5971, 'long': 106.8060},
    {'kota': 'Pekanbaru',   'tier': 'Kota Kecil',   'populasi': 1_000_000,  'lat': 0.5335,  'long': 101.4498},
    {'kota': 'Balikpapan',  'tier': 'Kota Kecil',   'populasi': 700_000,    'lat': -1.2379, 'long': 116.8529},
    {'kota': 'Desa Maju',   'tier': 'Desa',          'populasi': 15_000,     'lat': -7.0,   'long': 110.0},
    {'kota': 'Desa Sejahtera', 'tier': 'Desa',       'populasi': 8_000,      'lat': -7.5,   'long': 109.5},
]

CSV_TX    = "budu_transactions_clean_idr.csv"
CSV_USERS = "budu_dummy_users.csv"
CSV_PROFILES = "budu_user_profiles_idr.csv"


def _try_load_csv():
    import os
    if not (os.path.exists(CSV_TX) and os.path.exists(CSV_USERS)):
        return None
    try:
        df_users = pd.read_csv(CSV_USERS)
        df_tx    = pd.read_csv(CSV_TX, parse_dates=['date'])

        df_profiles = None
        if os.path.exists(CSV_PROFILES):
            df_profiles = pd.read_csv(CSV_PROFILES)

        if 'is_weekend' not in df_tx.columns:
            df_tx['is_weekend'] = (df_tx['date'].dt.dayofweek >= 5).astype(int)
        if 'is_night' not in df_tx.columns:
            df_tx['is_night'] = (df_tx['date'].dt.hour >= NIGHT_START).astype(int)
        if 'is_fraud' not in df_tx.columns:
            df_tx['is_fraud'] = 0
        if 'month' not in df_tx.columns:
            df_tx['month']       = df_tx['date'].dt.month
            df_tx['hour']        = df_tx['date'].dt.hour
            df_tx['day_of_week'] = df_tx['date'].dt.dayofweek
            df_tx['quarter']     = df_tx['date'].dt.quarter
        if 'above_avg' not in df_tx.columns:
            df_tx['above_avg'] = (df_tx['amount'] > df_tx['amount'].mean()).astype(int)
        if 'segmen' not in df_tx.columns and 'segmen_label' in df_tx.columns:
            label_to_key = {v['label']: k for k, v in SEGMENTS.items()}
            df_tx['segmen'] = df_tx['segmen_label'].map(label_to_key)
        elif 'segmen' not in df_tx.columns and 'user_id' in df_tx.columns and 'user_id' in df_users.columns:
            df_tx = df_tx.merge(df_users[['user_id', 'segmen']], on='user_id', how='left')

        needed_user_cols = ['user_id', 'usia', 'pendapatan_bulan', 'segmen_label',
                            'gender', 'kota', 'tier_kota']
        existing = [c for c in needed_user_cols if c in df_users.columns]
        missing_in_tx = [c for c in existing if c not in df_tx.columns]
        if missing_in_tx:
            df_tx = df_tx.merge(df_users[['user_id'] + missing_in_tx], on='user_id', how='left')

        return df_users, df_tx, df_profiles
    except Exception as e:
        st.warning(f"Gagal load CSV: {e}. Menggunakan data generator.")
        return None


@st.cache_data(show_spinner="⚙️ Memuat dataset Indonesia realistis...")
def load_data():
    csv_result = _try_load_csv()
    if csv_result is not None:
        return csv_result

    np.random.seed(RANDOM_SEED)
    N_USERS        = 1_000
    N_TRANSACTIONS = 50_000

    seg_keys  = list(SEGMENTS.keys())
    seg_probs = [SEGMENTS[s]['pct_pop'] for s in seg_keys]
    user_list = []

    for i in range(N_USERS):
        seg_key = np.random.choice(seg_keys, p=seg_probs)
        seg     = SEGMENTS[seg_key]
        kota_pool = [k for k in KOTA_INDONESIA if k['tier'] in seg['city_tier']]
        if not kota_pool:
            kota_pool = KOTA_INDONESIA
        kota_probs = np.array([seg['city_tier'].get(k['tier'], 0.01) for k in kota_pool], dtype=float)
        kota_probs /= kota_probs.sum()
        kota   = kota_pool[np.random.choice(len(kota_pool), p=kota_probs)]
        income = np.random.randint(*seg['income_range'])
        gender = np.random.choice(['L', 'P'])
        age    = np.random.randint(*seg['age_range'])
        user_list.append({
            'user_id':          f'BUDU{i+1:05d}',
            'nama':             f'User {i+1}',
            'segmen':           seg_key,
            'segmen_label':     seg['label'],
            'usia':             age,
            'gender':           gender,
            'kota':             kota['kota'],
            'tier_kota':        kota['tier'],
            'populasi_kota':    kota['populasi'],
            'lat':              round(kota['lat']  + np.random.uniform(-0.15, 0.15), 4),
            'long':             round(kota['long'] + np.random.uniform(-0.15, 0.15), 4),
            'pendapatan_bulan': income,
            'pekerjaan':        'Karyawan',
        })
    df_users = pd.DataFrame(user_list)

    np.random.seed(RANDOM_SEED)
    DATE_START  = datetime(2023, 1, 1)
    tx_list     = []
    user_txn_target = {}
    for u in user_list:
        seg    = SEGMENTS[u['segmen']]
        tmin, tmax = seg['txn_per_month']
        user_txn_target[u['user_id']] = int(np.random.uniform(tmin, tmax) * 24)

    total_gen  = sum(user_txn_target.values())
    scale      = N_TRANSACTIONS / total_gen
    user_txn_target = {uid: max(5, int(v * scale)) for uid, v in user_txn_target.items()}

    for u in user_list:
        uid     = u['user_id']
        seg_key = u['segmen']
        seg     = SEGMENTS[seg_key]
        n_txn   = user_txn_target[uid]
        cat_keys  = list(seg['categories'].keys())
        cat_probs = np.array(list(seg['categories'].values()), dtype=float)
        cat_probs /= cat_probs.sum()
        pay_keys  = list(seg['payment_methods'].keys())
        pay_probs = np.array(list(seg['payment_methods'].values()), dtype=float)
        pay_probs /= pay_probs.sum()
        p = TXN_AMOUNT_PARAMS[seg['txn_amount_dist']]
        merch_lat  = round(u['lat']  + np.random.uniform(-0.3, 0.3), 4)
        merch_long = round(u['long'] + np.random.uniform(-0.3, 0.3), 4)

        for _ in range(n_txn):
            day_offset = np.random.randint(0, 730)
            txn_date   = DATE_START + timedelta(
                days=day_offset,
                hours=int(np.random.choice(range(24))),
                minutes=np.random.randint(0, 60))
            category = np.random.choice(cat_keys, p=cat_probs)
            payment  = np.random.choice(pay_keys,  p=pay_probs)
            raw = np.random.lognormal(np.log(p['mean']), 0.7)
            raw = np.clip(raw, p['min'], p['max'])
            if category in ['Travel & Hotel', 'Elektronik', 'Properti & Renovasi',
                            'Investasi & Asuransi', 'Restoran & Kafe']:
                raw *= np.random.uniform(1.5, 3.5)
            elif category in ['Pulsa & Data', 'Sembako & Kebutuhan Pokok', 'Transportasi']:
                raw *= np.random.uniform(0.3, 0.7)
            season  = SEASON_BOOST.get(txn_date.month, 1.0)
            amount  = max(1_000, round(raw * season / 100) * 100)
            is_wknd = int(txn_date.weekday() >= 5)
            is_nght = int(txn_date.hour >= NIGHT_START)
            fraud_p = {'E':0.003,'D':0.005,'C':0.008,'B':0.012,'A':0.018}.get(seg_key, 0.005)
            is_frau = int(np.random.random() < fraud_p)
            m_lat  = round(merch_lat  + np.random.uniform(-0.05, 0.05), 4)
            m_long = round(merch_long + np.random.uniform(-0.05, 0.05), 4)
            dist   = round(((m_lat - u['lat'])**2 + (m_long - u['long'])**2)**0.5, 4)
            tx_list.append({
                'txn_id':           f'TXN{len(tx_list)+1:07d}',
                'user_id':          uid,
                'date':             txn_date,
                'amount':           int(amount),
                'category':         category,
                'payment_method':   payment,
                'segmen':           seg_key,
                'segmen_label':     seg['label'],
                'gender':           u['gender'],
                'usia':             u['usia'],
                'kota':             u['kota'],
                'tier_kota':        u['tier_kota'],
                'pendapatan_bulan': u['pendapatan_bulan'],
                'user_lat':         u['lat'],
                'user_long':        u['long'],
                'merch_lat':        m_lat,
                'merch_long':       m_long,
                'dist_user_merchant': dist,
                'is_weekend':       is_wknd,
                'is_night':         is_nght,
                'is_fraud':         is_frau,
                'month':            txn_date.month,
                'hour':             txn_date.hour,
                'day_of_week':      txn_date.weekday(),
                'quarter':          (txn_date.month - 1) // 3 + 1,
                'is_month_start':   int(txn_date.day <= 5),
                'is_month_end':     int(txn_date.day >= 25),
            })

    df_tx = pd.DataFrame(tx_list)
    df_tx['date'] = pd.to_datetime(df_tx['date'])
    df_tx['above_avg'] = (df_tx['amount'] > df_tx['amount'].mean()).astype(int)

    return df_users, df_tx, None


@st.cache_data(show_spinner="🔬 Menghitung user features & persona...")
def build_user_features(_df_tx, _df_users, _df_profiles=None):
    if _df_profiles is not None:
        uf = _df_profiles.copy()
        if 'nama' in _df_users.columns and 'nama' not in uf.columns:
            uf = uf.merge(_df_users[['user_id', 'nama']], on='user_id', how='left')
        if 'pekerjaan' in _df_users.columns and 'pekerjaan' not in uf.columns:
            uf = uf.merge(_df_users[['user_id', 'pekerjaan']], on='user_id', how='left')
        if 'kota' not in uf.columns and 'kota' in _df_users.columns:
            uf = uf.merge(_df_users[['user_id', 'kota', 'tier_kota', 'pendapatan_bulan',
                                      'pengeluaran_bulan', 'tabungan_bulan']], on='user_id', how='left')
        if 'spending_persona' not in uf.columns:
            def label_persona(s):
                if s >= IMPULSE_THRESHOLD:  return 'Impulsive Spender'
                elif s >= 0.30:             return 'Emotional Spender'
                else:                       return 'Rational Spender'
            uf['spending_persona'] = uf['impulse_score'].apply(label_persona)
        num_cols = uf.select_dtypes(include='number').columns
        uf[num_cols] = uf[num_cols].fillna(0)
        return uf

    df = _df_tx.copy()
    if 'above_avg' not in df.columns:
        df['above_avg'] = (df['amount'] > df['amount'].mean()).astype(int)

    uf = df.groupby('user_id').agg(
        total_spending_idr    = ('amount',     'sum'),
        avg_txn_idr           = ('amount',     'mean'),
        median_txn_idr        = ('amount',     'median'),
        max_txn_idr           = ('amount',     'max'),
        txn_count             = ('amount',     'count'),
        std_amount_idr        = ('amount',     'std'),
        weekend_ratio         = ('is_weekend', 'mean'),
        night_ratio           = ('is_night',   'mean'),
        fraud_ratio           = ('is_fraud',   'mean'),
        unique_categories     = ('category',   'nunique'),
        unique_merchants      = ('payment_method', 'nunique'),
        active_months         = ('month',      'nunique'),
        above_avg_ratio       = ('above_avg',  'mean'),
        month_start_ratio     = ('is_month_start', 'mean') if 'is_month_start' in df.columns else ('amount', 'count'),
        month_end_ratio       = ('is_month_end',   'mean') if 'is_month_end'   in df.columns else ('amount', 'count'),
    ).reset_index()

    if 'dist_user_merchant' in df.columns:
        dist_agg = df.groupby('user_id')['dist_user_merchant'].mean().reset_index()
        dist_agg.rename(columns={'dist_user_merchant': 'avg_dist_merchant'}, inplace=True)
        uf = uf.merge(dist_agg, on='user_id', how='left')
    else:
        uf['avg_dist_merchant'] = 0.0

    spike_list = []
    for uid, grp in df.sort_values('date').groupby('user_id'):
        rolling_mean = grp['amount'].rolling(7, min_periods=1).mean().shift(1).fillna(grp['amount'].mean())
        spikes       = int((grp['amount'] > 2 * rolling_mean).sum())
        spike_list.append({'user_id': uid, 'spike_count': spikes, 'spike_ratio': spikes / max(len(grp), 1)})
    spike_df = pd.DataFrame(spike_list)
    uf = uf.merge(spike_df, on='user_id', how='left')

    uf['std_amount_idr'] = uf['std_amount_idr'].fillna(0)
    uf['spike_ratio']    = uf['spike_ratio'].fillna(0)
    uf['spike_count']    = uf['spike_count'].fillna(0)
    uf['spending_cov']   = (uf['std_amount_idr'] / uf['avg_txn_idr'].replace(0, np.nan)).fillna(0)

    uf['impulse_score'] = (
        uf['weekend_ratio']   * 0.35 +
        uf['night_ratio']     * 0.30 +
        uf['above_avg_ratio'] * 0.20 +
        uf['spike_ratio']     * 0.15
    ).clip(0, 1).round(4)

    def label_persona(s):
        if s >= IMPULSE_THRESHOLD:  return 'Impulsive Spender'
        elif s >= 0.30:             return 'Emotional Spender'
        else:                       return 'Rational Spender'
    uf['spending_persona'] = uf['impulse_score'].apply(label_persona)

    user_demo_cols = ['user_id', 'segmen', 'segmen_label', 'usia', 'gender',
                      'kota', 'tier_kota', 'pendapatan_bulan']
    user_demo_cols = [c for c in user_demo_cols if c in _df_users.columns]
    uf = uf.merge(_df_users[user_demo_cols], on='user_id', how='left')

    if 'nama' in _df_users.columns:
        uf = uf.merge(_df_users[['user_id', 'nama']], on='user_id', how='left')
    if 'pekerjaan' in _df_users.columns:
        uf = uf.merge(_df_users[['user_id', 'pekerjaan']], on='user_id', how='left')

    if 'pendapatan_bulan' in uf.columns:
        uf['spending_ratio'] = (
            uf['total_spending_idr'] / (uf['pendapatan_bulan'].replace(0, np.nan) * 24)
        ).fillna(0).clip(0, 5)

    if 'usia' in uf.columns:
        uf['age_group'] = pd.cut(
            uf['usia'].fillna(25),
            bins=[0, 24, 34, 44, 100],
            labels=['18-24', '25-34', '35-44', '45+']
        ).astype(str)

    pay_dom = (
        df.groupby('user_id')['payment_method']
        .agg(lambda x: x.mode().iloc[0] if len(x) > 0 else 'Unknown')
        .reset_index()
        .rename(columns={'payment_method': 'dominant_payment'})
    )
    uf = uf.merge(pay_dom, on='user_id', how='left')

    cat_pivot = df.pivot_table(
        index='user_id', columns='category', values='amount', aggfunc='sum', fill_value=0
    ).reset_index()
    cat_pivot.columns.name = None
    cat_pivot.columns = [
        'user_id' if c == 'user_id'
        else f'cat_{str(c).lower().replace(" & ", "_").replace(" ", "_")[:18]}'
        for c in cat_pivot.columns
    ]
    uf = uf.merge(cat_pivot, on='user_id', how='left')

    num_cols = uf.select_dtypes(include='number').columns
    uf[num_cols] = uf[num_cols].fillna(0)
    return uf


@st.cache_data(show_spinner="🤖 Menjalankan K-Means clustering...")
def run_clustering(_uf):
    FEATURE_COLS = [
        'total_spending_idr', 'avg_txn_idr', 'median_txn_idr',
        'txn_count', 'std_amount_idr', 'weekend_ratio', 'night_ratio',
        'unique_categories', 'impulse_score', 'spending_cov',
        'above_avg_ratio', 'spike_ratio', 'active_months', 'avg_dist_merchant',
    ]
    FEATURE_COLS = [c for c in FEATURE_COLS if c in _uf.columns]
    X        = _uf[FEATURE_COLS].fillna(0).values
    scaler   = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    inertias   = []
    sil_scores = []
    K_range    = range(2, 9)
    for k in K_range:
        km  = KMeans(n_clusters=k, random_state=42, n_init=10)
        lbl = km.fit_predict(X_scaled)
        inertias.append(km.inertia_)
        sil_scores.append(silhouette_score(X_scaled, lbl))

    best_k = list(K_range)[sil_scores.index(max(sil_scores))]
    km_final = KMeans(n_clusters=3, random_state=42, n_init=10)
    labels   = km_final.fit_predict(X_scaled)
    pca   = PCA(n_components=2, random_state=42)
    X_pca = pca.fit_transform(X_scaled)

    cluster_results = {
        'k_vals': list(K_range), 'inertias': inertias,
        'sil_scores': sil_scores, 'best_k': best_k,
        'pca_var': float(pca.explained_variance_ratio_.sum()),
    }
    return labels, X_pca, cluster_results, FEATURE_COLS


# ==========================================
# LOAD DATA
# ==========================================
df_users, df_tx, df_profiles = load_data()
user_features = build_user_features(df_tx, df_users, df_profiles)
cluster_labels, pca_coords, cluster_results, feat_cols = run_clustering(user_features)
user_features['cluster'] = cluster_labels

stats_clust = user_features.groupby('cluster').agg(
    avg_impulse = ('impulse_score', 'mean'),
).round(2)
sorted_clusters = stats_clust.sort_values('avg_impulse').index.tolist()
cluster_persona_map = {
    sorted_clusters[0]: 'Rational Spender',
    sorted_clusters[1]: 'Emotional Spender',
    sorted_clusters[2]: 'Impulsive Spender',
}
user_features['spending_persona'] = user_features['cluster'].map(cluster_persona_map)

# ==========================================
# SIDEBAR
# ==========================================
with st.sidebar:
    st.markdown(
        "<h2 style='text-align:center;font-family:Syne,sans-serif;font-weight:800;"
        "font-size:1.7rem;color:#fff;margin-bottom:2px;'>BUDU</h2>",
        unsafe_allow_html=True
    )
    st.markdown(
        "<p style='text-align:center;color:#fed7aa;font-size:0.9rem;"
        "font-weight:500;margin-top:0;'>SpendBehavior Analyzer</p>",
        unsafe_allow_html=True
    )
    st.markdown("---")
    menu = st.radio("📌 Navigasi", [
        "🏠 Overview",
        "📊 EDA & Business Questions",
        "🧪 A/B Testing",
        "👥 Clustering & Persona",
        "🔎 User Deep Dive",
        "📖 Data Dictionary",
    ])
    st.markdown("---")

    st.markdown("""
    <div style="
        background: rgba(255,255,255,0.10);
        padding: 24px 20px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.15);
        text-align: center;
        backdrop-filter: blur(6px);
    ">
    
    <h3 style="
        color: white;
        margin-bottom: 6px;
        font-family: 'Sora', sans-serif;
        font-size: 1.7rem;
        font-weight: 700;
        letter-spacing: -0.5px;
    ">
    Tim CC26-PSU268
    </h3>
    
    <p style="
        color: #FFF6DE;
        font-size: 13px;
        margin-top: 0;
        margin-bottom: 20px;
        font-weight: 500;
    ">
    Coding Camp 2026 · DBS Foundation
    </p>
    
    <hr style="
        border: none;
        border-top: 1px solid rgba(255,255,255,0.15);
        margin: 18px 0 24px 0;
    ">
    
    <!-- DATA SCIENCE -->
    <div style="margin-bottom: 22px;">
    
    <p style="
        color: white;
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 10px;
        font-family: 'Sora', sans-serif;
    ">
    Data Science
    </p>
    
    <p style="
        color: #FFF6DE;
        font-size: 14px;
        margin: 4px 0;
        font-weight: 500;
    ">
    Dwi Cahyawati
    </p>
    
    <p style="
        color: #FFF6DE;
        font-size: 14px;
        margin: 4px 0;
        font-weight: 500;
    ">
    Mutia Saniya Rahma
    </p>
    
    </div>
    
    <!-- AI ENGINEER -->
    <div style="margin-bottom: 22px;">
    
    <p style="
        color: white;
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 10px;
        font-family: 'Sora', sans-serif;
    ">
    AI Engineer
    </p>
    
    <p style="
        color: #FFF6DE;
        font-size: 14px;
        margin: 4px 0;
        font-weight: 500;
    ">
    Aliya Shahira
    </p>
    
    <p style="
        color: #FFF6DE;
        font-size: 14px;
        margin: 4px 0;
        font-weight: 500;
    ">
    Khalisha Rana Putri
    </p>
    
    </div>
    
    <!-- FULLSTACK -->
    <div>
    
    <p style="
        color: white;
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 10px;
        font-family: 'Sora', sans-serif;
    ">
    Full-Stack Web Dev
    </p>
    
    <p style="
        color: #FFF6DE;
        font-size: 14px;
        margin: 4px 0;
        font-weight: 500;
    ">
    Hamzah Hudzairah
    </p>
    
    <p style="
        color: #FFF6DE;
        font-size: 14px;
        margin: 4px 0;
        font-weight: 500;
    ">
    Berton Adiwidya Wibowo
    </p>
    
    </div>
    
    </div>
    """, unsafe_allow_html=True)

    st.markdown("---")
    st.caption(f"Dataset: {len(df_users):,} user · {len(df_tx):,} transaksi")
    st.caption(f"Periode: {df_tx['date'].min().strftime('%b %Y')} – {df_tx['date'].max().strftime('%b %Y')}")

    import os
    if os.path.exists(CSV_TX):
        st.success("📂 Sumber: CSV notebook")
    else:
        st.info("🔧 Sumber: Data generator")

    available_segs = sorted(df_tx['segmen'].dropna().unique().tolist()) if 'segmen' in df_tx.columns else ['A','B','C','D','E']
    seg_filter = st.multiselect("Filter Segmen (Global)", options=['A','B','C','D','E'], default=available_segs)

# ── Apply global filter ───────────────────────────────────────
if 'segmen' in df_tx.columns:
    df_f = df_tx[df_tx['segmen'].isin(seg_filter)]
else:
    df_f = df_tx.copy()

seg_col_uf = 'segmen' if 'segmen' in user_features.columns else ('segmen_label' if 'segmen_label' in user_features.columns else None)

if seg_col_uf is not None:
    uf_f = user_features[user_features[seg_col_uf].isin(seg_filter)].copy()
else:
    uf_f = user_features.copy()

# ==========================================
# HEADER
# ==========================================
st.markdown("""
<div class="header-banner">
    <h1>💸 BUDU — SpendBehavior Analyzer</h1>
    <p>Coding Camp 2026 · DBS Foundation · Tim CC26-PSU268 &nbsp;|&nbsp; Dataset Dummy Indonesia Realistis (IDR)</p>
</div>
""", unsafe_allow_html=True)


# ==========================================
# HELPER: Persona color & icon
# ==========================================
PERSONA_COLORS = {
    'Rational Spender':  ACCENT,
    'Emotional Spender': '#f59e0b',
    'Impulsive Spender': WARN,
}
PERSONA_ICONS = {
    'Rational Spender': '🟢',
    'Emotional Spender': '🟡',
    'Impulsive Spender': '🔴',
}
M_LBL = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']


# ==========================================
# ██  OVERVIEW  ██
# ==========================================
if menu == "🏠 Overview":
    st.markdown('<p class="section-title">📌 Ringkasan Utama</p>', unsafe_allow_html=True)

    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("Total User",        f"{len(df_users):,}",                     "5 Segmen")
    c2.metric("Total Transaksi",   f"{len(df_tx):,}",                        "24 Bulan")
    c3.metric("Total Spending",    f"Rp {df_tx['amount'].sum()/1e9:.1f}M",   "Miliar IDR")
    c4.metric("Avg Transaksi",     f"Rp {df_tx['amount'].mean():,.0f}",      "per txn")
    imp_pct = (uf_f['spending_persona'] == 'Impulsive Spender').mean() * 100
    c5.metric("Impulsive Spender", f"{imp_pct:.1f}%", "≥ score 0.55", delta_color="inverse")

    st.markdown("---")
    col_a, col_b = st.columns(2)

    with col_a:
        st.markdown('<p class="section-title">👤 Distribusi Segmen Sosio-Ekonomi</p>', unsafe_allow_html=True)
        seg_col   = 'segmen' if 'segmen' in df_users.columns else 'segmen_label'
        df_users_f = df_users[df_users['segmen'].isin(seg_filter)] if 'segmen' in df_users.columns else df_users
        seg_count = df_users_f[seg_col].value_counts().reset_index()
        seg_count.columns = ['Segmen', 'Jumlah']
        seg_label_map = {s: SEGMENTS[s]['label'] for s in SEGMENTS}
        seg_count['Label'] = seg_count['Segmen'].map(seg_label_map).fillna(seg_count['Segmen'])
        fig_seg = px.pie(seg_count, names='Label', values='Jumlah',
                         color_discrete_sequence=PALETTE, hole=0.4)
        fig_seg.update_traces(textposition='outside', textinfo='percent+label')
        fig_seg.update_layout(margin=dict(t=10,b=10,l=10,r=10), showlegend=False, height=320)
        st.plotly_chart(fig_seg, use_container_width=True)

    with col_b:
        st.markdown('<p class="section-title">🏙️ Distribusi Tier Kota</p>', unsafe_allow_html=True)
        tier_count = df_users_f['tier_kota'].value_counts().reset_index()
        tier_count.columns = ['Tier', 'Jumlah']
        fig_tier = px.bar(tier_count, x='Tier', y='Jumlah',
                          color='Tier', color_discrete_sequence=PALETTE, text_auto=True)
        fig_tier.update_layout(showlegend=False, height=320,
                               plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                               yaxis=dict(showgrid=True, gridcolor='#ffedd5'))
        st.plotly_chart(fig_tier, use_container_width=True)

    st.markdown("---")
    st.markdown('<p class="section-title">🏷️ Top Kategori Pengeluaran (IDR)</p>', unsafe_allow_html=True)
    cat_spend = df_f.groupby('category')['amount'].sum().sort_values(ascending=False).reset_index()
    cat_spend['amount_M'] = cat_spend['amount'] / 1e6
    fig_cat = px.bar(cat_spend, x='category', y='amount_M',
                     color='amount_M', color_continuous_scale='Oranges',
                     text=cat_spend['amount_M'].apply(lambda x: f'Rp {x:.1f}M'),
                     labels={'amount_M': 'Total (Juta IDR)', 'category': 'Kategori'})
    fig_cat.update_traces(textposition='outside')
    fig_cat.update_layout(coloraxis_showscale=False, showlegend=False, height=380,
                          plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                          xaxis_tickangle=-30,
                          yaxis=dict(showgrid=True, gridcolor='#ffedd5'))
    st.plotly_chart(fig_cat, use_container_width=True)

    col_c, col_d = st.columns(2)
    with col_c:
        st.markdown('<p class="section-title">📅 Tren Spending Bulanan</p>', unsafe_allow_html=True)
        monthly = df_f.groupby('month')['amount'].sum().reset_index().sort_values('month')
        monthly['month_name'] = monthly['month'].apply(lambda m: M_LBL[m-1])
        monthly['amount_M']   = monthly['amount'] / 1e6
        fig_mon = px.area(monthly, x='month_name', y='amount_M',
                          color_discrete_sequence=[PRIMARY],
                          labels={'amount_M':'Total (Juta IDR)','month_name':'Bulan'})
        fig_mon.update_traces(line=dict(width=3))
        fig_mon.update_layout(height=300, plot_bgcolor='rgba(0,0,0,0)',
                              paper_bgcolor='rgba(0,0,0,0)',
                              yaxis=dict(showgrid=True, gridcolor='#ffedd5'))
        st.plotly_chart(fig_mon, use_container_width=True)

    with col_d:
        st.markdown('<p class="section-title">💳 Metode Pembayaran</p>', unsafe_allow_html=True)
        pay_count = df_f['payment_method'].value_counts().reset_index()
        pay_count.columns = ['Metode', 'Frekuensi']
        fig_pay = px.pie(pay_count.head(8), names='Metode', values='Frekuensi',
                         color_discrete_sequence=PALETTE, hole=0.3)
        fig_pay.update_layout(height=300, margin=dict(t=10,b=10))
        st.plotly_chart(fig_pay, use_container_width=True)


# ==========================================
# ██  EDA & BUSINESS QUESTIONS  ██
# ==========================================
elif menu == "📊 EDA & Business Questions":
    st.subheader("🔍 6 Business Questions SMART")
    tabs = st.tabs([
        "💰  Q1 · Money Leak",
        "📅  Q2 · Weekend Pattern",
        "📈  Q3 · Monthly Anomaly",
        "🚰  Q4 · Silent Drain",
        "💳  Q5 · Payment Spearman",
        "⚡  Q6 · Impulsive Profile",
    ])

    with tabs[0]:
        st.markdown("#### Q1: Kategori mana yang menyumbang ≥30% total pengeluaran?")
        st.markdown('<div class="insight-box">📌 Tujuan: Identifikasi kategori utama penyumbang spending untuk fitur <b>Money Leak Warning</b> BUDU.</div>', unsafe_allow_html=True)
        cat_spend = df_f.groupby('category')['amount'].sum().sort_values(ascending=False).reset_index()
        cat_spend['pct']            = cat_spend['amount'] / cat_spend['amount'].sum() * 100
        cat_spend['cumulative_pct'] = cat_spend['pct'].cumsum()
        top_cats = cat_spend[cat_spend['pct'] >= 2].copy()
        col1, col2 = st.columns([3, 1])
        with col1:
            fig_q1 = make_subplots(specs=[[{"secondary_y": True}]])
            fig_q1.add_trace(go.Bar(x=top_cats['category'], y=top_cats['pct'],
                                    name='% Spending', marker_color=PALETTE[:len(top_cats)],
                                    text=top_cats['pct'].apply(lambda x: f'{x:.1f}%'), textposition='outside'), secondary_y=False)
            fig_q1.add_trace(go.Scatter(x=top_cats['category'], y=top_cats['cumulative_pct'],
                                        name='Kumulatif %', line=dict(color='#ef4444', width=2.5), mode='lines+markers'), secondary_y=True)
            fig_q1.update_layout(height=380, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                                 xaxis_tickangle=-25, yaxis=dict(title='Proporsi (%)', showgrid=True, gridcolor='#ffedd5'),
                                 yaxis2=dict(title='Kumulatif (%)'))
            st.plotly_chart(fig_q1, use_container_width=True)
        with col2:
            st.markdown("**Top 5 Kategori:**")
            for _, row in cat_spend.head(5).iterrows():
                st.markdown(f"**{row['category']}**")
                st.progress(int(min(row['pct'], 100)))
                st.caption(f"Rp {row['amount']/1e6:.1f}M ({row['pct']:.1f}%)")
        top2_pct = cat_spend.head(2)['pct'].sum()
        if top2_pct >= 30:
            st.markdown(f'<div class="warn-box">⚠️ 2 kategori teratas menyumbang <b>{top2_pct:.1f}%</b> total spending.</div>', unsafe_allow_html=True)

    with tabs[1]:
        st.markdown("#### Q2: Apakah rata-rata transaksi weekend ≥20% lebih tinggi dari weekday?")
        wknd = df_f.groupby('is_weekend')['amount'].agg(['mean','median','count','sum']).reset_index()
        wknd['label'] = wknd['is_weekend'].map({0:'Weekday', 1:'Weekend'})
        avg_wknd = wknd.loc[wknd['is_weekend']==1,'mean'].values[0]
        avg_wkdy = wknd.loc[wknd['is_weekend']==0,'mean'].values[0]
        diff_pct = (avg_wknd - avg_wkdy) / avg_wkdy * 100
        col1, col2 = st.columns(2)
        with col1:
            fig_wk = px.bar(wknd, x='label', y='mean', color='label',
                            color_discrete_map={'Weekday':'#fed7aa','Weekend':PRIMARY},
                            text=wknd['mean'].apply(lambda x: f'Rp {x:,.0f}'),
                            labels={'mean':'Rata-rata (IDR)','label':''})
            fig_wk.update_traces(textposition='outside')
            fig_wk.update_layout(showlegend=False, height=320, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_wk, use_container_width=True)
        with col2:
            sample_q2 = df_f.sample(min(5000, len(df_f)), random_state=42).copy()
            sample_q2['Tipe Hari'] = sample_q2['is_weekend'].map({0:'Weekday',1:'Weekend'})
            fig_box = px.violin(sample_q2, x='Tipe Hari', y='amount', color='Tipe Hari',
                                color_discrete_map={'Weekday':'#fed7aa','Weekend':PRIMARY},
                                box=True, labels={'Tipe Hari':'','amount':'Amount (IDR)'})
            fig_box.update_layout(showlegend=False, height=320, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_box, use_container_width=True)
        col_m1, col_m2, col_m3 = st.columns(3)
        col_m1.metric("Avg Weekday", f"Rp {avg_wkdy:,.0f}")
        col_m2.metric("Avg Weekend", f"Rp {avg_wknd:,.0f}")
        col_m3.metric("Perbedaan",   f"{diff_pct:.1f}%")
        if diff_pct >= 20:
            st.markdown(f'<div class="warn-box">⚠️ Weekend <b>{diff_pct:.1f}%</b> lebih tinggi. BUDU aktifkan notifikasi Jumat malam.</div>', unsafe_allow_html=True)

    with tabs[2]:
        st.markdown("#### Q3: Bulan apa total pengeluaran melebihi mean + 1.5×SD?")
        monthly = df_f.groupby('month')['amount'].agg(total='sum', count='count', avg='mean').reset_index()
        thr      = monthly['total'].mean() + ANOMALY_STD_FACTOR * monthly['total'].std()
        monthly['anomaly'] = monthly['total'] > thr
        col1, col2 = st.columns(2)
        with col1:
            fig_line = go.Figure()
            fig_line.add_trace(go.Scatter(x=monthly['month'], y=monthly['total']/1e6,
                                          mode='lines+markers', line=dict(color=PRIMARY, width=3), name='Total Spending'))
            fig_line.add_hline(y=thr/1e6, line_dash='dash', line_color=WARN,
                               annotation_text=f'Threshold (mean+{ANOMALY_STD_FACTOR}σ)')
            anom = monthly[monthly['anomaly']]
            fig_line.add_trace(go.Scatter(x=anom['month'], y=anom['total']/1e6,
                                          mode='markers', marker=dict(color=WARN, size=12), name='Anomali'))
            fig_line.update_layout(height=360, xaxis=dict(tickmode='array', tickvals=list(range(1,13)), ticktext=M_LBL),
                                   yaxis_title='Juta IDR', plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_line, use_container_width=True)
        with col2:
            monthly['color'] = monthly['anomaly'].map({True: WARN, False: '#FB923C'})
            fig_bar = px.bar(monthly, x='month', y='count', color='color', color_discrete_map='identity', text='count')
            fig_bar.update_layout(height=360, showlegend=False,
                                  xaxis=dict(tickmode='array', tickvals=list(range(1,13)), ticktext=M_LBL),
                                  yaxis_title='Jumlah Transaksi', plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_bar, use_container_width=True)
        anom_names = [M_LBL[m-1] for m in anom['month'].tolist()]
        if anom_names:
            st.markdown(f'<div class="warn-box">⚠️ Bulan anomali: <b>{", ".join(anom_names)}</b> | Threshold: Rp {thr/1e6:.1f} juta/bulan</div>', unsafe_allow_html=True)

    with tabs[3]:
        st.markdown("#### Q4: Kategori mana yang bocor diam-diam (transaksi kecil, frekuensi tinggi)?")
        median_amt = df_f['amount'].median()
        small_lim  = median_amt * SMALL_TXN_MULTIPLIER
        df_small   = df_f[df_f['amount'] <= small_lim]
        n_months   = max(df_f['month'].nunique(), 1)
        leak = (df_small.groupby('category')
                .agg(total_idr=('amount','sum'), freq=('amount','count'), avg_idr=('amount','mean'))
                .assign(freq_monthly=lambda x: x['freq'] / n_months)
                .sort_values('total_idr', ascending=False).reset_index())
        display_leak = leak[leak['freq_monthly'] >= FREQ_MONTH_THRESH] if len(leak[leak['freq_monthly'] >= FREQ_MONTH_THRESH]) > 0 else leak.head(10)
        col1, col2 = st.columns(2)
        with col1:
            fig_leak1 = px.bar(display_leak.head(10), x='total_idr', y='category', orientation='h',
                               color='total_idr', color_continuous_scale='Oranges',
                               text=display_leak.head(10)['total_idr'].apply(lambda x: f'Rp {x/1e6:.1f}M'),
                               labels={'total_idr':'Akumulasi (IDR)','category':''})
            fig_leak1.update_traces(textposition='outside')
            fig_leak1.update_layout(coloraxis_showscale=False, height=380, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_leak1, use_container_width=True)
        with col2:
            fig_leak2 = px.scatter(display_leak, x='freq_monthly', y='avg_idr', size='total_idr',
                                   color='category', color_discrete_sequence=PALETTE, text='category',
                                   labels={'freq_monthly':'Frekuensi/Bulan','avg_idr':'Avg Nilai (IDR)'})
            fig_leak2.update_traces(textposition='top center', textfont_size=9)
            fig_leak2.update_layout(showlegend=False, height=380, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_leak2, use_container_width=True)
        st.markdown(f'<div class="warn-box">⚠️ Batas transaksi "kecil": ≤ Rp {small_lim:,.0f} | Total bocor: <b>Rp {df_small["amount"].sum()/1e9:.2f}M IDR</b></div>', unsafe_allow_html=True)

    with tabs[4]:
        st.markdown("#### Q5: Apakah metode pembayaran berkorelasi dengan nilai transaksi? (Spearman ρ ≥ 0.3)")
        pay = (df_f.groupby('payment_method')['amount']
               .agg(total='sum', count='count', avg='mean')
               .sort_values('total', ascending=False).reset_index())
        pay_enc  = df_f['payment_method'].astype('category').cat.codes
        rho, pval = spearmanr(pay_enc, df_f['amount'])
        col_m1, col_m2, col_m3 = st.columns(3)
        col_m1.metric("Spearman ρ", f"{rho:.4f}")
        col_m2.metric("P-value",    f"{pval:.4f}")
        col_m3.metric("Kekuatan",   "Signifikan (≥0.3)" if abs(rho) >= 0.3 else "Lemah (<0.3)")
        col1, col2, col3 = st.columns(3)
        for ax_col, col_key, lbl, fmt in [
            (col1, 'total', 'Total (Juta IDR)',    lambda x: f'{x/1e6:.1f}M'),
            (col2, 'count', 'Frekuensi',           lambda x: f'{x:,}'),
            (col3, 'avg',   'Rata-rata (Ribu IDR)', lambda x: f'{x/1e3:.0f}K'),
        ]:
            fig_p = px.bar(pay, x='payment_method', y=col_key, color='payment_method',
                           color_discrete_sequence=PALETTE, text=pay[col_key].apply(fmt))
            fig_p.update_traces(textposition='outside')
            fig_p.update_layout(title=f'Q5: {lbl}', showlegend=False, height=350,
                                xaxis_title='', yaxis_title=lbl, plot_bgcolor='rgba(0,0,0,0)',
                                paper_bgcolor='rgba(0,0,0,0)', xaxis_tickangle=-20)
            ax_col.plotly_chart(fig_p, use_container_width=True)
        if abs(rho) >= 0.3:
            st.markdown(f'<div class="success-box">✅ Korelasi signifikan (ρ = {rho:.2f}) — BUDU sesuaikan konteks warning berdasarkan metode pembayaran.</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="warn-box">ℹ️ Korelasi lemah (ρ = {rho:.2f} < 0.3).</div>', unsafe_allow_html=True)

    with tabs[5]:
        st.markdown(f"#### Q6: Berapa proporsi user dengan impulse_score ≥ {IMPULSE_THRESHOLD}?")
        n_imp  = (uf_f['impulse_score'] >= IMPULSE_THRESHOLD).sum()
        n_tot  = len(uf_f)
        st.markdown(f'<div class="warn-box">📌 Q6 Answer: <b>{n_imp}/{n_tot} pengguna = {n_imp/n_tot*100:.1f}%</b> Impulsive Spender</div>', unsafe_allow_html=True)
        persona_dist = uf_f['spending_persona'].value_counts().reset_index()
        persona_dist.columns = ['Persona', 'Count']
        col1, col2 = st.columns(2)
        with col1:
            fig_p1 = px.pie(persona_dist, names='Persona', values='Count',
                            color='Persona', color_discrete_map=PERSONA_COLORS, hole=0.45)
            fig_p1.update_layout(height=320)
            st.plotly_chart(fig_p1, use_container_width=True)
        with col2:
            imp_profile = uf_f.groupby('spending_persona').agg(
                avg_impulse=('impulse_score','mean'), avg_spend=('total_spending_idr','mean'),
                avg_weekend_r=('weekend_ratio','mean'), avg_night_r=('night_ratio','mean'),
                count=('user_id','count'),
            ).reset_index()
            st.dataframe(imp_profile.set_index('spending_persona'), use_container_width=True)
        seg_col_q6 = None
        if 'segmen' in uf_f.columns:
            seg_col_q6 = 'segmen'
        elif 'segmen_label' in uf_f.columns:
            seg_col_q6 = 'segmen_label'

        if seg_col_q6 is None:
            st.warning("Kolom segmen/segmen_label tidak tersedia untuk plot Q6.")
        else:
            category_order_q6 = ['E','D','C','B','A'] if seg_col_q6 == 'segmen' else None
            fig_imp = px.box(
                uf_f, x=seg_col_q6, y='impulse_score', color='spending_persona',
                color_discrete_map=PERSONA_COLORS,
                labels={seg_col_q6: 'Segmen', 'impulse_score': 'Impulse Score'},
                category_orders={seg_col_q6: category_order_q6} if category_order_q6 is not None else None,
            )
            fig_imp.add_hline(y=IMPULSE_THRESHOLD, line_dash='dash', line_color=WARN,
                              annotation_text=f'Threshold Impulsive ({IMPULSE_THRESHOLD})')
            fig_imp.add_hline(y=0.30, line_dash='dot', line_color='#f59e0b',
                              annotation_text='Threshold Emotional (0.30)')
            fig_imp.update_layout(height=380, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_imp, use_container_width=True)

# ==========================================
# ██  A/B TESTING  ██
# ==========================================
elif menu == "🧪 A/B Testing":
    st.subheader("A/B Test: Weekend vs Weekday Spending")
    st.markdown("Menggunakan **Mann-Whitney U Test** (non-parametric). H0: tidak ada perbedaan. H1: pengeluaran weekend ≥20% lebih tinggi.")

    grp_w = df_f[df_f['is_weekend'] == 1]['amount']
    grp_d = df_f[df_f['is_weekend'] == 0]['amount']
    u_stat, p_val = mannwhitneyu(grp_w, grp_d, alternative='greater')
    pct_diff = (grp_w.mean() - grp_d.mean()) / grp_d.mean() * 100
    alpha    = 0.05

    col1, col2, col3, col4, col5 = st.columns(5)
    col1.metric("Mann-Whitney U", f"{u_stat:,.0f}")
    col2.metric("P-value",        f"{p_val:.6f}")
    col3.metric("Avg Weekend",    f"Rp {grp_w.mean():,.0f}")
    col4.metric("Avg Weekday",    f"Rp {grp_d.mean():,.0f}")
    col5.metric("Selisih",        f"{pct_diff:.1f}%")

    if p_val < alpha and pct_diff >= 20:
        st.markdown(f'<div class="success-box">✅ <b>TOLAK H0</b> — signifikan (p={p_val:.6f}) DAN selisih {pct_diff:.1f}% ≥ 20%. BUDU aktifkan Smart Warning Jumat malam.</div>', unsafe_allow_html=True)
    elif p_val < alpha:
        st.markdown(f'<div class="warn-box">⚠️ Signifikan statistik tapi selisih {pct_diff:.1f}% &lt; 20%.</div>', unsafe_allow_html=True)
    else:
        st.markdown(f'<div class="insight-box">ℹ️ Gagal tolak H0 (p={p_val:.4f} ≥ {alpha})</div>', unsafe_allow_html=True)

    col_v1, col_v2 = st.columns(2)
    with col_v1:
        sample_ab = df_f.sample(min(8000, len(df_f)), random_state=42).copy()
        sample_ab['Tipe Hari'] = sample_ab['is_weekend'].map({0:'Weekday', 1:'Weekend'})
        fig_vln = px.violin(sample_ab, x='Tipe Hari', y='amount', color='Tipe Hari',
                            color_discrete_map={'Weekday':'#fed7aa','Weekend':PRIMARY},
                            box=True, labels={'amount':'Amount (IDR)','Tipe Hari':''})
        fig_vln.update_layout(showlegend=False, height=380, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig_vln, use_container_width=True)
    with col_v2:
        day_names = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']
        daily = df_f.groupby('day_of_week')['amount'].mean().reset_index()
        daily['day']        = daily['day_of_week'].map(dict(enumerate(day_names)))
        daily['is_weekend'] = daily['day_of_week'].isin([5, 6])
        fig_daily = px.bar(daily, x='day', y='amount', color='is_weekend',
                           color_discrete_map={False:'#fed7aa', True:PRIMARY},
                           text=daily['amount'].apply(lambda x: f'Rp {x/1000:.0f}K'),
                           labels={'amount':'Avg Amount (IDR)','day':'Hari'})
        fig_daily.update_traces(textposition='outside')
        fig_daily.update_layout(showlegend=False, height=380, plot_bgcolor='rgba(0,0,0,0)',
                                paper_bgcolor='rgba(0,0,0,0)', yaxis=dict(showgrid=True, gridcolor='#ffedd5'))
        st.plotly_chart(fig_daily, use_container_width=True)

    if 'segmen' in df_f.columns:
        seg_ab = df_f.groupby(['segmen','is_weekend'])['amount'].mean().reset_index()
        seg_ab['Tipe Hari'] = seg_ab['is_weekend'].map({0:'Weekday',1:'Weekend'})
        fig_sab = px.bar(seg_ab, x='segmen', y='amount', color='Tipe Hari', barmode='group',
                         color_discrete_map={'Weekday':'#fed7aa','Weekend':PRIMARY},
                         labels={'amount':'Avg Amount (IDR)','segmen':'Segmen'},
                         category_orders={'segmen':['E','D','C','B','A']},
                         text=seg_ab['amount'].apply(lambda x: f'Rp {x/1000:.0f}K'))
        fig_sab.update_traces(textposition='outside', textfont_size=9)
        fig_sab.update_layout(height=360, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig_sab, use_container_width=True)


# ==========================================
# ██  CLUSTERING & PERSONA  ██
# ==========================================
elif menu == "👥 Clustering & Persona":
    st.subheader("Spending Persona — K-Means Clustering")
    st.markdown("Replikasi Cell 22–23 notebook: Elbow Method + Silhouette + PCA Visualization. K final = 3.")

    persona_desc = {
        'Rational Spender':  'Konsisten, terkontrol, jarang spike. Impulse score < 0.30.',
        'Emotional Spender': 'Tidak konsisten, spending_cov tinggi. Impulse score 0.30–0.55.',
        'Impulsive Spender': 'Weekend & malam tinggi, banyak spike. Impulse score ≥ 0.55.',
    }
    persona_counts = uf_f['spending_persona'].value_counts()
    total_uf       = len(uf_f)
    cols = st.columns(3)
    for i, name in enumerate(['Rational Spender','Emotional Spender','Impulsive Spender']):
        cnt = persona_counts.get(name, 0)
        pct = cnt / total_uf * 100 if total_uf > 0 else 0
        clr = PERSONA_COLORS[name]
        with cols[i]:
            st.markdown(f"""
            <div class="persona-card" style="background:{clr}15;border-left:5px solid {clr}">
                <div style="font-size:1.8rem">{PERSONA_ICONS[name]}</div>
                <div style="font-size:1rem;font-weight:700;color:{clr};font-family:'Syne',sans-serif">{name}</div>
                <div style="font-size:2rem;font-weight:800;color:#0f172a;font-family:'Syne',sans-serif">{cnt}</div>
                <div style="color:#92400e;font-size:0.85rem">{pct:.1f}% dari {total_uf} user</div>
                <hr style="border-color:{clr}30;margin:8px 0"/>
                <div style="font-size:0.82rem;color:#78350f">{persona_desc[name]}</div>
            </div>
            """, unsafe_allow_html=True)

    col_elbow, col_sil = st.columns(2)
    k_vals     = cluster_results['k_vals']
    inertias   = cluster_results['inertias']
    sil_scores = cluster_results['sil_scores']
    best_k     = cluster_results['best_k']

    with col_elbow:
        fig_elbow = px.line(x=k_vals, y=inertias, markers=True, labels={'x':'K','y':'Inertia'}, color_discrete_sequence=[PRIMARY])
        fig_elbow.update_traces(line=dict(width=3), marker=dict(size=9))
        fig_elbow.update_layout(title='Elbow Method', height=300, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig_elbow, use_container_width=True)

    with col_sil:
        fig_sil = px.line(x=k_vals, y=sil_scores, markers=True, labels={'x':'K','y':'Silhouette Score'}, color_discrete_sequence=[ACCENT])
        fig_sil.update_traces(line=dict(width=3), marker=dict(size=9))
        fig_sil.update_layout(title='Silhouette Score', height=300, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig_sil, use_container_width=True)

    st.markdown(f'<div class="success-box">✅ K terbaik (Silhouette): <b>{best_k}</b> ({max(sil_scores):.4f}) | Dashboard menggunakan K=3 sesuai notebook</div>', unsafe_allow_html=True)

    pca_df = pd.DataFrame(pca_coords, columns=['PC1','PC2'])
    pca_df['Persona'] = user_features['spending_persona']
    pca_df['Impulse'] = user_features['impulse_score']
    if 'segmen' in user_features.columns:
        seg_col = 'segmen' if 'segmen' in user_features.columns else ('segmen_label' if 'segmen_label' in user_features.columns else None)
        if seg_col is not None:
            pca_df['Segmen'] = user_features[seg_col]
            pca_df = pca_df[pca_df['Segmen'].isin(seg_filter)]
    pca_df['Impulse'] = pca_df['Impulse'].clip(lower=0.001)

    fig_pca = px.scatter(pca_df, x='PC1', y='PC2', color='Persona',
                         color_discrete_map=PERSONA_COLORS, size='Impulse', opacity=0.75,
                         labels={'PC1':f'PC1 ({cluster_results["pca_var"]*100:.1f}% var)', 'PC2':'PC2'})
    fig_pca.update_layout(title='PCA Visualization — Spending Personality Map', height=450,
                          plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
    st.plotly_chart(fig_pca, use_container_width=True)

    col_r1, col_r2 = st.columns(2)
    with col_r1:
        if 'segmen' in uf_f.columns:
            seg_persona = uf_f.groupby(['segmen','spending_persona']).size().reset_index(name='count')
            fig_sp = px.bar(seg_persona, x='segmen', y='count', color='spending_persona', barmode='stack',
                            color_discrete_map=PERSONA_COLORS, category_orders={'segmen':['E','D','C','B','A']},
                            labels={'count':'Jumlah User','segmen':'Segmen'})
            fig_sp.update_layout(title='Persona Distribution per Segmen', height=360,
                                 plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_sp, use_container_width=True)
    with col_r2:
        fig_imp_dist = px.histogram(uf_f, x='impulse_score', color='spending_persona',
                                    nbins=40, color_discrete_map=PERSONA_COLORS, barmode='overlay', opacity=0.75)
        fig_imp_dist.add_vline(x=IMPULSE_THRESHOLD, line_dash='dash', line_color=WARN,
                               annotation_text=f'Threshold Impulsive ({IMPULSE_THRESHOLD})')
        fig_imp_dist.add_vline(x=0.30, line_dash='dot', line_color='#f59e0b',
                               annotation_text='Threshold Emotional (0.30)')
        fig_imp_dist.update_layout(title='Impulse Score Distribution per Persona', height=360,
                                   plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig_imp_dist, use_container_width=True)

    cluster_stats = uf_f.groupby('spending_persona').agg(
        Jumlah_User    = ('user_id', 'count'),
        Avg_Impulse    = ('impulse_score', 'mean'),
        Avg_TotalSpend = ('total_spending_idr', 'mean'),
        Avg_TxnCount   = ('txn_count', 'mean'),
        Avg_WeekendR   = ('weekend_ratio', 'mean'),
        Avg_NightR     = ('night_ratio', 'mean'),
        Avg_SpikeR     = ('spike_ratio', 'mean'),
    ).round(3)
    st.dataframe(cluster_stats, use_container_width=True)


# ==========================================
# ██  USER DEEP DIVE  ██
# ==========================================
elif menu == "🔎 User Deep Dive":
    st.subheader("User Deep Dive — Analisis Per Pengguna")
    st.markdown("Pilih satu pengguna untuk melihat profil lengkap: demografi, pola spending, kategori favorit, tren waktu, dan persona spending mereka.")

    col_filter1, col_filter2, col_filter3 = st.columns([2, 2, 1])

    with col_filter1:
        has_nama = 'nama' in df_users.columns
        if has_nama:
            df_users_sorted = df_users.sort_values('user_id').copy()
            df_users_sorted['label'] = df_users_sorted['user_id'] + ' — ' + df_users_sorted['nama']
            user_label_map  = dict(zip(df_users_sorted['label'], df_users_sorted['user_id']))
            search_query = st.text_input("🔍 Cari nama/ID pengguna", placeholder="Contoh: Dhea, BUDU00001")
            if search_query:
                matched = df_users_sorted[
                    df_users_sorted['label'].str.contains(search_query, case=False, na=False)
                ]
            else:
                matched = df_users_sorted
            options = matched['label'].tolist()
            if not options:
                st.warning("Pengguna tidak ditemukan.")
                st.stop()
            selected_label = st.selectbox("Pilih pengguna", options=options)
            selected_uid   = user_label_map[selected_label]
        else:
            all_uids = sorted(df_users['user_id'].unique().tolist())
            selected_uid = st.selectbox("Pilih User ID", options=all_uids)

    with col_filter2:
        date_min = df_tx['date'].min().date()
        date_max = df_tx['date'].max().date()
        date_range_sel = st.date_input(
            "📅 Filter rentang tanggal",
            value=(date_min, date_max),
            min_value=date_min,
            max_value=date_max,
        )
        if isinstance(date_range_sel, (list, tuple)) and len(date_range_sel) == 2:
            d_start, d_end = date_range_sel
        else:
            d_start, d_end = date_min, date_max

    with col_filter3:
        st.markdown("####")
        show_raw = st.toggle("Tampilkan tabel transaksi", value=False)

    u_tx = df_tx[
        (df_tx['user_id'] == selected_uid) &
        (df_tx['date'].dt.date >= d_start) &
        (df_tx['date'].dt.date <= d_end)
    ].copy().sort_values('date')

    if u_tx.empty:
        st.warning(f"Tidak ada transaksi untuk {selected_uid} di rentang tanggal yang dipilih.")
        st.stop()

    if show_raw:
        st.markdown("### 📋 Tabel Transaksi Pengguna")
        u_tx_display = u_tx.copy()
        if 'date' in u_tx_display.columns:
            u_tx_display['date'] = u_tx_display['date'].dt.strftime('%Y-%m-%d %H:%M')
        cols_show = [c for c in ['txn_id','date','category','amount','payment_method'] if c in u_tx_display.columns]
        st.dataframe(u_tx_display[cols_show].sort_values(by='date', ascending=False),
                     use_container_width=True, height=350)

    u_profile = user_features[user_features['user_id'] == selected_uid]
    u_demo    = df_users[df_users['user_id'] == selected_uid]

    persona = u_profile['spending_persona'].values[0] if len(u_profile) > 0 else 'Unknown'
    impulse = float(u_profile['impulse_score'].values[0]) if len(u_profile) > 0 else 0.0
    p_color = PERSONA_COLORS.get(persona, '#94a3b8')
    p_icon  = PERSONA_ICONS.get(persona, '⚪')

    st.markdown("---")
    col_card, col_stats = st.columns([1, 2])

    with col_card:
        nama_val    = u_demo['nama'].values[0] if (len(u_demo) > 0 and 'nama' in u_demo.columns) else selected_uid
        gender_val  = u_demo['gender'].values[0] if (len(u_demo) > 0 and 'gender' in u_demo.columns) else '-'
        usia_val    = u_demo['usia'].values[0] if (len(u_demo) > 0 and 'usia' in u_demo.columns) else '-'
        kota_val    = u_demo['kota'].values[0] if (len(u_demo) > 0 and 'kota' in u_demo.columns) else '-'
        tier_val    = u_demo['tier_kota'].values[0] if (len(u_demo) > 0 and 'tier_kota' in u_demo.columns) else '-'
        pekrj_val   = u_demo['pekerjaan'].values[0] if (len(u_demo) > 0 and 'pekerjaan' in u_demo.columns) else '-'
        segmen_val  = u_demo['segmen_label'].values[0] if (len(u_demo) > 0 and 'segmen_label' in u_demo.columns) else '-'
        income_val  = int(u_demo['pendapatan_bulan'].values[0]) if (len(u_demo) > 0 and 'pendapatan_bulan' in u_demo.columns) else 0
        gender_icon = '👩' if str(gender_val) == 'P' else '👨'

        st.markdown(f"""
        <div class="user-profile-card">
            <div style="font-size:2.5rem;margin-bottom:8px">{gender_icon}</div>
            <div style="font-size:1.3rem;font-weight:800;color:#9a3412;font-family:'Syne',sans-serif">{nama_val}</div>
            <div style="color:#92400e;font-size:0.88rem;margin-bottom:12px">{selected_uid}</div>
            <div style="margin-bottom:8px">
                <span class="user-stat-badge">🎂 {usia_val} tahun</span>
                <span class="user-stat-badge">⚥ {gender_val}</span>
            </div>
            <div style="margin-bottom:8px">
                <span class="user-stat-badge">📍 {kota_val}</span>
                <span class="user-stat-badge">🏙️ {tier_val}</span>
            </div>
            <div style="margin-bottom:8px">
                <span class="user-stat-badge">💼 {pekrj_val}</span>
            </div>
            <div style="margin-bottom:12px">
                <span class="user-stat-badge">📊 {segmen_val}</span>
            </div>
            <div style="background:{p_color}18;border-radius:10px;padding:10px;text-align:center;border:1.5px solid {p_color}40">
                <div style="font-size:1.5rem">{p_icon}</div>
                <div style="font-weight:700;color:{p_color};font-size:0.95rem;font-family:'Syne',sans-serif">{persona}</div>
                <div style="color:#92400e;font-size:0.8rem">Impulse Score: {impulse:.4f}</div>
            </div>
            <div style="margin-top:12px;color:#78350f;font-size:0.85rem">
                💰 Pendapatan: <b>Rp {income_val:,.0f}/bln</b>
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col_stats:
        total_spend  = u_tx['amount'].sum()
        avg_txn      = u_tx['amount'].mean()
        n_txn        = len(u_tx)
        n_cat        = u_tx['category'].nunique()
        fraud_n      = u_tx['is_fraud'].sum() if 'is_fraud' in u_tx.columns else 0
        night_pct    = u_tx['is_night'].mean() * 100 if 'is_night' in u_tx.columns else 0
        weekend_pct  = u_tx['is_weekend'].mean() * 100 if 'is_weekend' in u_tx.columns else 0
        max_txn      = u_tx['amount'].max()
        spend_ratio  = (total_spend / (income_val * 24) * 100) if income_val > 0 else 0

        r1c1, r1c2, r1c3 = st.columns(3)
        r1c1.metric("💸 Total Spending",   f"Rp {total_spend/1e6:.2f}M",     f"{n_txn} transaksi")
        r1c2.metric("📊 Rata-rata/Transaksi", f"Rp {avg_txn:,.0f}",           f"Max Rp {max_txn:,.0f}")
        r1c3.metric("🏷️ Kategori Digunakan", f"{n_cat} kategori",            f"Fraud: {fraud_n} txn")

        r2c1, r2c2, r2c3 = st.columns(3)
        r2c1.metric("🌙 Transaksi Malam",  f"{night_pct:.1f}%",              "Jam ≥20:00")
        r2c2.metric("📅 Transaksi Weekend", f"{weekend_pct:.1f}%",            "Sabtu & Minggu")
        r2c3.metric("📈 Spending Ratio",   f"{spend_ratio:.1f}%",            "dari pendapatan (24 bln)")

        if persona == 'Impulsive Spender':
            st.markdown(f'<div class="danger-box">🔴 <b>Smart Warning: AKTIF</b> — Pengguna ini Impulsive Spender. BUDU kirim notifikasi Jumat malam & weekend spending cap.</div>', unsafe_allow_html=True)
        elif persona == 'Emotional Spender':
            st.markdown(f'<div class="warn-box">🟡 <b>Smart Warning: SEDANG</b> — Pengguna ini Emotional Spender. BUDU kirim Weekly Reflection setiap Minggu malam.</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="success-box">🟢 <b>Smart Warning: RENDAH</b> — Pengguna ini Rational Spender. BUDU kirim insight dan tips investasi bulanan.</div>', unsafe_allow_html=True)

    st.markdown("---")
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "📊  Kategori & Spending",
        "📅  Pola Waktu",
        "💳  Metode Pembayaran",
        "📈  Tren Bulanan",
        "🆚  Perbandingan Segmen",
    ])

    with tab1:
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("#### 🏷️ Distribusi Pengeluaran per Kategori")
            cat_user = u_tx.groupby('category')['amount'].agg(total='sum', count='count', avg='mean').reset_index()
            cat_user['pct'] = cat_user['total'] / cat_user['total'].sum() * 100
            cat_user = cat_user.sort_values('total', ascending=False)
            fig_cu = px.pie(cat_user, names='category', values='total',
                            color_discrete_sequence=PALETTE, hole=0.35,
                            title=f'Distribusi Spending — {nama_val}')
            fig_cu.update_traces(textposition='outside', textinfo='percent+label')
            fig_cu.update_layout(height=380, margin=dict(t=40,b=10))
            st.plotly_chart(fig_cu, use_container_width=True)
        with col2:
            st.markdown("#### 💸 Total & Rata-rata per Kategori (IDR)")
            fig_cb = px.bar(cat_user, x='total', y='category', orientation='h',
                            color='total', color_continuous_scale='Oranges',
                            text=cat_user['total'].apply(lambda x: f'Rp {x/1e3:.0f}K'),
                            labels={'total':'Total (IDR)','category':'Kategori'})
            fig_cb.update_traces(textposition='outside')
            fig_cb.update_layout(coloraxis_showscale=False, height=380,
                                 plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                                 yaxis={'categoryorder': 'total ascending'})
            st.plotly_chart(fig_cb, use_container_width=True)

        st.markdown("#### 📊 Distribusi Nilai Transaksi")
        col_d1, col_d2 = st.columns(2)
        with col_d1:
            fig_hist = px.histogram(u_tx, x='amount', nbins=30,
                                    color_discrete_sequence=[PRIMARY],
                                    labels={'amount':'Amount (IDR)','count':'Frekuensi'})
            fig_hist.add_vline(x=u_tx['amount'].mean(), line_dash='dash', line_color=WARN,
                               annotation_text=f"Mean: Rp {u_tx['amount'].mean():,.0f}")
            fig_hist.add_vline(x=u_tx['amount'].median(), line_dash='dot', line_color=ACCENT,
                               annotation_text=f"Median: Rp {u_tx['amount'].median():,.0f}")
            fig_hist.update_layout(height=300, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_hist, use_container_width=True)
        with col_d2:
            bins_idr = [0, 50_000, 200_000, 500_000, 1_000_000, float('inf')]
            lbl_idr  = ['<50k','50k-200k','200k-500k','500k-1jt','>1jt']
            u_tx['_bucket'] = pd.cut(u_tx['amount'], bins=bins_idr, labels=lbl_idr)
            bucket_count = u_tx['_bucket'].value_counts().reindex(lbl_idr, fill_value=0).reset_index()
            bucket_count.columns = ['Bucket','Count']
            fig_bk = px.bar(bucket_count, x='Bucket', y='Count',
                            color='Bucket', color_discrete_sequence=PALETTE, text='Count')
            fig_bk.update_traces(textposition='outside')
            fig_bk.update_layout(showlegend=False, height=300,
                                 plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_bk, use_container_width=True)

    with tab2:
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("#### 🕐 Pola Spending per Jam")
            hourly_user = u_tx.groupby('hour')['amount'].agg(total='sum', count='count', avg='mean').reset_index()
            fig_hr = go.Figure()
            fig_hr.add_trace(go.Bar(x=hourly_user['hour'], y=hourly_user['count'],
                                    name='Frekuensi', marker_color='#FB923C', yaxis='y'))
            fig_hr.add_trace(go.Scatter(x=hourly_user['hour'], y=hourly_user['avg']/1e3,
                                        name='Avg Amount (ribu IDR)', line=dict(color=WARN, width=2.5),
                                        mode='lines+markers', yaxis='y2'))
            fig_hr.add_vrect(x0=20, x1=23, fillcolor=WARN, opacity=0.08,
                             annotation_text="Malam", annotation_position="top left")
            fig_hr.update_layout(
                height=350, xaxis=dict(title='Jam', tickmode='linear', dtick=2),
                yaxis=dict(title='Jumlah Transaksi', showgrid=True, gridcolor='#ffedd5'),
                yaxis2=dict(title='Avg Amount (ribu IDR)', overlaying='y', side='right'),
                legend=dict(orientation='h', y=-0.2),
                plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_hr, use_container_width=True)
        with col2:
            st.markdown("#### 📅 Pola Spending per Hari")
            day_names = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']
            daily_user = u_tx.groupby('day_of_week')['amount'].agg(total='sum', count='count', avg='mean').reset_index()
            daily_user['day_name'] = daily_user['day_of_week'].map(dict(enumerate(day_names)))
            daily_user['is_wknd']  = daily_user['day_of_week'].isin([5, 6])
            fig_dw = px.bar(daily_user, x='day_name', y='avg',
                            color='is_wknd',
                            color_discrete_map={False:'#FB923C', True:WARN},
                            text=daily_user['avg'].apply(lambda x: f'Rp {x/1e3:.0f}K'),
                            labels={'avg':'Avg Amount (IDR)','day_name':'Hari'},
                            category_orders={'day_name': day_names})
            fig_dw.update_traces(textposition='outside')
            fig_dw.update_layout(showlegend=False, height=350,
                                 plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_dw, use_container_width=True)

        st.markdown("#### 🗺️ Heatmap: Jam × Kategori")
        top_cats_u = u_tx.groupby('category')['amount'].sum().nlargest(6).index
        hm_data = u_tx[u_tx['category'].isin(top_cats_u)].groupby(['hour','category'])['amount'].sum().unstack(fill_value=0)
        if not hm_data.empty:
            fig_hm = px.imshow(hm_data.T / 1e3, color_continuous_scale='Oranges',
                               labels=dict(x='Jam', y='Kategori', color='Ribu IDR'), aspect='auto')
            fig_hm.update_layout(height=320, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_hm, use_container_width=True)

        st.markdown("#### 🏖️ Weekend vs Weekday — User Ini")
        col_w1, col_w2, col_w3 = st.columns(3)
        wknd_u = u_tx[u_tx['is_weekend'] == 1]['amount']
        wkdy_u = u_tx[u_tx['is_weekend'] == 0]['amount']
        if len(wknd_u) > 0 and len(wkdy_u) > 0:
            diff_u = (wknd_u.mean() - wkdy_u.mean()) / wkdy_u.mean() * 100
            col_w1.metric("Avg Weekday", f"Rp {wkdy_u.mean():,.0f}", f"{len(wkdy_u)} txn")
            col_w2.metric("Avg Weekend", f"Rp {wknd_u.mean():,.0f}", f"{len(wknd_u)} txn")
            col_w3.metric("Selisih", f"{diff_u:.1f}%",
                          "⬆️ Impulsif di weekend" if diff_u > 20 else "Normal")

    with tab3:
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("#### 💳 Frekuensi per Metode Pembayaran")
            pay_user = u_tx.groupby('payment_method')['amount'].agg(total='sum', count='count', avg='mean').sort_values('total', ascending=False).reset_index()
            fig_pay_u = px.pie(pay_user, names='payment_method', values='count',
                               color_discrete_sequence=PALETTE, hole=0.4, title='Frekuensi per Metode')
            fig_pay_u.update_traces(textposition='outside', textinfo='percent+label')
            fig_pay_u.update_layout(height=360, margin=dict(t=40,b=10))
            st.plotly_chart(fig_pay_u, use_container_width=True)
        with col2:
            st.markdown("#### 💰 Total Spending per Metode Pembayaran")
            fig_pay_b = px.bar(pay_user, x='payment_method', y='total',
                               color='payment_method', color_discrete_sequence=PALETTE,
                               text=pay_user['total'].apply(lambda x: f'Rp {x/1e3:.0f}K'),
                               labels={'total':'Total (IDR)','payment_method':'Metode'})
            fig_pay_b.update_traces(textposition='outside')
            fig_pay_b.update_layout(showlegend=False, height=360,
                                    plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_pay_b, use_container_width=True)

        st.markdown("#### 📊 Rata-rata Nilai Transaksi per Metode")
        pay_sorted = pay_user.sort_values('avg', ascending=True)
        fig_pay_avg = px.bar(pay_sorted, x='avg', y='payment_method', orientation='h',
                             color='avg', color_continuous_scale='Oranges',
                             text=pay_sorted['avg'].apply(lambda x: f'Rp {x:,.0f}'),
                             labels={'avg':'Rata-rata (IDR)','payment_method':'Metode'})
        fig_pay_avg.update_traces(textposition='outside')
        fig_pay_avg.update_layout(coloraxis_showscale=False, height=300,
                                  plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig_pay_avg, use_container_width=True)
        dom_pay = pay_user.sort_values('total', ascending=False)['payment_method'].values[0]
        st.markdown(f'<div class="insight-box">💳 Metode pembayaran dominan <b>{nama_val}</b>: <b>{dom_pay}</b> (berdasarkan total spending)</div>', unsafe_allow_html=True)

    with tab4:
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("#### 📈 Tren Spending Bulanan")
            monthly_u = u_tx.groupby('month')['amount'].agg(total='sum', count='count', avg='mean').reset_index().sort_values('month')
            monthly_u['month_name'] = monthly_u['month'].apply(lambda m: M_LBL[m-1])
            if len(monthly_u) > 2:
                thr_u = monthly_u['total'].mean() + ANOMALY_STD_FACTOR * monthly_u['total'].std()
                monthly_u['anomaly'] = monthly_u['total'] > thr_u
            else:
                monthly_u['anomaly'] = False
                thr_u = monthly_u['total'].max()
            fig_mu = go.Figure()
            fig_mu.add_trace(go.Bar(x=monthly_u['month_name'], y=monthly_u['total']/1e3,
                                    name='Total (ribu IDR)',
                                    marker_color=[WARN if a else '#FB923C' for a in monthly_u['anomaly']]))
            fig_mu.add_trace(go.Scatter(x=monthly_u['month_name'], y=monthly_u['avg']/1e3,
                                        name='Avg/Transaksi', line=dict(color=PRIMARY, width=2.5, dash='dot'),
                                        mode='lines+markers', yaxis='y2'))
            fig_mu.add_hline(y=thr_u/1e3, line_dash='dash', line_color=WARN, opacity=0.5,
                             annotation_text='Threshold anomali')
            fig_mu.update_layout(
                height=380, yaxis=dict(title='Total (ribu IDR)', showgrid=True, gridcolor='#ffedd5'),
                yaxis2=dict(title='Avg/Txn (ribu IDR)', overlaying='y', side='right'),
                legend=dict(orientation='h', y=-0.2),
                plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_mu, use_container_width=True)
        with col2:
            st.markdown("#### 🏷️ Spending per Kategori per Bulan")
            if len(u_tx) > 0:
                top_cats_u3 = u_tx.groupby('category')['amount'].sum().nlargest(5).index
                cat_month_u = u_tx[u_tx['category'].isin(top_cats_u3)].groupby(['month','category'])['amount'].sum().reset_index()
                cat_month_u['month_name'] = cat_month_u['month'].apply(lambda m: M_LBL[m-1])
                fig_cm = px.line(cat_month_u, x='month_name', y='amount', color='category',
                                 color_discrete_sequence=PALETTE, markers=True,
                                 labels={'amount':'Total (IDR)','month_name':'Bulan','category':'Kategori'})
                fig_cm.update_layout(height=380, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                                     yaxis=dict(showgrid=True, gridcolor='#ffedd5'))
                st.plotly_chart(fig_cm, use_container_width=True)

        st.markdown("#### 📉 Timeline Transaksi & Rolling 7 Txn")
        u_tx_sorted = u_tx.sort_values('date').copy()
        u_tx_sorted['rolling_7'] = u_tx_sorted['amount'].rolling(7, min_periods=1).mean()
        u_tx_sorted['spike_flag'] = u_tx_sorted['amount'] > u_tx_sorted['rolling_7'] * 2
        fig_tl = go.Figure()
        fig_tl.add_trace(go.Scatter(x=u_tx_sorted['date'], y=u_tx_sorted['amount']/1e3,
                                    mode='markers', name='Transaksi',
                                    marker=dict(size=6, color=[WARN if s else '#FB923C' for s in u_tx_sorted['spike_flag']], opacity=0.7)))
        fig_tl.add_trace(go.Scatter(x=u_tx_sorted['date'], y=u_tx_sorted['rolling_7']/1e3,
                                    mode='lines', name='Rolling Mean 7 Txn',
                                    line=dict(color=PRIMARY, width=2.5)))
        fig_tl.update_layout(height=320, xaxis_title='Tanggal', yaxis_title='Amount (ribu IDR)',
                             plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                             yaxis=dict(showgrid=True, gridcolor='#ffedd5'),
                             legend=dict(orientation='h', y=-0.2))
        st.plotly_chart(fig_tl, use_container_width=True)
        n_spikes = u_tx_sorted['spike_flag'].sum()
        if n_spikes > 0:
            st.markdown(f'<div class="warn-box">⚠️ Terdeteksi <b>{n_spikes} spike transaksi</b> (lebih dari 2× rolling mean 7 txn). Ditandai merah di grafik.</div>', unsafe_allow_html=True)

    with tab5:
        st.markdown("#### 🆚 Perbandingan Profil User vs Rata-rata Segmennya")
        segmen_user = u_demo['segmen'].values[0] if (len(u_demo) > 0 and 'segmen' in u_demo.columns) else None
        if segmen_user and segmen_user in seg_filter:
            seg_peers = df_tx[df_tx['segmen'] == segmen_user]
            seg_col_uf = 'segmen' if 'segmen' in user_features.columns else ('segmen_label' if 'segmen_label' in user_features.columns else None)
            seg_uf = user_features[user_features[seg_col_uf] == segmen_user] if seg_col_uf is not None else user_features.head(0)
            metrics_compare = {
                'Total Spending (IDR)': (u_tx['amount'].sum(), seg_peers['amount'].sum() / seg_uf['user_id'].nunique()),
                'Avg Transaksi (IDR)':  (u_tx['amount'].mean(), seg_peers['amount'].mean()),
                'Frekuensi Transaksi':  (len(u_tx), seg_peers.groupby('user_id').size().mean()),
                'Weekend Ratio':        (u_tx['is_weekend'].mean(), seg_peers['is_weekend'].mean()),
                'Night Ratio':          (u_tx['is_night'].mean(), seg_peers['is_night'].mean()),
                'Impulse Score':        (impulse, seg_uf['impulse_score'].mean()),
            }
            cmp_rows = []
            for metric, (user_val, seg_val) in metrics_compare.items():
                diff_pct_cmp = ((user_val - seg_val) / seg_val * 100) if seg_val != 0 else 0
                status = '⬆️' if diff_pct_cmp > 10 else ('⬇️' if diff_pct_cmp < -10 else '➡️')
                cmp_rows.append({
                    'Metrik': metric,
                    f'{nama_val}': f'{user_val:,.2f}' if isinstance(user_val, float) else f'{user_val:,.0f}',
                    f'Avg {segmen_val}': f'{seg_val:,.2f}' if isinstance(seg_val, float) else f'{seg_val:,.0f}',
                    'Selisih %': f'{diff_pct_cmp:+.1f}%',
                    'Status': status,
                })
            df_cmp = pd.DataFrame(cmp_rows)
            st.dataframe(df_cmp, use_container_width=True, hide_index=True)

            st.markdown("#### 🕸️ Radar: User vs Rata-rata Segmen")
            radar_feats_cmp = ['weekend_ratio','night_ratio','above_avg_ratio','spike_ratio','spending_cov','active_months']
            radar_feats_cmp = [f for f in radar_feats_cmp if f in user_features.columns]
            u_vals    = [float(u_profile[f].values[0]) if len(u_profile) > 0 else 0 for f in radar_feats_cmp]
            seg_means = seg_uf[radar_feats_cmp].mean().tolist()
            all_vals  = [max(u + s, 1e-9) for u, s in zip(u_vals, seg_means)]
            u_norm    = [v / m if m > 0 else 0 for v, m in zip(u_vals, all_vals)]
            s_norm    = [v / m if m > 0 else 0 for v, m in zip(seg_means, all_vals)]
            categories_r = radar_feats_cmp + [radar_feats_cmp[0]]
            u_norm_r     = u_norm + [u_norm[0]]
            s_norm_r     = s_norm + [s_norm[0]]
            fig_radar = go.Figure()
            fig_radar.add_trace(go.Scatterpolar(r=u_norm_r, theta=categories_r, fill='toself',
                                                name=nama_val, line=dict(color=p_color, width=2.5), fillcolor=p_color, opacity=0.25))
            fig_radar.add_trace(go.Scatterpolar(r=s_norm_r, theta=categories_r, fill='toself',
                                                name=f'Avg {segmen_val}', line=dict(color='#94a3b8', width=2, dash='dot'),
                                                fillcolor='#94a3b8', opacity=0.15))
            fig_radar.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 1.1])),
                                    height=420, showlegend=True, legend=dict(orientation='h', y=-0.1))
            st.plotly_chart(fig_radar, use_container_width=True)

            st.markdown("#### 📊 Posisi Impulse Score dalam Segmen")
            fig_pos = px.histogram(seg_uf, x='impulse_score', nbins=30,
                                   color_discrete_sequence=['#FB923C'],
                                   labels={'impulse_score':'Impulse Score','count':'Jumlah User'})
            fig_pos.add_vline(x=impulse, line_dash='solid', line_color=p_color, line_width=3,
                              annotation_text=f'{nama_val}: {impulse:.4f}', annotation_position='top right')
            fig_pos.add_vline(x=seg_uf['impulse_score'].mean(), line_dash='dash', line_color='#78350f',
                              annotation_text=f'Avg segmen: {seg_uf["impulse_score"].mean():.4f}')
            pct_rank = (seg_uf['impulse_score'] <= impulse).mean() * 100
            fig_pos.update_layout(height=300, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_pos, use_container_width=True)
            st.markdown(f'<div class="insight-box">📌 <b>{nama_val}</b> berada di persentil ke-<b>{pct_rank:.0f}</b> dalam segmen <b>{segmen_val}</b> berdasarkan impulse score ({impulse:.4f}).</div>', unsafe_allow_html=True)
        else:
            st.info("Data segmen tidak tersedia atau segmen user tidak termasuk dalam filter aktif.")

    if show_raw:
        st.markdown("---")
        st.markdown("#### 📋 Riwayat Transaksi Lengkap")
        show_cols = [c for c in ['txn_id','date','amount','category','sub_category',
                                  'payment_method','is_weekend','is_night','is_fraud',
                                  'is_spike','amount_idr_bucket'] if c in u_tx.columns]
        st.dataframe(u_tx[show_cols].sort_values('date', ascending=False).reset_index(drop=True),
                     use_container_width=True, height=400)
        csv_dl = u_tx[show_cols].to_csv(index=False).encode('utf-8')
        st.download_button(
            label=f"⬇️ Download transaksi {selected_uid} (.csv)",
            data=csv_dl,
            file_name=f"budu_{selected_uid}_transactions.csv",
            mime="text/csv",
        )


# ==========================================
# ██  DATA DICTIONARY  ██
# ==========================================
elif menu == "📖 Data Dictionary":
    st.subheader("Data Dictionary — BUDU Dataset")

    tab_d = st.tabs([
        "📊  Segmen Sosio-Ekonomi",
        "📋  Kolom Transaksi",
        "🕐  Fitur Temporal",
        "👤  User Profile Features",
        "🎯  Spending Persona",
        "📁  File Output",
    ])

    with tab_d[0]:
        seg_dict = pd.DataFrame([
            {'Segmen':'E','Label':'Kelas E (Miskin)',         '% Pop':'15%','Income/Bulan':'Rp 800rb–1,5jt','Metode Bayar Dominan':'Tunai 55%',         'Kota':'Desa / Kota Kecil'},
            {'Segmen':'D','Label':'Kelas D (Menengah Bawah)', '% Pop':'25%','Income/Bulan':'Rp 1,5–3jt',   'Metode Bayar Dominan':'GoPay 30%',         'Kota':'Kota Kecil / Besar'},
            {'Segmen':'C','Label':'Kelas C (Menengah)',       '% Pop':'35%','Income/Bulan':'Rp 3–7jt',     'Metode Bayar Dominan':'GoPay/OVO/Kartu',   'Kota':'Kota Besar'},
            {'Segmen':'B','Label':'Kelas B (Menengah Atas)',  '% Pop':'18%','Income/Bulan':'Rp 7–20jt',    'Metode Bayar Dominan':'Kartu Kredit 30%',  'Kota':'Kota Besar/Metropolitan'},
            {'Segmen':'A','Label':'Kelas A (Kaya)',           '% Pop':'7%', 'Income/Bulan':'Rp 20–150jt',  'Metode Bayar Dominan':'Kartu Kredit 45%',  'Kota':'Metropolitan'},
        ])
        st.dataframe(seg_dict, use_container_width=True, hide_index=True)

    with tab_d[1]:
        col_dict = pd.DataFrame([
            {'Kolom':'txn_id',            'Tipe':'string',   'Satuan':'-',      'Deskripsi':'ID unik transaksi (TXN0000001)'},
            {'Kolom':'user_id',           'Tipe':'string',   'Satuan':'-',      'Deskripsi':'ID unik pengguna BUDU (BUDU00001)'},
            {'Kolom':'date',              'Tipe':'datetime', 'Satuan':'-',      'Deskripsi':'Tanggal & jam transaksi'},
            {'Kolom':'amount',            'Tipe':'int',      'Satuan':'IDR',    'Deskripsi':'Nilai transaksi dalam Rupiah'},
            {'Kolom':'category',          'Tipe':'string',   'Satuan':'-',      'Deskripsi':'Kategori utama pengeluaran'},
            {'Kolom':'sub_category',      'Tipe':'string',   'Satuan':'-',      'Deskripsi':'Sub-kategori / nama merchant'},
            {'Kolom':'payment_method',    'Tipe':'string',   'Satuan':'-',      'Deskripsi':'Metode pembayaran'},
            {'Kolom':'gender',            'Tipe':'string',   'Satuan':'-',      'Deskripsi':'Jenis kelamin (L/P)'},
            {'Kolom':'usia',              'Tipe':'int',      'Satuan':'tahun',  'Deskripsi':'Usia pengguna'},
            {'Kolom':'segmen',            'Tipe':'string',   'Satuan':'-',      'Deskripsi':'Kode segmen (E/D/C/B/A)'},
            {'Kolom':'segmen_label',      'Tipe':'string',   'Satuan':'-',      'Deskripsi':'Label segmen lengkap'},
            {'Kolom':'pendapatan_bulan',  'Tipe':'int',      'Satuan':'IDR',    'Deskripsi':'Pendapatan bulanan user'},
            {'Kolom':'populasi_kota',     'Tipe':'int',      'Satuan':'jiwa',   'Deskripsi':'Populasi kota domisili'},
            {'Kolom':'dist_user_merchant','Tipe':'float',    'Satuan':'derajat','Deskripsi':'Jarak Euclidean user ke merchant'},
            {'Kolom':'is_fraud',          'Tipe':'int',      'Satuan':'0/1',    'Deskripsi':'Label fraud (1=fraud)'},
        ])
        st.dataframe(col_dict, use_container_width=True, hide_index=True)

    with tab_d[2]:
        temp_dict = pd.DataFrame([
            {'Fitur':'month',         'Tipe':'int', 'Deskripsi':'Bulan 1-12',           'Dipakai':'EDA, Model'},
            {'Fitur':'day_of_week',   'Tipe':'int', 'Deskripsi':'0=Senin ... 6=Minggu', 'Dipakai':'EDA, Model'},
            {'Fitur':'hour',          'Tipe':'int', 'Deskripsi':'Jam transaksi 0-23',   'Dipakai':'EDA, Model'},
            {'Fitur':'is_weekend',    'Tipe':'0/1', 'Deskripsi':'1 jika Sabtu/Minggu',  'Dipakai':'Model, A/B Test'},
            {'Fitur':'is_night',      'Tipe':'0/1', 'Deskripsi':'1 jika jam ≥20',       'Dipakai':'Model, Warning'},
            {'Fitur':'is_month_start','Tipe':'0/1', 'Deskripsi':'1 jika tgl 1-5',       'Dipakai':'Model'},
            {'Fitur':'is_month_end',  'Tipe':'0/1', 'Deskripsi':'1 jika tgl 25-31',     'Dipakai':'Model'},
            {'Fitur':'quarter',       'Tipe':'int', 'Deskripsi':'Kuartal 1-4',          'Dipakai':'EDA'},
        ])
        st.dataframe(temp_dict, use_container_width=True, hide_index=True)

    with tab_d[3]:
        prof_dict = pd.DataFrame([
            {'Fitur':'total_spending_idr','Satuan':'IDR',    'Deskripsi':'Total pengeluaran sepanjang periode'},
            {'Fitur':'avg_txn_idr',       'Satuan':'IDR',    'Deskripsi':'Rata-rata nilai transaksi'},
            {'Fitur':'median_txn_idr',    'Satuan':'IDR',    'Deskripsi':'Median nilai transaksi'},
            {'Fitur':'max_txn_idr',       'Satuan':'IDR',    'Deskripsi':'Nilai transaksi tertinggi'},
            {'Fitur':'txn_count',         'Satuan':'count',  'Deskripsi':'Jumlah total transaksi'},
            {'Fitur':'std_amount_idr',    'Satuan':'IDR',    'Deskripsi':'Standar deviasi nilai transaksi'},
            {'Fitur':'weekend_ratio',     'Satuan':'0-1',    'Deskripsi':'Proporsi transaksi di weekend'},
            {'Fitur':'night_ratio',       'Satuan':'0-1',    'Deskripsi':'Proporsi transaksi malam (≥20:00)'},
            {'Fitur':'above_avg_ratio',   'Satuan':'0-1',    'Deskripsi':'Proporsi transaksi di atas rata-rata global'},
            {'Fitur':'spike_ratio',       'Satuan':'0-1',    'Deskripsi':'Proporsi transaksi spike (>2× rolling mean 7 txn)'},
            {'Fitur':'spending_cov',      'Satuan':'ratio',  'Deskripsi':'Koefisien variasi (std/mean)'},
            {'Fitur':'impulse_score',     'Satuan':'0-1',    'Deskripsi':'Skor impulsivitas: weekend×0.35 + night×0.30 + above_avg×0.20 + spike×0.15'},
            {'Fitur':'unique_categories', 'Satuan':'count',  'Deskripsi':'Jumlah kategori berbeda'},
            {'Fitur':'active_months',     'Satuan':'count',  'Deskripsi':'Jumlah bulan aktif'},
            {'Fitur':'fraud_ratio',       'Satuan':'0-1',    'Deskripsi':'Proporsi transaksi fraud'},
            {'Fitur':'avg_dist_merchant', 'Satuan':'derajat','Deskripsi':'Rata-rata jarak user ke merchant'},
            {'Fitur':'spending_ratio',    'Satuan':'0-1',    'Deskripsi':'Rasio pengeluaran vs pendapatan (24 bulan)'},
        ])
        st.dataframe(prof_dict, use_container_width=True, hide_index=True)

    with tab_d[4]:
        st.markdown("""
| Label | Encode | Impulse Score | Karakteristik | Smart Warning |
|---|---|---|---|---|
| `Rational Spender` | 0 | < 0.30 | Konsisten, terkontrol, jarang spike | 🔵 Rendah – insight informatif |
| `Emotional Spender` | 1 | 0.30–0.55 | Tidak konsisten, spending_cov tinggi | 🟡 Sedang – Weekly Reflection |
| `Impulsive Spender` | 2 | ≥ 0.55 | Weekend & malam tinggi, banyak spike | 🔴 Tinggi – notifikasi Jumat malam |

**Formula Impulse Score (sesuai notebook Cell 21):**
```
impulse_score = (weekend_ratio × 0.35) + (night_ratio × 0.30) + (above_avg_ratio × 0.20) + (spike_ratio × 0.15)
```
""")

    with tab_d[5]:
        file_dict = pd.DataFrame([
            {'File':'budu_transactions_clean_idr.csv', 'Konten':'Semua transaksi bersih (IDR)',    'Digunakan oleh':'Dashboard, REST API'},
            {'File':'budu_user_profiles_idr.csv',      'Konten':'Profil + persona per user',       'Digunakan oleh':'REST API, Dashboard'},
            {'File':'budu_dummy_users.csv',             'Konten':'Data demografis user (dummy)',    'Digunakan oleh':'Analisis segmen'},
            {'File':'X/y_train/val/test.npy',           'Konten':'Array input/output model TF',    'Digunakan oleh':'AI Engineer (TF)'},
            {'File':'budu_model_metadata.json',         'Konten':'Metadata + saran arsitektur TF', 'Digunakan oleh':'AI Engineer'},
        ])
        st.dataframe(file_dict, use_container_width=True, hide_index=True)

    st.markdown("---")
    st.markdown("#### 🔎 Preview Dataset Transaksi (50 baris pertama)")
    preview_tx_cols = [c for c in ['txn_id','user_id','date','amount','category',
                                    'payment_method','segmen','segmen_label','gender',
                                    'usia','kota','is_weekend','is_night','is_fraud',
                                    'month','hour'] if c in df_f.columns]
    st.dataframe(df_f[preview_tx_cols].head(50), use_container_width=True)

    st.markdown("#### 👤 Preview User Profile & Features (50 baris pertama)")
    preview_uf_cols = [c for c in [
        'user_id','segmen','segmen_label','usia','gender','kota','tier_kota',
        'pendapatan_bulan','txn_count','total_spending_idr','avg_txn_idr',
        'impulse_score','spending_persona','weekend_ratio','night_ratio',
        'above_avg_ratio','spike_ratio',
    ] if c in uf_f.columns]
    st.dataframe(uf_f[preview_uf_cols].head(50), use_container_width=True)
