/**
 * English copy.
 *
 * Voice (brand guidelines p.16): warm, direct, proud, helpful.
 * Name the food, mention freshness, give a clear action.
 * Avoid luxury clichés, "best ever" claims and excessive exclamation marks.
 */
const en = {
  meta: {
    home: {
      title: "Kashkawan Cafeteria — Fresh manakish, pizza and Arabic bread in Ajman",
      description:
        "Oven-fresh manakish, pizza, pastries, Arabic bread and fresh juices in Al Rashidiya 2, Ajman. Order for delivery or pickup — no online payment needed.",
    },
    menu: {
      title: "Menu — Kashkawan Cafeteria",
      description:
        "The full Kashkawan menu: manakish, pizza, pastries, fresh Arabic bread, fresh juices and cold drinks, with prices in AED.",
    },
    about: {
      title: "Our story — Kashkawan Cafeteria",
      description:
        "A neighborhood bakery-cafeteria in Ajman built on oven-fresh Levantine staples, fair prices and bilingual service.",
    },
    location: {
      title: "Find us — Kashkawan Cafeteria, Al Rashidiya 2, Ajman",
      description:
        "Kashkawan Cafeteria is on Al Burkan Street, Al Rashidiya 2, Ajman. Directions, delivery contact and how to order.",
    },
    cart: { title: "Your order — Kashkawan Cafeteria", description: "Review and edit your order." },
    checkout: {
      title: "Checkout — Kashkawan Cafeteria",
      description: "Confirm your delivery details. No online payment required.",
    },
    confirmation: {
      title: "Order received — Kashkawan Cafeteria",
      description: "Your order reference and summary.",
    },
    privacy: { title: "Privacy policy — Kashkawan Cafeteria", description: "How we handle the details you give us when ordering." },
    terms: { title: "Terms of use — Kashkawan Cafeteria", description: "The terms that apply to orders placed on this website." },
    delivery: { title: "Delivery & orders — Kashkawan Cafeteria", description: "How delivery, pickup and payment work." },
  },

  nav: {
    home: "Home",
    menu: "Menu",
    about: "Our story",
    location: "Find us",
    cart: "Order",
    skipToContent: "Skip to content",
    openMenu: "Open navigation",
    closeMenu: "Close navigation",
    switchLanguage: "العربية",
    switchLanguageAria: "Switch to Arabic",
    primary: "Primary",
  },

  common: {
    from: "From",
    add: "Add",
    added: "Added",
    orderNow: "Order now",
    viewMenu: "View menu",
    viewFullMenu: "View the full menu",
    close: "Close",
    back: "Back",
    loading: "Loading",
    call: "Call",
    whatsapp: "WhatsApp",
    directions: "Get directions",
    each: "each",
    quantity: "Quantity",
    increase: "Increase quantity",
    decrease: "Decrease quantity",
    remove: "Remove",
    edit: "Edit",
    optional: "Optional",
    required: "Required",
    signature: "Signature",
    total: "Total",
    subtotal: "Subtotal",
    continue: "Continue",
    error: "Something went wrong",
  },

  home: {
    heroEyebrow: "Al Rashidiya 2 · Ajman",
    heroTitle: "Fresh from the oven, made for your table",
    heroBody:
      "A neighborhood bakery-cafeteria built on oven-fresh Levantine staples: manakish, pastries, pizza, fresh Arabic bread and juices.",
    heroPriceNote: "Manakish from {price} AED",

    storyEyebrow: "Our story",
    storyTitle: "The promise begins at the oven",
    storyBody:
      "Kashkawan is familiar food, made memorable. We bake through the day so what reaches your table has just come out of the oven — the same dough, the same hands, the same neighborhood.",
    storyQuote: "Freshly baked Levantine comfort, served generously and simply.",
    readStory: "Read our story",

    valuesTitle: "Four pillars keep every decision on-brand",
    values: [
      {
        title: "Authentic",
        arabic: "أصيل",
        body: "Familiar Levantine flavours, protected and Arabic-first.",
      },
      {
        title: "Fresh",
        arabic: "طازج",
        body: "Oven heat, real texture and daily preparation.",
      },
      {
        title: "Generous",
        arabic: "كريم",
        body: "Abundance in choice, portion and how we welcome you.",
      },
      {
        title: "Clear",
        arabic: "واضح",
        body: "Names, prices and ordering that are quick to understand.",
      },
    ],

    signatureEyebrow: "Straight from the oven",
    signatureTitle: "A selection from the menu",
    signatureBody:
      "Every price on this site is the price printed on our menu. Tap any dish to choose your size, dough and extras.",

    categoriesEyebrow: "The menu",
    categoriesTitle: "Six ways to fill the table",
    categoriesBody: "Pick a category to jump straight into it.",
    itemCount: "{count} items",

    familyEyebrow: "Family & hospitality",
    familyTitle: "Made for shared tables",
    familyBody:
      "Bring the family, order for the office, or send a kilo of sfiha to a gathering. Portions are built for sharing and our team will help you get the order right — in Arabic or English.",
    familyPoints: [
      "Sfiha by the half kilo (20 pieces) or the kilo (40 pieces)",
      "Bread sold by the bundle of five",
      "Wholegrain dough available on every manakish",
      "Bilingual service, with equal care in both languages",
    ],

    visitEyebrow: "Find us",
    visitTitle: "On Al Burkan Street",
    hoursLabel: "Opening hours",
    hoursUnconfirmed: "Call or message us and we will confirm today's hours.",
    addressLabel: "Address",
    phoneLabel: "Delivery & orders",
    openInMaps: "Open in Google Maps",
    mapTitle: "Map showing the location of Kashkawan Cafeteria",

    galleryEyebrow: "The food",
    galleryTitle: "From our kitchen",
    galleryBody: "Photography from our own menu — nothing staged that we do not bake.",

    ctaTitle: "Ready to order?",
    ctaBody: "Build your order online, or call the branch and we will take it over the phone.",
  },

  menu: {
    eyebrow: "Menu",
    title: "The full menu",
    subtitle: "Prices in AED, exactly as printed on our menu.",
    search: "Search the menu",
    searchPlaceholder: "Search a dish, e.g. zaatar",
    clearSearch: "Clear search",
    filters: "Filters",
    filterVegetarian: "Vegetarian",
    filterNoNuts: "No nuts",
    filterNoGluten: "No gluten",
    filterNoMilk: "No dairy",
    filterSpicy: "Spicy",
    filterSignature: "Signature",
    clearFilters: "Clear filters",
    resultsCount: "{count} dishes",
    noResults: "No dishes match that.",
    noResultsBody: "Try a different word, or clear the filters to see the whole menu.",
    categoryNav: "Menu categories",
    allergenNote:
      "Allergen guidance is derived from the ingredients named on our menu. If you have a severe allergy, please call the branch before ordering.",
  },

  dish: {
    ingredients: "Ingredients",
    allergens: "Allergens",
    dietary: "Dietary",
    noAllergens: "No declared allergens from the named ingredients.",
    removeIngredients: "Remove ingredients",
    removeHint: "Uncheck anything you would like left out.",
    specialInstructions: "Special instructions",
    specialInstructionsPlaceholder: "Anything else the kitchen should know?",
    chooseOne: "Choose one",
    portion: "Portion",
    addForTotal: "Add to order",
    updateForTotal: "Update order",
    selectRequired: "Choose an option to continue",
    openDetails: "Open details for {name}",
    quickAdd: "Quick add {name}",
  },

  allergens: {
    gluten: "Gluten",
    milk: "Dairy",
    egg: "Egg",
    nuts: "Nuts",
    sesame: "Sesame",
  },

  dietary: {
    vegetarian: "Vegetarian",
    "contains-meat": "Contains meat",
    "contains-poultry": "Contains poultry",
    spicy: "Spicy",
  },

  cart: {
    title: "Your order",
    empty: "Your order is empty",
    emptyBody: "Add something from the menu and it will show up here.",
    browseMenu: "Browse the menu",
    itemCount: "{count} item",
    itemCountPlural: "{count} items",
    openCart: "Open your order",
    removeItem: "Remove {name} from your order",
    editItem: "Edit {name}",
    itemRemoved: "{name} removed",
    undo: "Undo",
    clear: "Clear order",
    clearConfirm: "Remove everything from your order?",
    checkout: "Go to checkout",
    continueShopping: "Add more",
    notes: "Notes",
    without: "Without",
    deliveryFee: "Delivery fee",
    deliveryFeeOnCall: "Confirmed when we call",
    deliveryFeePickup: "Not applicable — pickup",
    orderTotal: "Order total",
    noOnlinePayment: "No online payment required",
    noOnlinePaymentBody:
      "You pay the driver on delivery, or at the counter on pickup. Nothing is charged on this website.",
    minimumOrder: "Minimum order {amount} AED",
    stickyView: "View order",
  },

  checkout: {
    title: "Checkout",
    subtitle: "Tell us where the order is going. No online payment is required.",
    step: "Step {current} of {total}",

    fulfilmentLegend: "How would you like it?",
    contactLegend: "Your details",
    addressLegend: "Delivery address",
    paymentLegend: "Payment",
    reviewLegend: "Order summary",

    fullName: "Full name",
    phone: "Phone number",
    phoneHint: "UAE mobile, e.g. 05X XXX XXXX",
    email: "Email address",
    emailHint: "We send your order confirmation here.",
    area: "City / delivery area",
    areaPlaceholder: "Choose your area",
    areaHelp: "We only deliver to the areas listed here.",
    areaUnserved:
      "We do not deliver to that area yet. Choose another area, switch to pickup, or call us.",
    neighbourhood: "Neighbourhood & street",
    building: "Building name or number",
    floor: "Floor",
    apartment: "Apartment or villa number",
    landmark: "Nearby landmark",
    landmarkHint: "Helps the driver find you faster.",
    mapPin: "Map pin (optional)",
    mapPinHint: "Paste a Google Maps link to your location.",
    mapPinPlaceholder: "https://maps.app.goo.gl/…",
    mapPinShare: "Open Google Maps to copy your location link",
    deliveryInstructions: "Delivery instructions",
    deliveryInstructionsPlaceholder: "Gate code, best time to arrive, anything else.",
    paymentMethod: "How will you pay?",

    pickupNotice: "Pickup from the branch",
    pickupBody: "Collect from {address}. We will call you when the order is ready.",

    placeOrder: "Place order",
    placingOrder: "Sending your order…",
    submitError: "We could not send your order. Please try again, or call us on {phone}.",
    validationError: "Please check the highlighted fields.",
    emptyCart: "Your order is empty — add something from the menu first.",

    required: "Required",
    invalidEmail: "Enter a valid email address.",
    invalidPhone: "Enter a valid UAE phone number.",
    invalidUrl: "Enter a valid link, or leave this empty.",

    consent:
      "By placing this order you agree to our {terms} and {privacy}. We use your details only to prepare and deliver this order.",
    termsLink: "terms",
    privacyLink: "privacy policy",
  },

  confirmation: {
    eyebrow: "Order received",
    title: "Thank you — we have your order",
    reference: "Order reference",
    referenceHint: "Keep this number handy if you call us about the order.",
    body: "We have emailed a copy to {email}. Our team will call {phone} to confirm the order and the delivery fee.",
    bodyPickup: "We have emailed a copy to {email}. Our team will call {phone} when your order is ready to collect.",
    /* Used when email delivery is not configured or the send failed — we do
       not tell the customer we emailed them when we did not. */
    bodyNoEmail: "Our team will call {phone} to confirm the order and the delivery fee.",
    bodyPickupNoEmail: "Our team will call {phone} when your order is ready to collect.",
    noPayment: "No online payment was taken. You pay on delivery or at the counter.",
    whatNext: "What happens next",
    steps: [
      "Our team reviews your order and calls you to confirm it.",
      "We bake it fresh — nothing is prepared before your call.",
      "Your driver collects it and heads to your address.",
    ],
    stepsPickup: [
      "Our team reviews your order and calls you to confirm it.",
      "We bake it fresh — nothing is prepared before your call.",
      "We call you again as soon as it is ready to collect.",
    ],
    summary: "Order summary",
    deliverTo: "Delivering to",
    collectFrom: "Collect from",
    contactUs: "Questions about this order?",
    backHome: "Back to the homepage",
    orderAgain: "Order again",
    emailPending:
      "Email confirmation is not switched on yet — please keep your reference number and call us to confirm.",
    notFound: "We could not find that order in this browser.",
    notFoundBody:
      "Order details are kept on your own device only. If you have your reference number, call us and we will look it up.",
  },

  footer: {
    tagline: "Your neighborhood stop for fresh manakish and bread.",
    explore: "Explore",
    visit: "Visit",
    legal: "Legal",
    followUs: "Follow us",
    socialPending: "Our social links are being confirmed — call or message us in the meantime.",
    privacy: "Privacy policy",
    terms: "Terms of use",
    delivery: "Delivery & orders",
    rights: "All rights reserved.",
    payments: "Cards and wallets accepted in person and on delivery.",
    noOnlinePayment: "No online payment on this website.",
  },

  policies: {
    lastUpdatedLabel: "Last updated",
    privacy: {
      title: "Privacy policy",
      intro:
        "This page explains what we collect when you place an order on this website, why we need it, and how long we keep it.",
      sections: [
        {
          heading: "What we collect",
          body: "When you place an order we collect your full name, phone number, email address, delivery area, address details (neighbourhood and street, building, floor, apartment or villa, nearby landmark), any map link you choose to share, your delivery instructions and your chosen offline payment method. We also record the items in your order and the order reference we generate for it.",
        },
        {
          heading: "Why we need it",
          body: "We use these details for one purpose: to prepare your order, call you to confirm it, and deliver it to the right address. We do not use them for marketing unless you ask us to.",
        },
        {
          heading: "Payment details",
          body: "This website takes no payment and asks for no card details. Payment happens in person, at the counter or with the driver. No card number is ever entered on this site.",
        },
        {
          heading: "Who sees your details",
          body: "Your order is emailed to our branch team and a copy is emailed to you. We use a transactional email provider to send those two messages. We do not sell or share your details with anyone else.",
        },
        {
          heading: "Your basket",
          body: "The items you add are stored in your own browser so your order survives a page refresh. Clearing your browser storage removes them. Nothing is sent to us until you place the order.",
        },
        {
          heading: "How long we keep it",
          body: "We keep order records for as long as we need them for our accounts and for handling any question about the order.",
        },
        {
          heading: "Contact",
          body: "For any question about your details, or to ask us to delete them, call or message the branch on the number in the footer.",
        },
      ],
    },
    terms: {
      title: "Terms of use",
      intro: "These terms apply when you use this website to place an order with Kashkawan Cafeteria.",
      sections: [
        {
          heading: "Orders are a request, not a contract",
          body: "Placing an order on this website sends us a request. The order is confirmed when our team calls you back. If something is unavailable we will tell you on that call and offer an alternative.",
        },
        {
          heading: "Prices",
          body: "Prices shown are in UAE dirhams and match our printed menu. If a printed price changes, this website is updated to match it. Any delivery fee is confirmed with you before the order is prepared.",
        },
        {
          heading: "Payment",
          body: "No payment is taken online. You pay on delivery or at the counter, using the offline method you chose at checkout.",
        },
        {
          heading: "Delivery areas",
          body: "We deliver only to the areas listed at checkout. If your area is not listed, you can still collect your order from the branch.",
        },
        {
          heading: "Allergens",
          body: "Allergen information on this site is derived from the ingredients named on our menu and is offered as guidance. Our kitchen handles gluten, dairy, egg, nuts and sesame in a shared space, so we cannot guarantee any dish is free from traces. If you have a severe allergy, call the branch before ordering.",
        },
        {
          heading: "Cancelling",
          body: "To change or cancel an order, call the branch as soon as you can and quote your order reference. Once an order has gone into the oven we may not be able to cancel it.",
        },
        {
          heading: "This website",
          body: "We keep the menu, prices and contact details on this site accurate. If you spot something wrong, please tell us so we can fix it.",
        },
      ],
    },
    delivery: {
      title: "Delivery & orders",
      intro: "How ordering, delivery, pickup and payment work at Kashkawan.",
      sections: [
        {
          heading: "How to order",
          body: "Build your order on the menu page and place it at checkout, or call the branch and we will take it over the phone. Either way, our team calls you to confirm before we start baking.",
        },
        {
          heading: "Delivery areas",
          body: "Checkout lists every area we deliver to. If your area is not on that list we cannot deliver there yet — pickup is always available from the branch on Al Burkan Street.",
        },
        {
          heading: "Delivery fee",
          body: "The delivery fee depends on your area and is confirmed with you on the call, before we prepare the order. It is never charged on this website.",
        },
        {
          heading: "Pickup",
          body: "Choose pickup at checkout and we will call you when your order is ready to collect from the branch.",
        },
        {
          heading: "Paying",
          body: "There is no online payment. Pay the driver on delivery, or at the counter on pickup — cash or card.",
        },
        {
          heading: "Something wrong with an order?",
          body: "Call the branch with your order reference and we will put it right.",
        },
      ],
    },
  },

  about: {
    eyebrow: "Our story",
    title: "Kashkawan is familiar food, made memorable",
    lead: "A neighborhood bakery-cafeteria in Ajman centred on oven-fresh Levantine staples: manakish, pastries, pizza, fresh Arabic bread and juices.",
    promiseTitle: "Our promise",
    proofTitle: "What you can see for yourself",
    proof: [
      "Visible food freshness and appetising texture",
      "Clear, accessible prices and product names",
      "Bilingual service with equal respect for Arabic and English",
      "A grounded visual language: wheat, bread, wood and warm hospitality",
    ],
    positioningTitle: "Where we sit",
    positioning: "More crafted than fast food. More accessible than a specialist restaurant.",
    audienceTitle: "Who we cook for",
    audience: [
      { title: "Nearby families", body: "Reliable favourites, generous choice, fair value." },
      { title: "Workers & commuters", body: "Fast ordering, clear prices, fresh food to go." },
      { title: "Delivery customers", body: "Instant recognition, appetising food, easy contact." },
    ],
    valuesTitle: "What guides us",
    visitCta: "Come and see us",
  },

  location: {
    eyebrow: "Find us",
    title: "Al Rashidiya 2, Ajman",
    lead: "We are on Al Burkan Street. Call or message the number below for delivery and we will take it from there.",
    howToFind: "Getting here",
    directionsBody:
      "Open the address in Google Maps for turn-by-turn directions from wherever you are.",
    parkingNote: "Street parking is available on Al Burkan Street.",
    orderByPhone: "Order by phone",
    orderByPhoneBody: "Prefer to talk? Call or send us a WhatsApp message and we will take your order.",
    orderOnline: "Order online",
    orderOnlineBody: "Build your order from the full menu and we will call you to confirm it.",
  },

  a11y: {
    cartRegion: "Your order",
    addedToCart: "{name} added to your order",
  },
};

export default en;

/**
 * The shape every locale must satisfy. Inferred from the English copy — adding
 * a key here makes the Arabic file fail to compile until it is translated,
 * which is exactly the safety net a bilingual site needs.
 */
export type Dictionary = typeof en;
