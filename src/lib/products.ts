export type Store = "frozen" | "kitchen";

export type Tag = "halal" | "spicy" | "veg" | "bestseller" | "new" | "family-pack" | "air-fryer";

export interface Variant {
  label: string;
  price: number;
  compareAt?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  store: Store;
  category: string;
  image: string;
  gallery: string[];
  variants: Variant[];
  rating: number;
  reviews: number;
  stock: number;
  tags: Tag[];
  short: string;
  description: string;
  highlights: string[];
  nutrition?: { serving: string; calories: number; protein: number; carbs: number; fat: number };
  cooking?: { method: string; time: string; steps: string }[];
  specs?: Record<string, string>;
  sold: number;
}

export interface Category {
  slug: string;
  name: string;
  store: Store;
  image: string;
  blurb: string;
}

export const categories: Category[] = [
  { slug: "chicken", name: "Chicken & Nuggets", store: "frozen", image: "1562967914-608f82629710", blurb: "Crispy, juicy, ready in minutes" },
  { slug: "kebabs-bbq", name: "Kebabs & BBQ", store: "frozen", image: "1555939594-58d7cb561ad1", blurb: "Char-grilled desi flavours" },
  { slug: "snacks", name: "Snacks & Samosas", store: "frozen", image: "1601050690597-df0568f70950", blurb: "Tea-time, sorted" },
  { slug: "ready-meals", name: "Ready Meals", store: "frozen", image: "1631515243349-e0cb75fb8d3a", blurb: "Home-style, heat & eat" },
  { slug: "seafood", name: "Seafood", store: "frozen", image: "1565680018434-b513d5e5fd47", blurb: "Flash-frozen at sea" },
  { slug: "pizza-burgers", name: "Pizza & Burgers", store: "frozen", image: "1628840042765-356cda07504e", blurb: "Weekend cravings" },
  { slug: "desserts", name: "Desserts & Ice Cream", store: "frozen", image: "1497034825429-c343d7c6a68f", blurb: "Sweet endings" },
  { slug: "fruits-veg", name: "Fruits & Veg", store: "frozen", image: "1590779033100-9f60a05a013d", blurb: "Picked ripe, frozen fresh" },
  { slug: "cookware", name: "Cookware", store: "kitchen", image: "1590794056226-79ef3a8147e1", blurb: "Built for everyday cooking" },
  { slug: "appliances", name: "Appliances", store: "kitchen", image: "1544233726-9f1d2b27be8b", blurb: "Smarter, faster kitchens" },
  { slug: "tools", name: "Knives & Tools", store: "kitchen", image: "1593618998160-e34014e67546", blurb: "Precision in every cut" },
  { slug: "serveware", name: "Serveware", store: "kitchen", image: "1610701596007-11502861dcfa", blurb: "Plate it beautifully" },
];

const fryCook = (airFryer: string, pan: string, oven: string) => [
  { method: "Air Fryer", time: airFryer, steps: "Preheat to 200°C. Cook straight from frozen in a single layer, shaking halfway." },
  { method: "Shallow Fry", time: pan, steps: "Heat oil on medium flame. Fry from frozen, turning until golden and crisp." },
  { method: "Oven", time: oven, steps: "Preheat to 220°C. Bake on a lined tray, flipping once halfway through." },
];

const heatCook = [
  { method: "Microwave", time: "5–6 min", steps: "Pierce film, heat on high for 3 min, stir, then 2–3 min more. Rest 1 min." },
  { method: "Stovetop", time: "10–12 min", steps: "Empty into a pan with 2 tbsp water. Cover and heat on low, stirring occasionally." },
];

type Seed = Omit<Product, "id" | "slug" | "gallery"> & { gallery?: string[] };

const seeds: Seed[] = [
  // ---------- FROZEN ----------
  {
    name: "Crispy Chicken Nuggets", store: "frozen", category: "chicken", image: "1562967914-608f82629710",
    variants: [{ label: "500 g", price: 790, compareAt: 890 }, { label: "1 kg", price: 1450, compareAt: 1690 }, { label: "2 kg Family", price: 2690, compareAt: 3290 }],
    rating: 4.8, reviews: 1284, stock: 142, sold: 9820, tags: ["halal", "bestseller", "air-fryer", "family-pack"],
    short: "Golden breaded bites made with 100% chicken breast.",
    description: "Our signature nuggets are made from whole-muscle chicken breast, lightly seasoned and coated in a crunchy golden crumb. Snap-frozen within 2 hours of production to lock in juiciness, they go from freezer to plate in under 10 minutes.",
    highlights: ["100% chicken breast, no fillers", "HFA Halal certified", "No added MSG", "Air-fryer ready in 8 minutes"],
    nutrition: { serving: "100 g", calories: 245, protein: 16, carbs: 14, fat: 13 },
    cooking: fryCook("8–10 min", "5–6 min", "15–18 min"),
  },
  {
    name: "Hot & Spicy Chicken Wings", store: "frozen", category: "chicken", image: "1567620832903-9fc6debc209f",
    variants: [{ label: "750 g", price: 1190 }, { label: "1.5 kg", price: 2250, compareAt: 2380 }],
    rating: 4.7, reviews: 642, stock: 58, sold: 4210, tags: ["halal", "spicy", "air-fryer"],
    short: "Fiery marinated wings with a sticky peri-peri glaze.",
    description: "Tender wings marinated overnight in our house peri-peri blend of red chilli, garlic and lemon, then par-cooked and frozen. Toss in the air fryer for a crackling skin and a heat that builds.",
    highlights: ["Overnight marinated", "Par-cooked for speed", "Medium-hot peri-peri", "Party favourite"],
    nutrition: { serving: "100 g", calories: 228, protein: 19, carbs: 4, fat: 15 },
    cooking: fryCook("14–16 min", "10–12 min", "22–25 min"),
  },
  {
    name: "Southern Fried Drumsticks", store: "frozen", category: "chicken", image: "1626082927389-6cd097cdc6ec",
    variants: [{ label: "1 kg", price: 1590, compareAt: 1750 }],
    rating: 4.6, reviews: 388, stock: 34, sold: 2380, tags: ["halal", "air-fryer"],
    short: "Double-breaded, 11-spice crunchy drumsticks.",
    description: "Buttermilk-soaked drumsticks double-dipped in a signature 11-spice crumb for that shatteringly crisp restaurant crunch at home.",
    highlights: ["Buttermilk brined", "11-spice coating", "Fully cooked — just reheat"],
    nutrition: { serving: "100 g", calories: 262, protein: 18, carbs: 11, fat: 16 },
    cooking: fryCook("15–18 min", "12 min", "25 min"),
  },
  {
    name: "Zinger Chicken Fillets", store: "frozen", category: "chicken", image: "1599921841143-819065a55cc6",
    variants: [{ label: "6 pcs", price: 1340 }, { label: "12 pcs", price: 2490, compareAt: 2680 }],
    rating: 4.7, reviews: 511, stock: 7, sold: 3120, tags: ["halal", "spicy", "new"],
    short: "Burger-ready spicy fillets with an extra crunchy crust.",
    description: "Whole chicken thigh fillets flattened, spiced and crumbed — the exact size of a burger bun. Build a zinger that beats the drive-through.",
    highlights: ["Whole thigh fillet", "Bun-sized", "Extra crunchy flake crust"],
    nutrition: { serving: "1 fillet", calories: 310, protein: 22, carbs: 19, fat: 16 },
    cooking: fryCook("12–14 min", "8 min", "20 min"),
  },
  {
    name: "Chicken Seekh Kebab", store: "frozen", category: "kebabs-bbq", image: "1603360946369-dc9bb6258143",
    variants: [{ label: "12 pcs", price: 1150, compareAt: 1290 }, { label: "24 pcs", price: 2190, compareAt: 2580 }],
    rating: 4.9, reviews: 2031, stock: 96, sold: 12450, tags: ["halal", "bestseller", "spicy"],
    short: "Charcoal-grilled, hand-rolled Lahori-style seekh.",
    description: "Minced chicken hand-blended with fresh coriander, green chilli, ginger and our 14-spice garam masala, skewered and charcoal-grilled for authentic smoky flavour.",
    highlights: ["Real charcoal smoke", "14-spice masala", "Fully cooked", "Lahori recipe"],
    nutrition: { serving: "2 pcs", calories: 180, protein: 17, carbs: 3, fat: 11 },
    cooking: [
      { method: "Tawa / Pan", time: "6–8 min", steps: "Heat a little oil on a tawa. Cook from frozen on medium, turning often." },
      { method: "Air Fryer", time: "8 min", steps: "Brush with oil and air fry at 190°C, turning once." },
    ],
  },
  {
    name: "Chicken Tikka Boti", store: "frozen", category: "kebabs-bbq", image: "1610057099443-fde8c4d50f91",
    variants: [{ label: "500 g", price: 1090 }, { label: "1 kg", price: 1990, compareAt: 2180 }],
    rating: 4.8, reviews: 876, stock: 61, sold: 5630, tags: ["halal", "spicy"],
    short: "Yogurt-marinated boneless tikka, tandoor finished.",
    description: "Boneless chicken chunks marinated in hung yogurt, kashmiri chilli and mustard oil, then tandoor-roasted. Perfect for wraps, platters and karahi.",
    highlights: ["Boneless", "Tandoor roasted", "Great for wraps"],
    nutrition: { serving: "100 g", calories: 165, protein: 24, carbs: 3, fat: 6 },
    cooking: [{ method: "Pan", time: "7 min", steps: "Sauté from frozen with a tsp of butter until heated through and slightly charred." }],
  },
  {
    name: "BBQ Mixed Grill Platter", store: "frozen", category: "kebabs-bbq", image: "1555939594-58d7cb561ad1",
    variants: [{ label: "Serves 4", price: 3490, compareAt: 3990 }, { label: "Serves 8", price: 6490, compareAt: 7980 }],
    rating: 4.9, reviews: 322, stock: 18, sold: 1470, tags: ["halal", "family-pack", "bestseller"],
    short: "Seekh, tikka, malai boti & wings — a dawat in a box.",
    description: "Everything you need for a backyard BBQ night: chicken seekh kebabs, tikka boti, creamy malai boti and spicy wings, plus two dipping chutneys.",
    highlights: ["4 grills in one box", "Includes mint & imli chutney", "Serves a full family"],
    nutrition: { serving: "150 g", calories: 290, protein: 30, carbs: 5, fat: 17 },
    cooking: [{ method: "Grill / Oven", time: "15–20 min", steps: "Thaw 30 min. Grill or bake at 200°C, basting with butter, until sizzling." }],
  },
  {
    name: "Punjabi Aloo Samosa", store: "frozen", category: "snacks", image: "1601050690597-df0568f70950",
    variants: [{ label: "12 pcs", price: 620 }, { label: "24 pcs", price: 1180, compareAt: 1240 }],
    rating: 4.8, reviews: 1540, stock: 210, sold: 15200, tags: ["veg", "bestseller", "air-fryer"],
    short: "Flaky pastry filled with spiced potato & peas.",
    description: "Hand-folded samosas with a crisp ajwain pastry and a tangy potato-pea filling spiced with anardana and roasted cumin. Iftar and chai-time essential.",
    highlights: ["Hand folded", "Vegetarian", "Fry or air fry from frozen"],
    nutrition: { serving: "2 pcs", calories: 260, protein: 5, carbs: 32, fat: 12 },
    cooking: fryCook("12 min", "6–7 min", "20 min"),
  },
  {
    name: "Chicken Momos", store: "frozen", category: "snacks", image: "1534422298391-e4f8c172dddb",
    variants: [{ label: "20 pcs", price: 890 }],
    rating: 4.6, reviews: 298, stock: 74, sold: 1980, tags: ["halal", "new"],
    short: "Steamed dumplings with ginger-garlic chicken.",
    description: "Thin, silky wrappers pleated around juicy ginger-garlic chicken. Steam, pan-fry or drop into soup. Comes with a sachet of fiery red chutney.",
    highlights: ["Hand pleated", "Chutney sachet included", "Steam in 10 min"],
    nutrition: { serving: "5 pcs", calories: 210, protein: 12, carbs: 26, fat: 6 },
    cooking: [{ method: "Steam", time: "10–12 min", steps: "Place on greased steamer basket over boiling water. Steam covered from frozen." }],
  },
  {
    name: "Masala Crinkle Fries", store: "frozen", category: "snacks", image: "1573080496219-bb080dd4f877",
    variants: [{ label: "1 kg", price: 690 }, { label: "2.5 kg", price: 1590, compareAt: 1725 }],
    rating: 4.5, reviews: 734, stock: 180, sold: 8740, tags: ["veg", "air-fryer", "family-pack"],
    short: "Crinkle-cut potato fries with a masala dust.",
    description: "Premium grade potatoes crinkle-cut for maximum crunch and pre-seasoned with our chatpata masala. Kids' favourite.",
    highlights: ["Grade A potatoes", "Pre-seasoned", "Extra crunch ridges"],
    nutrition: { serving: "100 g", calories: 150, protein: 2, carbs: 22, fat: 6 },
    cooking: fryCook("15 min", "4–5 min", "22 min"),
  },
  {
    name: "Chicken Biryani Ready Meal", store: "frozen", category: "ready-meals", image: "1631515243349-e0cb75fb8d3a",
    variants: [{ label: "Single 400 g", price: 650 }, { label: "Pack of 4", price: 2390, compareAt: 2600 }],
    rating: 4.7, reviews: 912, stock: 88, sold: 6210, tags: ["halal", "spicy", "bestseller"],
    short: "Layered Karachi-style biryani with bone-in chicken.",
    description: "Aged basmati layered with slow-cooked masala chicken, fried onions, aloo and saffron. Dum-cooked in small batches, then frozen fresh.",
    highlights: ["Aged sella basmati", "Dum cooked", "No preservatives"],
    nutrition: { serving: "400 g", calories: 620, protein: 32, carbs: 78, fat: 20 },
    cooking: heatCook,
  },
  {
    name: "Butter Chicken & Rice", store: "frozen", category: "ready-meals", image: "1631452180519-c014fe946bc7",
    variants: [{ label: "Single 400 g", price: 690 }, { label: "Pack of 4", price: 2550, compareAt: 2760 }],
    rating: 4.6, reviews: 455, stock: 52, sold: 2840, tags: ["halal"],
    short: "Creamy makhani gravy with tandoori chicken & jeera rice.",
    description: "Tandoori chicken simmered in a velvety tomato-butter makhani sauce with kasuri methi, served with fragrant jeera rice.",
    highlights: ["Real butter & cream", "Mildly spiced", "Complete meal"],
    nutrition: { serving: "400 g", calories: 580, protein: 29, carbs: 62, fat: 23 },
    cooking: heatCook,
  },
  {
    name: "Pepperoni Stone-Baked Pizza", store: "frozen", category: "pizza-burgers", image: "1628840042765-356cda07504e",
    variants: [{ label: '10" Medium', price: 1190 }, { label: '12" Large', price: 1590, compareAt: 1790 }],
    rating: 4.5, reviews: 367, stock: 41, sold: 2150, tags: ["halal"],
    short: "Beef pepperoni, mozzarella & slow-cooked tomato sauce.",
    description: "A thin, stone-baked sourdough base loaded with halal beef pepperoni and a generous layer of real mozzarella. Oven to table in 12 minutes.",
    highlights: ["Sourdough base", "Real mozzarella", "Halal beef pepperoni"],
    nutrition: { serving: "1/3 pizza", calories: 320, protein: 14, carbs: 34, fat: 14 },
    cooking: [{ method: "Oven", time: "10–12 min", steps: "Preheat to 220°C. Bake directly on the rack until cheese bubbles." }],
  },
  {
    name: "Margherita Wood-Fired Pizza", store: "frozen", category: "pizza-burgers", image: "1574071318508-1cdbab80d002",
    variants: [{ label: '12" Large', price: 1390 }],
    rating: 4.4, reviews: 188, stock: 29, sold: 1120, tags: ["veg"],
    short: "San Marzano tomato, fior di latte & fresh basil.",
    description: "Neapolitan-style leopard-spotted crust with San Marzano tomato sauce, creamy mozzarella and basil.",
    highlights: ["Wood-fired crust", "Vegetarian", "48-hour dough"],
    nutrition: { serving: "1/3 pizza", calories: 270, protein: 11, carbs: 33, fat: 10 },
    cooking: [{ method: "Oven", time: "8–10 min", steps: "Preheat to 230°C. Bake on the middle rack." }],
  },
  {
    name: "Smash Beef Burger Patties", store: "frozen", category: "pizza-burgers", image: "1568901346375-23c9450c58cd",
    variants: [{ label: "6 patties", price: 1490 }, { label: "12 patties", price: 2790, compareAt: 2980 }],
    rating: 4.8, reviews: 603, stock: 44, sold: 3380, tags: ["halal", "new"],
    short: "80/20 beef chuck, seasoned & ready to smash.",
    description: "Freshly ground 80/20 beef chuck portioned into balls, frozen with parchment. Smash on a screaming hot pan for lacy, crusty edges.",
    highlights: ["80/20 beef chuck", "Parchment separated", "No binders"],
    nutrition: { serving: "1 patty", calories: 290, protein: 20, carbs: 0, fat: 23 },
    cooking: [{ method: "Griddle", time: "4 min", steps: "Thaw 10 min. Smash hard on a very hot pan, season, flip after 2 min, add cheese." }],
  },
  {
    name: "Jumbo Tiger Prawns", store: "frozen", category: "seafood", image: "1565680018434-b513d5e5fd47",
    variants: [{ label: "500 g", price: 2890 }, { label: "1 kg", price: 5490, compareAt: 5780 }],
    rating: 4.7, reviews: 214, stock: 23, sold: 980, tags: ["halal"],
    short: "Shell-on, deveined U15 prawns, IQF frozen.",
    description: "Wild-caught from the Arabian Sea, graded U15, deveined and individually quick frozen (IQF) so you can use exactly what you need.",
    highlights: ["IQF — no clumping", "Deveined", "Wild caught"],
    nutrition: { serving: "100 g", calories: 99, protein: 24, carbs: 0, fat: 1 },
    cooking: [{ method: "Pan / Grill", time: "4–5 min", steps: "Thaw in cold water. Sear on high heat 2 min per side until pink." }],
  },
  {
    name: "Norwegian Salmon Fillets", store: "frozen", category: "seafood", image: "1601314002592-b8734bca6604",
    variants: [{ label: "2 × 150 g", price: 3290 }, { label: "4 × 150 g", price: 6290, compareAt: 6580 }],
    rating: 4.9, reviews: 156, stock: 15, sold: 640, tags: ["new"],
    short: "Skin-on, pin-boned fillets rich in omega-3.",
    description: "Premium Norwegian Atlantic salmon, vacuum sealed and frozen at -35°C within hours of harvest. Restaurant quality for pan-searing or baking.",
    highlights: ["Vacuum sealed portions", "Pin-boned", "Rich in Omega-3"],
    nutrition: { serving: "150 g", calories: 310, protein: 31, carbs: 0, fat: 20 },
    cooking: [{ method: "Pan-sear", time: "8 min", steps: "Thaw overnight. Sear skin-side down 5 min, flip and cook 3 min." }],
  },
  {
    name: "Strawberry Vanilla Ice Cream", store: "frozen", category: "desserts", image: "1497034825429-c343d7c6a68f",
    variants: [{ label: "1 L Tub", price: 890 }, { label: "2 L Tub", price: 1590, compareAt: 1780 }],
    rating: 4.6, reviews: 420, stock: 66, sold: 3910, tags: ["veg"],
    short: "Real strawberries swirled through Madagascar vanilla.",
    description: "Slow-churned with fresh cream, Madagascar vanilla bean and a ribbon of real strawberry compote.",
    highlights: ["Real fruit ribbon", "Fresh dairy cream", "No artificial colours"],
    nutrition: { serving: "100 ml", calories: 210, protein: 3, carbs: 24, fat: 11 },
  },
  {
    name: "Berry Kulfi Pops", store: "frozen", category: "desserts", image: "1488900128323-21503983a07e",
    variants: [{ label: "6 pops", price: 750 }],
    rating: 4.7, reviews: 233, stock: 48, sold: 1650, tags: ["veg", "new"],
    short: "Slow-reduced milk kulfi with mixed berries.",
    description: "Traditional khoya kulfi meets tangy mixed berries — creamy, dense and not too sweet.",
    highlights: ["Real khoya", "Mixed berries", "Kids approved"],
    nutrition: { serving: "1 pop", calories: 140, protein: 3, carbs: 17, fat: 7 },
  },
  {
    name: "Triple Chocolate Fudge Cake", store: "frozen", category: "desserts", image: "1578985545062-69928b1d9587",
    variants: [{ label: '8" (serves 10)', price: 2990, compareAt: 3290 }],
    rating: 4.9, reviews: 187, stock: 12, sold: 870, tags: ["veg", "bestseller"],
    short: "Belgian chocolate sponge, ganache & fudge frosting.",
    description: "Three layers of moist Belgian chocolate sponge, whipped ganache and a glossy fudge drip. Thaw for 4 hours and it tastes bakery-fresh.",
    highlights: ["Belgian chocolate", "Thaw & serve", "Celebration size"],
    nutrition: { serving: "1 slice", calories: 420, protein: 5, carbs: 52, fat: 22 },
  },
  {
    name: "Wild Frozen Blueberries", store: "frozen", category: "fruits-veg", image: "1498557850523-fd3d118b962e",
    variants: [{ label: "500 g", price: 1450 }],
    rating: 4.7, reviews: 142, stock: 39, sold: 760, tags: ["veg"],
    short: "IQF wild blueberries for smoothies & baking.",
    description: "Small, intensely flavoured wild blueberries, individually quick frozen at peak ripeness.",
    highlights: ["Antioxidant rich", "IQF", "No added sugar"],
    nutrition: { serving: "100 g", calories: 57, protein: 1, carbs: 14, fat: 0 },
  },
  {
    name: "Garden Mixed Vegetables", store: "frozen", category: "fruits-veg", image: "1590779033100-9f60a05a013d",
    variants: [{ label: "1 kg", price: 520 }],
    rating: 4.5, reviews: 309, stock: 120, sold: 4400, tags: ["veg", "family-pack"],
    short: "Carrots, peas, corn, beans & peppers — blanched & frozen.",
    description: "Farm-fresh vegetables washed, diced, blanched and frozen within hours of harvest to keep vitamins in.",
    highlights: ["Pre-washed & chopped", "Blanched", "Farm to freezer in 6 hrs"],
    nutrition: { serving: "100 g", calories: 64, protein: 3, carbs: 12, fat: 0 },
    cooking: [{ method: "Stir-fry", time: "5 min", steps: "Add straight from frozen to a hot pan with oil. Season and toss." }],
  },

  // ---------- KITCHEN ----------
  {
    name: "Enamel Cast Iron Dutch Oven", store: "kitchen", category: "cookware", image: "1590794056226-79ef3a8147e1",
    variants: [{ label: "24 cm / 4.2 L", price: 14990, compareAt: 18500 }, { label: "28 cm / 6.7 L", price: 18990, compareAt: 22900 }],
    rating: 4.9, reviews: 418, stock: 22, sold: 1320, tags: ["bestseller"],
    short: "Heirloom-grade pot for biryani, nihari & slow roasts.",
    description: "Heavy cast iron with a chip-resistant enamel finish. Even heat retention makes it perfect for dum biryani, haleem and bread baking. Oven-safe to 260°C.",
    highlights: ["Oven safe to 260°C", "Induction compatible", "Lifetime warranty"],
    specs: { Material: "Enamelled cast iron", Compatible: "Gas, induction, oven", Warranty: "Lifetime", Care: "Hand wash recommended" },
  },
  {
    name: "Tri-Ply Stainless Frying Pan", store: "kitchen", category: "cookware", image: "1605522561233-768ad7a8fabf",
    variants: [{ label: "26 cm", price: 6490 }, { label: "30 cm", price: 7990, compareAt: 8900 }],
    rating: 4.7, reviews: 265, stock: 40, sold: 980, tags: [],
    short: "Aluminium-core tri-ply for a perfect sear every time.",
    description: "Stainless steel bonded to an aluminium core runs all the way up the sides for even heating. Dishwasher safe and built for decades.",
    highlights: ["Full tri-ply body", "Stay-cool handle", "Dishwasher safe"],
    specs: { Material: "18/10 stainless + aluminium", Compatible: "All hobs incl. induction", Warranty: "10 years" },
  },
  {
    name: "Granite Non-Stick Wok", store: "kitchen", category: "cookware", image: "1528712306091-ed0763094c98",
    variants: [{ label: "30 cm with lid", price: 4290, compareAt: 4990 }],
    rating: 4.5, reviews: 511, stock: 64, sold: 2210, tags: ["new"],
    short: "PFOA-free granite coating for low-oil cooking.",
    description: "Deep wok with a 5-layer granite non-stick coating — ideal for karahi, stir fries and reheating frozen snacks with minimal oil.",
    highlights: ["PFOA free", "5-layer coating", "Glass lid included"],
    specs: { Material: "Forged aluminium", Coating: "Granite non-stick", Warranty: "2 years" },
  },
  {
    name: "Digital Multi Pressure Cooker 6L", store: "kitchen", category: "appliances", image: "1544233726-9f1d2b27be8b",
    variants: [{ label: "6 L", price: 24990, compareAt: 29990 }],
    rating: 4.8, reviews: 733, stock: 9, sold: 1890, tags: ["bestseller"],
    short: "10-in-1: pressure cook, slow cook, rice, yogurt & more.",
    description: "Cut cooking time by up to 70%. 13 one-touch programs including nihari, rice, yogurt and sauté. Stainless inner pot with 10 safety mechanisms.",
    highlights: ["13 smart programs", "Delay start timer", "10 safety features"],
    specs: { Capacity: "6 litres", Power: "1000 W", Programs: "13", Warranty: "1 year official" },
  },
  {
    name: "1200W Power Blender", store: "kitchen", category: "appliances", image: "1585515320310-259814833e62",
    variants: [{ label: "1.8 L jar", price: 11990, compareAt: 13990 }],
    rating: 4.6, reviews: 347, stock: 31, sold: 1210, tags: [],
    short: "Crushes frozen fruit & ice in seconds.",
    description: "A 1200W motor and 6-blade stainless assembly pulverise frozen berries, ice and nuts for silky smoothies, lassi and chutneys.",
    highlights: ["1200 W motor", "BPA-free Tritan jar", "Pulse & 3 speeds"],
    specs: { Power: "1200 W", Capacity: "1.8 L", Blades: "6 stainless steel", Warranty: "2 years" },
  },
  {
    name: "Burr Spice & Coffee Grinder", store: "kitchen", category: "appliances", image: "1570222094114-d054a817e56b",
    variants: [{ label: "Standard", price: 8490 }],
    rating: 4.4, reviews: 128, stock: 26, sold: 450, tags: ["new"],
    short: "18 grind settings for masalas & coffee beans.",
    description: "Conical burr grinder that gives you consistent grinds for fresh garam masala, chilli flakes or espresso.",
    highlights: ["18 settings", "Removable burr", "Quiet motor"],
    specs: { Power: "150 W", Hopper: "250 g", Warranty: "1 year" },
  },
  {
    name: "Retro Mini Freezer 90L", store: "kitchen", category: "appliances", image: "1571175443880-49e1d25b2bc5",
    variants: [{ label: "Mint", price: 64990, compareAt: 72000 }],
    rating: 4.7, reviews: 96, stock: 5, sold: 210, tags: ["new"],
    short: "Keeps your Frostly haul at a steady -18°C.",
    description: "A statement retro-styled upright freezer with inverter compressor and 4-star freezing, sized perfectly for apartments.",
    highlights: ["4-star -18°C", "Inverter compressor", "A++ energy rating"],
    specs: { Capacity: "90 L", Rating: "A++", Noise: "39 dB", Warranty: "10 yrs compressor" },
  },
  {
    name: "Damascus Chef Knife Set", store: "kitchen", category: "tools", image: "1593618998160-e34014e67546",
    variants: [{ label: "5-piece + roll", price: 15990, compareAt: 19990 }],
    rating: 4.9, reviews: 204, stock: 17, sold: 560, tags: ["bestseller"],
    short: "67-layer steel with olive-wood handles & leather roll.",
    description: "Chef, santoku, utility, carving fork and honing steel — hand-sharpened to 15° and presented in a waxed canvas roll.",
    highlights: ["67-layer Damascus", "15° edge", "Gift-ready roll"],
    specs: { Steel: "VG-10 core", Handle: "Olive wood", Pieces: "5", Warranty: "Lifetime" },
  },
  {
    name: "Acacia Board & Utensil Set", store: "kitchen", category: "tools", image: "1556909211-36987daf7b4d",
    variants: [{ label: "Board + 6 tools", price: 5490 }],
    rating: 4.6, reviews: 173, stock: 45, sold: 830, tags: [],
    short: "Solid acacia board with silicone utensils & crock.",
    description: "End-grain acacia chopping board paired with heat-proof silicone spatulas, whisk and ladle in a ceramic crock.",
    highlights: ["Knife-friendly acacia", "Heat-proof to 230°C", "Ceramic crock"],
    specs: { Board: "45 × 30 cm", Utensils: "Silicone + beech", Care: "Oil monthly" },
  },
  {
    name: "Measuring Spoon & Spice Kit", store: "kitchen", category: "tools", image: "1506368249639-73a05d6f6488",
    variants: [{ label: "8-piece", price: 1890 }],
    rating: 4.5, reviews: 241, stock: 90, sold: 1650, tags: [],
    short: "Magnetic stainless spoons with engraved measures.",
    description: "Dual-sided magnetic measuring spoons that nest together and fit narrow spice jars.",
    highlights: ["Dual-sided", "Magnetic nesting", "Laser engraved"],
    specs: { Material: "Stainless steel", Pieces: "8" },
  },
  {
    name: "Stoneware Bowl Collection", store: "kitchen", category: "serveware", image: "1610701596007-11502861dcfa",
    variants: [{ label: "Set of 4", price: 4990 }, { label: "Set of 8", price: 8990, compareAt: 9980 }],
    rating: 4.7, reviews: 158, stock: 36, sold: 690, tags: ["new"],
    short: "Hand-glazed speckled bowls, microwave & oven safe.",
    description: "Artisan stoneware with a two-tone speckled glaze. Each piece is subtly unique.",
    highlights: ["Hand glazed", "Microwave safe", "Chip resistant"],
    specs: { Material: "Stoneware", Diameter: "14 cm", Care: "Dishwasher safe" },
  },
  {
    name: "Nesting Serving Bowls", store: "kitchen", category: "serveware", image: "1603199506016-b9a594b593c0",
    variants: [{ label: "Set of 3", price: 3490 }],
    rating: 4.4, reviews: 92, stock: 52, sold: 380, tags: [],
    short: "Patterned ceramic bowls that stack neatly.",
    description: "Three nesting bowls with a hand-painted geometric exterior — for raita, salads and desserts.",
    highlights: ["Space saving", "Hand painted", "Food safe glaze"],
    specs: { Material: "Ceramic", Sizes: "12 / 16 / 20 cm" },
  },
  {
    name: "Smart Recipe Tablet Stand", store: "kitchen", category: "serveware", image: "1495521821757-a1efb6729352",
    variants: [{ label: "Walnut", price: 2790 }],
    rating: 4.3, reviews: 64, stock: 70, sold: 290, tags: [],
    short: "Walnut stand with utensil caddy for recipe videos.",
    description: "Keep your tablet splash-free and at eye level while following recipes, with a built-in caddy.",
    highlights: ["Solid walnut", "Adjustable angle", "Built-in caddy"],
    specs: { Material: "Walnut + ceramic", Fits: "Up to 13-inch tablets" },
  },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const lifestyle = ["1556909114-f6e7ad7d3136", "1556911261-6bd341186b2f", "1556910633-5099dc3971e8"];

export const products: Product[] = seeds.map((s, i) => ({
  ...s,
  id: `p${String(i + 1).padStart(3, "0")}`,
  slug: slugify(s.name),
  gallery: s.gallery ?? [s.image, lifestyle[i % lifestyle.length]],
}));

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getProductById = (id: string) => products.find((p) => p.id === id);
export const byStore = (store: Store) => products.filter((p) => p.store === store);
export const byTag = (tag: Tag) => products.filter((p) => p.tags.includes(tag));
export const priceOf = (p: Product) => p.variants[0].price;

export const related = (p: Product, n = 4) =>
  products.filter((x) => x.id !== p.id && x.category === p.category)
    .concat(products.filter((x) => x.id !== p.id && x.store === p.store && x.category !== p.category))
    .slice(0, n);

/** Cross-sell from the other store: frozen food → kitchen gear and vice versa. */
export const crossSell = (p: Product, n = 2) => {
  const pool = products.filter((x) => x.store !== p.store).sort((a, b) => b.sold - a.sold);
  const offset = Number(p.id.slice(1)) % Math.max(1, pool.length - n);
  return pool.slice(offset, offset + n);
};

export const tagLabels: Record<Tag, string> = {
  halal: "Halal",
  spicy: "Spicy",
  veg: "Vegetarian",
  bestseller: "Bestseller",
  new: "New",
  "family-pack": "Family Pack",
  "air-fryer": "Air-Fryer Friendly",
};

export const reviewsFor = (p: Product) => {
  const names = ["Ayesha K.", "Hamza R.", "Sana M.", "Bilal A.", "Mahnoor S.", "Usman T.", "Fatima Z.", "Daniyal H."];
  const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"];
  const bodies = p.store === "frozen"
    ? ["Arrived still rock solid frozen — the insulated box is legit. Tastes like homemade.", "My kids finished the whole pack in one evening. Reordering already!", "Perfect in the air fryer, super crispy and not oily at all.", "Delivery slot was on time to the minute. Quality is consistent every order."]
    : ["Build quality is excellent, feels far more premium than the price.", "Packaging was secure and it arrived a day early. Very happy.", "Use it daily now — easily one of the best kitchen buys this year.", "Looks gorgeous on the counter and performs even better."];
  const seed = Number(p.id.slice(1));
  return Array.from({ length: 4 }, (_, i) => ({
    id: `${p.id}-r${i}`,
    name: names[(seed + i * 3) % names.length],
    city: cities[(seed + i) % cities.length],
    rating: i === 3 ? 4 : 5,
    date: new Date(2026, 7, 28 - ((seed * 3 + i * 7) % 26)).toISOString(),
    body: bodies[i],
    verified: true,
  }));
};
