import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { Newsletter } from "./Newsletter";

const cols = [
  { title: "Shop", links: [["Frozen Foods", "/shop?store=frozen"], ["Kitchen Essentials", "/shop?store=kitchen"], ["Bestsellers", "/shop?tag=bestseller"], ["Deals", "/shop?sort=discount"]] },
  { title: "Help", links: [["Track your order", "/track"], ["My account", "/account"], ["Refer & earn", "/referrals"], ["Wishlist", "/wishlist"], ["FAQs", "/#faq"]] },
  { title: "Company", links: [["Our cold chain", "/#cold-chain"], ["Admin dashboard", "/admin"], ["Careers", "/#"], ["Wholesale", "/#"]] },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-frost-900 text-frost-100">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <div className="text-white"><Logo /></div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-frost-200/80">
            Pakistan’s cold-chain grocery for halal frozen foods and premium kitchen essentials. Frozen at -18°C, delivered in insulated boxes to your door.
          </p>
          <div className="mt-6 space-y-2 text-sm text-frost-200/80">
            <p className="flex items-center gap-2"><Phone className="size-4" /> 0300-1234567</p>
            <p className="flex items-center gap-2"><Mail className="size-4" /> hello@frostly.pk</p>
            <p className="flex items-center gap-2"><MapPin className="size-4" /> Gulberg III, Lahore</p>
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{c.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-frost-200/80 transition hover:text-white">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div className="max-w-sm sm:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Stay in the loop</h3>
            <p className="mt-4 text-sm text-frost-200/80">Weekly deals & recipes. No spam.</p>
            <div className="mt-3"><Newsletter compact /></div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-frost-200/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Frostly Foods (Pvt.) Ltd. — Portfolio demo.</p>
          <div className="flex items-center gap-2">
            {["VISA", "Mastercard", "JazzCash", "Easypaisa", "COD"].map((m) => (
              <span key={m} className="rounded-md border border-white/15 px-2 py-1 font-semibold">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
