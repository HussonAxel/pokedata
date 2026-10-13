import {
  berry,
  berryFlavor,
  item,
  itemCategory,
  itemCategoryName,
  itemName,
  type,
  typeName,
} from "@pokedata/db/schema/catalog";
import { and, asc, eq, isNull, ne, or } from "drizzle-orm";

import { detailInput, scopeInput } from "../catalog-input";
import { itemDescription } from "../flavor-text";
import { publicProcedure } from "../index";

const UNUSED_CATEGORY = "unused";

/** Objets traduits dans la langue consultée, par ordre alphabétique. */
const list = publicProcedure.input(scopeInput).handler(async ({ context, input }) => {
  const entries = await context.db
    .select({
      id: item.id,
      identifier: item.identifier,
      name: itemName.name,
      category: itemCategoryName.name,
    })
    .from(item)
    .innerJoin(itemName, and(eq(itemName.itemId, item.id), eq(itemName.language, input.locale)))
    .leftJoin(itemCategory, eq(itemCategory.id, item.categoryId))
    .leftJoin(
      itemCategoryName,
      and(
        eq(itemCategoryName.categoryId, item.categoryId),
        eq(itemCategoryName.language, input.locale),
      ),
    )
    // Données présentes dans les fichiers des jeux mais jamais obtenables.
    .where(or(isNull(itemCategory.identifier), ne(itemCategory.identifier, UNUSED_CATEGORY)))
    .orderBy(asc(itemName.name));

  return { generationId: input.generationId, entries };
});

const detail = publicProcedure.input(detailInput).handler(async ({ context, input }) => {
  const [entry] = await context.db
    .select({
      id: item.id,
      identifier: item.identifier,
      name: itemName.name,
      category: itemCategoryName.name,
      categoryIdentifier: itemCategory.identifier,
      cost: item.cost,
      description: itemDescription(item.id, input.locale, input.generationId),
      isBerry: berry.id,
    })
    .from(item)
    .innerJoin(itemName, and(eq(itemName.itemId, item.id), eq(itemName.language, input.locale)))
    .leftJoin(itemCategory, eq(itemCategory.id, item.categoryId))
    .leftJoin(
      itemCategoryName,
      and(
        eq(itemCategoryName.categoryId, item.categoryId),
        eq(itemCategoryName.language, input.locale),
      ),
    )
    .leftJoin(berry, eq(berry.itemId, item.id))
    .where(eq(item.identifier, input.identifier))
    .limit(1);

  if (!entry) return null;

  const { isBerry, ...rest } = entry;
  return { ...rest, isBerry: isBerry !== null };
});

export const itemsRouter = { list, detail };

/** Baies, dans l'ordre du jeu ; leur identifiant d'URL est celui de l'objet. */
const berryList = publicProcedure.input(scopeInput).handler(async ({ context, input }) => {
  const entries = await context.db
    .select({
      id: berry.id,
      identifier: item.identifier,
      name: itemName.name,
      firmness: berry.firmness,
      naturalGiftType: type.identifier,
    })
    .from(berry)
    .innerJoin(item, eq(item.id, berry.itemId))
    .innerJoin(itemName, and(eq(itemName.itemId, item.id), eq(itemName.language, input.locale)))
    .leftJoin(type, eq(type.id, berry.naturalGiftTypeId))
    .orderBy(asc(berry.id));

  return { generationId: input.generationId, entries };
});

const berryDetail = publicProcedure.input(detailInput).handler(async ({ context, input }) => {
  const [entry] = await context.db
    .select({
      id: berry.id,
      identifier: item.identifier,
      name: itemName.name,
      firmness: berry.firmness,
      size: berry.size,
      growthTime: berry.growthTime,
      maxHarvest: berry.maxHarvest,
      smoothness: berry.smoothness,
      soilDryness: berry.soilDryness,
      naturalGiftPower: berry.naturalGiftPower,
      naturalGiftType: { identifier: type.identifier, name: typeName.name },
      description: itemDescription(item.id, input.locale, input.generationId),
    })
    .from(berry)
    .innerJoin(item, eq(item.id, berry.itemId))
    .innerJoin(itemName, and(eq(itemName.itemId, item.id), eq(itemName.language, input.locale)))
    .leftJoin(type, eq(type.id, berry.naturalGiftTypeId))
    .leftJoin(typeName, and(eq(typeName.typeId, type.id), eq(typeName.language, input.locale)))
    .where(eq(item.identifier, input.identifier))
    .limit(1);

  if (!entry) return null;

  const flavors = await context.db
    .select({ flavor: berryFlavor.flavor, potency: berryFlavor.potency })
    .from(berryFlavor)
    .where(eq(berryFlavor.berryId, entry.id));

  return { ...entry, flavors };
});

export const berriesRouter = { list: berryList, detail: berryDetail };
