CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"kind" text NOT NULL,
	"ml_key" text,
	"color" text,
	"icon" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "categories" ("name", "slug", "kind", "ml_key", "color", "icon", "is_system")
VALUES
	('Makanan & Minuman', 'makanan-and-minuman', 'expense', 'cat_makanan_minuman_ratio', '#EF4444', 'utensils', true),
	('Transportasi', 'transportasi', 'expense', 'cat_transportasi_ratio', '#3B82F6', 'car', true),
	('Belanja Online', 'belanja-online', 'expense', 'cat_belanja_online_ratio', '#A855F7', 'shopping-bag', true),
	('Fashion & Pakaian', 'fashion-and-pakaian', 'expense', 'cat_fashion_pakaian_ratio', '#EC4899', 'shirt', true),
	('Hiburan', 'hiburan', 'expense', 'cat_hiburan_ratio', '#F97316', 'film', true),
	('Kesehatan', 'kesehatan', 'expense', 'cat_kesehatan_ratio', '#10B981', 'heart-pulse', true),
	('Kesehatan & Kecantikan', 'kesehatan-and-kecantikan', 'expense', 'cat_kesehatan_kecantik_ratio', '#14B8A6', 'sparkles', true),
	('Pendidikan', 'pendidikan', 'expense', 'cat_pendidikan_ratio', '#6366F1', 'graduation-cap', true),
	('Pulsa & Data', 'pulsa-and-data', 'expense', 'cat_pulsa_data_ratio', '#06B6D4', 'smartphone', true),
	('Sembako & Kebutuhan Pokok', 'sembako-and-kebutuhan-pokok', 'expense', 'cat_sembako_kebutuhan__ratio', '#84CC16', 'shopping-cart', true),
	('Lainnya', 'lainnya', 'expense', null, '#64748B', 'circle-help', true),
	('Pemasukan', 'pemasukan', 'income', null, '#22C55E', 'wallet', true);
--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "amount" TO "amount_idr";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "merchant_name" DROP NOT NULL;--> statement-breakpoint
UPDATE "transactions"
SET
	"title" = coalesce(nullif("merchant_name", ''), nullif("category", ''), 'Transaksi'),
	"type" = 'expense',
	"amount_idr" = abs("amount_idr");
--> statement-breakpoint
UPDATE "transactions" AS "t"
SET "category_id" = "c"."id"
FROM "categories" AS "c"
WHERE "c"."user_id" IS NULL
	AND "c"."kind" = 'expense'
	AND lower("c"."name") = lower("t"."category");
--> statement-breakpoint
UPDATE "transactions" AS "t"
SET "category_id" = "c"."id"
FROM "categories" AS "c"
WHERE "c"."user_id" IS NULL
	AND "c"."kind" = 'expense'
	AND "c"."slug" = 'lainnya'
	AND "t"."category_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "category";--> statement-breakpoint
CREATE UNIQUE INDEX "categories_system_kind_slug_unique" ON "categories" ("kind","slug") WHERE "user_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_kind_slug_unique" ON "categories" ("user_id","kind","slug") WHERE "user_id" is not null;--> statement-breakpoint
CREATE INDEX "categories_user_kind_idx" ON "categories" ("user_id","kind");--> statement-breakpoint
CREATE INDEX "transactions_user_date_idx" ON "transactions" ("user_id","transaction_date");--> statement-breakpoint
CREATE INDEX "transactions_user_category_idx" ON "transactions" ("user_id","category_id");--> statement-breakpoint
CREATE INDEX "transactions_user_type_date_idx" ON "transactions" ("user_id","type","transaction_date");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id");--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_id_users_id_fkey", ADD CONSTRAINT "transactions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
