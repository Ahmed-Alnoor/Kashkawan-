import type { BilingualText } from "./restaurant";

export type { BilingualText };

/**
 * Allergen keys. Values are DERIVED from the components named in each dish on
 * the printed menu (e.g. anything with cheese carries `milk`; every dough or
 * bread item carries `gluten`). The printed menu contains no allergen
 * declaration, so the UI always shows this as guidance and asks customers with
 * a severe allergy to call the branch. We deliberately over-declare rather
 * than under-declare.
 */
export type AllergenKey = "gluten" | "milk" | "egg" | "nuts" | "sesame";

/** Dietary flags derived only from what the dish name states. */
export type DietaryKey = "vegetarian" | "contains-meat" | "contains-poultry" | "spicy";

export type OptionChoice = {
  id: string;
  label: BilingualText;
  /** AED added to the item's base price when this choice is selected. */
  priceDelta: number;
  isDefault?: boolean;
};

export type OptionGroup =
  | {
      kind: "single";
      id: string;
      label: BilingualText;
      /** Required groups must have a selection before the item can be added. */
      required: boolean;
      choices: OptionChoice[];
      note?: BilingualText;
    }
  | {
      kind: "multi";
      id: string;
      label: BilingualText;
      required: false;
      choices: OptionChoice[];
      note?: BilingualText;
    }
  | {
      /** A counted extra, e.g. "Extra toppings — 3 AED each". */
      kind: "counter";
      id: string;
      label: BilingualText;
      required: false;
      unitPrice: number;
      max: number;
      note?: BilingualText;
    };

export type MenuItem = {
  id: string;
  categoryId: CategoryId;
  name: BilingualText;
  /** Short description composed only from the components printed on the menu. */
  description: BilingualText;
  /** Components named on the menu, plus the category's base (dough / bread). */
  ingredients: BilingualText[];
  /** Ingredients the kitchen can leave out on request. */
  removable: BilingualText[];
  allergens: AllergenKey[];
  dietary: DietaryKey[];
  /** Lowest printed price in AED. Option deltas build up from here. */
  basePrice: number;
  /** Portion / packaging exactly as printed, when the menu states one. */
  portion?: BilingualText;
  optionGroups: OptionGroup[];
  /** Path under /public — only set when a real photo of this dish exists. */
  image?: string;
  /** True only for items that literally carry the Kashkawan name. */
  signature?: boolean;
  /** Shown in the homepage selection. Presentation only — not a claim. */
  featured?: boolean;
};

export type CategoryId =
  | "pizza"
  | "pastries"
  | "manakish"
  | "bread"
  | "juices"
  | "drinks";

export type MenuCategory = {
  id: CategoryId;
  name: BilingualText;
  /** Category blurb built from the brand guidelines' own language. */
  blurb: BilingualText;
  /** Notes printed under the category on the menu, reproduced verbatim. */
  notes: BilingualText[];
  image?: string;
  items: MenuItem[];
};
