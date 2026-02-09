DO $$ BEGIN
 CREATE TYPE "split_type" AS ENUM('default', 'custom', 'payer_only');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"paid_by" varchar(50) NOT NULL,
	"category" varchar(50),
	"split_type" "split_type" DEFAULT 'default' NOT NULL,
	"custom_percentage" integer,
	"is_installment" boolean DEFAULT false NOT NULL,
	"total_installments" integer,
	"installment_payer" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "installment_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expense_id" uuid NOT NULL,
	"installment_number" integer NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_person" varchar(50) NOT NULL,
	"to_person" varchar(50) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"person1_name" varchar(50) DEFAULT 'Persona 1' NOT NULL,
	"person2_name" varchar(50) DEFAULT 'Persona 2' NOT NULL,
	"person1_percentage" integer DEFAULT 50 NOT NULL,
	"pin_hash" varchar(255) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "installment_payments" ADD CONSTRAINT "installment_payments_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
