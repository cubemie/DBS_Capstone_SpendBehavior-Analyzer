# TODO — SpendBehavior Analyzer

## Completed
- ✅ Updated `dashboard_app.py` to load real data from `transactions_clean.csv` and `user_profiles.csv` (instead of synthetic generation).

## Pending
- ⏳ Ensure persona tab PCA plotting is consistent with the current `user_profiles.csv` schema (we recompute `pca_x/pca_y` on load if missing).
- ⏳ Optional: replace `use_container_width` with `width='stretch'` for Streamlit v1.40+ compatibility.
- ⏳ Run/verify: `python -m streamlit run dashboard_app.py` and check each page renders without errors.

