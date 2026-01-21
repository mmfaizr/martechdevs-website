import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import Script from "next/script";
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
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WV8926DK');`,
          }}
        />
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WV8926DK"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
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
