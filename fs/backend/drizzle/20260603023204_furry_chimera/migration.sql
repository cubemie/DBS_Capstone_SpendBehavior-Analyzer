CREATE TABLE "prediction_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"period_from" timestamp with time zone,
	"period_to" timestamp with time zone,
	"timezone" text NOT NULL,
	"persona" text NOT NULL,
	"confidence" double precision NOT NULL,
	"probabilities" jsonb NOT NULL,
	"warnings" jsonb NOT NULL,
	"feature_order" text[] NOT NULL,
	"features" jsonb NOT NULL,
	"feature_vector_hash" text NOT NULL,
	"transaction_count" integer NOT NULL,
	"ml_response" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "prediction_results_user_created_idx" ON "prediction_results" ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "prediction_results_user_feature_hash_idx" ON "prediction_results" ("user_id","feature_vector_hash");--> statement-breakpoint
ALTER TABLE "prediction_results" ADD CONSTRAINT "prediction_results_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;