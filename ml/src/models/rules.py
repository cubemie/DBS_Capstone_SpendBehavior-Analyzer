import pandas as pd

def detect_money_leaks(transactions_df: pd.DataFrame, user_id: str):
    user_txns = transactions_df[transactions_df['user_id'] == user_id]
    micro_txns = user_txns[user_txns['amount'] < 100000]
    
    leak_summary = micro_txns.groupby('category').agg(
        txn_count=('txn_id', 'count'),
        total_amount=('amount', 'sum')
    ).reset_index()
    
    # Rule: Transaksi >= 10 kali dan total > Rp 500.000
    leaks = leak_summary[(leak_summary['txn_count'] >= 10) & (leak_summary['total_amount'] > 500000)]
    return leaks.to_dict('records')

def detect_behavior_patterns(profile: dict):
    warnings = []
    if profile.get('weekend_ratio', 0) > 0.4:
        warnings.append("Pola terdeteksi: Pengeluaran akhir pekan sangat tinggi (>40%).")
    if profile.get('night_ratio', 0) > 0.3:
        warnings.append("Pola terdeteksi: Aktivitas transaksi malam hari dominan.")
    if profile.get('impulse_score', 0) > 0.25:
        warnings.append("Peringatan: Tingkat pengeluaran impulsif melewati ambang batas aman.")
    if profile.get('spending_cov', 0) > 0.8:
        warnings.append("Peringatan: Fluktuasi nominal transaksi tidak stabil (High Variability).")
    
    return warnings