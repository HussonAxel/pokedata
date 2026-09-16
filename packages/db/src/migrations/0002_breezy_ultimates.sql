CREATE TABLE "ability" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"generation_id" integer
);
--> statement-breakpoint
CREATE TABLE "ability_name" (
	"ability_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "ability_name_ability_id_language_pk" PRIMARY KEY("ability_id","language")
);
--> statement-breakpoint
CREATE TABLE "egg_group" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "egg_group_name" (
	"egg_group_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "egg_group_name_egg_group_id_language_pk" PRIMARY KEY("egg_group_id","language")
);
--> statement-breakpoint
CREATE TABLE "encounter" (
	"id" integer PRIMARY KEY NOT NULL,
	"pokemon_id" integer NOT NULL,
	"location_area_id" integer NOT NULL,
	"version_id" integer NOT NULL,
	"min_level" integer NOT NULL,
	"max_level" integer NOT NULL,
	"method_id" integer,
	"rarity" integer
);
--> statement-breakpoint
CREATE TABLE "evolution_trigger_name" (
	"trigger_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "evolution_trigger_name_trigger_id_language_pk" PRIMARY KEY("trigger_id","language")
);
--> statement-breakpoint
CREATE TABLE "location" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "location_area" (
	"id" integer PRIMARY KEY NOT NULL,
	"location_id" integer NOT NULL,
	"identifier" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "location_name" (
	"location_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "location_name_location_id_language_pk" PRIMARY KEY("location_id","language")
);
--> statement-breakpoint
CREATE TABLE "move" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"generation_id" integer,
	"type_id" integer,
	"power" integer,
	"pp" integer,
	"accuracy" integer,
	"priority" integer,
	"effect_chance" integer
);
--> statement-breakpoint
CREATE TABLE "move_name" (
	"move_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "move_name_move_id_language_pk" PRIMARY KEY("move_id","language")
);
--> statement-breakpoint
CREATE TABLE "pokemon_ability" (
	"pokemon_id" integer NOT NULL,
	"ability_id" integer NOT NULL,
	"slot" integer NOT NULL,
	"is_hidden" boolean NOT NULL,
	CONSTRAINT "pokemon_ability_pokemon_id_ability_id_pk" PRIMARY KEY("pokemon_id","ability_id")
);
--> statement-breakpoint
CREATE TABLE "pokemon_egg_group" (
	"species_id" integer NOT NULL,
	"egg_group_id" integer NOT NULL,
	CONSTRAINT "pokemon_egg_group_species_id_egg_group_id_pk" PRIMARY KEY("species_id","egg_group_id")
);
--> statement-breakpoint
CREATE TABLE "pokemon_evolution" (
	"id" integer PRIMARY KEY NOT NULL,
	"evolved_species_id" integer NOT NULL,
	"trigger_id" integer,
	"version_group_id" integer,
	"minimum_level" integer,
	"minimum_happiness" integer,
	"minimum_beauty" integer,
	"minimum_affection" integer,
	"time_of_day" text,
	"location_id" integer,
	"trigger_item_id" integer,
	"held_item_id" integer,
	"known_move_id" integer,
	"known_move_type_id" integer,
	"trade_species_id" integer,
	"relative_physical_stats" integer,
	"needs_overworld_rain" boolean NOT NULL,
	"turn_upside_down" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pokemon_move" (
	"pokemon_id" integer NOT NULL,
	"version_group_id" integer NOT NULL,
	"move_id" integer NOT NULL,
	"method_id" integer NOT NULL,
	"level" integer NOT NULL,
	"order" integer,
	CONSTRAINT "pokemon_move_pokemon_id_version_group_id_move_id_method_id_pk" PRIMARY KEY("pokemon_id","version_group_id","move_id","method_id")
);
--> statement-breakpoint
CREATE TABLE "species_flavor_text" (
	"species_id" integer NOT NULL,
	"version_id" integer NOT NULL,
	"language" text NOT NULL,
	"flavor_text" text NOT NULL,
	CONSTRAINT "species_flavor_text_species_id_version_id_language_pk" PRIMARY KEY("species_id","version_id","language")
);
--> statement-breakpoint
ALTER TABLE "ability" ADD CONSTRAINT "ability_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ability_name" ADD CONSTRAINT "ability_name_ability_id_ability_id_fk" FOREIGN KEY ("ability_id") REFERENCES "public"."ability"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "egg_group_name" ADD CONSTRAINT "egg_group_name_egg_group_id_egg_group_id_fk" FOREIGN KEY ("egg_group_id") REFERENCES "public"."egg_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter" ADD CONSTRAINT "encounter_pokemon_id_pokemon_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter" ADD CONSTRAINT "encounter_location_area_id_location_area_id_fk" FOREIGN KEY ("location_area_id") REFERENCES "public"."location_area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter" ADD CONSTRAINT "encounter_version_id_version_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."version"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_area" ADD CONSTRAINT "location_area_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_name" ADD CONSTRAINT "location_name_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move" ADD CONSTRAINT "move_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move" ADD CONSTRAINT "move_type_id_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_name" ADD CONSTRAINT "move_name_move_id_move_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."move"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_ability" ADD CONSTRAINT "pokemon_ability_pokemon_id_pokemon_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_ability" ADD CONSTRAINT "pokemon_ability_ability_id_ability_id_fk" FOREIGN KEY ("ability_id") REFERENCES "public"."ability"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_egg_group" ADD CONSTRAINT "pokemon_egg_group_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_egg_group" ADD CONSTRAINT "pokemon_egg_group_egg_group_id_egg_group_id_fk" FOREIGN KEY ("egg_group_id") REFERENCES "public"."egg_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_evolution" ADD CONSTRAINT "pokemon_evolution_evolved_species_id_species_id_fk" FOREIGN KEY ("evolved_species_id") REFERENCES "public"."species"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_evolution" ADD CONSTRAINT "pokemon_evolution_version_group_id_version_group_id_fk" FOREIGN KEY ("version_group_id") REFERENCES "public"."version_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_move" ADD CONSTRAINT "pokemon_move_pokemon_id_pokemon_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_move" ADD CONSTRAINT "pokemon_move_version_group_id_version_group_id_fk" FOREIGN KEY ("version_group_id") REFERENCES "public"."version_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_move" ADD CONSTRAINT "pokemon_move_move_id_move_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."move"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "species_flavor_text" ADD CONSTRAINT "species_flavor_text_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "species_flavor_text" ADD CONSTRAINT "species_flavor_text_version_id_version_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."version"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "encounter_pokemon_idx" ON "encounter" USING btree ("pokemon_id");