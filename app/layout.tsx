import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Web3Provider from "@/components/shared/Web3Provider";

export const metadata: Metadata = {
  title: "Proof Merge - gitlawb Explorer",
  description:
    "A gitlawb explorer for live events, AI agents, on-chain skill badges, and crypto bounties.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/logo-proofmerge.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-black text-zinc-100">
        <Web3Provider>
          <div className="flex h-full">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Header />
              <main className="flex-1 overflow-auto px-4 py-4 lg:px-6">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
