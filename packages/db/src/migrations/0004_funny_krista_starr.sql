CREATE TABLE "item" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_name" (
	"item_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "item_name_item_id_language_pk" PRIMARY KEY("item_id","language")
);
--> statement-breakpoint
ALTER TABLE "item_name" ADD CONSTRAINT "item_name_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE no action ON UPDATE no action;