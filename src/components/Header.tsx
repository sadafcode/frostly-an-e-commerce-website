"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Heart, Menu, Moon, ShoppingBag, Sun, Truck, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { useHydrated, useShop, useUI } from "@/lib/store";
import { cn } from "@/lib/format";

const nav = [
  { href: "/shop?store=frozen", label: "Frozen Foods" },
  { href: "/shop?store=kitchen", label: "Kitchen Essentials" },
  { href: "/shop?tag=bestseller", label: "Bestsellers" },
  { href: "/shop?sort=discount", label: "Deals" },
  { href: "/track", label: "Track Order" },
];

const announcements = [
  "❄️ Free cold-chain delivery on orders above Rs. 3,000",
  "🎉 New here? Use code WELCOME10 for 10% off",
  "🕒 Choose your delivery slot — same-day in Lahore, Karachi & Islamabad",
];

const subscribeTheme = (cb: () => void) => {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
};

export function Header() {
  const hydrated = useHydrated();
  const cartCount = useShop((s) => s.cart.reduce((n, i) => n + i.qty, 0));
  const wishCount = useShop((s) => s.wishlist.length);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tick, setTick] = useState(0);
  const dark = useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains("dark"), () => false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(id);
    };
  }, []);

  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("frostly-theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <>
      <div className="bg-frost-900 text-frost-50">
        <div className="container-x flex h-9 items-center justify-between text-xs font-medium">
          <p key={tick} className="animate-fade-up truncate">{announcements[tick % announcements.length]}</p>
          <div className="hidden items-center gap-5 md:flex">
            <span className="inline-flex items-center gap-1.5"><Truck className="size-3.5" /> Delivering in 12 cities</span>
            <Link href="/admin" className="hover:text-white hover:underline">Admin Dashboard</Link>
          </div>
        </div>
      </div>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled ? "border-line bg-surface/80 shadow-sm backdrop-blur-xl" : "border-transparent bg-bg",
        )}
      >
        <div className="container-x flex h-16 items-center gap-4 md:h-20">
          <button className="-ml-2 rounded-lg p-2 xl:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="size-6" />
          </button>
          <Logo />
          <nav className="ml-4 hidden items-center gap-0.5 xl:flex" aria-label="Primary">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-fg">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto hidden w-full max-w-sm md:block xl:max-w-[16rem] 2xl:max-w-xs">
            <SearchBox />
          </div>
          <div className="ml-auto flex items-center gap-1 md:ml-2">
            <button onClick={toggleTheme} className="rounded-full p-2.5 transition hover:bg-surface-2" aria-label="Toggle dark mode">
              {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <Link href="/account" className="hidden rounded-full p-2.5 transition hover:bg-surface-2 sm:block" aria-label="Account">
              <User className="size-5" />
            </Link>
            <Link href="/wishlist" className="relative rounded-full p-2.5 transition hover:bg-surface-2" aria-label="Wishlist">
              <Heart className="size-5" />
              {hydrated && wishCount > 0 && <Badge n={wishCount} />}
            </Link>
            <button onClick={() => setCartOpen(true)} className="relative rounded-full p-2.5 transition hover:bg-surface-2" aria-label="Open cart">
              <ShoppingBag className="size-5" />
              {hydrated && cartCount > 0 && <Badge n={cartCount} accent />}
            </button>
          </div>
        </div>
        <div className="container-x pb-3 md:hidden">
          <SearchBox />
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-surface p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-2" aria-label="Close menu"><X className="size-6" /></button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {[...nav, { href: "/account", label: "My Account" }, { href: "/wishlist", label: "Wishlist" }, { href: "/admin", label: "Admin Dashboard" }].map((n) => (
                <Link key={n.href} href={n.href} className="rounded-xl px-4 py-3 font-semibold hover:bg-surface-2">{n.label}</Link>
              ))}
            </nav>
            <div className="mt-auto rounded-2xl bg-frost-50 p-4 text-sm text-frost-900 dark:bg-frost-900/40 dark:text-frost-100">
              <p className="font-semibold">Need help ordering?</p>
              <p className="mt-1 opacity-80">WhatsApp us at 0300-1234567, 9am–11pm daily.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Badge({ n, accent }: { n: number; accent?: boolean }) {
  return (
    <span
      key={n}
      className={cn(
        "absolute right-0.5 top-0.5 grid h-5 min-w-5 animate-fade-up place-items-center rounded-full px-1 text-[10px] font-bold text-white",
        accent ? "bg-ember-500" : "bg-frost-600",
      )}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}
