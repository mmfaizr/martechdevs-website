import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  title: "MartechDevs - We Integrate Your Martech + Analytics Tools",
  description: "We integrate your Martech + Analytics tools. Lightning fast. Get accurate data, automated messaging, and unified customer views.",
  keywords: "martech, analytics, Segment, Mixpanel, HubSpot, data integration, customer data platform",
  openGraph: {
    title: "MartechDevs - We Integrate Your Martech + Analytics Tools",
    description: "Get accurate data, automated messaging, and unified customer views.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={interTight.variable} suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
