const pkr = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

export const formatPrice = (value: number) => `Rs. ${pkr.format(Math.round(value))}`;

export const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export const discountPercent = (price: number, compareAt?: number) =>
  compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
