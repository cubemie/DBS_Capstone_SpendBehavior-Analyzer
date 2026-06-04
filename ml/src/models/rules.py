import pandas as pd

MICRO_TRANSACTION_LIMIT = 100000
MIN_LEAK_TRANSACTION_COUNT = 10
MIN_LEAK_TOTAL_AMOUNT = 500000
DANGER_LEAK_TOTAL_AMOUNT = 1000000

SMART_WARNING_DEFINITIONS = {
    "weekend_spending_high": {
        "code": "weekend_spending_high",
        "title": "Pengeluaran Akhir Pekan Tinggi",
        "message": "Pola terdeteksi: Pengeluaran akhir pekan sangat tinggi (>40%).",
        "label": "Weekend",
        "severity": "warning",
    },
    "night_activity_high": {
        "code": "night_activity_high",
        "title": "Transaksi Malam Meningkat",
        "message": "Pola terdeteksi: Aktivitas transaksi malam hari dominan.",
        "label": "Malam",
        "severity": "warning",
    },
    "impulse_score_high": {
        "code": "impulse_score_high",
        "title": "Pola Impulsif Terdeteksi",
        "message": "Peringatan: Tingkat pengeluaran impulsif melewati ambang batas aman.",
        "label": "Impulsif",
        "severity": "danger",
    },
    "spending_variability_high": {
        "code": "spending_variability_high",
        "title": "Nominal Transaksi Tidak Stabil",
        "message": "Peringatan: Fluktuasi nominal transaksi tidak stabil (High Variability).",
        "label": "Variasi",
        "severity": "info",
    },
}


def _leak_severity(total_amount: float) -> str:
    return "danger" if total_amount >= DANGER_LEAK_TOTAL_AMOUNT else "warning"


def _smart_warning(code: str) -> dict:
    return SMART_WARNING_DEFINITIONS[code].copy()


def detect_money_leaks(transactions_df: pd.DataFrame):
    if transactions_df.empty:
        return []

    expense_txns = transactions_df[transactions_df["type"] == "expense"]
    micro_txns = expense_txns[expense_txns["amount"] < MICRO_TRANSACTION_LIMIT]

    if micro_txns.empty:
        return []

    leak_summary = micro_txns.groupby('category').agg(
        txn_count=('txn_id', 'count'),
        total_amount=('amount', 'sum'),
        category_id=('category_id', 'first'),
    ).reset_index()

    leaks = leak_summary[
        (leak_summary["txn_count"] >= MIN_LEAK_TRANSACTION_COUNT)
        & (leak_summary["total_amount"] > MIN_LEAK_TOTAL_AMOUNT)
    ].sort_values("total_amount", ascending=False)

    records = []
    for leak in leaks.to_dict("records"):
        total_amount = float(leak["total_amount"])
        records.append({
            "category_id": leak["category_id"],
            "category": leak["category"],
            "txn_count": int(leak["txn_count"]),
            "total_amount": total_amount,
            "severity": _leak_severity(total_amount),
        })

    return records

def detect_behavior_patterns(profile: dict):
    warnings = []
    if profile.get('weekend_ratio', 0) > 0.4:
        warnings.append(_smart_warning("weekend_spending_high"))
    if profile.get('night_ratio', 0) > 0.3:
        warnings.append(_smart_warning("night_activity_high"))
    if profile.get('impulse_score', 0) > 0.25:
        warnings.append(_smart_warning("impulse_score_high"))
    if profile.get('spending_cov', 0) > 0.8:
        warnings.append(_smart_warning("spending_variability_high"))
    
    return warnings
