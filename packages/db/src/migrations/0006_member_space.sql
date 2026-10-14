CREATE TABLE "caught_pokemon" (
	"user_id" text NOT NULL,
	"pokemon_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "caught_pokemon_user_id_pokemon_id_pk" PRIMARY KEY("user_id","pokemon_id")
);
--> statement-breakpoint
CREATE TABLE "favorite_pokemon" (
	"user_id" text NOT NULL,
	"pokemon_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_pokemon_user_id_pokemon_id_pk" PRIMARY KEY("user_id","pokemon_id")
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"generation_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_member" (
	"team_id" text NOT NULL,
	"slot" integer NOT NULL,
	"pokemon_id" integer NOT NULL,
	CONSTRAINT "team_member_team_id_slot_pk" PRIMARY KEY("team_id","slot")
);
--> statement-breakpoint
ALTER TABLE "caught_pokemon" ADD CONSTRAINT "caught_pokemon_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_pokemon" ADD CONSTRAINT "favorite_pokemon_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "team_user_idx" ON "team" USING btree ("user_id");