def generate_smart_warnings(user_data):
    
    # Logika berdasarkan temuan EDA:
    # - night_ratio > 0.3
    # - std_amount > 2x average
    
    warnings = []
    
    if user_data['night_ratio'] > 0.3:
        warnings.append("⚠️ Pola belanja malam hari terdeteksi tinggi. Potensi belanja impulsif!")
        
    if user_data['std_amount'] > (2 * user_data['avg_amount']):
        warnings.append("⚠️ Fluktuasi nominal belanja sangat tinggi. Coba tinjau kembali kebutuhan utama Anda.")
        
    return warnings

def detect_money_leak(small_transactions):
    # """
    # Mendeteksi akumulasi pengeluaran kecil (di bawah 50rb) yang berulang.
    # """
    threshold = 50000
    leak_count = sum(1 for tx in small_transactions if tx < threshold)
    total_leak = sum(tx for tx in small_transactions if tx < threshold)
    
    if leak_count > 10: # Contoh: lebih dari 10 transaksi kecil sebulan
        return {
            "status": "Leak Detected",
            "count": leak_count,
            "total_nominal": total_leak,
            "message": "Bocor halus terdeteksi dari transaksi kecil yang sering dilakukan."
        }
    return {"status": "Safe"}