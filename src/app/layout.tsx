import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/Toaster";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://frostly.pk"),
  title: { default: "Frostly — Frozen Foods & Kitchen Essentials Delivered", template: "%s · Frostly" },
  description:
    "Order halal frozen foods — nuggets, kebabs, samosas, ready meals, seafood & desserts — plus premium kitchen essentials. Cold-chain delivery at -18°C across Pakistan.",
  keywords: ["frozen food", "online grocery Pakistan", "halal nuggets", "seekh kebab", "kitchen essentials", "cookware"],
  openGraph: {
    type: "website",
    siteName: "Frostly",
    title: "Frostly — Frozen Foods & Kitchen Essentials",
    description: "Cold-chain delivered frozen foods and premium kitchen gear.",
    images: ["https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#07111f" },
  ],
};

const themeScript = `try{var t=localStorage.getItem('frostly-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${fraunces.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-frost-600 focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <Toaster />
        <WhatsAppButton />
      </body>
    </html>
  );
}
