UPDATE "categories"
SET "ml_key" = CASE "slug"
  WHEN 'makanan-and-minuman' THEN 'cat_makanan_minuman_ratio'
  WHEN 'transportasi' THEN 'cat_transportasi_ratio'
  WHEN 'kesehatan-and-kecantikan' THEN 'cat_kesehatan_kecantik_ratio'
  WHEN 'sembako-and-kebutuhan-pokok' THEN 'cat_sembako_kebutuhan__ratio'
  WHEN 'kesehatan' THEN 'cat_kesehatan_ratio'
  WHEN 'pendidikan' THEN 'cat_pendidikan_ratio'
  WHEN 'belanja-online' THEN 'cat_belanja_online_ratio'
  WHEN 'pulsa-and-data' THEN 'cat_pulsa_data_ratio'
  WHEN 'hiburan' THEN 'cat_hiburan_ratio'
  WHEN 'fashion-and-pakaian' THEN 'cat_fashion_pakaian_ratio'
  ELSE "ml_key"
END
WHERE "user_id" IS NULL
  AND "kind" = 'expense'
  AND "slug" IN (
    'makanan-and-minuman',
    'transportasi',
    'kesehatan-and-kecantikan',
    'sembako-and-kebutuhan-pokok',
    'kesehatan',
    'pendidikan',
    'belanja-online',
    'pulsa-and-data',
    'hiburan',
    'fashion-and-pakaian'
  );
