CREATE TABLE "generation" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pokemon" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"species_id" integer NOT NULL,
	"height" integer,
	"weight" integer,
	"base_experience" integer,
	"is_default" boolean NOT NULL,
	"order" integer
);
--> statement-breakpoint
CREATE TABLE "pokemon_form" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"form_identifier" text,
	"pokemon_id" integer NOT NULL,
	"introduced_in_version_group_id" integer,
	"is_default" boolean NOT NULL,
	"is_battle_only" boolean NOT NULL,
	"is_mega" boolean NOT NULL,
	"form_order" integer,
	"order" integer
);
--> statement-breakpoint
CREATE TABLE "pokemon_stat" (
	"pokemon_id" integer NOT NULL,
	"generation_id" integer NOT NULL,
	"stat_id" integer NOT NULL,
	"base_stat" integer NOT NULL,
	"effort" integer NOT NULL,
	CONSTRAINT "pokemon_stat_pokemon_id_generation_id_stat_id_pk" PRIMARY KEY("pokemon_id","generation_id","stat_id")
);
--> statement-breakpoint
CREATE TABLE "pokemon_type" (
	"pokemon_id" integer NOT NULL,
	"generation_id" integer NOT NULL,
	"slot" integer NOT NULL,
	"type_id" integer NOT NULL,
	CONSTRAINT "pokemon_type_pokemon_id_generation_id_slot_pk" PRIMARY KEY("pokemon_id","generation_id","slot")
);
--> statement-breakpoint
CREATE TABLE "species" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"generation_id" integer NOT NULL,
	"evolves_from_species_id" integer,
	"evolution_chain_id" integer,
	"gender_rate" integer NOT NULL,
	"capture_rate" integer NOT NULL,
	"base_happiness" integer,
	"hatch_counter" integer,
	"is_baby" boolean NOT NULL,
	"is_legendary" boolean NOT NULL,
	"is_mythical" boolean NOT NULL,
	"has_gender_differences" boolean NOT NULL,
	"order" integer
);
--> statement-breakpoint
CREATE TABLE "species_name" (
	"species_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	"genus" text,
	CONSTRAINT "species_name_species_id_language_pk" PRIMARY KEY("species_id","language")
);
--> statement-breakpoint
CREATE TABLE "stat" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"is_battle_only" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "type" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"generation_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "type_efficacy" (
	"generation_id" integer NOT NULL,
	"damage_type_id" integer NOT NULL,
	"target_type_id" integer NOT NULL,
	"factor" integer NOT NULL,
	CONSTRAINT "type_efficacy_generation_id_damage_type_id_target_type_id_pk" PRIMARY KEY("generation_id","damage_type_id","target_type_id")
);
--> statement-breakpoint
CREATE TABLE "type_name" (
	"type_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "type_name_type_id_language_pk" PRIMARY KEY("type_id","language")
);
--> statement-breakpoint
CREATE TABLE "version" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"version_group_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "version_group" (
	"id" integer PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"generation_id" integer NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pokemon" ADD CONSTRAINT "pokemon_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_form" ADD CONSTRAINT "pokemon_form_pokemon_id_pokemon_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_form" ADD CONSTRAINT "pokemon_form_introduced_in_version_group_id_version_group_id_fk" FOREIGN KEY ("introduced_in_version_group_id") REFERENCES "public"."version_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_stat" ADD CONSTRAINT "pokemon_stat_pokemon_id_pokemon_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_stat" ADD CONSTRAINT "pokemon_stat_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_stat" ADD CONSTRAINT "pokemon_stat_stat_id_stat_id_fk" FOREIGN KEY ("stat_id") REFERENCES "public"."stat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_type" ADD CONSTRAINT "pokemon_type_pokemon_id_pokemon_id_fk" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_type" ADD CONSTRAINT "pokemon_type_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_type" ADD CONSTRAINT "pokemon_type_type_id_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "species_name" ADD CONSTRAINT "species_name_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "type" ADD CONSTRAINT "type_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "type_efficacy" ADD CONSTRAINT "type_efficacy_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "type_efficacy" ADD CONSTRAINT "type_efficacy_damage_type_id_type_id_fk" FOREIGN KEY ("damage_type_id") REFERENCES "public"."type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "type_efficacy" ADD CONSTRAINT "type_efficacy_target_type_id_type_id_fk" FOREIGN KEY ("target_type_id") REFERENCES "public"."type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "type_name" ADD CONSTRAINT "type_name_type_id_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "version" ADD CONSTRAINT "version_version_group_id_version_group_id_fk" FOREIGN KEY ("version_group_id") REFERENCES "public"."version_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "version_group" ADD CONSTRAINT "version_group_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pokemon_species_idx" ON "pokemon" USING btree ("species_id");--> statement-breakpoint
CREATE INDEX "pokemon_form_pokemon_idx" ON "pokemon_form" USING btree ("pokemon_id");--> statement-breakpoint
CREATE INDEX "pokemon_stat_lookup_idx" ON "pokemon_stat" USING btree ("generation_id","stat_id","base_stat");--> statement-breakpoint
CREATE INDEX "pokemon_type_lookup_idx" ON "pokemon_type" USING btree ("generation_id","type_id");--> statement-breakpoint
CREATE INDEX "species_generation_idx" ON "species" USING btree ("generation_id");--> statement-breakpoint
CREATE INDEX "species_evolution_chain_idx" ON "species" USING btree ("evolution_chain_id");--> statement-breakpoint
CREATE INDEX "species_name_name_idx" ON "species_name" USING btree ("name");--> statement-breakpoint
CREATE INDEX "version_version_group_idx" ON "version" USING btree ("version_group_id");--> statement-breakpoint
CREATE INDEX "version_group_generation_idx" ON "version_group" USING btree ("generation_id");