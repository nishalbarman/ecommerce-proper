import { Toaster } from "react-hot-toast";
import ReduxStore from "../components/ReduxStore/ReduxStore";
import NextTopLoader from "nextjs-toploader";
import { CookiesProvider } from "next-client-cookies/server";

import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Image from "next/image";
import TabBar from "@/components/TabBar/TabBar";
import AuthModal from "@/modal/AuthModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Petal Perfection Bouquet Plot",
  description: "",
  // icons: {
  // icon: "/favicon/favicon.ico",
  // },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative`}>
        <NextTopLoader color="#DA4544" />
        <Toaster />
        <CookiesProvider>
          <ReduxStore>
            <Navbar title={process.env.BRAND_NAME} logo={""} />
            <main className="min-h-screen z-[999] bg-background">{children}</main>
            <TabBar />
            <Footer />
            <AuthModal />
          </ReduxStore>
        </CookiesProvider>
      </body>
    </html>
  );
}
