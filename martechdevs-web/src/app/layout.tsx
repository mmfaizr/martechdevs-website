import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import MartechChat from "@/components/MartechChat";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  title: "martechdevs - We Integrate Your Martech + Analytics Tools",
  description: "We integrate your Martech + Analytics tools. Lightning fast. Get accurate data, automated messaging, and unified customer views.",
  keywords: "martech, analytics, Segment, Mixpanel, HubSpot, data integration, customer data platform",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "martechdevs - We Integrate Your Martech + Analytics Tools",
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
        <MartechChat
          apiUrl={process.env.NEXT_PUBLIC_CHAT_API_URL || "https://claychat-api.onrender.com/api"}
          autoOpen={true}
          autoOpenDelay={3000}
        />
      </body>
    </html>
  );
}
