import { Playfair_Display, DM_Sans, El_Messiri } from "next/font/google";
import "./globals.css";
import TrackingScripts from "@/components/tracking/TrackingScripts";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const elMessiri = El_Messiri({
  subsets: ["latin"],
  variable: "--font-el-messiri",
  display: "swap",
});

export const metadata = {
  title: "Turquoise Holidays - Inspiring Destinations Within Your Reach",
  description: "Experience the world with Turquoise Holidays. Premium travel packages, custom itineraries, and unforgettable destinations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${elMessiri.variable}`}>
      <body className="antialiased font-sans bg-cream text-charcoal" suppressHydrationWarning>
        <TrackingScripts />
        {children}
      </body>
    </html>
  );
}
