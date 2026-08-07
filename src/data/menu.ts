/**
 * THE MENU — single source of truth for the whole site.
 *
 * Every name, price, portion and footnote below is transcribed from
 * "Kashkawan Menu | July 24" (the PDF in the repository root). Prices are in
 * AED and match the printed menu exactly:
 *
 *   Pizza      p.3   Medium / Large columns
 *   Pastries   p.3   flat 1.5, Sfiha sold by half-kilo / kilo
 *   Manakish   p.4   flat price per piece
 *   Fresh Bread p.2
 *   Fresh Juices p.2 350 ml
 *   Cold Drinks p.2
 *
 * Rules for maintaining this file:
 *   1. Never add a dish, price or portion that is not on the printed menu.
 *   2. `description` may only restate the components already in the name.
 *   3. `allergens` are derived (see menu-types.ts) — always over-declare.
 *   4. `image` is only set when a real photograph of that exact dish exists
 *      in the brand pack. Items without one render a branded pattern tile.
 */

import type {
  BilingualText,
  MenuCategory,
  MenuItem,
  OptionGroup,
  AllergenKey,
  DietaryKey,
  CategoryId,
} from "./menu-types";

const t = (en: string, ar: string): BilingualText => ({ en, ar });

/* ------------------------------------------------------------------ */
/* Shared ingredient vocabulary                                        */
/* ------------------------------------------------------------------ */

const ING = {
  pizzaDough: t("Pizza dough", "عجينة بيتزا"),
  manakishDough: t("Manakish dough", "عجينة مناقيش"),
  pastryDough: t("Pastry dough", "عجينة فطائر"),
  tomatoSauce: t("Tomato sauce", "صلصة طماطم"),
  mozzarella: t("Mozzarella cheese", "جبنة موزاريلا"),
  akkawi: t("Akkawi cheese", "جبنة عكاوي"),
  kashkawanCheese: t("Kashkawan cheese", "جبنة قشقوان"),
  halloumi: t("Halloumi cheese", "جبنة حلوم"),
  kraftCheese: t("Kraft cheese", "جبنة كرافت"),
  cheese: t("Cheese", "جبنة"),
  threeCheese: t("Three-cheese mix", "مكس ثلاث أجبان"),
  fourCheese: t("Four-cheese mix", "مكس أربع أجبان"),
  zaatar: t("Zaatar", "زعتر"),
  labneh: t("Labneh", "لبنة"),
  makdous: t("Makdous", "مكدوس"),
  vegetables: t("Vegetables", "خضار"),
  meat: t("Minced meat", "لحم مفروم"),
  chicken: t("Chicken", "دجاج"),
  bbqChicken: t("Barbecue chicken", "دجاج باربيكيو"),
  zinger: t("Zinger chicken", "دجاج زنجر"),
  buffaloSauce: t("Spicy buffalo sauce", "صلصة بافلو حارة"),
  pepperoni: t("Pepperoni", "بيبروني"),
  turkey: t("Turkey", "تيركي"),
  hotDog: t("Hot dog", "هوت دوغ"),
  sausage: t("Sausage", "سجق"),
  sausagePastry: t("Sausage", "نقانق"),
  spinach: t("Spinach", "سبانخ"),
  potato: t("Potatoes", "بطاطا"),
  muhammara: t("Muhammara", "محمرة"),
  gazawiDukkah: t("Gazawi dukkah", "دقة غزاوية"),
  honey: t("Honey", "عسل"),
  nutella: t("Nutella", "نوتيلا"),
  banana: t("Banana", "موز"),
  strawberry: t("Strawberry", "فراولة"),
  eggs: t("Eggs", "بيض"),
  meatMix: t("Mixed meats", "مكس لحوم"),
} as const;

/* ------------------------------------------------------------------ */
/* Shared option groups                                                */
/* ------------------------------------------------------------------ */

/** Menu p.3: "5 AED for adding cheese edges" / "3 AED for pizza toppings". */
const pizzaExtras = (): OptionGroup[] => [
  {
    kind: "multi",
    id: "pizza-edges",
    label: t("Crust", "الأطراف"),
    required: false,
    choices: [
      {
        id: "cheese-edges",
        label: t("Cheese-stuffed edges", "إضافة أطراف الجبنة"),
        priceDelta: 5,
      },
    ],
  },
  {
    kind: "counter",
    id: "pizza-toppings",
    label: t("Extra toppings", "إضافات مكونات البيتزا"),
    required: false,
    unitPrice: 3,
    max: 6,
    note: t(
      "3 AED per topping. Tell us which toppings you would like in the notes below.",
      "3 دراهم لكل إضافة. اذكر الإضافات التي ترغب بها في الملاحظات أدناه.",
    ),
  },
];

/** Menu p.4: "Available in wholegrain dough (brown flour)" — no upcharge printed. */
const manakishDoughGroup = (): OptionGroup => ({
  kind: "single",
  id: "dough",
  label: t("Dough", "العجينة"),
  required: true,
  choices: [
    { id: "regular", label: t("Regular dough", "عجينة عادية"), priceDelta: 0, isDefault: true },
    {
      id: "wholegrain",
      label: t("Wholegrain dough (brown flour)", "عجينة الحبة الكاملة (دقيق أسمر)"),
      priceDelta: 0,
    },
  ],
});

/** Menu p.4: "2 AED for extras upon request". */
const manakishExtras = (): OptionGroup => ({
  kind: "counter",
  id: "manakish-extras",
  label: t("Extras", "إضافات"),
  required: false,
  unitPrice: 2,
  max: 6,
  note: t(
    "2 AED per extra, upon request. Tell us what to add in the notes below.",
    "2 درهم لكل إضافة حسب الطلب. اذكر ما تود إضافته في الملاحظات أدناه.",
  ),
});

/* ------------------------------------------------------------------ */
/* Item builders                                                       */
/* ------------------------------------------------------------------ */

type Build = {
  id: string;
  name: BilingualText;
  description: BilingualText;
  ingredients: BilingualText[];
  removable?: BilingualText[];
  allergens: AllergenKey[];
  dietary: DietaryKey[];
  image?: string;
  signature?: boolean;
  featured?: boolean;
  portion?: BilingualText;
};

/**
 * Pizza. `medium` and `large` are the two printed prices; the size group
 * stores the difference so the computed totals equal the printed numbers.
 */
const pizza = (b: Build & { medium: number; large: number }): MenuItem => ({
  id: b.id,
  categoryId: "pizza",
  name: b.name,
  description: b.description,
  ingredients: b.ingredients,
  removable: b.removable ?? [],
  allergens: b.allergens,
  dietary: b.dietary,
  basePrice: b.medium,
  image: b.image,
  signature: b.signature,
  featured: b.featured,
  optionGroups: [
    {
      kind: "single",
      id: "size",
      label: t("Size", "الحجم"),
      required: true,
      choices: [
        { id: "medium", label: t("Medium", "وسط"), priceDelta: 0, isDefault: true },
        { id: "large", label: t("Large", "كبير"), priceDelta: b.large - b.medium },
      ],
    },
    ...pizzaExtras(),
  ],
});

const manakish = (b: Build & { price: number }): MenuItem => ({
  id: b.id,
  categoryId: "manakish",
  name: b.name,
  description: b.description,
  ingredients: b.ingredients,
  removable: b.removable ?? [],
  allergens: b.allergens,
  dietary: b.dietary,
  basePrice: b.price,
  image: b.image,
  signature: b.signature,
  featured: b.featured,
  optionGroups: [manakishDoughGroup(), manakishExtras()],
});

const simple =
  (categoryId: CategoryId) =>
  (b: Build & { price: number; optionGroups?: OptionGroup[] }): MenuItem => ({
    id: b.id,
    categoryId,
    name: b.name,
    description: b.description,
    ingredients: b.ingredients,
    removable: b.removable ?? [],
    allergens: b.allergens,
    dietary: b.dietary,
    basePrice: b.price,
    portion: b.portion,
    image: b.image,
    signature: b.signature,
    featured: b.featured,
    optionGroups: b.optionGroups ?? [],
  });

const pastry = simple("pastries");
const bread = simple("bread");
const juice = simple("juices");
const drink = simple("drinks");

/* ------------------------------------------------------------------ */
/* 1 — PIZZA (menu p.3)                                                */
/* ------------------------------------------------------------------ */

const PIZZA: MenuItem[] = [
  pizza({
    id: "pizza-margherita",
    name: t("Margherita Pizza", "بيتزا مارغريتا"),
    description: t(
      "Oven-baked pizza with tomato sauce and mozzarella.",
      "بيتزا مخبوزة في الفرن مع صلصة الطماطم والموزاريلا.",
    ),
    ingredients: [ING.pizzaDough, ING.tomatoSauce, ING.mozzarella],
    removable: [ING.tomatoSauce],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    medium: 15,
    large: 22,
    image: "/food/pizza-margherita.jpg",
    featured: true,
  }),
  pizza({
    id: "pizza-bbq-chicken",
    name: t("Barbecue Chicken Pizza", "بيتزا دجاج باربيكيو"),
    description: t(
      "Barbecue chicken with tomato sauce and mozzarella.",
      "دجاج باربيكيو مع صلصة الطماطم والموزاريلا.",
    ),
    ingredients: [ING.pizzaDough, ING.tomatoSauce, ING.mozzarella, ING.bbqChicken],
    removable: [ING.tomatoSauce, ING.bbqChicken],
    allergens: ["gluten", "milk"],
    dietary: ["contains-poultry"],
    medium: 17,
    large: 25,
  }),
  pizza({
    id: "pizza-pepperoni",
    name: t("Pepperoni Pizza", "بيتزا بيبروني"),
    description: t(
      "Pepperoni with tomato sauce and mozzarella.",
      "بيبروني مع صلصة الطماطم والموزاريلا.",
    ),
    ingredients: [ING.pizzaDough, ING.tomatoSauce, ING.mozzarella, ING.pepperoni],
    removable: [ING.tomatoSauce, ING.pepperoni],
    allergens: ["gluten", "milk"],
    dietary: ["contains-meat"],
    medium: 17,
    large: 25,
    image: "/food/pizza-pepperoni.jpg",
    featured: true,
  }),
  pizza({
    id: "pizza-meat-mix",
    name: t("Meat Mix Pizza", "بيتزا مكس لحوم"),
    description: t(
      "Mixed meats with tomato sauce and mozzarella.",
      "مكس لحوم مع صلصة الطماطم والموزاريلا.",
    ),
    ingredients: [ING.pizzaDough, ING.tomatoSauce, ING.mozzarella, ING.meatMix],
    removable: [ING.tomatoSauce],
    allergens: ["gluten", "milk"],
    dietary: ["contains-meat"],
    medium: 20,
    large: 30,
  }),
  pizza({
    id: "pizza-chicken",
    name: t("Chicken Pizza", "بيتزا دجاج"),
    description: t(
      "Chicken with tomato sauce and mozzarella.",
      "دجاج مع صلصة الطماطم والموزاريلا.",
    ),
    ingredients: [ING.pizzaDough, ING.tomatoSauce, ING.mozzarella, ING.chicken],
    removable: [ING.tomatoSauce, ING.chicken],
    allergens: ["gluten", "milk"],
    dietary: ["contains-poultry"],
    medium: 17,
    large: 25,
  }),
  pizza({
    id: "pizza-hot-dog",
    name: t("Hot Dog Pizza", "بيتزا هوت دوغ"),
    description: t(
      "Hot dog with tomato sauce and mozzarella.",
      "هوت دوغ مع صلصة الطماطم والموزاريلا.",
    ),
    ingredients: [ING.pizzaDough, ING.tomatoSauce, ING.mozzarella, ING.hotDog],
    removable: [ING.tomatoSauce, ING.hotDog],
    allergens: ["gluten", "milk"],
    dietary: ["contains-meat"],
    medium: 17,
    large: 22,
  }),
  pizza({
    id: "pizza-zinger",
    name: t("Zinger Pizza", "بيتزا زنجر"),
    description: t(
      "Zinger chicken with tomato sauce and mozzarella.",
      "دجاج زنجر مع صلصة الطماطم والموزاريلا.",
    ),
    ingredients: [ING.pizzaDough, ING.tomatoSauce, ING.mozzarella, ING.zinger],
    removable: [ING.tomatoSauce],
    allergens: ["gluten", "milk"],
    dietary: ["contains-poultry"],
    medium: 20,
    large: 30,
  }),
  pizza({
    id: "pizza-spicy-buffalo-zinger",
    name: t("Spicy Buffalo Zinger Pizza", "بيتزا زنجر بافلو حار"),
    description: t(
      "Zinger chicken in spicy buffalo sauce with tomato sauce and mozzarella.",
      "دجاج زنجر بصلصة بافلو حارة مع صلصة الطماطم والموزاريلا.",
    ),
    ingredients: [
      ING.pizzaDough,
      ING.tomatoSauce,
      ING.mozzarella,
      ING.zinger,
      ING.buffaloSauce,
    ],
    removable: [ING.buffaloSauce, ING.tomatoSauce],
    allergens: ["gluten", "milk"],
    dietary: ["contains-poultry", "spicy"],
    medium: 20,
    large: 30,
  }),
  pizza({
    id: "pizza-special-kashkawan",
    name: t("Special Kashkawan Pizza", "بيتزا سبيشال قشقوان"),
    description: t(
      "The house pizza, made the Kashkawan way.",
      "بيتزا البيت، على طريقة قشقوان.",
    ),
    ingredients: [ING.pizzaDough, ING.tomatoSauce, ING.mozzarella],
    allergens: ["gluten", "milk"],
    dietary: [],
    medium: 22,
    large: 32,
    signature: true,
    featured: true,
  }),
  pizza({
    id: "pizza-vegetable",
    name: t("Vegetable Pizza", "بيتزا خضار"),
    description: t(
      "Vegetables with tomato sauce and mozzarella.",
      "خضار مع صلصة الطماطم والموزاريلا.",
    ),
    ingredients: [ING.pizzaDough, ING.tomatoSauce, ING.mozzarella, ING.vegetables],
    removable: [ING.tomatoSauce, ING.vegetables],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    medium: 17,
    large: 22,
    image: "/food/pizza-vegetable.jpg",
    featured: true,
  }),
  pizza({
    id: "pizza-four-cheese",
    name: t("Four Cheese Mix Pizza", "بيتزا مكس أربع أجبان"),
    description: t("A mix of four cheeses on oven-baked dough.", "مكس من أربعة أجبان على عجينة مخبوزة."),
    ingredients: [ING.pizzaDough, ING.fourCheese],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    medium: 20,
    large: 25,
  }),
  pizza({
    id: "pizza-custom-half",
    name: t("Custom Half Pizza", "بيتزا نصفين من اختيارك"),
    description: t(
      "One pizza, two halves — choose a different flavour for each side.",
      "بيتزا واحدة بنصفين — اختر نكهة مختلفة لكل نصف.",
    ),
    ingredients: [ING.pizzaDough],
    allergens: ["gluten", "milk"],
    dietary: [],
    medium: 22,
    large: 32,
  }),
];

/**
 * "Custom Half Pizza" needs two required flavour choices. They are built from
 * the other pizzas on the menu so the list can never drift out of sync.
 */
const halfChoices = PIZZA.filter((p) => p.id !== "pizza-custom-half").map((p) => ({
  id: p.id,
  label: p.name,
  priceDelta: 0,
}));

const customHalf = PIZZA.find((p) => p.id === "pizza-custom-half")!;
customHalf.optionGroups = [
  customHalf.optionGroups[0], // size
  {
    kind: "single",
    id: "half-one",
    label: t("First half", "النصف الأول"),
    required: true,
    choices: halfChoices,
  },
  {
    kind: "single",
    id: "half-two",
    label: t("Second half", "النصف الثاني"),
    required: true,
    choices: halfChoices,
  },
  ...pizzaExtras(),
];

/* ------------------------------------------------------------------ */
/* 2 — PASTRIES (menu p.3)                                             */
/* ------------------------------------------------------------------ */

const PASTRIES: MenuItem[] = [
  pastry({
    id: "pastry-akkawi",
    name: t("Akkawi Cheese Pie", "فطيرة جبنة عكاوي"),
    description: t("Individual pie filled with Akkawi cheese.", "فطيرة مفردة محشوة بجبنة العكاوي."),
    ingredients: [ING.pastryDough, ING.akkawi],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 1.5,
  }),
  pastry({
    id: "pastry-zaatar",
    name: t("Zaatar Pie", "فطيرة زعتر"),
    description: t("Individual pie topped with zaatar.", "فطيرة مفردة بالزعتر."),
    ingredients: [ING.pastryDough, ING.zaatar],
    allergens: ["gluten", "sesame"],
    dietary: ["vegetarian"],
    price: 1.5,
  }),
  pastry({
    id: "pastry-meat",
    name: t("Meat Pie", "فطيرة لحمة"),
    description: t("Individual pie filled with minced meat.", "فطيرة مفردة محشوة باللحم المفروم."),
    ingredients: [ING.pastryDough, ING.meat],
    allergens: ["gluten"],
    dietary: ["contains-meat"],
    price: 1.5,
  }),
  pastry({
    id: "pastry-muhammara",
    name: t("Muhammara Pie", "فطيرة محمرة"),
    description: t("Individual pie filled with muhammara.", "فطيرة مفردة محشوة بالمحمرة."),
    ingredients: [ING.pastryDough, ING.muhammara],
    allergens: ["gluten", "nuts"],
    dietary: ["vegetarian"],
    price: 1.5,
  }),
  pastry({
    id: "pastry-labneh",
    name: t("Labneh Pie", "فطيرة لبنة"),
    description: t("Individual pie filled with labneh.", "فطيرة مفردة محشوة باللبنة."),
    ingredients: [ING.pastryDough, ING.labneh],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 1.5,
  }),
  pastry({
    id: "pastry-sausage",
    name: t("Sausage Pie", "فطيرة نقانق"),
    description: t("Individual pie filled with sausage.", "فطيرة مفردة محشوة بالنقانق."),
    ingredients: [ING.pastryDough, ING.sausagePastry],
    allergens: ["gluten"],
    dietary: ["contains-meat"],
    price: 1.5,
  }),
  pastry({
    id: "pastry-spinach",
    name: t("Spinach Pie", "فطيرة سبانخ"),
    description: t("Individual pie filled with spinach.", "فطيرة مفردة محشوة بالسبانخ."),
    ingredients: [ING.pastryDough, ING.spinach],
    allergens: ["gluten"],
    dietary: ["vegetarian"],
    price: 1.5,
  }),
  pastry({
    id: "pastry-potato",
    name: t("Potato Pie", "فطيرة بطاطا"),
    description: t("Individual pie filled with potatoes.", "فطيرة مفردة محشوة بالبطاطا."),
    ingredients: [ING.pastryDough, ING.potato],
    allergens: ["gluten"],
    dietary: ["vegetarian"],
    price: 1.5,
  }),
  pastry({
    id: "pastry-vegetable-pizza",
    name: t("Vegetable Pizza Pie", "فطيرة بيتزا خضار"),
    description: t(
      "Individual pie topped like a vegetable pizza.",
      "فطيرة مفردة بنكهة بيتزا الخضار.",
    ),
    ingredients: [ING.pastryDough, ING.tomatoSauce, ING.mozzarella, ING.vegetables],
    removable: [ING.vegetables],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 1.5,
  }),
  pastry({
    id: "pastry-gaza-dukkah",
    name: t("Gaza Dukkah Pie", "فطيرة دقة غزاوية"),
    description: t("Individual pie topped with Gazawi dukkah.", "فطيرة مفردة بالدقة الغزاوية."),
    ingredients: [ING.pastryDough, ING.gazawiDukkah],
    allergens: ["gluten", "sesame"],
    dietary: ["vegetarian"],
    price: 1.5,
  }),
  pastry({
    id: "pastry-sfiha-half-kilo",
    name: t("Sfiha Pie — Half Kilo", "صفيحة لحم شامية نصف كيلو"),
    description: t(
      "Levantine meat sfiha, sold by the half kilo.",
      "صفيحة لحم شامية، تُباع بنصف الكيلو.",
    ),
    ingredients: [ING.pastryDough, ING.meat],
    allergens: ["gluten"],
    dietary: ["contains-meat"],
    price: 45,
    portion: t("Half kilo — 20 pieces", "نصف كيلو - 20 حبة"),
    featured: true,
  }),
  pastry({
    id: "pastry-sfiha-kilo",
    name: t("Sfiha Pie — Kilo", "صفيحة لحم شامية كيلو"),
    description: t("Levantine meat sfiha, sold by the kilo.", "صفيحة لحم شامية، تُباع بالكيلو."),
    ingredients: [ING.pastryDough, ING.meat],
    allergens: ["gluten"],
    dietary: ["contains-meat"],
    price: 85,
    portion: t("Kilo — 40 pieces", "كيلو - 40 حبة"),
  }),
];

/* ------------------------------------------------------------------ */
/* 3 — MANAKISH (menu p.4)                                             */
/* ------------------------------------------------------------------ */

const MANAKISH: MenuItem[] = [
  manakish({
    id: "manakish-akkawi",
    name: t("Akkawi Cheese", "جبنة عكاوي"),
    description: t("Manakish baked with Akkawi cheese.", "منقوشة مخبوزة بجبنة العكاوي."),
    ingredients: [ING.manakishDough, ING.akkawi],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 8,
    image: "/food/manakish-akkawi.jpg",
    featured: true,
  }),
  manakish({
    id: "manakish-zaatar",
    name: t("Zaatar", "زعتر"),
    description: t("Manakish baked with zaatar.", "منقوشة مخبوزة بالزعتر."),
    ingredients: [ING.manakishDough, ING.zaatar],
    allergens: ["gluten", "sesame"],
    dietary: ["vegetarian"],
    price: 7,
    image: "/food/manakish-zaatar.jpg",
    featured: true,
  }),
  manakish({
    id: "manakish-cheese-zaatar",
    name: t("Cheese with Zaatar", "جبنة مع زعتر"),
    description: t("Manakish baked with cheese and zaatar.", "منقوشة مخبوزة بالجبنة والزعتر."),
    ingredients: [ING.manakishDough, ING.cheese, ING.zaatar],
    removable: [ING.cheese, ING.zaatar],
    allergens: ["gluten", "milk", "sesame"],
    dietary: ["vegetarian"],
    price: 8,
  }),
  manakish({
    id: "manakish-gazawi-dough",
    name: t("Gazawi Dough", "دقة غزاوية"),
    description: t("Manakish topped with Gazawi dukkah.", "منقوشة بالدقة الغزاوية."),
    ingredients: [ING.manakishDough, ING.gazawiDukkah],
    allergens: ["gluten", "sesame"],
    dietary: ["vegetarian"],
    price: 7,
    image: "/food/manakish-gazawi.jpg",
    featured: true,
  }),
  manakish({
    id: "manakish-zaatar-vegetables",
    name: t("Zaatar with Vegetables", "زعتر مع خضار"),
    description: t("Manakish with zaatar and vegetables.", "منقوشة بالزعتر والخضار."),
    ingredients: [ING.manakishDough, ING.zaatar, ING.vegetables],
    removable: [ING.vegetables],
    allergens: ["gluten", "sesame"],
    dietary: ["vegetarian"],
    price: 8,
  }),
  manakish({
    id: "manakish-labneh-makdous",
    name: t("Labneh with Makdous", "لبنة مع مكدوس"),
    description: t("Manakish with labneh and makdous.", "منقوشة باللبنة والمكدوس."),
    ingredients: [ING.manakishDough, ING.labneh, ING.makdous],
    removable: [ING.makdous],
    allergens: ["gluten", "milk", "nuts"],
    dietary: ["vegetarian"],
    price: 10,
  }),
  manakish({
    id: "manakish-labneh-vegetables",
    name: t("Labneh with Vegetables", "لبنة مع الخضار"),
    description: t("Manakish with labneh and vegetables.", "منقوشة باللبنة والخضار."),
    ingredients: [ING.manakishDough, ING.labneh, ING.vegetables],
    removable: [ING.vegetables],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 8,
    image: "/food/manakish-labneh-veg.jpg",
    featured: true,
  }),
  manakish({
    id: "manakish-meat",
    name: t("Meat", "لحم"),
    description: t("Manakish baked with minced meat.", "منقوشة مخبوزة باللحم المفروم."),
    ingredients: [ING.manakishDough, ING.meat],
    allergens: ["gluten"],
    dietary: ["contains-meat"],
    price: 10,
    image: "/food/manakish-meat.jpg",
    featured: true,
  }),
  manakish({
    id: "manakish-meat-cheese",
    name: t("Meat with Cheese", "لحم بالجبنة"),
    description: t("Manakish with minced meat and cheese.", "منقوشة باللحم المفروم والجبنة."),
    ingredients: [ING.manakishDough, ING.meat, ING.cheese],
    removable: [ING.cheese],
    allergens: ["gluten", "milk"],
    dietary: ["contains-meat"],
    price: 12,
    image: "/food/manakish-meat-cheese.jpg",
  }),
  manakish({
    id: "manakish-kashkawan-cheese",
    name: t("Kashkawan Cheese", "جبنة قشقوان"),
    description: t("Manakish baked with Kashkawan cheese.", "منقوشة مخبوزة بجبنة قشقوان."),
    ingredients: [ING.manakishDough, ING.kashkawanCheese],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 8,
    signature: true,
    featured: true,
  }),
  manakish({
    id: "manakish-kashkawan-turkey",
    name: t("Kashkawan Cheese with Turkey", "جبنة قشقوان مع تيركي"),
    description: t(
      "Manakish with Kashkawan cheese and turkey.",
      "منقوشة بجبنة قشقوان والتيركي.",
    ),
    ingredients: [ING.manakishDough, ING.kashkawanCheese, ING.turkey],
    removable: [ING.turkey],
    allergens: ["gluten", "milk"],
    dietary: ["contains-poultry"],
    price: 10,
    signature: true,
  }),
  manakish({
    id: "manakish-kashkawan-pepperoni",
    name: t("Kashkawan Cheese with Pepperoni", "جبنة قشقوان مع بيبروني"),
    description: t(
      "Manakish with Kashkawan cheese and pepperoni.",
      "منقوشة بجبنة قشقوان والبيبروني.",
    ),
    ingredients: [ING.manakishDough, ING.kashkawanCheese, ING.pepperoni],
    removable: [ING.pepperoni],
    allergens: ["gluten", "milk"],
    dietary: ["contains-meat"],
    price: 10,
    signature: true,
  }),
  manakish({
    id: "manakish-kashkawan-hot-dogs",
    name: t("Kashkawan Cheese with Hot Dogs", "جبنة قشقوان مع هوت دوغ"),
    description: t(
      "Manakish with Kashkawan cheese and hot dogs.",
      "منقوشة بجبنة قشقوان والهوت دوغ.",
    ),
    ingredients: [ING.manakishDough, ING.kashkawanCheese, ING.hotDog],
    removable: [ING.hotDog],
    allergens: ["gluten", "milk"],
    dietary: ["contains-meat"],
    price: 10,
    signature: true,
  }),
  manakish({
    id: "manakish-halloumi",
    name: t("Halloumi Cheese", "جبنة حلوم"),
    description: t("Manakish baked with halloumi cheese.", "منقوشة مخبوزة بجبنة الحلوم."),
    ingredients: [ING.manakishDough, ING.halloumi],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 8,
  }),
  manakish({
    id: "manakish-halloumi-vegetables",
    name: t("Halloumi Cheese with Vegetables", "جبنة حلوم مع خضار"),
    description: t("Manakish with halloumi cheese and vegetables.", "منقوشة بجبنة الحلوم والخضار."),
    ingredients: [ING.manakishDough, ING.halloumi, ING.vegetables],
    removable: [ING.vegetables],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 10,
  }),
  manakish({
    id: "manakish-three-cheese",
    name: t("Three Cheese Mix", "مكس ثلاث أجبان"),
    description: t("Manakish with a mix of three cheeses.", "منقوشة بمكس ثلاث أجبان."),
    ingredients: [ING.manakishDough, ING.threeCheese],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 10,
  }),
  manakish({
    id: "manakish-kraft-honey",
    name: t("Kraft Cheese with Honey", "جبنة كرافت مع عسل"),
    description: t("Manakish with Kraft cheese and honey.", "منقوشة بجبنة كرافت والعسل."),
    ingredients: [ING.manakishDough, ING.kraftCheese, ING.honey],
    removable: [ING.honey],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 8,
  }),
  manakish({
    id: "manakish-nutella-banana-strawberry",
    name: t("Nutella, Banana, Strawberry", "نوتيلا مع موز وفراولة"),
    description: t(
      "Sweet manakish with Nutella, banana and strawberry.",
      "منقوشة حلوة بالنوتيلا والموز والفراولة.",
    ),
    ingredients: [ING.manakishDough, ING.nutella, ING.banana, ING.strawberry],
    removable: [ING.banana, ING.strawberry],
    allergens: ["gluten", "milk", "nuts"],
    dietary: ["vegetarian"],
    price: 12,
  }),
  manakish({
    id: "manakish-eggs-cheese",
    name: t("Eggs with Cheese", "بيض مع جبنة"),
    description: t("Manakish with eggs and cheese.", "منقوشة بالبيض والجبنة."),
    ingredients: [ING.manakishDough, ING.eggs, ING.cheese],
    removable: [ING.cheese],
    allergens: ["gluten", "milk", "egg"],
    dietary: ["vegetarian"],
    price: 10,
  }),
  manakish({
    id: "manakish-sausage",
    name: t("Sausage", "سجق"),
    description: t("Manakish baked with sausage.", "منقوشة مخبوزة بالسجق."),
    ingredients: [ING.manakishDough, ING.sausage],
    allergens: ["gluten"],
    dietary: ["contains-meat"],
    price: 10,
  }),
  manakish({
    id: "manakish-sausage-cheese",
    name: t("Sausage with Cheese", "سجق مع جبنة"),
    description: t("Manakish with sausage and cheese.", "منقوشة بالسجق والجبنة."),
    ingredients: [ING.manakishDough, ING.sausage, ING.cheese],
    removable: [ING.cheese],
    allergens: ["gluten", "milk"],
    dietary: ["contains-meat"],
    price: 12,
  }),
  manakish({
    id: "manakish-potatoes",
    name: t("Potatoes", "بطاطا"),
    description: t("Manakish baked with potatoes.", "منقوشة مخبوزة بالبطاطا."),
    ingredients: [ING.manakishDough, ING.potato],
    allergens: ["gluten"],
    dietary: ["vegetarian"],
    price: 8,
  }),
  manakish({
    id: "manakish-potatoes-cheese",
    name: t("Potatoes with Cheese", "بطاطا مع جبنة"),
    description: t("Manakish with potatoes and cheese.", "منقوشة بالبطاطا والجبنة."),
    ingredients: [ING.manakishDough, ING.potato, ING.cheese],
    removable: [ING.cheese],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 10,
  }),
  manakish({
    id: "manakish-muhammara",
    name: t("Muhammara", "محمرة"),
    description: t("Manakish topped with muhammara.", "منقوشة بالمحمرة."),
    ingredients: [ING.manakishDough, ING.muhammara],
    allergens: ["gluten", "nuts"],
    dietary: ["vegetarian"],
    price: 7,
  }),
  manakish({
    id: "manakish-muhammara-cheese",
    name: t("Muhammara with Cheese", "محمرة مع جبنة"),
    description: t("Manakish with muhammara and cheese.", "منقوشة بالمحمرة والجبنة."),
    ingredients: [ING.manakishDough, ING.muhammara, ING.cheese],
    removable: [ING.cheese],
    allergens: ["gluten", "milk", "nuts"],
    dietary: ["vegetarian"],
    price: 9,
  }),
  manakish({
    id: "manakish-muhammara-turkey-cheese",
    name: t("Muhammara with Turkey & Cheese", "محمرة مع تيركي مع جبنة"),
    description: t(
      "Manakish with muhammara, turkey and cheese.",
      "منقوشة بالمحمرة والتيركي والجبنة.",
    ),
    ingredients: [ING.manakishDough, ING.muhammara, ING.turkey, ING.cheese],
    removable: [ING.turkey, ING.cheese],
    allergens: ["gluten", "milk", "nuts"],
    dietary: ["contains-poultry"],
    price: 10,
  }),
  manakish({
    id: "manakish-spinach",
    name: t("Spinach", "سبانخ"),
    description: t("Manakish baked with spinach.", "منقوشة مخبوزة بالسبانخ."),
    ingredients: [ING.manakishDough, ING.spinach],
    allergens: ["gluten"],
    dietary: ["vegetarian"],
    price: 8,
  }),
  manakish({
    id: "manakish-spinach-cheese",
    name: t("Spinach with Cheese", "سبانخ مع جبنة"),
    description: t("Manakish with spinach and cheese.", "منقوشة بالسبانخ والجبنة."),
    ingredients: [ING.manakishDough, ING.spinach, ING.cheese],
    removable: [ING.cheese],
    allergens: ["gluten", "milk"],
    dietary: ["vegetarian"],
    price: 10,
  }),
];

/* ------------------------------------------------------------------ */
/* 4 — FRESH BREAD (menu p.2)                                          */
/* ------------------------------------------------------------------ */

const BREAD: MenuItem[] = [
  bread({
    id: "bread-white",
    name: t("White Bread", "خبز أبيض"),
    description: t("Fresh Arabic white bread, sold by the bundle.", "خبز عربي أبيض طازج، يُباع بالربطة."),
    ingredients: [t("Wheat flour", "دقيق قمح")],
    allergens: ["gluten"],
    dietary: ["vegetarian"],
    price: 3,
    portion: t("5 pieces per bundle", "ربطة 5 حبات"),
    image: "/food/bread-white.jpg",
    featured: true,
  }),
  bread({
    id: "bread-brown",
    name: t("Brown Bread", "خبز أسمر (الحبة الكاملة)"),
    description: t(
      "Fresh wholegrain Arabic bread, sold by the bundle.",
      "خبز عربي أسمر من الحبة الكاملة، يُباع بالربطة.",
    ),
    ingredients: [t("Wholegrain wheat flour", "دقيق قمح كامل")],
    allergens: ["gluten"],
    dietary: ["vegetarian"],
    price: 3,
    portion: t("5 pieces per bundle", "ربطة 5 حبات"),
    image: "/food/bread-brown.jpg",
  }),
  bread({
    id: "bread-turkish-kaa",
    name: t("Turkish Kaa", "كعك تركي"),
    description: t("Turkish kaa, sold by the piece.", "كعك تركي، يُباع بالحبة."),
    ingredients: [t("Wheat flour", "دقيق قمح"), t("Sesame", "سمسم")],
    allergens: ["gluten", "sesame"],
    dietary: ["vegetarian"],
    price: 2,
    portion: t("1 piece", "حبة واحدة"),
  }),
];

/* ------------------------------------------------------------------ */
/* 5 — FRESH JUICES (menu p.2) — all 350 ml                            */
/* ------------------------------------------------------------------ */

const ML350 = t("350 ml", "350 مل");

const juiceItem = (
  id: string,
  en: string,
  ar: string,
  price: number,
  ingredients: BilingualText[],
  allergens: AllergenKey[] = [],
  extra: Partial<Build> = {},
): MenuItem =>
  juice({
    id,
    name: t(en, ar),
    description: t(`Freshly pressed ${en.toLowerCase()}, served at 350 ml.`, `${ar} طازج، يُقدَّم بحجم 350 مل.`),
    ingredients,
    allergens,
    dietary: ["vegetarian"],
    price,
    portion: ML350,
    ...extra,
  });

const JUICES: MenuItem[] = [
  juice({
    id: "juice-kashkawan-cocktail",
    name: t("Kashkawan Cocktail", "كوكتيل قشقوان"),
    description: t("The house fruit cocktail, served at 350 ml.", "كوكتيل الفواكه الخاص بالبيت، يُقدَّم بحجم 350 مل."),
    ingredients: [t("Mixed fruit", "فواكه مشكلة")],
    allergens: [],
    dietary: ["vegetarian"],
    price: 10,
    portion: ML350,
    signature: true,
    featured: true,
  }),
  juiceItem("juice-lemon-mint", "Lemon with Mint", "ليمون بالنعناع", 8, [
    t("Lemon", "ليمون"),
    t("Mint", "نعناع"),
  ]),
  juiceItem("juice-carrot", "Carrot", "جزر", 8, [t("Carrot", "جزر")]),
  juiceItem("juice-pineapple", "Pineapple", "أناناس", 8, [t("Pineapple", "أناناس")]),
  juiceItem("juice-mango", "Mango", "مانجو", 8, [t("Mango", "مانجو")]),
  juiceItem("juice-kiwi", "Kiwi", "كيوي", 8, [t("Kiwi", "كيوي")]),
  juiceItem("juice-watermelon", "Watermelon", "بطيخ", 8, [t("Watermelon", "بطيخ")]),
  juice({
    id: "juice-avocado-honey",
    name: t("Avocado with Honey", "أفوكادو مع العسل"),
    description: t("Avocado blended with honey, served at 350 ml.", "أفوكادو مع العسل، يُقدَّم بحجم 350 مل."),
    ingredients: [t("Avocado", "أفوكادو"), ING.honey],
    removable: [ING.honey],
    allergens: [],
    dietary: ["vegetarian"],
    price: 10,
    portion: ML350,
  }),
  juice({
    id: "juice-banana-milk",
    name: t("Banana and Milk", "موز وحليب"),
    description: t("Banana blended with milk, served at 350 ml.", "موز مع الحليب، يُقدَّم بحجم 350 مل."),
    ingredients: [ING.banana, t("Milk", "حليب")],
    allergens: ["milk"],
    dietary: ["vegetarian"],
    price: 8,
    portion: ML350,
  }),
  juiceItem("juice-strawberry", "Strawberry", "فراولة", 8, [ING.strawberry]),
  juiceItem("juice-orange", "Orange", "برتقال", 8, [t("Orange", "برتقال")]),
  juiceItem("juice-hibiscus", "Hibiscus", "كركدية", 6, [t("Hibiscus", "كركدية")]),
  juice({
    id: "juice-laben-ayran",
    name: t("Laben Ayran", "لبن عيران"),
    description: t("Chilled laben ayran, served at 350 ml.", "لبن عيران بارد، يُقدَّم بحجم 350 مل."),
    ingredients: [t("Laben", "لبن")],
    allergens: ["milk"],
    dietary: ["vegetarian"],
    price: 6,
    portion: ML350,
    image: "/food/drink-ayran.jpg",
    featured: true,
  }),
];

/* ------------------------------------------------------------------ */
/* 6 — COLD DRINKS (menu p.2)                                          */
/* ------------------------------------------------------------------ */

const coldDrink = (id: string, en: string, ar: string, price: number): MenuItem =>
  drink({
    id,
    name: t(en, ar),
    description: t(`${en}, served chilled.`, `${ar}، يُقدَّم بارداً.`),
    ingredients: [],
    allergens: [],
    dietary: [],
    price,
  });

const DRINKS: MenuItem[] = [
  coldDrink("drink-kenza-cola", "Kenza Cola", "كنزا كولا", 3),
  coldDrink("drink-kenza-citrus", "Kenza Citrus", "كنزا حمضيات", 3),
  coldDrink("drink-kenza-orange", "Kenza Orange", "كنزا برتقال", 3),
  coldDrink("drink-kenza-lemon", "Kenza Lemon", "كنزا ليمون", 3),
  coldDrink("drink-kenza-cola-zero", "Kenza Cola Zero", "كنزا كولا زيرو", 3),
  drink({
    id: "drink-small-water",
    name: t("Small Water", "ماء صغير"),
    description: t("Bottled water, small.", "مياه معبأة، حجم صغير."),
    ingredients: [],
    allergens: [],
    dietary: [],
    price: 2,
  }),
];

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export const MENU: MenuCategory[] = [
  {
    id: "manakish",
    name: t("Manakish", "مناقيش"),
    blurb: t(
      "Baked to order on our own dough — the everyday heart of the bakery.",
      "تُخبز عند الطلب على عجينتنا — قلب المخبز كل يوم.",
    ),
    notes: [
      t("Available in wholegrain dough (brown flour)", "متوفرة بعجينة الحبة الكاملة (دقيق أسمر)"),
      t("2 AED for extras upon request", "2 درهم للإضافات حسب الطلب"),
    ],
    image: "/food/category-manakish.jpg",
    items: MANAKISH,
  },
  {
    id: "pizza",
    name: t("Pizza", "بيتزا"),
    blurb: t(
      "Medium or large, straight from the oven.",
      "وسط أو كبير، طازجة من الفرن.",
    ),
    notes: [
      t("5 AED for adding cheese edges", "5 درهم لإضافة أطراف الجبنة"),
      t("3 AED for pizza toppings", "3 درهم للإضافات مكونات البيتزا"),
    ],
    image: "/food/category-pizza.jpg",
    items: PIZZA,
  },
  {
    id: "pastries",
    name: t("Pastries", "فطائر"),
    blurb: t(
      "Small pies by the piece, and Levantine sfiha by the kilo.",
      "فطائر مفردة بالحبة، وصفيحة شامية بالكيلو.",
    ),
    notes: [],
    image: "/food/category-pastries.jpg",
    items: PASTRIES,
  },
  {
    id: "bread",
    name: t("Fresh Arabic Bread", "خبز عربي طازج"),
    blurb: t("Baked daily, sold by the bundle.", "يُخبز يومياً، ويُباع بالربطة."),
    notes: [],
    image: "/food/bread-white.jpg",
    items: BREAD,
  },
  {
    id: "juices",
    name: t("Fresh Juices", "عصائر طازجة"),
    blurb: t("Pressed fresh, served at 350 ml.", "تُعصر طازجة، وتُقدَّم بحجم 350 مل."),
    notes: [t("350 ml", "350 مل")],
    image: "/food/drink-ayran.jpg",
    items: JUICES,
  },
  {
    id: "drinks",
    name: t("Cold Drinks", "مشروبات باردة"),
    blurb: t("Chilled and ready to go.", "باردة وجاهزة.")
    ,
    notes: [],
    items: DRINKS,
  },
];

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export const ALL_ITEMS: MenuItem[] = MENU.flatMap((c) => c.items);

const ITEM_INDEX = new Map(ALL_ITEMS.map((i) => [i.id, i]));

export const getItem = (id: string): MenuItem | undefined => ITEM_INDEX.get(id);

export const getCategory = (id: CategoryId): MenuCategory | undefined =>
  MENU.find((c) => c.id === id);

export const FEATURED_ITEMS: MenuItem[] = ALL_ITEMS.filter((i) => i.featured);

/** Lowest printed price in a category, for "from X AED" straplines. */
export const categoryPriceFloor = (id: CategoryId): number => {
  const category = getCategory(id);
  if (!category || category.items.length === 0) return 0;
  return Math.min(...category.items.map((i) => i.basePrice));
};

/** Lowest price anywhere on the menu. */
export const MENU_PRICE_FLOOR = Math.min(...ALL_ITEMS.map((i) => i.basePrice));
