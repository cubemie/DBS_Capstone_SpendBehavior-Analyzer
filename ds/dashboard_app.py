"""
╔══════════════════════════════════════════════════════════════╗
║    SpendBehavior Analyzer — Streamlit Dashboard             ║
║    Coding Camp 2026 | CC26-PSU268 | DBS Foundation          ║
╚══════════════════════════════════════════════════════════════╝

Cara menjalankan:
    streamlit run dashboard_app.py

Dependency:
    pip install streamlit pandas numpy matplotlib seaborn plotly scikit-learn
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
import warnings

warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────
# 0. PAGE CONFIG
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="SpendBehavior Analyzer",
    page_icon="💸",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─────────────────────────────────────────────
# 1. STYLING
# ─────────────────────────────────────────────
st.markdown("""
<style>
    /* Main background */
    .main { background-color: #F8FAFC; }

    /* Metric cards */
    .metric-card {
        background: white;
        border-radius: 12px;
        padding: 1.2rem 1.5rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        border-left: 4px solid #2563EB;
    }
    .metric-card.green  { border-left-color: #10B981; }
    .metric-card.orange { border-left-color: #F59E0B; }
    .metric-card.red    { border-left-color: #EF4444; }
    .metric-card.purple { border-left-color: #8B5CF6; }

    /* Section header */
    .section-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1E3A5F;
        margin-bottom: 0.8rem;
        padding-bottom: 0.3rem;
        border-bottom: 2px solid #E2E8F0;
    }

    /* Insight box */
    .insight-box {
        background: #EFF6FF;
        border: 1px solid #BFDBFE;
        border-radius: 8px;
        padding: 0.8rem 1rem;
        font-size: 0.92rem;
        color: #1E40AF;
        margin-bottom: 0.5rem;
    }
    .warning-box {
        background: #FEF3C7;
        border: 1px solid #FCD34D;
        border-radius: 8px;
        padding: 0.8rem 1rem;
        font-size: 0.92rem;
        color: #92400E;
        margin-bottom: 0.5rem;
    }
    .leak-box {
        background: #FFF1F2;
        border: 1px solid #FECDD3;
        border-radius: 8px;
        padding: 0.8rem 1rem;
        font-size: 0.92rem;
        color: #9F1239;
        margin-bottom: 0.5rem;
    }

    /* Hide streamlit default elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
# 2. DATA GENERATION (ganti dengan load CSV asli)
# ─────────────────────────────────────────────
@st.cache_data
def generate_data():
    np.random.seed(42)
    n = 2500

    categories = [
        'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
        'Health & Medical', 'Utilities & Bills', 'Groceries',
        'Education', 'Personal Care', 'Travel'
    ]
    cat_weights = [0.25, 0.15, 0.18, 0.10, 0.07, 0.08, 0.07, 0.04, 0.04, 0.02]

    sub_categories = {
        'Food & Dining'    : ['Cafe', 'Restaurant', 'Fast Food', 'Online Food Order'],
        'Transportation'   : ['Ojek Online', 'Taxi', 'Bensin', 'Bus/KRL'],
        'Shopping'         : ['Fashion', 'Elektronik', 'Online Shop', 'Aksesoris'],
        'Entertainment'    : ['Streaming', 'Bioskop', 'Game', 'Konser'],
        'Health & Medical' : ['Obat', 'Dokter', 'Gym', 'Vitamin'],
        'Utilities & Bills': ['Listrik', 'Internet', 'Air', 'Pulsa/Data'],
        'Groceries'        : ['Supermarket', 'Pasar', 'Mini Market'],
        'Education'        : ['Kursus', 'Buku', 'Seminar'],
        'Personal Care'    : ['Salon', 'Skincare', 'Barbershop'],
        'Travel'           : ['Hotel', 'Tiket', 'Oleh-oleh']
    }

    payment_methods = ['QRIS', 'E-Wallet', 'Debit Card', 'Cash', 'Credit Card']
    payment_weights = [0.35, 0.25, 0.20, 0.12, 0.08]

    date_range = pd.date_range('2023-01-01', '2023-12-31', freq='D')
    cat_col  = np.random.choice(categories, size=n, p=cat_weights)
    sub_col  = [np.random.choice(sub_categories[c]) for c in cat_col]
    date_col = np.random.choice(date_range, size=n)
    pay_col  = np.random.choice(payment_methods, size=n, p=payment_weights)

    amount_map = {
        'Food & Dining'    : (15_000, 120_000),
        'Transportation'   : (10_000,  80_000),
        'Shopping'         : (50_000, 500_000),
        'Entertainment'    : (15_000, 200_000),
        'Health & Medical' : (20_000, 350_000),
        'Utilities & Bills': (50_000, 400_000),
        'Groceries'        : (30_000, 300_000),
        'Education'        : (50_000, 500_000),
        'Personal Care'    : (20_000, 200_000),
        'Travel'           : (100_000, 2_000_000)
    }

    amount_col = np.array([
        np.random.randint(amount_map[c][0], amount_map[c][1]) for c in cat_col
    ])
    user_ids = np.random.choice([f'USR{str(i).zfill(3)}' for i in range(1, 51)], size=n)

    df = pd.DataFrame({
        'transaction_id': [f'TXN{str(i).zfill(5)}' for i in range(n)],
        'user_id'       : user_ids,
        'date'          : pd.to_datetime(date_col),
        'category'      : cat_col,
        'sub_category'  : sub_col,
        'amount'        : amount_col,
        'payment_method': pay_col,
        'type'          : 'expense'
    })

    df['month']       = df['date'].dt.month
    df['month_name']  = df['date'].dt.strftime('%b')
    df['day_of_week'] = df['date'].dt.dayofweek
    df['day_name']    = df['date'].dt.strftime('%a')
    df['hour']        = np.random.choice(range(6, 24), size=len(df))
    df['is_weekend']  = df['day_of_week'].isin([5, 6]).astype(int)
    df['is_night']    = (df['hour'] >= 20).astype(int)
    df['week']        = df['date'].dt.isocalendar().week.astype(int)
    df['quarter']     = df['date'].dt.quarter

    return df


@st.cache_data
def build_user_profiles(df):
    profiles = df.groupby('user_id').agg(
        total_spending    = ('amount', 'sum'),
        avg_transaction   = ('amount', 'mean'),
        transaction_count = ('amount', 'count'),
        std_amount        = ('amount', 'std'),
        max_transaction   = ('amount', 'max'),
        weekend_ratio     = ('is_weekend', 'mean'),
        night_ratio       = ('is_night', 'mean'),
        unique_categories = ('category', 'nunique'),
    ).reset_index()
    profiles['std_amount']    = profiles['std_amount'].fillna(0)
    profiles['impulse_score'] = (
        profiles['weekend_ratio'] * 0.5 + profiles['night_ratio'] * 0.5
    ).round(4)

    feature_cols = [
        'total_spending','avg_transaction','transaction_count',
        'std_amount','weekend_ratio','night_ratio',
        'unique_categories','impulse_score'
    ]
    X        = profiles[feature_cols].fillna(0).values
    scaler   = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    km       = KMeans(n_clusters=3, random_state=42, n_init=10)
    profiles['cluster'] = km.fit_predict(X_scaled)

    cluster_stats     = profiles.groupby('cluster')['impulse_score'].mean()
    sorted_clusters   = cluster_stats.sort_values()
    persona_map = {
        sorted_clusters.index[0]: 'Rational Spender',
        sorted_clusters.index[1]: 'Emotional Spender',
        sorted_clusters.index[2]: 'Impulsive Spender',
    }
    profiles['spending_persona'] = profiles['cluster'].map(persona_map)

    pca    = PCA(n_components=2, random_state=42)
    X_pca  = pca.fit_transform(X_scaled)
    profiles['pca_x'] = X_pca[:, 0]
    profiles['pca_y'] = X_pca[:, 1]

    return profiles


# Load data
df       = generate_data()
profiles = build_user_profiles(df)

# ─────────────────────────────────────────────
# 3. SIDEBAR
# ─────────────────────────────────────────────
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/DBS_Bank_logo.svg/320px-DBS_Bank_logo.svg.png", width=100)
    st.markdown("## 💸 SpendBehavior Analyzer")
    st.caption("Coding Camp 2026 | CC26-PSU268")
    st.divider()

    page = st.radio(
        "📌 Navigasi",
        ["🏠 Overview", "📊 EDA & Insights", "🔍 Money Leak", "👤 Spending Persona", "📅 Weekly Reflection"],
        index=0
    )

    st.divider()
    st.markdown("**🔽 Filter Data**")

    # Filter kategori
    all_cats = sorted(df['category'].unique().tolist())
    sel_cats = st.multiselect("Kategori", all_cats, default=all_cats)

    # Filter bulan
    months   = list(range(1, 13))
    sel_months = st.select_slider("Bulan", options=months, value=(1, 12))

    # Filter User
    all_users = sorted(df['user_id'].unique().tolist())
    sel_user  = st.selectbox("👤 Pilih User (Persona Tab)", all_users)

    st.divider()
    st.caption("Dataset: Financial Transactions 2023")
    st.caption("Tim: Dwi, Mutia, Hamzah, Berton, Aliya, Khalisha")

# Filter data
df_filtered = df[
    (df['category'].isin(sel_cats)) &
    (df['month'] >= sel_months[0]) &
    (df['month'] <= sel_months[1])
]

# ─────────────────────────────────────────────
# 4. PAGE: OVERVIEW
# ─────────────────────────────────────────────
if page == "🏠 Overview":
    st.title("💸 SpendBehavior Analyzer")
    st.caption("Analisis perilaku pengeluaran personal | Coding Camp 2026 — DBS Foundation")
    st.divider()

    # KPI Row
    col1, col2, col3, col4, col5 = st.columns(5)
    total_spend   = df_filtered['amount'].sum()
    avg_trx       = df_filtered['amount'].mean()
    trx_count     = len(df_filtered)
    unique_users  = df_filtered['user_id'].nunique()
    weekend_pct   = df_filtered['is_weekend'].mean() * 100

    with col1:
        st.metric("💰 Total Pengeluaran", f"Rp {total_spend/1e6:.1f}jt")
    with col2:
        st.metric("🧾 Jumlah Transaksi", f"{trx_count:,}")
    with col3:
        st.metric("📊 Rata-rata/Transaksi", f"Rp {avg_trx:,.0f}")
    with col4:
        st.metric("👥 Pengguna Aktif", f"{unique_users}")
    with col5:
        st.metric("📅 Weekend Spending", f"{weekend_pct:.1f}%")

    st.divider()

    col_a, col_b = st.columns([1.3, 1])

    with col_a:
        st.markdown('<div class="section-title">📈 Tren Pengeluaran Bulanan</div>', unsafe_allow_html=True)
        monthly = df_filtered.groupby('month')['amount'].sum().reset_index()
        month_labels = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'Mei',6:'Jun',
                        7:'Jul',8:'Agu',9:'Sep',10:'Okt',11:'Nov',12:'Des'}
        monthly['month_name'] = monthly['month'].map(month_labels)

        threshold = monthly['amount'].mean() + 1.5 * monthly['amount'].std()
        monthly['anomaly'] = monthly['amount'] > threshold

        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=monthly['month_name'], y=monthly['amount']/1e6,
            mode='lines+markers', name='Total Pengeluaran',
            line=dict(color='#2563EB', width=2.5),
            marker=dict(size=7)
        ))
        fig.add_hline(y=threshold/1e6, line_dash='dash', line_color='#EF4444',
                      annotation_text='Threshold Anomali')
        fig.add_trace(go.Scatter(
            x=monthly[monthly['anomaly']]['month_name'],
            y=monthly[monthly['anomaly']]['amount']/1e6,
            mode='markers', name='Anomali',
            marker=dict(color='#EF4444', size=12, symbol='star')
        ))
        fig.update_layout(
            yaxis_title='Total (juta Rp)', showlegend=True,
            height=300, margin=dict(l=0, r=0, t=10, b=0),
            plot_bgcolor='white', paper_bgcolor='white'
        )
        st.plotly_chart(fig, use_container_width=True)

    with col_b:
        st.markdown('<div class="section-title">🍕 Proporsi per Kategori</div>', unsafe_allow_html=True)
        cat_sum = df_filtered.groupby('category')['amount'].sum().reset_index()
        cat_sum = cat_sum.sort_values('amount', ascending=False)
        fig_pie = px.pie(
            cat_sum, names='category', values='amount',
            color_discrete_sequence=px.colors.qualitative.Set2,
            hole=0.4
        )
        fig_pie.update_traces(textposition='inside', textinfo='percent+label')
        fig_pie.update_layout(
            showlegend=False, height=300,
            margin=dict(l=0, r=0, t=10, b=0)
        )
        st.plotly_chart(fig_pie, use_container_width=True)

    # Bottom row
    col_c, col_d = st.columns(2)

    with col_c:
        st.markdown('<div class="section-title">📅 Pola Pengeluaran per Hari</div>', unsafe_allow_html=True)
        day_order = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
        day_sum = df_filtered.groupby('day_name')['amount'].sum().reindex(day_order).reset_index()
        day_sum.columns = ['day','total']
        day_sum['color'] = day_sum['day'].apply(lambda x: '#EF4444' if x in ['Sat','Sun'] else '#2563EB')
        fig_day = px.bar(day_sum, x='day', y='total',
                         color='color', color_discrete_map='identity',
                         labels={'total':'Total (Rp)', 'day':'Hari'})
        fig_day.update_layout(
            height=280, showlegend=False,
            margin=dict(l=0,r=0,t=10,b=0),
            plot_bgcolor='white', paper_bgcolor='white'
        )
        st.plotly_chart(fig_day, use_container_width=True)

    with col_d:
        st.markdown('<div class="section-title">💳 Metode Pembayaran</div>', unsafe_allow_html=True)
        pay_ct = df_filtered['payment_method'].value_counts().reset_index()
        pay_ct.columns = ['method','count']
        fig_pay = px.bar(pay_ct, x='method', y='count',
                         color='count', color_continuous_scale='Blues',
                         labels={'count':'Jumlah Transaksi','method':''})
        fig_pay.update_layout(
            height=280, showlegend=False, coloraxis_showscale=False,
            margin=dict(l=0,r=0,t=10,b=0),
            plot_bgcolor='white', paper_bgcolor='white'
        )
        st.plotly_chart(fig_pay, use_container_width=True)


# ─────────────────────────────────────────────
# 5. PAGE: EDA & INSIGHTS
# ─────────────────────────────────────────────
elif page == "📊 EDA & Insights":
    st.title("📊 Exploratory Data Analysis")
    st.divider()

    tab1, tab2, tab3 = st.tabs(["🗂️ Kategori", "⏰ Pola Waktu", "💳 Pembayaran"])

    with tab1:
        col1, col2 = st.columns(2)
        cat_stats = df_filtered.groupby('category').agg(
            total=('amount','sum'),
            count=('amount','count'),
            avg=('amount','mean')
        ).reset_index().sort_values('total', ascending=False)

        with col1:
            st.markdown("**Total Pengeluaran per Kategori**")
            fig = px.bar(cat_stats.sort_values('total'),
                         x='total', y='category', orientation='h',
                         color='total', color_continuous_scale='Blues',
                         labels={'total':'Total (Rp)','category':''})
            fig.update_layout(height=400, coloraxis_showscale=False,
                              margin=dict(l=0,r=0,t=5,b=0),
                              plot_bgcolor='white', paper_bgcolor='white')
            st.plotly_chart(fig, use_container_width=True)

        with col2:
            st.markdown("**Rata-rata Transaksi per Kategori**")
            fig2 = px.bar(cat_stats.sort_values('avg'),
                          x='avg', y='category', orientation='h',
                          color='avg', color_continuous_scale='Oranges',
                          labels={'avg':'Rata-rata (Rp)','category':''})
            fig2.update_layout(height=400, coloraxis_showscale=False,
                               margin=dict(l=0,r=0,t=5,b=0),
                               plot_bgcolor='white', paper_bgcolor='white')
            st.plotly_chart(fig2, use_container_width=True)

        st.markdown("**📋 Tabel Statistik Kategori**")
        cat_stats['total_fmt'] = cat_stats['total'].apply(lambda x: f"Rp {x:,.0f}")
        cat_stats['avg_fmt']   = cat_stats['avg'].apply(lambda x: f"Rp {x:,.0f}")
        st.dataframe(
            cat_stats[['category','count','total_fmt','avg_fmt']].rename(columns={
                'category':'Kategori','count':'Frekuensi',
                'total_fmt':'Total Pengeluaran','avg_fmt':'Rata-rata'
            }),
            use_container_width=True, hide_index=True
        )

    with tab2:
        st.markdown("**Heatmap Pengeluaran: Jam vs Kategori**")
        top5 = df_filtered.groupby('category')['amount'].sum().nlargest(5).index.tolist()
        df_top = df_filtered[df_filtered['category'].isin(top5)]
        heat = df_top.groupby(['hour','category'])['amount'].sum().unstack(fill_value=0)
        fig_heat = px.imshow(
            heat.T / 1e3, color_continuous_scale='Blues',
            labels=dict(x='Jam', y='Kategori', color='Ribu Rp'),
            aspect='auto'
        )
        fig_heat.update_layout(height=350, margin=dict(l=0,r=0,t=5,b=0))
        st.plotly_chart(fig_heat, use_container_width=True)

        col1, col2 = st.columns(2)
        with col1:
            st.markdown("**Pengeluaran: Weekend vs Weekday**")
            wknd = df_filtered.groupby(['category','is_weekend'])['amount'].mean().unstack()
            wknd.columns = ['Weekday','Weekend']
            wknd = wknd.reset_index()
            fig_wk = go.Figure()
            fig_wk.add_trace(go.Bar(name='Weekday', x=wknd['category'],
                                     y=wknd['Weekday'], marker_color='#93C5FD'))
            fig_wk.add_trace(go.Bar(name='Weekend', x=wknd['category'],
                                     y=wknd['Weekend'], marker_color='#EF4444'))
            fig_wk.update_layout(barmode='group', height=350,
                                  margin=dict(l=0,r=0,t=5,b=0),
                                  plot_bgcolor='white', paper_bgcolor='white',
                                  xaxis_tickangle=-20)
            st.plotly_chart(fig_wk, use_container_width=True)

        with col2:
            st.markdown("**Distribusi Transaksi Malam vs Siang**")
            df_filtered['time_label'] = df_filtered['is_night'].map({0:'Siang/Sore (06:00–19:59)', 1:'Malam (20:00–23:59)'})
            night_cat = df_filtered.groupby(['category','time_label'])['amount'].sum().reset_index()
            fig_nt = px.bar(night_cat, x='category', y='amount', color='time_label',
                            barmode='group',
                            color_discrete_map={
                                'Siang/Sore (06:00–19:59)': '#FCD34D',
                                'Malam (20:00–23:59)': '#7C3AED'
                            },
                            labels={'amount':'Total (Rp)','category':'','time_label':''})
            fig_nt.update_layout(height=350, margin=dict(l=0,r=0,t=5,b=0),
                                  plot_bgcolor='white', paper_bgcolor='white',
                                  xaxis_tickangle=-20)
            st.plotly_chart(fig_nt, use_container_width=True)

    with tab3:
        col1, col2 = st.columns(2)
        pay_stats = df_filtered.groupby('payment_method').agg(
            total=('amount','sum'),
            count=('amount','count'),
            avg=('amount','mean')
        ).reset_index()

        with col1:
            st.markdown("**Distribusi Nilai Transaksi per Metode**")
            fig_box = px.box(df_filtered, x='payment_method', y='amount',
                             color='payment_method',
                             color_discrete_sequence=px.colors.qualitative.Set2,
                             labels={'amount':'Nilai (Rp)','payment_method':''})
            fig_box.update_layout(showlegend=False, height=380,
                                   margin=dict(l=0,r=0,t=5,b=0),
                                   plot_bgcolor='white', paper_bgcolor='white')
            st.plotly_chart(fig_box, use_container_width=True)

        with col2:
            st.markdown("**Rata-rata Pengeluaran per Metode**")
            fig_avg = px.funnel(pay_stats.sort_values('avg'),
                                x='avg', y='payment_method',
                                color_discrete_sequence=['#2563EB'],
                                labels={'avg':'Rata-rata (Rp)','payment_method':''})
            fig_avg.update_layout(height=380, margin=dict(l=0,r=0,t=5,b=0))
            st.plotly_chart(fig_avg, use_container_width=True)


# ─────────────────────────────────────────────
# 6. PAGE: MONEY LEAK DETECTION
# ─────────────────────────────────────────────
elif page == "🔍 Money Leak":
    st.title("🔍 Money Leak Detection")
    st.caption("Deteksi akumulasi pengeluaran kecil yang sering tidak disadari")
    st.divider()

    median_amt = df_filtered['amount'].median()
    df_small   = df_filtered[df_filtered['amount'] <= median_amt]
    total_leak = df_small['amount'].sum()
    pct_leak   = total_leak / df_filtered['amount'].sum() * 100

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("💧 Total Kebocoran", f"Rp {total_leak/1e6:.1f}jt",
                  delta=f"{pct_leak:.1f}% dari total spending")
    with col2:
        st.metric("🔢 Jumlah Transaksi Kecil", f"{len(df_small):,}",
                  delta=f"{len(df_small)/len(df_filtered)*100:.1f}% dari semua transaksi")
    with col3:
        st.metric("📊 Threshold Transaksi Kecil", f"≤ Rp {median_amt:,.0f}",
                  delta="Nilai median keseluruhan")

    st.divider()

    leak = df_small.groupby('sub_category').agg(
        total=('amount','sum'), freq=('amount','count'),
        avg=('amount','mean')
    ).sort_values('total', ascending=False).head(15).reset_index()

    col_a, col_b = st.columns(2)
    with col_a:
        st.markdown("**💧 Top 15 Sub-Kategori: Total Akumulasi Bocor**")
        fig = px.bar(leak.sort_values('total'), x='total', y='sub_category',
                     orientation='h', color='total',
                     color_continuous_scale='Reds',
                     labels={'total':'Akumulasi (Rp)','sub_category':''})
        fig.update_layout(height=450, coloraxis_showscale=False,
                          margin=dict(l=0,r=0,t=5,b=0),
                          plot_bgcolor='white', paper_bgcolor='white')
        st.plotly_chart(fig, use_container_width=True)

    with col_b:
        st.markdown("**🔁 Top 15 Sub-Kategori: Frekuensi Transaksi Kecil**")
        fig2 = px.bar(leak.sort_values('freq'), x='freq', y='sub_category',
                      orientation='h', color='freq',
                      color_continuous_scale='Oranges',
                      labels={'freq':'Jumlah Transaksi','sub_category':''})
        fig2.update_layout(height=450, coloraxis_showscale=False,
                           margin=dict(l=0,r=0,t=5,b=0),
                           plot_bgcolor='white', paper_bgcolor='white')
        st.plotly_chart(fig2, use_container_width=True)

    st.divider()
    st.markdown("**⚠️ Smart Warning: Kategori dengan Impulse Spending Tertinggi**")

    wknd_stats = df_filtered.groupby('category').apply(
        lambda g: pd.Series({
            'avg_weekend': g[g['is_weekend']==1]['amount'].mean(),
            'avg_weekday': g[g['is_weekend']==0]['amount'].mean(),
        })
    ).reset_index()
    wknd_stats['impulse_ratio'] = wknd_stats['avg_weekend'] / wknd_stats['avg_weekday']
    wknd_stats = wknd_stats.sort_values('impulse_ratio', ascending=False)

    for _, row in wknd_stats.head(3).iterrows():
        icon = "🔴" if row['impulse_ratio'] > 1.2 else "🟡"
        st.markdown(
            f'<div class="warning-box">{icon} <strong>{row["category"]}</strong> — '
            f'Rata-rata weekend Rp {row["avg_weekend"]:,.0f} vs weekday Rp {row["avg_weekday"]:,.0f} '
            f'(Impulse Ratio: <strong>{row["impulse_ratio"]:.2f}×</strong>)</div>',
            unsafe_allow_html=True
        )

    st.markdown("**💧 Insight Money Leak Utama:**")
    top_leak = leak.iloc[0]
    st.markdown(
        f'<div class="leak-box">💸 Sub-kategori <strong>{top_leak["sub_category"]}</strong> '
        f'mencatat {top_leak["freq"]:.0f} transaksi kecil dengan akumulasi Rp {top_leak["total"]:,.0f}. '
        f'Rata-rata hanya Rp {top_leak["avg"]:,.0f} per transaksi — terkesan kecil, tapi menumpuk!</div>',
        unsafe_allow_html=True
    )


# ─────────────────────────────────────────────
# 7. PAGE: SPENDING PERSONA
# ─────────────────────────────────────────────
elif page == "👤 Spending Persona":
    st.title("👤 Spending Personality Classification")
    st.caption("Klasifikasi pengguna ke dalam tipe kepribadian finansial")
    st.divider()

    persona_colors = {
        'Impulsive Spender': '#EF4444',
        'Emotional Spender': '#F59E0B',
        'Rational Spender' : '#10B981'
    }

    col1, col2, col3 = st.columns(3)
    for col, persona, desc, icon in zip(
        [col1, col2, col3],
        ['Rational Spender', 'Emotional Spender', 'Impulsive Spender'],
        ['Belanja terencana, jarang impulsif', 'Kadang belanja berdasar mood', 'Sering belanja tiba-tiba'],
        ['🟢', '🟡', '🔴']
    ):
        cnt = (profiles['spending_persona'] == persona).sum()
        with col:
            st.metric(f"{icon} {persona}", f"{cnt} pengguna",
                      delta=f"{cnt/len(profiles)*100:.1f}% dari total")

    st.divider()
    col_a, col_b = st.columns([1.4, 1])

    with col_a:
        st.markdown("**📍 Visualisasi Cluster (PCA 2D)**")
        fig_pca = px.scatter(
            profiles, x='pca_x', y='pca_y',
            color='spending_persona',
            color_discrete_map=persona_colors,
            hover_data={'user_id': True, 'impulse_score': ':.3f',
                        'total_spending': ':,.0f', 'pca_x': False, 'pca_y': False},
            labels={'pca_x': 'PC1', 'pca_y': 'PC2', 'spending_persona': 'Persona'},
            opacity=0.8
        )
        fig_pca.update_traces(marker=dict(size=9, line=dict(width=0.5, color='white')))
        fig_pca.update_layout(
            height=420, margin=dict(l=0, r=0, t=10, b=0),
            plot_bgcolor='white', paper_bgcolor='white',
            legend=dict(orientation='h', yanchor='bottom', y=1.02)
        )
        st.plotly_chart(fig_pca, use_container_width=True)

    with col_b:
        st.markdown("**📊 Rata-rata Fitur per Persona**")
        persona_stats = profiles.groupby('spending_persona').agg(
            impulse_score     = ('impulse_score','mean'),
            weekend_ratio     = ('weekend_ratio','mean'),
            night_ratio       = ('night_ratio','mean'),
            avg_transaction   = ('avg_transaction','mean'),
            transaction_count = ('transaction_count','mean'),
        ).T.round(3)
        st.dataframe(persona_stats.style.background_gradient(cmap='RdYlGn_r', axis=1),
                     use_container_width=True)

        st.markdown("**🏷️ Deskripsi Persona:**")
        for p, color, desc in [
            ('🔴 Impulsive Spender', '#FFF1F2',
             'Impulse score tinggi. Sering belanja malam & weekend tanpa perencanaan.'),
            ('🟡 Emotional Spender', '#FFFBEB',
             'Belanja dipengaruhi mood. Inconsistent, pola belanja tidak teratur.'),
            ('🟢 Rational Spender', '#F0FDF4',
             'Pola terencana, impulse score rendah. Pengeluaran stabil dan terkontrol.'),
        ]:
            st.markdown(f'<div style="background:{color};border-radius:8px;padding:0.6rem 1rem;'
                        f'margin-bottom:0.4rem;font-size:0.88rem;">'
                        f'<strong>{p}</strong><br>{desc}</div>', unsafe_allow_html=True)

    st.divider()
    st.markdown("**🔎 Detail Profil User**")
    user_data = profiles[profiles['user_id'] == sel_user].iloc[0]
    persona = user_data['spending_persona']
    p_color = persona_colors.get(persona, '#374151')

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("👤 User", sel_user)
    with col2:
        st.metric("🎭 Persona", persona)
    with col3:
        st.metric("⚡ Impulse Score", f"{user_data['impulse_score']:.3f}")
    with col4:
        st.metric("💰 Total Spending", f"Rp {user_data['total_spending']:,.0f}")

    # Radar chart user
    user_tx = df[df['user_id'] == sel_user]
    if len(user_tx) > 0:
        user_cat = user_tx.groupby('category')['amount'].sum().reset_index()
        fig_radar = go.Figure(go.Scatterpolar(
            r=user_cat['amount'].tolist() + [user_cat['amount'].iloc[0]],
            theta=user_cat['category'].tolist() + [user_cat['category'].iloc[0]],
            fill='toself', fillcolor=f'rgba({",".join(str(int(int(p_color[1:3+i*2], 16))) for i in range(3))}, 0.2)',
            line_color=p_color, name=persona
        ))
        fig_radar.update_layout(
            polar=dict(radialaxis=dict(visible=True)),
            showlegend=True, height=380,
            margin=dict(l=10, r=10, t=30, b=10)
        )
        st.plotly_chart(fig_radar, use_container_width=True)


# ─────────────────────────────────────────────
# 8. PAGE: WEEKLY REFLECTION
# ─────────────────────────────────────────────
elif page == "📅 Weekly Reflection":
    st.title("📅 Weekly Reflection")
    st.caption("Laporan mingguan pola pengeluaran, anomali, dan rekomendasi")
    st.divider()

    # Pilih minggu
    weeks = sorted(df_filtered['week'].unique().tolist())
    sel_week = st.select_slider("📆 Pilih Minggu", options=weeks, value=weeks[-1])

    df_week     = df_filtered[df_filtered['week'] == sel_week]
    df_prev     = df_filtered[df_filtered['week'] == max(sel_week - 1, weeks[0])]
    total_week  = df_week['amount'].sum()
    total_prev  = df_prev['amount'].sum()
    delta_pct   = ((total_week - total_prev) / total_prev * 100) if total_prev > 0 else 0

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("📅 Minggu ke-", f"{sel_week}")
    with col2:
        st.metric("💸 Total Minggu Ini", f"Rp {total_week/1e3:,.0f}rb",
                  delta=f"{delta_pct:+.1f}% vs minggu lalu")
    with col3:
        st.metric("🧾 Jumlah Transaksi", f"{len(df_week)}")
    with col4:
        st.metric("🌙 Transaksi Malam", f"{df_week['is_night'].sum()}",
                  delta=f"{df_week['is_night'].mean()*100:.0f}% dari total")

    st.divider()
    col_a, col_b = st.columns(2)

    with col_a:
        st.markdown("**Pengeluaran per Kategori Minggu Ini**")
        wk_cat = df_week.groupby('category')['amount'].sum().reset_index().sort_values('amount', ascending=False)
        fig = px.bar(wk_cat, x='category', y='amount',
                     color='amount', color_continuous_scale='Blues',
                     labels={'amount':'Total (Rp)','category':''})
        fig.update_layout(height=320, coloraxis_showscale=False,
                          xaxis_tickangle=-20, margin=dict(l=0,r=0,t=5,b=0),
                          plot_bgcolor='white', paper_bgcolor='white')
        st.plotly_chart(fig, use_container_width=True)

    with col_b:
        st.markdown("**Tren Harian Minggu Ini**")
        daily = df_week.groupby(df_week['date'].dt.date)['amount'].sum().reset_index()
        daily.columns = ['date','total']
        fig2 = px.area(daily, x='date', y='total',
                       labels={'total':'Total (Rp)','date':''},
                       color_discrete_sequence=['#2563EB'])
        fig2.update_layout(height=320, margin=dict(l=0,r=0,t=5,b=0),
                           plot_bgcolor='white', paper_bgcolor='white')
        st.plotly_chart(fig2, use_container_width=True)

    st.divider()
    st.markdown("### 💡 Insight & Rekomendasi Minggu Ini")

    # Auto-generate insights
    if len(df_week) > 0:
        top_cat    = wk_cat.iloc[0]['category'] if len(wk_cat) > 0 else '-'
        top_amount = wk_cat.iloc[0]['amount']   if len(wk_cat) > 0 else 0
        night_cnt  = df_week['is_night'].sum()
        weekend_cnt = df_week['is_weekend'].sum()
        small_txn  = (df_week['amount'] <= df_week['amount'].median()).sum()

        insights = [
            (f"📌 Kategori <strong>{top_cat}</strong> menjadi pengeluaran terbesar minggu ini "
             f"sebesar Rp {top_amount:,.0f}.", "insight-box"),
            (f"🌙 Terdapat <strong>{night_cnt} transaksi malam</strong> ({night_cnt/max(len(df_week),1)*100:.0f}% dari total minggu ini). "
             f"Transaksi malam cenderung lebih impulsif — pertimbangkan untuk membuat batas pengeluaran malam.",
             "warning-box" if night_cnt > 5 else "insight-box"),
            (f"📅 <strong>{weekend_cnt} transaksi</strong> terjadi di weekend — "
             f"pastikan sudah direncanakan untuk menghindari pembelian spontan.", "insight-box"),
            (f"💧 <strong>{small_txn} transaksi kecil</strong> (≤ median) tercatat minggu ini. "
             f"Meski kecil, akumulasinya mencapai Rp {df_week[df_week['amount'] <= df_week['amount'].median()]['amount'].sum():,.0f}.",
             "leak-box"),
        ]

        for text, style in insights:
            st.markdown(f'<div class="{style}">{text}</div>', unsafe_allow_html=True)

        # Rekomendasi
        st.markdown("### 📋 Rekomendasi")
        recs = [
            f"1. **Batasi pengeluaran {top_cat}** minggu depan — coba alokasikan maksimal Rp {top_amount*0.8:,.0f} (penghematan 20%).",
            f"2. **Hindari belanja malam impulsif** — aktifkan reminder di jam 20:00 sebelum membuka e-commerce.",
            f"3. **Catat tujuan setiap transaksi kecil** — sub-kategori dengan frekuensi tinggi perlu diperhatikan.",
            f"4. **Bandingkan dengan minggu lalu** — pengeluaran {'naik' if delta_pct > 0 else 'turun'} {abs(delta_pct):.1f}%. {'Perlu penghematan!' if delta_pct > 10 else 'Sudah cukup terkontrol.'}",
        ]
        for r in recs:
            st.markdown(r)
    else:
        st.info("Tidak ada data untuk minggu yang dipilih.")


# ─────────────────────────────────────────────
# FOOTER
# ─────────────────────────────────────────────
st.divider()
st.caption("💸 SpendBehavior Analyzer | Coding Camp 2026 powered by DBS Foundation | Tim CC26-PSU268")
