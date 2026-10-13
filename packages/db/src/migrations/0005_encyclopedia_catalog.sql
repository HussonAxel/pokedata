CREATE TABLE "berry" (
	"id" integer PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"firmness" text,
	"natural_gift_power" integer,
	"natural_gift_type_id" integer,
	"size" integer,
	"max_harvest" integer,
	"growth_time" integer,
	"soil_dryness" integer,
	"smoothness" integer
);
--> statement-breakpoint
CREATE TABLE "berry_flavor" (
	"berry_id" integer NOT NULL,
	"flavor" text NOT NULL,
	"potency" integer NOT NULL,
	CONSTRAINT "berry_flavor_berry_id_flavor_pk" PRIMARY KEY("berry_id","flavor")
);
--> statement-breakpoint
CREATE TABLE "item_category" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"pocket_id" integer
);
--> statement-breakpoint
CREATE TABLE "item_category_name" (
	"category_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "item_category_name_category_id_language_pk" PRIMARY KEY("category_id","language")
);
--> statement-breakpoint
CREATE TABLE "item_flavor_text" (
	"item_id" integer NOT NULL,
	"language" text NOT NULL,
	"version_group_id" integer NOT NULL,
	"flavor_text" text NOT NULL,
	CONSTRAINT "item_flavor_text_item_id_language_version_group_id_pk" PRIMARY KEY("item_id","language","version_group_id")
);
--> statement-breakpoint
CREATE TABLE "move_flavor_text" (
	"move_id" integer NOT NULL,
	"language" text NOT NULL,
	"version_group_id" integer NOT NULL,
	"flavor_text" text NOT NULL,
	CONSTRAINT "move_flavor_text_move_id_language_version_group_id_pk" PRIMARY KEY("move_id","language","version_group_id")
);
--> statement-breakpoint
ALTER TABLE "item" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "item" ADD COLUMN "cost" integer;--> statement-breakpoint
ALTER TABLE "move" ADD COLUMN "damage_class" text;--> statement-breakpoint
ALTER TABLE "berry" ADD CONSTRAINT "berry_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "berry" ADD CONSTRAINT "berry_natural_gift_type_id_type_id_fk" FOREIGN KEY ("natural_gift_type_id") REFERENCES "public"."type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "berry_flavor" ADD CONSTRAINT "berry_flavor_berry_id_berry_id_fk" FOREIGN KEY ("berry_id") REFERENCES "public"."berry"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_category_name" ADD CONSTRAINT "item_category_name_category_id_item_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."item_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_flavor_text" ADD CONSTRAINT "item_flavor_text_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_flavor_text" ADD CONSTRAINT "item_flavor_text_version_group_id_version_group_id_fk" FOREIGN KEY ("version_group_id") REFERENCES "public"."version_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_flavor_text" ADD CONSTRAINT "move_flavor_text_move_id_move_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."move"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_flavor_text" ADD CONSTRAINT "move_flavor_text_version_group_id_version_group_id_fk" FOREIGN KEY ("version_group_id") REFERENCES "public"."version_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_category_id_item_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."item_category"("id") ON DELETE no action ON UPDATE no action;