# ============================================================
# dashboard.py — BUDU SpendBehavior Analyzer
# Streamlit Dashboard · Tim CC26-PSU268
# Jalankan: streamlit run dashboard.py
# ============================================================

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick
import seaborn as sns
import warnings
import json
import os
from scipy.stats import mannwhitneyu, spearmanr
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from sklearn.model_selection import train_test_split

warnings.filterwarnings('ignore')

# ── Page config ─────────────────────────────────────────────
st.set_page_config(
    page_title='BUDU — SpendBehavior Analyzer',
    page_icon='💸',
    layout='wide',
    initial_sidebar_state='expanded',
)

# ── Global style ─────────────────────────────────────────────
PALETTE  = ['#60a5fa','#34d399','#fbbf24','#f87171','#a78bfa','#f472b6','#fb923c']
PRIMARY  = '#60a5fa'
ACCENT   = '#34d399'
WARN     = '#f87171'
PERSONA_COLORS = {
    'Impulsive Spender': '#f87171',
    'Emotional Spender': '#fbbf24',
    'Rational Spender' : '#34d399',
}

plt.rcParams.update({
    'figure.facecolor': 'none',
    'axes.facecolor'  : 'none',
    'axes.spines.top' : False,
    'axes.spines.right': False,
    'font.size'       : 10,
    'text.color'      : '#c8d8f0',
    'axes.labelcolor' : '#7b90b8',
    'xtick.color'     : '#7b90b8',
    'ytick.color'     : '#7b90b8',
    'axes.edgecolor'  : '#2a3a55',
    'axes.spines.left': True,
    'axes.spines.bottom': True,
    'grid.color'      : '#1e2d45',
    'grid.alpha'      : 0.6,
    'legend.facecolor': '#161c2a',
    'legend.edgecolor': '#2a3a55',
    'legend.labelcolor': '#c8d8f0',
})

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

html, body, [class*="css"] { font-family: 'Plus Jakarta Sans', sans-serif; }

/* ── DARK MODE ── */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-main:    #0d1117;
    --bg-card:    #161c2a;
    --bg-card2:   #1a2235;
    --border:     #2a3a55;
    --text-main:  #e8f0fe;
    --text-muted: #7b90b8;
    --text-dim:   #4a6080;
    --accent1:    #60a5fa;
    --accent2:    #34d399;
    --accent3:    #fbbf24;
    --accent4:    #f87171;
  }
}
/* ── LIGHT MODE ── */
@media (prefers-color-scheme: light) {
  :root {
    --bg-main:    #f0f4ff;
    --bg-card:    #ffffff;
    --bg-card2:   #eef3ff;
    --border:     #c7d7f5;
    --text-main:  #0f1e3c;
    --text-muted: #3b5080;
    --text-dim:   #6b82a8;
    --accent1:    #1d4ed8;
    --accent2:    #059669;
    --accent3:    #d97706;
    --accent4:    #dc2626;
  }
}
/* Fallback (Streamlit injected dark) */
:root {
  --bg-main:    #0d1117;
  --bg-card:    #161c2a;
  --bg-card2:   #1a2235;
  --border:     #2a3a55;
  --text-main:  #e8f0fe;
  --text-muted: #7b90b8;
  --text-dim:   #4a6080;
  --accent1:    #60a5fa;
  --accent2:    #34d399;
  --accent3:    #fbbf24;
  --accent4:    #f87171;
}

.stApp { background: var(--bg-main) !important; color: var(--text-main) !important; }

/* Sidebar */
[data-testid="stSidebar"] {
    background: var(--bg-card) !important;
    border-right: 2px solid var(--border) !important;
}
[data-testid="stSidebar"] * { color: var(--text-main) !important; }
[data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3 { color: var(--accent1) !important; }

/* Metric cards */
[data-testid="metric-container"] {
    background: var(--bg-card) !important;
    border: 1.5px solid var(--border) !important;
    border-radius: 14px !important;
    padding: 18px !important;
    box-shadow: 0 2px 12px rgba(37,99,235,0.08);
}
[data-testid="metric-container"] label { color: var(--text-muted) !important; font-size: 12px !important; font-weight: 600 !important; letter-spacing: 0.05em !important; }
[data-testid="metric-container"] [data-testid="stMetricValue"] { color: var(--text-main) !important; font-weight: 800 !important; font-size: 1.5rem !important; }
[data-testid="metric-container"] [data-testid="stMetricDelta"] { font-size: 12px !important; font-weight: 600 !important; }

/* Section header */
.section-header {
    font-size: 11px; font-weight: 800; letter-spacing: 0.15em;
    color: var(--accent1); text-transform: uppercase;
    border-bottom: 2px solid var(--border);
    padding-bottom: 10px; margin-bottom: 18px;
    display: flex; align-items: center; gap: 8px;
}

/* Persona badges */
.badge-impulsive {
    background: linear-gradient(135deg, #ef444422, #dc262622);
    color: #f87171; border: 1.5px solid #f8717155;
    padding: 3px 14px; border-radius: 99px; font-size: 12px; font-weight: 700;
    letter-spacing: 0.03em;
}
.badge-emotional {
    background: linear-gradient(135deg, #f59e0b22, #d9770622);
    color: #fbbf24; border: 1.5px solid #fbbf2455;
    padding: 3px 14px; border-radius: 99px; font-size: 12px; font-weight: 700;
}
.badge-rational {
    background: linear-gradient(135deg, #10b98122, #05966922);
    color: #34d399; border: 1.5px solid #34d39955;
    padding: 3px 14px; border-radius: 99px; font-size: 12px; font-weight: 700;
}

/* Colored insight boxes */
.warn-box {
    background: linear-gradient(135deg, #ef444418, #dc262610);
    border-left: 4px solid #f87171;
    border-radius: 10px; padding: 14px 18px; margin: 10px 0;
    font-size: 13px; color: var(--text-main);
    box-shadow: 0 2px 8px rgba(248,113,113,0.12);
}
.info-box {
    background: linear-gradient(135deg, #3b82f618, #2563eb10);
    border-left: 4px solid var(--accent1);
    border-radius: 10px; padding: 14px 18px; margin: 10px 0;
    font-size: 13px; color: var(--text-main);
    box-shadow: 0 2px 8px rgba(96,165,250,0.12);
}
.success-box {
    background: linear-gradient(135deg, #10b98118, #05966910);
    border-left: 4px solid var(--accent2);
    border-radius: 10px; padding: 14px 18px; margin: 10px 0;
    font-size: 13px; color: var(--text-main);
    box-shadow: 0 2px 8px rgba(52,211,153,0.12);
}

/* Persona card */
.persona-card {
    background: var(--bg-card);
    border: 1.5px solid var(--border);
    border-radius: 14px; padding: 18px;
    box-shadow: 0 2px 12px rgba(37,99,235,0.07);
    transition: box-shadow 0.2s;
}
.persona-card:hover { box-shadow: 0 4px 20px rgba(37,99,235,0.18); }

/* General text */
h1, h2, h3, h4 { color: var(--text-main) !important; }
p, li, span, label { color: var(--text-main); }
.stMarkdown { color: var(--text-main); }

/* Tabs */
.stTabs [data-baseweb="tab-list"] {
    background: var(--bg-card);
    border-radius: 12px; padding: 5px;
    border: 1.5px solid var(--border);
    gap: 4px;
}
.stTabs [data-baseweb="tab"] {
    color: var(--text-muted) !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    font-size: 13px !important;
}
.stTabs [aria-selected="true"] {
    background: linear-gradient(135deg, #2563eb22, #1d4ed818) !important;
    color: var(--accent1) !important;
    border: 1px solid var(--accent1) !important;
}

/* Dataframe */
[data-testid="stDataFrame"] { border-radius: 10px; overflow: hidden; border: 1px solid var(--border); }

/* Divider */
hr { border-color: var(--border) !important; }

/* Buttons */
.stButton button {
    background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
    color: white !important; border: none !important;
    border-radius: 10px !important; font-weight: 700 !important;
    box-shadow: 0 2px 10px rgba(37,99,235,0.3) !important;
    transition: all 0.2s !important;
}
.stButton button:hover {
    box-shadow: 0 4px 20px rgba(37,99,235,0.5) !important;
    transform: translateY(-1px) !important;
}

/* Slider */
[data-testid="stSlider"] [data-baseweb="slider"] [data-testid="stThumbValue"] { color: var(--accent1) !important; }

/* Selectbox */
[data-baseweb="select"] { background: var(--bg-card2) !important; border-color: var(--border) !important; border-radius: 10px !important; }
[data-baseweb="select"] * { color: var(--text-main) !important; }

/* Code blocks */
.stCode { background: var(--bg-card2) !important; border: 1px solid var(--border) !important; border-radius: 10px !important; }

/* Radio */
[data-testid="stRadio"] label { color: var(--text-main) !important; font-weight: 500 !important; }

/* KPI highlight strip */
.kpi-strip {
    display: flex; gap: 12px; margin-bottom: 16px;
}
.kpi-item {
    flex: 1;
    background: var(--bg-card);
    border: 1.5px solid var(--border);
    border-radius: 12px; padding: 14px 18px;
    text-align: center;
}
.kpi-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
.kpi-value { font-size: 22px; font-weight: 800; color: var(--accent1); margin-top: 4px; }

</style>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════
# CONSTANTS (sama persis dengan notebook)
# ══════════════════════════════════════════════════════════════
NIGHT_START          = 20
ANOMALY_STD_FACTOR   = 1.5
SMALL_TXN_MULTIPLIER = 0.5
FREQ_MONTH_THRESH    = 10
IMPULSE_THRESHOLD    = 0.55
RANDOM_SEED          = 42

SEGMENTS = {
    'E': {'label':'Kelas E (Miskin)',       'pct_pop':0.15,'income_range':(800_000,1_500_000),   'spending_ratio':(0.85,0.98),'txn_per_month':(8,20),   'txn_amount_dist':'low',     'payment_methods':{'Tunai':0.55,'GoPay':0.25,'OVO':0.12,'DANA':0.08},                                                                          'categories':{'Sembako & Kebutuhan Pokok':0.40,'Transportasi':0.20,'Pulsa & Data':0.15,'Makanan & Minuman':0.15,'Kesehatan':0.05,'Pendidikan':0.05},'city_tier':{'Desa':0.45,'Kota Kecil':0.40,'Kota Besar':0.15},'age_range':(18,55),'weekend_boost':1.05,'night_prob':0.08,'impulse_base':0.15,'jobs':['Buruh Tani','Pedagang Kaki Lima','Nelayan','Buruh Pabrik','Asisten Rumah Tangga','Ojek Konvensional']},
    'D': {'label':'Kelas D (Menengah Bawah)','pct_pop':0.25,'income_range':(1_500_000,3_000_000),'spending_ratio':(0.75,0.92),'txn_per_month':(15,35),  'txn_amount_dist':'low_mid', 'payment_methods':{'Tunai':0.30,'GoPay':0.30,'OVO':0.20,'DANA':0.12,'Transfer Bank':0.08},                                                    'categories':{'Sembako & Kebutuhan Pokok':0.28,'Makanan & Minuman':0.22,'Transportasi':0.18,'Pulsa & Data':0.12,'Fashion & Pakaian':0.08,'Kesehatan':0.06,'Pendidikan':0.04,'Hiburan':0.02},'city_tier':{'Desa':0.20,'Kota Kecil':0.45,'Kota Besar':0.35},'age_range':(18,50),'weekend_boost':1.15,'night_prob':0.15,'impulse_base':0.25,'jobs':['Driver Ojek Online','Karyawan Toko','Guru Honorer','Admin Kantor','Teknisi','Pedagang Warung','SPG/SPB']},
    'C': {'label':'Kelas C (Menengah)',      'pct_pop':0.35,'income_range':(3_000_000,7_000_000),'spending_ratio':(0.60,0.82),'txn_per_month':(25,60),  'txn_amount_dist':'mid',     'payment_methods':{'GoPay':0.25,'OVO':0.20,'Kartu Debit':0.20,'Transfer Bank':0.15,'DANA':0.12,'Tunai':0.08},                                      'categories':{'Makanan & Minuman':0.25,'Belanja Online':0.18,'Sembako & Kebutuhan Pokok':0.15,'Fashion & Pakaian':0.10,'Transportasi':0.10,'Hiburan':0.08,'Kesehatan & Kecantikan':0.06,'Pulsa & Data':0.05,'Pendidikan':0.03},'city_tier':{'Kota Kecil':0.30,'Kota Besar':0.55,'Metropolitan':0.15},'age_range':(18,45),'weekend_boost':1.30,'night_prob':0.25,'impulse_base':0.40,'jobs':['Pegawai Swasta','PNS Golongan II','Guru Tetap','Staf Administrasi','Wirausaha Kecil','Perawat','Sales']},
    'B': {'label':'Kelas B (Menengah Atas)', 'pct_pop':0.18,'income_range':(7_000_000,20_000_000),'spending_ratio':(0.45,0.70),'txn_per_month':(40,90), 'txn_amount_dist':'mid_high','payment_methods':{'Kartu Kredit':0.30,'Kartu Debit':0.25,'GoPay':0.18,'Transfer Bank':0.15,'OVO':0.08,'ShopeePay':0.04},                       'categories':{'Makanan & Minuman':0.22,'Belanja Online':0.18,'Fashion & Pakaian':0.12,'Hiburan':0.10,'Transportasi':0.09,'Kecantikan & Perawatan':0.08,'Elektronik':0.07,'Restoran & Kafe':0.07,'Olahraga & Gym':0.04,'Travel & Hotel':0.03},'city_tier':{'Kota Besar':0.45,'Metropolitan':0.55},'age_range':(22,50),'weekend_boost':1.50,'night_prob':0.35,'impulse_base':0.55,'jobs':['Manajer','Pengacara','Dokter','Engineer Senior','Dosen','Wirausaha Menengah','Analis Keuangan','Arsitek']},
    'A': {'label':'Kelas A (Kaya)',           'pct_pop':0.07,'income_range':(20_000_000,150_000_000),'spending_ratio':(0.25,0.55),'txn_per_month':(50,150),'txn_amount_dist':'high',  'payment_methods':{'Kartu Kredit':0.45,'Transfer Bank':0.30,'Kartu Debit':0.15,'GoPay':0.10},                                                      'categories':{'Restoran & Kafe':0.18,'Travel & Hotel':0.15,'Fashion & Pakaian':0.13,'Elektronik':0.10,'Kecantikan & Perawatan':0.08,'Hiburan':0.08,'Belanja Online':0.08,'Olahraga & Gym':0.07,'Investasi & Asuransi':0.07,'Properti & Renovasi':0.06},'city_tier':{'Metropolitan':0.75,'Kota Besar':0.25},'age_range':(25,60),'weekend_boost':1.70,'night_prob':0.45,'impulse_base':0.65,'jobs':['CEO/Direktur','Pengusaha','Konsultan Senior','Dokter Spesialis','Investor','Artis/Influencer','Notaris','Partner Law Firm']},
}

SUB_CATEGORIES = {
    'Sembako & Kebutuhan Pokok':['Indomaret','Alfamart','Pasar Tradisional','Warung Sembako','Giant','Hypermart','Lotte Mart','Superindo'],
    'Makanan & Minuman':['GoFood/GrabFood','Warteg','Warung Padang','Mie Ayam & Bakso','Geprek/Ayam Goreng','Indomie Rebus','Kopi Jahe/Wedang','Jus Buah'],
    'Restoran & Kafe':['Kopi Kenangan','Fore Coffee','Starbucks',"McDonald's",'KFC','Pizza Hut','Sushi Tei','Holycow Steak','Rooftop Restaurant'],
    'Transportasi':['Gojek','Grab','Angkot','Bus Kota','KRL Commuter','MRT Jakarta','BBM Pertamina','Parkir','Toll'],
    'Belanja Online':['Shopee','Tokopedia','Lazada','Blibli','Tiktok Shop','Zalora','JD.ID','Bukalapak'],
    'Fashion & Pakaian':['H&M','Zara','Uniqlo','Cotton On','Erigo','Pasar Baju','Brand Lokal IG','Batik Keris','Matahari Dept Store'],
    'Hiburan':['CGV Cinemas','XXI Cinema','Netflix/Spotify','Karaoke','Game Online','Taman Wisata','Konser Musik','Bioskop Drive-in'],
    'Kesehatan':['Apotek Kimia Farma','Guardian','Klinik Pratama','Puskesmas','RS Umum','Dokter Praktek','Laboratorium'],
    'Kesehatan & Kecantikan':['Apotek K-24','Guardian','Watsons','The Body Shop','Klinik Kecantikan','Sociolla','Base (Skincare Lokal)'],
    'Kecantikan & Perawatan':['Erha Clinic','ZAP Clinic','Sociolla Premium','Salon Premium','Spa & Wellness','Dermatologist Private'],
    'Pulsa & Data':['Telkomsel','Indosat Ooredoo','XL Axiata','Tri (3)','Smartfren','IndiHome','Myrepublic'],
    'Pendidikan':['Bimbel Primagama','Ruangguru','Zenius','Coursera','SPP Sekolah','Alat Tulis','Buku Teks','Udemy'],
    'Elektronik':['iBox Apple','Samsung Store','iQOO','Erafone','JD.ID Electronics','Tokopedia Electronics','Charger/Aksesori'],
    'Olahraga & Gym':['Fitness First','Celebrity Fitness',"Gold's Gym",'Lapangan Futsal','Kolam Renang','Badminton','Nike/Adidas Store'],
    'Travel & Hotel':['Traveloka','Tiket.com','Airbnb','Airy Rooms','Hotel Bintang 3','Resort Bali','Penginapan Murah'],
    'Investasi & Asuransi':['Bibit','Bareksa','Pluang','BPJS Kesehatan','Asuransi Prudential','AIA Financial','Reksa Dana Mandiri'],
    'Properti & Renovasi':['ACE Hardware','Depo Bangunan','IKEA','Vivere','Kontraktor Renovasi','Cat Dulux','Mebel Custom'],
}

CITIES = {
    'Desa':        [('Desa Sukamaju',5_000),('Desa Makmur',3_200),('Desa Sejahtera',4_100),('Desa Cikaret',2_800),('Desa Rawa Indah',6_500),('Desa Panyingkiran',3_700)],
    'Kota Kecil':  [('Tasikmalaya',700_000),('Cirebon',320_000),('Purwokerto',290_000),('Magelang',130_000),('Tegal',285_000),('Pekalongan',310_000),('Kediri',320_000),('Blitar',150_000),('Jombang',190_000)],
    'Kota Besar':  [('Bandung',2_500_000),('Surabaya',3_100_000),('Medan',2_400_000),('Semarang',1_800_000),('Makassar',1_500_000),('Palembang',1_700_000),('Denpasar',900_000),('Yogyakarta',420_000)],
    'Metropolitan':[('Jakarta',10_500_000),('Bekasi',2_700_000),('Depok',2_200_000),('Tangerang',2_100_000),('Bogor',1_100_000),('Tangerang Selatan',1_700_000)],
}
CITY_COORDS = {
    'Jakarta':(-6.2088,106.8456),'Bekasi':(-6.2349,106.9896),'Depok':(-6.4025,106.7942),
    'Tangerang':(-6.1702,106.6402),'Bogor':(-6.5971,106.8060),'Tangerang Selatan':(-6.2867,106.7104),
    'Bandung':(-6.9175,107.6191),'Surabaya':(-7.2575,112.7521),'Medan':(3.5952,98.6722),
    'Semarang':(-6.9932,110.4203),'Makassar':(-5.1477,119.4327),'Palembang':(-2.9761,104.7754),
    'Denpasar':(-8.6705,115.2126),'Yogyakarta':(-7.7956,110.3695),'Tasikmalaya':(-7.3506,108.2183),
    'Cirebon':(-6.7320,108.5523),'Purwokerto':(-7.4216,109.2425),'Magelang':(-7.4797,110.2177),
    'Tegal':(-6.8694,109.1402),'Pekalongan':(-6.8886,109.6753),'Kediri':(-7.8165,112.0112),
    'Blitar':(-8.0983,112.1686),'Jombang':(-7.5478,112.2289),
}

TXN_AMOUNT_PARAMS = {
    'low'     :{'mean':25_000,    'std':12_000,  'min':2_000,  'max':100_000},
    'low_mid' :{'mean':60_000,    'std':35_000,  'min':5_000,  'max':250_000},
    'mid'     :{'mean':150_000,   'std':100_000, 'min':10_000, 'max':700_000},
    'mid_high':{'mean':400_000,   'std':300_000, 'min':25_000, 'max':3_000_000},
    'high'    :{'mean':1_200_000, 'std':900_000, 'min':50_000, 'max':25_000_000},
}
SEASON_BOOST = {1:1.05,2:0.90,3:0.95,4:1.00,5:1.25,6:1.35,7:1.10,8:0.95,9:0.90,10:0.95,11:1.05,12:1.30}

FEATURE_COLS = [
    'avg_txn_idr','txn_count','weekend_ratio','night_ratio',
    'above_avg_ratio','spike_ratio','impulse_score',
    'unique_categories','spending_cov',
    'pendapatan_bulan',
    'cat_makanan_&_minum_ratio','cat_transportasi_ratio',
    'cat_kesehatan_&_kec_ratio','cat_sembako_&_kebut_ratio',
    'cat_kesehatan_ratio','cat_pendidikan_ratio',
    'cat_belanja_online_ratio','cat_pulsa_&_data_ratio',
    'cat_hiburan_ratio','cat_fashion_&_pakai_ratio',
]

# ══════════════════════════════════════════════════════════════
# DATA GENERATION (sama persis dengan notebook)
# ══════════════════════════════════════════════════════════════
NAMA_DEPAN_L = ['Budi','Andi','Deni','Fajar','Hendra','Rizki','Agus','Doni','Eko','Fery','Galih','Hadi','Irwan','Joko','Kevin','Lutfi','Maman','Nanda','Oki','Prio','Rudi','Samsul','Tono','Udin','Vino','Wahyu','Yanto','Zulfi','Ahmad','Bagas','Candra','Dimas','Erwin','Firmansyah','Gilang','Hafizh','Ivan','Januar','Kukuh','Lukman','Mulyadi','Nanang','Oscar','Putra']
NAMA_DEPAN_P = ['Siti','Ani','Dewi','Rina','Wulan','Maya','Nisa','Putri','Rini','Sari','Tari','Ulfa','Vina','Wati','Yuni','Zara','Ayu','Bella','Clara','Dinda','Ella','Fitri','Gita','Hana','Indri','Julia','Kiki','Lina','Mira','Nadia','Okta','Prita','Rahma','Sinta','Tiara','Uci','Vevi','Widya','Yanti','Afifah','Bunga','Cantika','Dhea','Elisa','Farida','Hasna','Intan']
NAMA_BELAKANG = ['Santoso','Wijaya','Susanto','Purwanto','Setiawan','Rahayu','Kurniawan','Hidayat','Purnomo','Saputra','Wahyudi','Nugroho','Pratama','Sanjaya','Wibowo','Hartono','Gunawan','Kusuma','Sutrisno','Harahap','Nasution','Siregar','Lubis','Rajasa','Mahendra','Yulianto','Firmansyah','Prasetyo','Budiman','Iskandar']

def pick_city(tier):
    opts = CITIES[tier]
    return opts[np.random.randint(0, len(opts))]

def get_coords(city_name, jitter=0.5):
    base = CITY_COORDS.get(city_name, (-6.2, 106.8))
    return (round(base[0]+np.random.uniform(-jitter,jitter),4),
            round(base[1]+np.random.uniform(-jitter,jitter),4))

def sample_amount(dist_type, category):
    p   = TXN_AMOUNT_PARAMS[dist_type]
    raw = np.random.lognormal(np.log(p['mean']), 0.7, 1)
    raw = np.clip(raw, p['min'], p['max'])
    if category in ['Travel & Hotel','Elektronik','Properti & Renovasi','Investasi & Asuransi','Restoran & Kafe']:
        raw *= np.random.uniform(1.5, 3.5)
    if category in ['Pulsa & Data','Sembako & Kebutuhan Pokok','Transportasi']:
        raw *= np.random.uniform(0.3, 0.7)
    return float(np.clip(raw, p['min'], p['max'])[0])

hour_probs = np.array([0.5,0.3,0.2,0.2,0.2,0.3,0.8,2.5,2.5,1.5,1.2,1.5,2.8,2.0,1.5,1.5,1.8,2.5,3.0,3.2,2.8,2.0,1.2,0.8])
hour_probs /= hour_probs.sum()

@st.cache_data(show_spinner=False)
def generate_data():
    N_USERS        = 1_000
    N_TRANSACTIONS = 50_000
    DATE_START     = '2023-01-01'

    np.random.seed(RANDOM_SEED)
    seg_keys  = list(SEGMENTS.keys())
    seg_probs = [SEGMENTS[s]['pct_pop'] for s in seg_keys]
    users = []

    for uid in range(1, N_USERS+1):
        seg_key   = np.random.choice(seg_keys, p=seg_probs)
        seg       = SEGMENTS[seg_key]
        gender    = np.random.choice(['L','P'], p=[0.52,0.48])
        nama_d    = np.random.choice(NAMA_DEPAN_L if gender=='L' else NAMA_DEPAN_P)
        nama_b    = np.random.choice(NAMA_BELAKANG)
        age       = int(np.random.uniform(*seg['age_range']))
        income    = int(np.random.uniform(*seg['income_range']))
        city_tier = np.random.choice(list(seg['city_tier'].keys()), p=list(seg['city_tier'].values()))
        city_name, city_pop = pick_city(city_tier)
        lat, long_ = get_coords(city_name)
        spend_ratio   = np.random.uniform(*seg['spending_ratio'])
        monthly_spend = round(income * spend_ratio)
        users.append({'user_id':f'BUDU{uid:05d}','nama':f'{nama_d} {nama_b}','gender':gender,'usia':age,
                      'segmen':seg_key,'segmen_label':seg['label'],'pekerjaan':np.random.choice(seg['jobs']),
                      'kota':city_name,'tier_kota':city_tier,'populasi_kota':city_pop,'lat':lat,'long':long_,
                      'pendapatan_bulan':income,'pengeluaran_bulan':monthly_spend,
                      'tabungan_bulan':income-monthly_spend,'spending_ratio':round(spend_ratio,3),
                      'impulse_base':seg['impulse_base']})

    df_users = pd.DataFrame(users)

    np.random.seed(RANDOM_SEED)
    user_txn_counts = {}
    for _, u in df_users.iterrows():
        seg = SEGMENTS[u['segmen']]
        tmin, tmax = seg['txn_per_month']
        user_txn_counts[u['user_id']] = int(np.random.uniform(tmin, tmax) * 24)
    scale = N_TRANSACTIONS / sum(user_txn_counts.values())
    user_txn_counts = {uid: max(10, int(v*scale)) for uid, v in user_txn_counts.items()}

    transactions = []
    txn_id = 1
    for _, u in df_users.iterrows():
        uid     = u['user_id']
        seg_key = u['segmen']
        seg     = SEGMENTS[seg_key]
        n_txn   = user_txn_counts[uid]
        cat_keys  = list(seg['categories'].keys())
        cat_p     = np.array(list(seg['categories'].values())); cat_p /= cat_p.sum()
        pay_keys  = list(seg['payment_methods'].keys())
        pay_p     = np.array(list(seg['payment_methods'].values())); pay_p /= pay_p.sum()
        dist_type = seg['txn_amount_dist']
        fraud_prob = {'E':0.003,'D':0.005,'C':0.008,'B':0.012,'A':0.018}.get(seg_key, 0.005)
        merch_lat  = round(u['lat']  + np.random.uniform(-0.3, 0.3), 4)
        merch_long = round(u['long'] + np.random.uniform(-0.3, 0.3), 4)
        for _ in range(n_txn):
            day      = pd.Timestamp(DATE_START) + pd.Timedelta(days=np.random.randint(0, 730))
            hour     = np.random.choice(range(24), p=hour_probs)
            txn_date = day.replace(hour=hour, minute=np.random.randint(0,60), second=np.random.randint(0,60))
            category = np.random.choice(cat_keys, p=cat_p)
            sub_cat  = np.random.choice(SUB_CATEGORIES.get(category, [category]))
            payment  = np.random.choice(pay_keys, p=pay_p)
            seasonal = SEASON_BOOST.get(txn_date.month, 1.0)
            amount   = round(sample_amount(dist_type, category) * seasonal / 100) * 100
            amount   = max(1_000, int(amount))
            is_fraud = int(np.random.random() < fraud_prob)
            m_lat    = round(merch_lat  + np.random.uniform(-0.05, 0.05), 4)
            m_long   = round(merch_long + np.random.uniform(-0.05, 0.05), 4)
            dist     = round(((m_lat-u['lat'])**2 + (m_long-u['long'])**2)**0.5, 4)
            transactions.append({'txn_id':f'TXN{txn_id:07d}','user_id':uid,
                'date':txn_date,'amount':amount,'category':category,
                'sub_category':sub_cat,'payment_method':payment,
                'gender':u['gender'],'usia':int(u['usia']),
                'segmen':seg_key,'segmen_label':u['segmen_label'],'pekerjaan':u['pekerjaan'],
                'kota':u['kota'],'tier_kota':u['tier_kota'],'populasi_kota':int(u['populasi_kota']),
                'pendapatan_bulan':int(u['pendapatan_bulan']),'spending_ratio':float(u['spending_ratio']),
                'user_lat':u['lat'],'user_long':u['long'],'merch_lat':m_lat,'merch_long':m_long,
                'dist_user_merchant':dist,'is_fraud':is_fraud,
                'is_night':int(txn_date.hour >= NIGHT_START),
                'is_weekend':int(txn_date.dayofweek >= 5),
                'month':txn_date.month,'day_of_week':txn_date.dayofweek,'hour':txn_date.hour,
                'quarter':txn_date.quarter,
                'is_month_start':int(txn_date.day <= 5),'is_month_end':int(txn_date.day >= 25)})
            txn_id += 1

    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    for col in ['category','sub_category','payment_method']:
        df[col] = df[col].astype(str).str.strip().str.title()
    df = df[df['amount'] >= 1_000].reset_index(drop=True)
    df['day_name']   = df['date'].dt.day_name().str[:3]
    df['week']       = df['date'].dt.isocalendar().week.astype(int)
    df['above_avg']  = (df['amount'] > df['amount'].mean()).astype(int)

    df_s = df.sort_values(['user_id','date']).copy()
    df_s['rolling_7_mean'] = df_s.groupby('user_id')['amount'].transform(lambda x: x.rolling(7, min_periods=1).mean())
    df_s['is_spike'] = (df_s['amount'] > df_s['rolling_7_mean'] * 2).astype(int)
    df = df_s.reset_index(drop=True)

    return df, df_users

@st.cache_data(show_spinner=False)
def build_user_features(_df, _df_users):
    df, df_users = _df, _df_users

    user_agg = df.groupby('user_id').agg(
        total_spending_idr = ('amount','sum'), avg_txn_idr=('amount','mean'),
        txn_count=('amount','count'), std_amount_idr=('amount','std'),
        weekend_ratio=('is_weekend','mean'), night_ratio=('is_night','mean'),
        above_avg_ratio=('above_avg','mean'), spike_ratio=('is_spike','mean'),
        unique_categories=('category','nunique'),
    ).reset_index()
    user_agg['std_amount_idr'].fillna(0, inplace=True)
    user_agg['spending_cov'] = (user_agg['std_amount_idr'] / user_agg['avg_txn_idr'].replace(0,np.nan)).fillna(0)
    user_agg['impulse_score'] = (user_agg['weekend_ratio']*0.35 + user_agg['night_ratio']*0.30 +
                                  user_agg['above_avg_ratio']*0.20 + user_agg['spike_ratio']*0.15).round(4)

    cat_pivot = df.pivot_table(index='user_id', columns='category', values='amount', aggfunc='sum', fill_value=0)
    cat_pivot.columns = [f'cat_{str(c).lower().replace(" & ","_").replace(" ","_")[:18]}' for c in cat_pivot.columns]

    pay_dom = df.groupby('user_id')['payment_method'].agg(lambda x: x.mode().iloc[0] if len(x)>0 else 'Unknown').reset_index().rename(columns={'payment_method':'dominant_payment'})
    age_agg = df.groupby('user_id')['usia'].mean().reset_index().rename(columns={'usia':'age'})
    income_agg = df_users[['user_id','pendapatan_bulan','spending_ratio','segmen','segmen_label','kota','tier_kota']]

    uf = (user_agg.merge(cat_pivot,on='user_id',how='left').merge(pay_dom,on='user_id',how='left')
          .merge(age_agg,on='user_id',how='left').merge(income_agg,on='user_id',how='left'))
    uf.fillna(0, inplace=True)

    # v3 cleanup
    cat_cols_src = [c for c in uf.columns if c.startswith('cat_') and not c.endswith('_ratio')]
    for col in cat_cols_src:
        uf[col+'_ratio'] = (uf[col] / uf['total_spending_idr'].replace(0, np.nan)).fillna(0)
    all_cat_raw = [c for c in uf.columns if c.startswith('cat_') and not c.endswith('_ratio')]
    uf.drop(columns=all_cat_raw, inplace=True)
    for col in ['total_spending_idr','std_amount_idr']:
        if col in uf.columns:
            uf.drop(columns=[col], inplace=True)

    if 'pendapatan_bulan' not in uf.columns:
        uf['pendapatan_bulan'] = 0

    fc = [c for c in FEATURE_COLS if c in uf.columns]
    X  = uf[fc].fillna(0).values
    scaler   = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    km = KMeans(n_clusters=3, random_state=42, n_init=10)
    uf['cluster'] = km.fit_predict(X_scaled)

    stats_c = uf.groupby('cluster')['impulse_score'].mean()
    rank    = stats_c.rank(method='first').astype(int)
    pmap    = {rank.idxmax():'Impulsive Spender', rank.idxmin():'Rational Spender'}
    mid     = [k for k in rank.index if k not in pmap][0]
    pmap[mid] = 'Emotional Spender'
    uf['spending_persona'] = uf['cluster'].map(pmap)

    le = LabelEncoder()
    uf['persona_encoded'] = le.fit_transform(uf['spending_persona'])

    mm     = MinMaxScaler()
    X_norm = mm.fit_transform(uf[fc].fillna(0).values)

    return uf, fc, X_scaled, X_norm, le

# ══════════════════════════════════════════════════════════════
# SIDEBAR
# ══════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown("""
    <div style='text-align:center; padding:8px 0 4px'>
      <div style='font-size:28px; font-weight:900;
                  background:linear-gradient(90deg,#60a5fa,#34d399,#fbbf24);
                  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
                  background-clip:text;'>💸 BUDU</div>
      <div style='color:#7b90b8;font-size:11px;margin-top:2px'>SpendBehavior Analyzer · <span style="color:#fbbf24;font-weight:700">v3</span></div>
      <div style='color:#4a6080;font-size:10px;margin-top:2px'>Tim CC26-PSU268 · Coding Camp 2026</div>
    </div>
    """, unsafe_allow_html=True)
    st.divider()

    st.markdown("### Filter Data")
    seg_all    = ['Semua'] + [SEGMENTS[k]['label'] for k in SEGMENTS]
    seg_filter = st.selectbox('Segmen Sosio-Ekonomi', seg_all)

    persona_all    = ['Semua', 'Impulsive Spender', 'Emotional Spender', 'Rational Spender']
    persona_filter = st.selectbox('Spending Persona', persona_all)

    st.divider()
    st.markdown("### Threshold Global")
    impulse_thr = st.slider('Impulse Threshold', 0.0, 1.0, IMPULSE_THRESHOLD, 0.05)
    anomaly_std = st.slider('Anomali (× SD)', 0.5, 3.0, ANOMALY_STD_FACTOR, 0.5)

    st.divider()
    if st.button('🔄 Generate Ulang Data', use_container_width=True):
        st.cache_data.clear()
        st.rerun()

# ══════════════════════════════════════════════════════════════
# LOAD DATA
# ══════════════════════════════════════════════════════════════
with st.spinner('Generating dataset BUDU Indonesia...'):
    df_raw, df_users = generate_data()
    user_features, feat_cols, X_scaled, X_norm, le = build_user_features(df_raw, df_users)

# Apply filter
df = df_raw.copy()
uf = user_features.copy()

if seg_filter != 'Semua':
    valid_users = df_users[df_users['segmen_label'] == seg_filter]['user_id']
    df = df[df['user_id'].isin(valid_users)]
    uf = uf[uf['segmen_label'] == seg_filter]

if persona_filter != 'Semua':
    uf_p = user_features[user_features['spending_persona'] == persona_filter]
    df = df[df['user_id'].isin(uf_p['user_id'])]
    uf = uf[uf['spending_persona'] == persona_filter]

# ══════════════════════════════════════════════════════════════
# HEADER
# ══════════════════════════════════════════════════════════════
st.markdown("""
<div style='
  background: linear-gradient(135deg, #1e3a5f 0%, #1a2a4a 50%, #0f1a35 100%);
  border: 1.5px solid #2a4a7a;
  border-radius: 16px;
  padding: 20px 28px;
  margin-bottom: 20px;
  box-shadow: 0 4px 24px rgba(37,99,235,0.15);
'>
  <div style='display:flex; align-items:center; gap:12px; margin-bottom:6px'>
    <span style='font-size:32px'>💸</span>
    <h1 style='font-size:26px;font-weight:800;margin:0;
               background: linear-gradient(90deg, #60a5fa, #34d399, #fbbf24);
               -webkit-background-clip: text; -webkit-text-fill-color: transparent;
               background-clip: text;'>
      BUDU — SpendBehavior Analyzer
    </h1>
  </div>
  <div style='display:flex; gap:16px; flex-wrap:wrap; margin-top:8px'>
    <span style='background:#1e3a6022; color:#60a5fa; border:1px solid #3b6cb055; padding:3px 12px; border-radius:99px; font-size:11px; font-weight:700'>🇮🇩 Dataset Dummy Indonesia</span>
    <span style='background:#05966922; color:#34d399; border:1px solid #34d39955; padding:3px 12px; border-radius:99px; font-size:11px; font-weight:700'>💰 IDR</span>
    <span style='background:#d9770622; color:#fbbf24; border:1px solid #fbbf2455; padding:3px 12px; border-radius:99px; font-size:11px; font-weight:700'>✨ Feature v3 · 20 fitur</span>
    <span style='background:#7c3aed22; color:#a78bfa; border:1px solid #a78bfa55; padding:3px 12px; border-radius:99px; font-size:11px; font-weight:700'>👥 Tim CC26-PSU268</span>
  </div>
</div>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════
# TABS
# ══════════════════════════════════════════════════════════════
tab_overview, tab_eda, tab_ab, tab_clustering, tab_model, tab_dict = st.tabs([
    '📊 Overview', '🔍 EDA & Business Questions', '🧪 A/B Testing',
    '🤖 Clustering & Persona', '🧠 Persiapan Model TF', '📖 Data Dictionary'
])

# ─────────────────────────────────────────────────────────────
# TAB 1 — OVERVIEW
# ─────────────────────────────────────────────────────────────
with tab_overview:
    st.markdown('<div class="section-header" style="border-color:#60a5fa;color:#60a5fa">📈 Ringkasan Dataset</div>', unsafe_allow_html=True)

    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric('Total Transaksi',    f'{len(df):,}')
    c2.metric('Total User',         f'{df["user_id"].nunique():,}')
    c3.metric('Median Amount',      f'Rp {int(df["amount"].median()):,}')
    c4.metric('Fraud Rate',         f'{df["is_fraud"].mean()*100:.2f}%')
    c5.metric('Kategori',           f'{df["category"].nunique()}')

    st.divider()

    col_l, col_r = st.columns(2)

    with col_l:
        st.markdown("**Distribusi Segmen Sosio-Ekonomi**")
        seg_dist = df.groupby('segmen_label')['amount'].agg(total='sum', txn='count').reset_index()
        seg_dist['persen_txn'] = seg_dist['txn'] / seg_dist['txn'].sum() * 100
        fig, ax = plt.subplots(figsize=(6,3.5))
        bars = ax.barh(seg_dist['segmen_label'], seg_dist['persen_txn'],
                       color=[PALETTE[i] for i in range(len(seg_dist))])
        ax.set_xlabel('% Transaksi'); ax.set_xlim(0, seg_dist['persen_txn'].max()*1.2)
        for bar, val in zip(bars, seg_dist['persen_txn']):
            ax.text(bar.get_width()+0.3, bar.get_y()+bar.get_height()/2,
                    f'{val:.1f}%', va='center', fontsize=9, color='#c8d8f0')
        ax.set_facecolor('none'); fig.patch.set_facecolor('none')
        ax.tick_params(colors='#94a3b8'); ax.xaxis.label.set_color('#94a3b8')
        st.pyplot(fig, use_container_width=True); plt.close()

    with col_r:
        st.markdown("**Spending Persona Distribution**")
        if 'spending_persona' in user_features.columns:
            persona_cnt = user_features['spending_persona'].value_counts()
            fig, ax = plt.subplots(figsize=(6,3.5))
            colors = [PERSONA_COLORS.get(p, PRIMARY) for p in persona_cnt.index]
            wedges, texts, autotexts = ax.pie(persona_cnt.values, labels=persona_cnt.index,
                autopct='%1.1f%%', colors=colors, startangle=140,
                wedgeprops=dict(edgecolor='#0d1117', lw=2))
            for t in texts:
                t.set_color('#94a3b8')
                t.set_fontsize(9)
            for at in autotexts:
                at.set_color('white')
                at.set_fontsize(9)
                at.set_fontweight('bold')
            ax.set_facecolor('none'); fig.patch.set_facecolor('none')
            st.pyplot(fig, use_container_width=True); plt.close()

    st.divider()
    st.markdown("**Tren Bulanan — Total Pengeluaran IDR**")
    m_lbl = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
    monthly = df.groupby('month')['amount'].sum().reset_index()
    thr = monthly['amount'].mean() + anomaly_std * monthly['amount'].std()
    fig, ax = plt.subplots(figsize=(13,3))
    ax.plot(monthly['month'], monthly['amount']/1e6, marker='o', color=PRIMARY, lw=2.5, zorder=3)
    ax.fill_between(monthly['month'], monthly['amount']/1e6, alpha=0.15, color='#60a5fa')
    ax.axhline(thr/1e6, color=WARN, ls='--', lw=1.5, label=f'Threshold (mean+{anomaly_std}σ)')
    anom = monthly[monthly['amount'] > thr]
    ax.scatter(anom['month'], anom['amount']/1e6, color=WARN, s=100, zorder=5, label='Anomali')
    ax.set_xticks(range(1,13)); ax.set_xticklabels(m_lbl)
    ax.set_ylabel('Juta IDR'); ax.legend(framealpha=0.1)
    ax.set_facecolor('none'); fig.patch.set_facecolor('none')
    ax.tick_params(colors='#94a3b8'); ax.yaxis.label.set_color('#94a3b8')
    st.pyplot(fig, use_container_width=True); plt.close()

    anom_months = [m_lbl[m-1] for m in anom['month'].tolist()]
    if anom_months:
        st.markdown(f'<div class="warn-box">⚠️ <b>Bulan anomali:</b> {", ".join(anom_months)} — pengeluaran melebihi threshold Rp {thr/1e6:.1f}jt/bulan</div>', unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
# TAB 2 — EDA & BUSINESS QUESTIONS
# ─────────────────────────────────────────────────────────────
with tab_eda:
    bq = st.radio('Pilih Business Question:', [
        'Q1 — Distribusi Kategori', 'Q2 — Pola Waktu',
        'Q3 — Anomali Bulanan', 'Q4 — Money Leak',
        'Q5 — Metode Pembayaran + Spearman', 'Q6 — Impulsive User',
        'EDA Segmen'
    ], horizontal=True)

    # Q1
    if bq == 'Q1 — Distribusi Kategori':
        st.markdown('<div class="section-header" style="border-color:#fbbf24;color:#fbbf24">Q1: Kategori mana yang menyumbang ≥30% total pengeluaran?</div>', unsafe_allow_html=True)
        cat_grp = df.groupby('category')['amount'].agg(total='sum', count='count', avg='mean').sort_values('total', ascending=False)
        cat_grp['persen'] = (cat_grp['total'] / cat_grp['total'].sum() * 100).round(2)

        col1, col2 = st.columns(2)
        with col1:
            top10 = cat_grp.head(10)
            fig, ax = plt.subplots(figsize=(6,4.5))
            clrs = [PALETTE[i % len(PALETTE)] for i in range(len(top10))]
            ax.barh(top10.index[::-1], top10['total'][::-1]/1e6, color=clrs[::-1])
            ax.set_xlabel('Juta IDR')
            ax.set_title('Top 10 Kategori — Total IDR', fontweight='bold', color='#c8d8f0')
            for i, v in enumerate(top10['total'][::-1]/1e6):
                ax.text(v*0.02, i, f'Rp {v:.1f}jt', va='center', fontsize=8, color='#c8d8f0')
            ax.set_facecolor('none'); fig.patch.set_facecolor('none')
            ax.tick_params(colors='#94a3b8'); ax.xaxis.label.set_color('#94a3b8')
            st.pyplot(fig, use_container_width=True); plt.close()
        with col2:
            top6 = cat_grp.head(6); other = cat_grp['total'].iloc[6:].sum()
            pie_v = list(top6['total']) + ([other] if other>0 else [])
            pie_l = list(top6.index) + (['Others'] if other>0 else [])
            fig, ax = plt.subplots(figsize=(6,4.5))
            ax.pie(pie_v, labels=pie_l, autopct='%1.1f%%', colors=PALETTE[:len(pie_v)],
                   startangle=140, wedgeprops=dict(edgecolor='#0d1117', lw=2))
            ax.set_title('Porsi per Kategori', fontweight='bold', color='#c8d8f0')
            fig.patch.set_facecolor('none')
            st.pyplot(fig, use_container_width=True); plt.close()

        cat_30 = cat_grp[cat_grp['persen'] >= 30]
        if cat_30.empty:
            top1 = cat_grp.head(1)
            st.markdown(f'<div class="info-box">📌 <b>Q1 ANSWER:</b> Tidak ada kategori tunggal ≥ 30%. Terbesar: <b>{top1.index[0]}</b> ({top1["persen"].values[0]:.1f}% · Rp {top1["total"].values[0]/1e6:.1f}jt)<br>➡️ BUDU: tampilkan top-3 sebagai <b>Money Leak Priority</b></div>', unsafe_allow_html=True)
        else:
            for cat, row in cat_30.iterrows():
                st.markdown(f'<div class="warn-box">⚠️ <b>{cat}</b>: {row["persen"]:.1f}% — Rp {row["total"]/1e6:.1f}jt → Aktifkan Money Leak Alert</div>', unsafe_allow_html=True)

        st.dataframe(cat_grp.head(10).style.format({'total':'{:,.0f}','avg':'{:,.0f}','persen':'{:.2f}%'}), use_container_width=True)

    # Q2
    elif bq == 'Q2 — Pola Waktu':
        st.markdown('<div class="section-header" style="border-color:#f87171;color:#f87171">Q2: Apakah rata-rata transaksi weekend ≥20% lebih tinggi dari weekday?</div>', unsafe_allow_html=True)
        day_order = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
        day_avg   = df.groupby('day_name')['amount'].mean().reindex(day_order).fillna(0)
        col1, col2 = st.columns(2)
        with col1:
            fig, ax = plt.subplots(figsize=(6,4))
            bar_c = ['#EF4444' if d in ['Sat','Sun'] else PRIMARY for d in day_order]
            ax.bar(day_order, day_avg/1e3, color=bar_c)
            ax.set_ylabel('Rata-rata (ribu IDR)'); ax.set_title('Avg Pengeluaran per Hari', fontweight='bold', color='#c8d8f0')
            ax.axvline(4.5, color='gray', ls='--', lw=1)
            for i, v in enumerate(day_avg/1e3): ax.text(i, v+v*0.03, f'{v:.0f}k', ha='center', fontsize=8, color='#c8d8f0')
            ax.set_facecolor('none'); fig.patch.set_facecolor('none')
            ax.tick_params(colors='#94a3b8'); ax.yaxis.label.set_color('#94a3b8')
            st.pyplot(fig, use_container_width=True); plt.close()
        with col2:
            top5 = df.groupby('category')['amount'].sum().nlargest(5).index
            hm   = df[df['category'].isin(top5)].groupby(['hour','category'])['amount'].sum().unstack(fill_value=0)
            fig, ax = plt.subplots(figsize=(6,4))
            sns.heatmap(hm.T/1e6, cmap='YlOrRd', ax=ax, linewidths=0.3, cbar_kws={'label':'Juta IDR'})
            ax.set_title('Heatmap: Jam × Kategori Top 5', fontweight='bold', color='#c8d8f0')
            ax.set_facecolor('none'); fig.patch.set_facecolor('none')
            ax.tick_params(colors='#94a3b8')
            st.pyplot(fig, use_container_width=True); plt.close()
        wknd = day_avg[['Sat','Sun']].mean(); wkdy = day_avg[['Mon','Tue','Wed','Thu','Fri']].mean()
        diff = (wknd-wkdy)/wkdy*100
        if diff >= 20:
            st.markdown(f'<div class="warn-box">📌 <b>Weekend lebih tinggi {diff:+.1f}%</b> dari weekday (threshold ≥20%). ➡️ BUDU: aktifkan Smart Warning Jumat malam.</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="info-box">📌 Selisih weekend vs weekday: <b>{diff:+.1f}%</b> (threshold ≥20% belum terpenuhi).</div>', unsafe_allow_html=True)

    # Q3
    elif bq == 'Q3 — Anomali Bulanan':
        st.markdown('<div class="section-header" style="border-color:#a78bfa;color:#a78bfa">Q3: Bulan apa total pengeluaran melebihi mean + 1.5×SD?</div>', unsafe_allow_html=True)
        m_lbl = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
        monthly = df.groupby('month')['amount'].agg(total='sum', count='count').reset_index()
        thr = monthly['total'].mean() + anomaly_std * monthly['total'].std()
        monthly['anomaly'] = monthly['total'] > thr
        fig, axes = plt.subplots(2, 1, figsize=(13,7))
        axes[0].plot(monthly['month'], monthly['total']/1e6, marker='o', color=PRIMARY, lw=2.5)
        axes[0].axhline(thr/1e6, color=WARN, ls='--', lw=1.5, label=f'Threshold (mean+{anomaly_std}σ)')
        anom = monthly[monthly['anomaly']]
        axes[0].scatter(anom['month'], anom['total']/1e6, color=WARN, s=120, zorder=5, label='Anomali')
        axes[0].set_xticks(range(1,13)); axes[0].set_xticklabels(m_lbl)
        axes[0].set_ylabel('Juta IDR'); axes[0].legend(framealpha=0.1)
        axes[0].set_title('Tren Bulanan + Deteksi Anomali', fontweight='bold', color='#c8d8f0')
        axes[1].bar(monthly['month'], monthly['count'],
                    color=['#EF4444' if a else '#93C5FD' for a in monthly['anomaly']])
        axes[1].set_xticks(range(1,13)); axes[1].set_xticklabels(m_lbl)
        axes[1].set_ylabel('Jumlah Transaksi'); axes[1].set_title('Frekuensi Transaksi per Bulan', fontweight='bold', color='#c8d8f0')
        for ax in axes: ax.set_facecolor('none'); ax.tick_params(colors='#94a3b8')
        fig.patch.set_facecolor('none'); plt.tight_layout()
        st.pyplot(fig, use_container_width=True); plt.close()
        anom_names = [m_lbl[m-1] for m in anom['month'].tolist()]
        st.markdown(f'<div class="warn-box">📌 <b>Bulan anomali:</b> {anom_names if anom_names else "Tidak ada"}<br>Threshold: Rp {thr/1e6:.1f}jt/bulan → ➡️ BUDU: tandai di Weekly Reflection</div>', unsafe_allow_html=True)

    # Q4
    elif bq == 'Q4 — Money Leak':
        st.markdown('<div class="section-header" style="border-color:#fb923c;color:#fb923c">Q4: Kategori mana yang bocor diam-diam (transaksi kecil, frekuensi tinggi)?</div>', unsafe_allow_html=True)
        median_idr = df['amount'].median(); small_lim = median_idr * SMALL_TXN_MULTIPLIER
        df_small   = df[df['amount'] <= small_lim]
        n_months   = max(df['month'].nunique(), 1)
        leak = (df_small.groupby('category').agg(total_idr=('amount','sum'),freq=('amount','count'),avg_idr=('amount','mean'))
                .assign(freq_monthly=lambda x: x['freq']/n_months)
                .query(f'freq_monthly >= {FREQ_MONTH_THRESH}').sort_values('total_idr', ascending=False))
        col1, col2 = st.columns(2)
        with col1:
            fig, ax = plt.subplots(figsize=(6,4))
            src = leak if not leak.empty else df_small.groupby('category').agg(total_idr=('amount','sum'),freq=('amount','count')).sort_values('total_idr',ascending=False).head(10)
            src_sorted = src.sort_values('total_idr')
            ax.barh(src_sorted.index, src_sorted['total_idr']/1e3, color='#F59E0B')
            ax.set_title('Akumulasi Money Leak (ribu IDR)', fontweight='bold', color='#c8d8f0')
            ax.set_facecolor('none'); fig.patch.set_facecolor('none'); ax.tick_params(colors='#94a3b8')
            st.pyplot(fig, use_container_width=True); plt.close()
        with col2:
            fig, ax = plt.subplots(figsize=(6,4))
            src_freq = src.sort_values('freq')
            ax.barh(src_freq.index, src_freq['freq'], color=WARN)
            ax.set_title('Frekuensi Transaksi Kecil', fontweight='bold', color='#c8d8f0')
            ax.set_facecolor('none'); fig.patch.set_facecolor('none'); ax.tick_params(colors='#94a3b8')
            st.pyplot(fig, use_container_width=True); plt.close()
        st.markdown(f'<div class="warn-box">📌 Batas transaksi "kecil": ≤ Rp {small_lim:,.0f} | Total bocor: Rp {df_small["amount"].sum()/1e6:,.1f} juta<br>➡️ BUDU: kartu <b>Silent Money Leak</b></div>', unsafe_allow_html=True)

    # Q5
    elif bq == 'Q5 — Metode Pembayaran + Spearman':
        st.markdown('<div class="section-header" style="border-color:#34d399;color:#34d399">Q5: Apakah metode pembayaran berkorelasi dengan nilai transaksi?</div>', unsafe_allow_html=True)
        pay = df.groupby('payment_method')['amount'].agg(total='sum',count='count',avg='mean').sort_values('total',ascending=False)
        pay_enc = df['payment_method'].astype('category').cat.codes
        rho, pval = spearmanr(pay_enc, df['amount'])
        fig, axes = plt.subplots(1, 3, figsize=(13,4))
        for i, (col, lbl, div) in enumerate([('total','Total (juta IDR)',1e6),('count','Frekuensi',1),('avg','Rata-rata (ribu IDR)',1e3)]):
            axes[i].bar(pay.index, pay[col]/div, color=PALETTE[:len(pay)])
            axes[i].set_title(lbl, fontweight='bold', color='#c8d8f0')
            axes[i].tick_params(axis='x', rotation=25, colors='#94a3b8'); axes[i].tick_params(axis='y', colors='#94a3b8')
            axes[i].set_facecolor('none')
        fig.patch.set_facecolor('none'); plt.tight_layout()
        st.pyplot(fig, use_container_width=True); plt.close()
        box_cls = 'success-box' if abs(rho) >= 0.3 else 'info-box'
        st.markdown(f'<div class="{box_cls}">📌 <b>Spearman ρ = {rho:.4f}</b> | p-value = {pval:.4f}<br>{"✅ Korelasi signifikan ≥ 0.3 — BUDU: sesuaikan konteks peringatan per metode bayar" if abs(rho)>=0.3 else "ℹ️ Korelasi lemah < 0.3"}</div>', unsafe_allow_html=True)
        st.dataframe(pay.style.format({'total':'{:,.0f}','avg':'{:,.0f}'}), use_container_width=True)

    # Q6
    elif bq == 'Q6 — Impulsive User':
        st.markdown('<div class="section-header" style="border-color:#f87171;color:#f87171">Q6: Berapa proporsi user dengan impulse_score ≥ 0.55?</div>', unsafe_allow_html=True)
        n_imp = (user_features['impulse_score'] >= impulse_thr).sum()
        n_tot = len(user_features)
        col1, col2, col3 = st.columns(3)
        col1.metric('Impulsive Spender', f'{n_imp} user', f'{n_imp/n_tot*100:.1f}%')
        col2.metric('Non-Impulsive',     f'{n_tot-n_imp} user', f'{(n_tot-n_imp)/n_tot*100:.1f}%')
        col3.metric('Impulse Threshold', f'{impulse_thr}')
        fig, axes = plt.subplots(1, 2, figsize=(13,4))
        axes[0].hist(user_features['impulse_score'], bins=30, color=PRIMARY, alpha=0.8, edgecolor='none')
        axes[0].axvline(impulse_thr, color=WARN, ls='--', lw=2, label=f'Threshold ({impulse_thr})')
        axes[0].set_xlabel('Impulse Score'); axes[0].set_ylabel('Jumlah User')
        axes[0].set_title('Distribusi Impulse Score', fontweight='bold', color='#c8d8f0')
        axes[0].legend(framealpha=0.1)
        persona_cnt = user_features['spending_persona'].value_counts()
        axes[1].bar(persona_cnt.index, persona_cnt.values,
                    color=[PERSONA_COLORS.get(p, PRIMARY) for p in persona_cnt.index])
        axes[1].set_title('Distribusi Spending Persona', fontweight='bold', color='#c8d8f0')
        axes[1].tick_params(axis='x', rotation=15)
        for ax in axes: ax.set_facecolor('none'); ax.tick_params(colors='#94a3b8')
        fig.patch.set_facecolor('none'); plt.tight_layout()
        st.pyplot(fig, use_container_width=True); plt.close()
        st.markdown(f'<div class="warn-box">📌 <b>{n_imp}/{n_tot} pengguna = {n_imp/n_tot*100:.1f}%</b> adalah Impulsive Spender → segmen prioritas notifikasi BUDU</div>', unsafe_allow_html=True)

    # EDA Segmen
    elif bq == 'EDA Segmen':
        st.markdown('<div class="section-header" style="border-color:#60a5fa;color:#60a5fa">EDA per Segmen Sosio-Ekonomi Indonesia</div>', unsafe_allow_html=True)
        seg_order = ['Kelas E (Miskin)','Kelas D (Menengah Bawah)','Kelas C (Menengah)','Kelas B (Menengah Atas)','Kelas A (Kaya)']
        seg_avail = [s for s in seg_order if s in df['segmen_label'].unique()]
        fig, axes = plt.subplots(1, 3, figsize=(16,5))
        seg_med = df.groupby('segmen_label')['amount'].median().reindex(seg_avail)
        axes[0].bar(range(len(seg_med)), seg_med.values/1e3, color=PALETTE[:len(seg_med)])
        axes[0].set_xticks(range(len(seg_med)))
        axes[0].set_xticklabels([s.split('(')[1].rstrip(')') for s in seg_avail], rotation=20, fontsize=8)
        axes[0].set_ylabel('Median Amount (ribu IDR)'); axes[0].set_title('Median Transaksi per Segmen', fontweight='bold', color='#c8d8f0')
        top_cat = df.groupby(['segmen_label','category'])['amount'].sum().reset_index().sort_values('amount',ascending=False).groupby('segmen_label').first().reindex(seg_avail)
        axes[1].barh(range(len(top_cat)), top_cat['amount'].values/1e6, color=PALETTE[:len(top_cat)])
        axes[1].set_yticks(range(len(top_cat)))
        axes[1].set_yticklabels([f'{s.split("(")[1].rstrip(")")}: {c}' for s,c in zip(top_cat.index,top_cat['category'])], fontsize=8)
        axes[1].set_xlabel('Juta IDR'); axes[1].set_title('Kategori Dominan per Segmen', fontweight='bold', color='#c8d8f0')
        pay_seg = df.groupby(['segmen_label','payment_method'])['amount'].count().reset_index().sort_values('amount',ascending=False)
        top_pay = pay_seg.groupby('segmen_label').first().reindex(seg_avail)
        axes[2].barh(range(len(top_pay)), top_pay['amount'].values, color=PALETTE[:len(top_pay)])
        axes[2].set_yticks(range(len(top_pay)))
        axes[2].set_yticklabels([f'{s.split("(")[1].rstrip(")")}: {p}' for s,p in zip(top_pay.index,top_pay['payment_method'])], fontsize=8)
        axes[2].set_xlabel('Frekuensi'); axes[2].set_title('Metode Bayar Dominan per Segmen', fontweight='bold', color='#c8d8f0')
        for ax in axes: ax.set_facecolor('none'); ax.tick_params(colors='#94a3b8')
        fig.patch.set_facecolor('none'); plt.tight_layout()
        st.pyplot(fig, use_container_width=True); plt.close()

# ─────────────────────────────────────────────────────────────
# TAB 3 — A/B TESTING
# ─────────────────────────────────────────────────────────────
with tab_ab:
    st.markdown('<div class="section-header" style="border-color:#f87171;color:#f87171">🧪 A/B Test — Weekend vs Weekday · Mann-Whitney U</div>', unsafe_allow_html=True)
    st.markdown("""
    **H₀:** Tidak ada perbedaan rata-rata pengeluaran weekend vs weekday  
    **H₁:** Pengeluaran weekend ≥ 20% lebih tinggi dari weekday  
    **Uji:** Mann-Whitney U (non-parametrik) · α = 0.05
    """)

    grp_w = df[df['is_weekend']==1]['amount']
    grp_d = df[df['is_weekend']==0]['amount']
    u_stat, p_val = mannwhitneyu(grp_w, grp_d, alternative='greater')
    n_total  = len(grp_w) + len(grp_d)
    from scipy import stats as scipy_stats
    z_score  = scipy_stats.norm.ppf(1 - p_val) if p_val < 1 else 0
    effect_r = z_score / np.sqrt(n_total)
    pct_diff = (grp_w.mean() - grp_d.mean()) / grp_d.mean() * 100

    c1, c2, c3, c4 = st.columns(4)
    c1.metric('Weekend avg',    f'Rp {grp_w.mean():,.0f}')
    c2.metric('Weekday avg',    f'Rp {grp_d.mean():,.0f}')
    c3.metric('Selisih',        f'{pct_diff:+.1f}%', delta='≥20% ✅' if pct_diff >= 20 else '<20% ⚠️')
    c4.metric('p-value',        f'{p_val:.4f}', delta='Signifikan' if p_val < 0.05 else 'Tidak signifikan')

    col1, col2 = st.columns(2)
    with col1:
        fig, ax = plt.subplots(figsize=(6,4))
        for g, lbl, clr in [(grp_w,'Weekend',WARN),(grp_d,'Weekday',PRIMARY)]:
            ax.hist(g/1e3, bins=50, alpha=0.6, label=lbl, color=clr, density=True)
        ax.set_xlabel('Amount (ribu IDR)'); ax.set_ylabel('Density')
        ax.set_title('Distribusi Weekend vs Weekday', fontweight='bold', color='#c8d8f0')
        ax.legend(framealpha=0.1); ax.set_facecolor('none'); fig.patch.set_facecolor('none')
        ax.tick_params(colors='#94a3b8')
        st.pyplot(fig, use_container_width=True); plt.close()
    with col2:
        fig, ax = plt.subplots(figsize=(6,4))
        bp = ax.boxplot([grp_w/1e3, grp_d/1e3], labels=['Weekend','Weekday'],
                        patch_artist=True, notch=True,
                        boxprops=dict(facecolor='#f87171', alpha=0.5),
                        medianprops=dict(color='black', lw=2))
        ax.set_ylabel('Amount (ribu IDR)')
        ax.set_title(f'Boxplot — Selisih: {pct_diff:+.1f}%', fontweight='bold', color='#c8d8f0')
        ax.set_facecolor('none'); fig.patch.set_facecolor('none'); ax.tick_params(colors='#94a3b8')
        st.pyplot(fig, use_container_width=True); plt.close()

    alpha = 0.05
    if p_val < alpha and pct_diff >= 20:
        st.markdown(f'<div class="warn-box">✅ <b>TOLAK H₀</b> — Signifikan DAN selisih ≥ 20%<br>📌 <b>BUDU:</b> Aktifkan Smart Warning otomatis setiap Jumat malam<br>U={u_stat:,.0f} | p={p_val:.6f} | Effect size r={effect_r:.4f}</div>', unsafe_allow_html=True)
    elif p_val < alpha:
        st.markdown(f'<div class="info-box">⚠️ Signifikan statistik, tapi selisih {pct_diff:.1f}% < 20% | p={p_val:.4f} | r={effect_r:.4f}</div>', unsafe_allow_html=True)
    else:
        st.markdown(f'<div class="info-box">ℹ️ Gagal tolak H₀ (p={p_val:.4f} ≥ {alpha}) | Effect size r={effect_r:.4f}</div>', unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
# TAB 4 — CLUSTERING & PERSONA
# ─────────────────────────────────────────────────────────────
with tab_clustering:
    st.markdown('<div class="section-header" style="border-color:#a78bfa;color:#a78bfa">🤖 Spending Personality Clustering (K-Means · Feature v3)</div>', unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)
    for persona, col in zip(['Impulsive Spender','Emotional Spender','Rational Spender'], [col1,col2,col3]):
        cnt = (user_features['spending_persona'] == persona).sum()
        avg_imp = user_features[user_features['spending_persona']==persona]['impulse_score'].mean()
        badge_cls = {'Impulsive Spender':'badge-impulsive','Emotional Spender':'badge-emotional','Rational Spender':'badge-rational'}[persona]
        accent_map = {'Impulsive Spender':('#f87171','#ef444420','#f8717140'), 'Emotional Spender':('#fbbf24','#f59e0b20','#fbbf2440'), 'Rational Spender':('#34d399','#10b98120','#34d39940')}
        ac, bg, br = accent_map.get(persona, ('#60a5fa','#2563eb20','#60a5fa40'))
        col.markdown(f'''<div style="background:linear-gradient(135deg,{bg},{bg}88);border:2px solid {br};border-radius:16px;padding:20px;box-shadow:0 4px 16px {bg}">
          <span class="{badge_cls}">{persona}</span><br><br>
          <span style="font-size:36px;font-weight:900;color:{ac}">{cnt}</span>
          <span style="color:var(--text-muted);font-size:14px;font-weight:600"> user</span><br>
          <div style="margin-top:8px;background:var(--bg-card2);border-radius:8px;padding:6px 10px;display:inline-block">
            <span style="color:var(--text-muted);font-size:11px;font-weight:700">AVG IMPULSE </span>
            <span style="color:{ac};font-size:13px;font-weight:800">{avg_imp:.3f}</span>
          </div>
        </div>''', unsafe_allow_html=True)

    st.divider()

    col_l, col_r = st.columns(2)
    with col_l:
        st.markdown("**PCA 2D — Spending Personality Map**")
        pca   = PCA(n_components=2, random_state=42)
        X_pca = pca.fit_transform(X_scaled)
        fig, ax = plt.subplots(figsize=(6,5))
        for persona, color in PERSONA_COLORS.items():
            mask = user_features['spending_persona'] == persona
            ax.scatter(X_pca[mask,0], X_pca[mask,1], label=persona, color=color, alpha=0.7, s=40, edgecolors='none')
        ax.set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)', color='#94a3b8')
        ax.set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)', color='#94a3b8')
        ax.legend(framealpha=0.1); ax.set_facecolor('none'); fig.patch.set_facecolor('none')
        ax.tick_params(colors='#94a3b8')
        st.pyplot(fig, use_container_width=True); plt.close()
    with col_r:
        st.markdown("**Radar — Profil Fitur per Persona**")
        radar_feats = [f for f in ['weekend_ratio','night_ratio','above_avg_ratio','spike_ratio','spending_cov','unique_categories'] if f in user_features.columns]
        persona_means = user_features.groupby('spending_persona')[radar_feats].mean()
        persona_means_norm = (persona_means - persona_means.min()) / (persona_means.max() - persona_means.min() + 1e-9)
        angles = np.linspace(0, 2*np.pi, len(radar_feats), endpoint=False).tolist() + [0]
        fig = plt.figure(figsize=(6,5)); ax = fig.add_subplot(111, polar=True)
        for persona, color in PERSONA_COLORS.items():
            if persona in persona_means_norm.index:
                vals = persona_means_norm.loc[persona].tolist() + [persona_means_norm.loc[persona].tolist()[0]]
                ax.plot(angles, vals, color=color, lw=2, label=persona)
                ax.fill(angles, vals, color=color, alpha=0.15)
        ax.set_xticks(angles[:-1]); ax.set_xticklabels(radar_feats, size=8, color='#94a3b8')
        ax.legend(loc='upper right', bbox_to_anchor=(1.35,1.1), framealpha=0.1)
        fig.patch.set_facecolor('none'); ax.set_facecolor('none')
        st.pyplot(fig, use_container_width=True); plt.close()

    st.divider()
    st.markdown("**Distribusi pendapatan_bulan per Persona (IDR)**")
    income_persona = user_features.groupby('spending_persona')['pendapatan_bulan'].agg(['mean','median','std']).round(0)
    income_persona.columns = ['Mean','Median','Std']
    st.dataframe(income_persona.style.format('Rp {:,.0f}'), use_container_width=True)

# ─────────────────────────────────────────────────────────────
# TAB 5 — PERSIAPAN MODEL TF
# ─────────────────────────────────────────────────────────────
with tab_model:
    st.markdown('<div class="section-header" style="border-color:#34d399;color:#34d399">🧠 Persiapan Data Model TensorFlow · Feature v3 (20 fitur)</div>', unsafe_allow_html=True)

    y_model = user_features['persona_encoded'].values
    X_tr, X_tmp, y_tr, y_tmp = train_test_split(X_norm, y_model, test_size=0.30, random_state=42, stratify=y_model)
    X_val, X_te, y_val, y_te = train_test_split(X_tmp, y_tmp, test_size=0.50, random_state=42, stratify=y_tmp)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric('Train',    f'{X_tr.shape[0]} user',  f'{X_tr.shape[1]} fitur')
    c2.metric('Val',      f'{X_val.shape[0]} user',  '')
    c3.metric('Test',     f'{X_te.shape[0]} user',   '')
    c4.metric('N Features', f'{X_tr.shape[1]}',      'v3 ✅')

    col_l, col_r = st.columns(2)
    with col_l:
        st.markdown("**Distribusi Kelas Train / Val / Test**")
        fig, axes = plt.subplots(1, 3, figsize=(10,3.5))
        for ax, y, lbl in [(axes[0],y_tr,'Train'),(axes[1],y_val,'Val'),(axes[2],y_te,'Test')]:
            uniq, cnt = np.unique(y, return_counts=True)
            colors = [list(PERSONA_COLORS.values())[i] for i in uniq]
            ax.bar([le.classes_[i] for i in uniq], cnt/cnt.sum()*100, color=colors)
            ax.set_title(lbl, fontweight='bold', color='#c8d8f0', fontsize=10)
            ax.set_ylabel('%'); ax.tick_params(axis='x', rotation=20, colors='#94a3b8')
            ax.tick_params(axis='y', colors='#94a3b8'); ax.set_facecolor('none')
        fig.patch.set_facecolor('none'); plt.tight_layout()
        st.pyplot(fig, use_container_width=True); plt.close()

    with col_r:
        st.markdown("**Encoding Spending Persona**")
        enc_df = pd.DataFrame([{'Encode':i,'Persona':cls,'Jumlah':(user_features['persona_encoded']==i).sum()} for i,cls in enumerate(le.classes_)])
        enc_df['%'] = (enc_df['Jumlah']/len(user_features)*100).round(1)
        st.dataframe(enc_df, use_container_width=True, hide_index=True)

        st.markdown("**Feature v3 — 20 Fitur Training**")
        n_f = len([c for c in feat_cols if c in user_features.columns])
        fc_display = [c for c in feat_cols if c in user_features.columns]
        st.markdown(f'`{n_f} fitur aktif`')
        for i, f in enumerate(fc_display, 1):
            icon = '✨' if f == 'pendapatan_bulan' else '·'
            st.markdown(f"<span style='font-family:JetBrains Mono,monospace;font-size:12px;color:#94a3b8'>{i:2d}. {icon} {f}</span>", unsafe_allow_html=True)

    st.divider()
    st.markdown("**Arsitektur TensorFlow yang Disarankan**")
    arch_code = f"""import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

N_FEATURES = {len([c for c in feat_cols if c in user_features.columns])}  # Feature v3

class BehaviorNormLayer(keras.layers.Layer):
    def build(self, input_shape):
        self.scale = self.add_weight(shape=(input_shape[-1],), initializer="ones", trainable=True)
        self.bias  = self.add_weight(shape=(input_shape[-1],), initializer="zeros", trainable=True)
    def call(self, x):
        return tf.nn.tanh(x * self.scale + self.bias)

class FocalLoss(keras.losses.Loss):
    def __init__(self, gamma=2.0, **kw): super().__init__(**kw); self.gamma = gamma
    def call(self, y_true, y_pred):
        y_oh = tf.one_hot(tf.cast(y_true, tf.int32), 3)
        ce   = -tf.reduce_sum(y_oh * tf.math.log(y_pred + 1e-7), axis=-1)
        p_t  = tf.reduce_sum(y_oh * y_pred, axis=-1)
        return tf.reduce_mean((1 - p_t) ** self.gamma * ce)

inputs = keras.Input(shape=(N_FEATURES,), name="spending_features")
x = BehaviorNormLayer(name="behavior_norm")(inputs)
x = layers.Dense(128, activation="relu")(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.30)(x)
x = layers.Dense(64, activation="relu")(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.20)(x)
x = layers.Dense(32, activation="relu")(x)
out = layers.Dense(3, activation="softmax", name="persona")(x)
model = keras.Model(inputs, out, name="BUDU_SpendingPersona")
model.compile(optimizer=keras.optimizers.Adam(1e-3),
              loss=FocalLoss(gamma=2.0), metrics=["accuracy"])"""
    st.code(arch_code, language='python')

# ─────────────────────────────────────────────────────────────
# TAB 6 — DATA DICTIONARY
# ─────────────────────────────────────────────────────────────
with tab_dict:
    st.markdown('<div class="section-header" style="border-color:#fbbf24;color:#fbbf24">📖 Data Dictionary · BUDU v3</div>', unsafe_allow_html=True)

    st.markdown("#### 📦 Sumber Dataset")
    st.markdown("> Dataset dummy Indonesia — di-generate secara programatik dari Cell 1–3. **Tidak menggunakan dataset eksternal.**")

    st.markdown("#### 🏙️ Segmen Sosio-Ekonomi")
    seg_data = [{'Kode':k,'Label':v['label'],'% Pop':f"{v['pct_pop']*100:.0f}%",
                 'Income/Bulan':f"Rp {v['income_range'][0]:,} – Rp {v['income_range'][1]:,}"} for k,v in SEGMENTS.items()]
    st.dataframe(pd.DataFrame(seg_data), use_container_width=True, hide_index=True)

    st.markdown("#### ⭐ User Profile Features — Input Model TF (20 fitur v3)")
    feat_dict = [
        {'Fitur':'avg_txn_idr','Satuan':'IDR','Deskripsi':'Rata-rata nilai transaksi','Grup':'Behavioral'},
        {'Fitur':'txn_count','Satuan':'count','Deskripsi':'Jumlah total transaksi','Grup':'Behavioral'},
        {'Fitur':'weekend_ratio','Satuan':'0–1','Deskripsi':'Proporsi transaksi weekend','Grup':'Behavioral'},
        {'Fitur':'night_ratio','Satuan':'0–1','Deskripsi':'Proporsi transaksi malam ≥20:00','Grup':'Behavioral'},
        {'Fitur':'above_avg_ratio','Satuan':'0–1','Deskripsi':'Proporsi transaksi di atas rata-rata global','Grup':'Behavioral'},
        {'Fitur':'spike_ratio','Satuan':'0–1','Deskripsi':'Proporsi spike (>2× rolling mean 7 txn)','Grup':'Behavioral'},
        {'Fitur':'impulse_score','Satuan':'0–1','Deskripsi':'Skor impulsivitas gabungan','Grup':'Behavioral'},
        {'Fitur':'unique_categories','Satuan':'count','Deskripsi':'Diversifikasi belanja','Grup':'Behavioral'},
        {'Fitur':'spending_cov','Satuan':'ratio','Deskripsi':'Koefisien variasi (std/mean)','Grup':'Behavioral'},
        {'Fitur':'pendapatan_bulan ✨','Satuan':'IDR','Deskripsi':'Pendapatan bulanan — BARU v3','Grup':'Konteks'},
        {'Fitur':'cat_makanan_&_minum_ratio','Satuan':'0–1','Deskripsi':'% spending ke Makanan & Minuman','Grup':'Kategori'},
        {'Fitur':'cat_transportasi_ratio','Satuan':'0–1','Deskripsi':'% spending ke Transportasi','Grup':'Kategori'},
        {'Fitur':'cat_kesehatan_&_kec_ratio','Satuan':'0–1','Deskripsi':'% spending ke Kesehatan & Kecantikan','Grup':'Kategori'},
        {'Fitur':'cat_sembako_&_kebut_ratio','Satuan':'0–1','Deskripsi':'% spending ke Sembako','Grup':'Kategori'},
        {'Fitur':'cat_kesehatan_ratio','Satuan':'0–1','Deskripsi':'% spending ke Kesehatan','Grup':'Kategori'},
        {'Fitur':'cat_pendidikan_ratio','Satuan':'0–1','Deskripsi':'% spending ke Pendidikan','Grup':'Kategori'},
        {'Fitur':'cat_belanja_online_ratio','Satuan':'0–1','Deskripsi':'% spending ke Belanja Online','Grup':'Kategori'},
        {'Fitur':'cat_pulsa_&_data_ratio','Satuan':'0–1','Deskripsi':'% spending ke Pulsa & Data','Grup':'Kategori'},
        {'Fitur':'cat_hiburan_ratio','Satuan':'0–1','Deskripsi':'% spending ke Hiburan','Grup':'Kategori'},
        {'Fitur':'cat_fashion_&_pakai_ratio','Satuan':'0–1','Deskripsi':'% spending ke Fashion & Pakaian','Grup':'Kategori'},
    ]
    st.dataframe(pd.DataFrame(feat_dict), use_container_width=True, hide_index=True)

    st.markdown("#### 🎯 Output Model — Spending Persona")
    persona_dict = [
        {'Label':'Rational Spender','Encode':0,'Impulse Score':'< 0.30','Karakteristik':'Konsisten, terkontrol, jarang spike','BUDU Warning':'🔵 Rendah — insight informatif'},
        {'Label':'Emotional Spender','Encode':1,'Impulse Score':'0.30 – 0.55','Karakteristik':'Tidak konsisten, spending_cov tinggi','BUDU Warning':'🟡 Sedang — Weekly Reflection'},
        {'Label':'Impulsive Spender','Encode':2,'Impulse Score':'≥ 0.55','Karakteristik':'Weekend & malam tinggi, banyak spike','BUDU Warning':'🔴 Tinggi — notifikasi Jumat malam'},
    ]
    st.dataframe(pd.DataFrame(persona_dict), use_container_width=True, hide_index=True)

    st.markdown("#### 📐 Formula Impulse Score")
    st.code("impulse_score = (weekend_ratio × 0.35) + (night_ratio × 0.30) + (above_avg_ratio × 0.20) + (spike_ratio × 0.15)", language='text')

    st.markdown("#### 🗂️ File Output")
    files_dict = [
        {'File':'budu_transactions_clean_idr.csv','Konten':'Semua transaksi bersih (IDR)','Digunakan oleh':'Dashboard, REST API'},
        {'File':'budu_user_profiles_idr.csv','Konten':'Profil + persona per user','Digunakan oleh':'REST API, Dashboard'},
        {'File':'budu_dummy_users.csv','Konten':'Data demografis user','Digunakan oleh':'Analisis segmen'},
        {'File':'X/y_train/val/test.npy','Konten':'Array input/output model TF','Digunakan oleh':'AI Engineer'},
        {'File':'budu_model_metadata.json','Konten':'Metadata + saran arsitektur (v3)','Digunakan oleh':'AI Engineer'},
    ]
    st.dataframe(pd.DataFrame(files_dict), use_container_width=True, hide_index=True)

    st.markdown("#### 🔄 Perubahan Feature v3")
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("**Ditambahkan**")
        st.markdown("- ✨ `pendapatan_bulan` — sinyal konteks finansial user")
        st.markdown("**Dihapus — Tidak Relevan**")
        for f in ['fraud_ratio','avg_dist_merchant','active_months','month_start_ratio','month_end_ratio']:
            st.markdown(f"- ~~`{f}`~~")
    with col2:
        st.markdown("**Dihapus — Redundan**")
        for f in ['total_spending_idr','median_txn_idr','max_txn_idr','std_amount_idr','unique_merchants']:
            st.markdown(f"- ~~`{f}`~~")
        st.markdown("**Transformasi**")
        st.markdown("- 10 kolom `cat_*` IDR → rasio proporsi (`_ratio`)")