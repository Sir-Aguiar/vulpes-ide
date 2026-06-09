import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LayoutProvider } from "@/providers/LayoutProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vulpes IDE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vulpes-theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark')}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
