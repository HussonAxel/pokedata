CREATE TABLE "ability_flavor_text" (
	"ability_id" integer NOT NULL,
	"language" text NOT NULL,
	"version_group_id" integer NOT NULL,
	"flavor_text" text NOT NULL,
	CONSTRAINT "ability_flavor_text_ability_id_language_version_group_id_pk" PRIMARY KEY("ability_id","language","version_group_id")
);
--> statement-breakpoint
ALTER TABLE "ability_flavor_text" ADD CONSTRAINT "ability_flavor_text_ability_id_ability_id_fk" FOREIGN KEY ("ability_id") REFERENCES "public"."ability"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ability_flavor_text" ADD CONSTRAINT "ability_flavor_text_version_group_id_version_group_id_fk" FOREIGN KEY ("version_group_id") REFERENCES "public"."version_group"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
-- Les installations déjà importées disposent des textes bruts en staging.
-- Une base neuve sera alimentée par ingest:transform.
DO $$
BEGIN
  IF to_regclass('staging.ability_flavor_text') IS NOT NULL THEN
    INSERT INTO ability_flavor_text (ability_id, language, version_group_id, flavor_text)
    SELECT f.ability_id::int, l.code, f.version_group_id::int,
      regexp_replace(trim(f.flavor_text), '[[:space:]]+', ' ', 'g')
    FROM staging.ability_flavor_text f
    JOIN (VALUES (5, 'fr'), (9, 'en')) l(id, code) ON l.id = f.language_id::int
    JOIN ability a ON a.id = f.ability_id::int
    JOIN version_group vg ON vg.id = f.version_group_id::int
    WHERE nullif(trim(f.flavor_text), '') IS NOT NULL;
  END IF;
END $$;
