import type { Order } from "./store";
import { products } from "./products";

export const STAGES = [
  { key: "confirmed", label: "Order confirmed", body: "We’ve received your order and payment details.", at: 0 },
  { key: "packed", label: "Packed in cold box", body: "Blast-frozen items sealed in an insulated box with gel packs.", at: 1 },
  { key: "dispatched", label: "Dispatched", body: "Loaded into a -18°C refrigerated van.", at: 2 },
  { key: "out", label: "Out for delivery", body: "Your rider is on the way.", at: 3 },
  { key: "delivered", label: "Delivered", body: "Box temperature verified at your door.", at: 5 },
] as const;

/** Demo timeline is accelerated: each stage is reached after `at` minutes. */
export const stageIndex = (createdAt: string, now: number) => {
  const mins = (now - new Date(createdAt).getTime()) / 60000;
  return STAGES.reduce((idx, s, i) => (mins >= s.at ? i : idx), 0);
};

const names = ["Ayesha Khan", "Hamza Raza", "Sana Mirza", "Bilal Ahmed", "Mahnoor Shah", "Usman Tariq", "Fatima Zahra", "Daniyal Haider", "Zainab Ali", "Ali Hassan", "Hira Malik", "Omar Siddiqui"];
const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"];
const pays = ["Cash on Delivery", "Credit / Debit Card", "JazzCash", "Easypaisa"];

/** Deterministic pseudo-random sample orders for the demo admin & tracking pages. */
export function demoOrders(now: number): Order[] {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 60 }, (_, i) => {
    const count = 1 + Math.floor(rand() * 4);
    const items = Array.from({ length: count }, () => {
      const p = products[Math.floor(rand() * products.length)];
      const v = p.variants[Math.floor(rand() * p.variants.length)];
      return { productId: p.id, name: p.name, variant: v.label, price: v.price, qty: p.store === "kitchen" ? 1 : 1 + Math.floor(rand() * 3), image: p.image };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const delivery = subtotal >= 3000 ? 0 : 199;
    const minutesAgo = i === 0 ? 3.5 : Math.round(240 * Math.pow(i, 1.12)) + Math.floor(rand() * 90);
    const name = names[i % names.length];
    return {
      id: i === 0 ? "FRL-28413" : `FRL-${28413 - i * 37}`,
      createdAt: new Date(now - minutesAgo * 60000).toISOString(),
      items,
      address: { name, phone: "0300-1234567", email: `${name.split(" ")[0].toLowerCase()}@mail.pk`, city: cities[i % cities.length], area: "DHA", address: `House ${12 + i}, Street ${3 + (i % 9)}` },
      slot: { date: new Date(now).toISOString().slice(0, 10), window: "4pm – 7pm" },
      payment: pays[i % pays.length],
      subtotal,
      discount: 0,
      delivery,
      total: subtotal + delivery,
    };
  });
}
