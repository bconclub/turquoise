import { Playfair_Display, DM_Sans, El_Messiri } from "next/font/google";
import "./globals.css";

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
  title: "Turquoise Holidays | Refined Travel Luxury",
  description: "Experience the world with Turquoise Holidays. Premium travel packages, custom itineraries, and unforgettable destinations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${elMessiri.variable}`}>
      <body className="antialiased font-sans bg-cream text-charcoal">
        {children}
      </body>
    </html>
  );
}
