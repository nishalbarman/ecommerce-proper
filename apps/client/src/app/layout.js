import { Toaster } from "react-hot-toast";
import ReduxStore from "../components/ReduxStore/ReduxStore";
import { CookiesProvider } from "next-client-cookies/server";

import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jharna Mehendi - Get your mehendi now.",
  description: "Get variaties of mehendi for your special occusions.",
  icons: {
    icon: "/favicon/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster />
        <CookiesProvider>
          <ReduxStore>
            <Navbar title={"Jharna Mehendi"} logo={""} />
            <main className="min-h-screen z-[999]">{children}</main>
            <Footer />
          </ReduxStore>
        </CookiesProvider>
      </body>
    </html>
  );
}
