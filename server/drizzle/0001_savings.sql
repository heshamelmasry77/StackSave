CREATE TABLE "saving" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" numeric(18, 4) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"saved_at" timestamp with time zone NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saving" ADD CONSTRAINT "saving_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saving_user_saved_at_idx" ON "saving" USING btree ("user_id","saved_at");