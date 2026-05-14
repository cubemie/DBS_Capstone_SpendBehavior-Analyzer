import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from scipy import stats
from datetime import datetime, timedelta

# ==========================================
# KONFIGURASI HALAMAN
# ==========================================
st.set_page_config(
    page_title="BUDU — SpendBehavior Analyzer",
    page_icon="💸",
    layout="wide"
)

# Custom CSS untuk gaya seperti dashboard HTML
st.markdown("""
    <style>
    .main { background-color: #f8f9fc; }
    .stMetric { background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid #e0e0e0; }
    .css-1r6slb0 { border-radius: 10px; }
    </style>
    """, unsafe_allow_html=True)

# ==========================================
# FUNGSI PENJANAAN DATA (Sama seperti Notebook)
# ==========================================
@st.cache_data
def load_data():
    np.random.seed(42)
    num_users = 1000
    
    # 1. Data User
    segments = ['E', 'D', 'C', 'B', 'A']
    weights = [0.15, 0.25, 0.35, 0.18, 0.07]
    user_list = []
    for i in range(num_users):
        seg = np.random.choice(segments, p=weights)
        user_list.append({
            'user_id': i + 1,
            'segment': seg,
            'age': np.random.randint(18, 60),
            'gender': np.random.choice(['Laki-laki', 'Perempuan']),
            'city_tier': np.random.choice(['Metropolitan', 'Kota Besar', 'Kota Kecil', 'Desa'], p=[0.2, 0.4, 0.25, 0.15])
        })
    df_users = pd.DataFrame(user_list)

    # 2. Data Transaksi (Simulasi 12 Bulan)
    categories = ['Makanan & Minuman', 'Belanja Online', 'Sembako', 'Fashion', 'Transportasi', 'Hiburan', 'Kesehatan', 'Pulsa & Data', 'Elektronik', 'Travel & Hotel']
    cat_weights = [0.25, 0.18, 0.15, 0.10, 0.10, 0.08, 0.06, 0.05, 0.02, 0.01]
    
    tx_list = []
    start_date = datetime(2025, 1, 1)
    for i in range(5000): # Sample 5000 untuk kelajuan dashboard
        u_id = np.random.randint(1, 1001)
        date = start_date + timedelta(days=np.random.randint(0, 365))
        cat = np.random.choice(categories, p=cat_weights)
        amount = np.random.randint(20, 500) * 1000
        if date.weekday() >= 5: amount *= 1.3 # Weekend lebih mahal
        
        tx_list.append({
            'user_id': u_id,
            'date': date,
            'category': cat,
            'amount': amount,
            'is_weekend': 1 if date.weekday() >= 5 else 0,
            'month': date.strftime('%b')
        })
    df_tx = pd.DataFrame(tx_list)
    
    return df_users, df_tx

df_users, df_tx = load_data()

# ==========================================
# HEADER
# ==========================================
st.title("💸 BUDU — SpendBehavior Analyzer")
st.caption("Coding Camp 2026 · DBS Foundation · Tim CC26-PSU268")
st.divider()

# ==========================================
# SIDEBAR NAVIGATION
# ==========================================
menu = st.sidebar.radio("Navigasi", ["Overview", "EDA & Business Q", "A/B Testing", "Clustering & Persona"])

# ==========================================
# TAB 1: OVERVIEW
# ==========================================
if menu == "Overview":
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total User", "1,000", "5 Segmen")
    col2.metric("Total Transaksi", "~5,000", "Simulasi")
    col3.metric("Fitur Dihasilkan", "22+", "Level User")
    col4.metric("Impulsive Spender", "42%", "Score ≥ 0.55", delta_color="inverse")

    st.subheader("📊 Distribusi Demografi")
    c1, c2 = st.columns(2)
    
    with c1:
        fig_seg = px.pie(df_users, names='segment', title='Segmen Sosio-Ekonomi', 
                         color_discrete_sequence=px.colors.qualitative.Pastel)
        st.plotly_chart(fig_seg, use_container_width=True)
        
    with c2:
        fig_city = px.pie(df_users, names='city_tier', title='Distribusi Tier Kota', hole=0.4)
        st.plotly_chart(fig_city, use_container_width=True)

    st.subheader("🏷️ Top Kategori Pengeluaran (IDR)")
    cat_spend = df_tx.groupby('category')['amount'].sum().sort_values(ascending=False).reset_index()
    fig_cat = px.bar(cat_spend, x='category', y='amount', color='category', text_auto='.2s')
    st.plotly_chart(fig_cat, use_container_width=True)

# ==========================================
# TAB 2: EDA & BUSINESS Q
# ==========================================
elif menu == "EDA & Business Q":
    st.header("🔍 6 Business Questions SMART")
    
    with st.expander("Q1: Money Leak (Kategori Utama)", expanded=True):
        st.write("Kategori apa yang menyumbang ≥30% pengeluaran?")
        st.info("Makanan & Minuman + Belanja Online menyumbang lebih dari 40% total spending.")

    with st.expander("Q2: Weekend Spending Pattern"):
        st.write("Apakah rata-rata weekend ≥20% lebih tinggi?")
        avg_w = df_tx.groupby('is_weekend')['amount'].mean()
        diff = (avg_w[1] - avg_w[0]) / avg_w[0] * 100
        st.success(f"Weekend: Rp {avg_w[1]:,.0f} | Weekday: Rp {avg_w[0]:,.0f} (Beza: {diff:.1f}%)")

    st.subheader("📈 Tren Pengeluaran Bulanan")
    order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthly = df_tx.groupby('month')['amount'].sum().reindex(order).reset_index()
    fig_trend = px.line(monthly, x='month', y='amount', markers=True, title="Total Spending per Bulan")
    st.plotly_chart(fig_trend, use_container_width=True)

# ==========================================
# TAB 3: A/B TESTING
# ==========================================
elif menu == "A/B Testing":
    st.header("🧪 A/B Test: Weekend vs Weekday")
    
    group_w = df_tx[df_tx['is_weekend'] == 1]['amount']
    group_wd = df_tx[df_tx['is_weekend'] == 0]['amount']
    
    t_stat, p_val = stats.ttest_ind(group_w, group_wd)
    
    col1, col2 = st.columns(2)
    with col1:
        st.metric("P-Value", f"{p_val:.4f}")
        if p_val < 0.05:
            st.success("Signifikan: Pola belanja Weekend memang berbeza.")
        else:
            st.warning("Tidak Signifikan.")
            
    with col2:
        fig_box = px.box(df_tx, x='is_weekend', y='amount', color='is_weekend',
                         points="all", title="Distribusi Nilai Transaksi")
        st.plotly_chart(fig_box, use_container_width=True)

# ==========================================
# TAB 4: CLUSTERING & PERSONA
# ==========================================
elif menu == "Clustering & Persona":
    st.header("👥 Spending Persona (K-Means)")
    
    # Simulasi hasil clustering
    personas = {
        'Conservative Saver': [28, '#10b981', 'Hemat, jarang impulsive'],
        'Balanced Spender': [30, '#2563eb', 'Terencana, stabil'],
        'Active Consumer': [24, '#f59e0b', 'Lifestyle-oriented, urban'],
        'Impulsive Spender': [18, '#ef4444', 'High impulse, malam & weekend']
    }
    
    cols = st.columns(4)
    for i, (name, val) in enumerate(personas.items()):
        with cols[i]:
            st.markdown(f"""
                <div style="background:{val[1]}22; padding:20px; border-radius:10px; border-left: 5px solid {val[1]}">
                    <h4 style="color:{val[1]}">{name}</h4>
                    <p><b>{val[0]}%</b> User</p>
                    <small>{val[2]}</small>
                </div>
            """, unsafe_allow_html=True)
            
    st.divider()
    
    # Scatter plot simulasi
    st.subheader("Visualisasi Kluster (Simulasi Income vs Spending)")
    df_users['spending_sim'] = np.random.randint(1, 100, 1000)
    df_users['persona_sim'] = np.random.choice(list(personas.keys()), 1000)
    
    fig_scatter = px.scatter(df_users, x='age', y='spending_sim', color='persona_sim',
                             title="Persona Distribution by Age",
                             color_discrete_map={k: v[1] for k, v in personas.items()})
    st.plotly_chart(fig_scatter, use_container_width=True)