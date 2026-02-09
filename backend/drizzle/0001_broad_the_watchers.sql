ALTER TABLE "expenses" ADD COLUMN "is_fixed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "fixed_template_id" uuid;