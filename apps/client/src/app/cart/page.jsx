import React, { Suspense } from "react";
import Cart from "../../components/Cart/Cart";
import Footer from "../../components/Footer/Footer";

import { fetchCart } from "@/lib/cart";

export default async function page() {
  return (
    <>
      <main className="min-h-[100vh] ml-[3%] mr-[3%] lg:ml-[10%] lg:mr-[10%]">
        <div className="h-fill w-fill m-[40px_0]">
          <Cart />
        </div>
      </main>
    </>
  );
}
