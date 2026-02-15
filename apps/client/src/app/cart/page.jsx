import React from "react";
import Cart from "../../components/Cart/Cart";

export default async function page() {
  return (
    <>
      <main className="min-h-screen bg-gray-50 ">
        <div className="h-fill w-fill ">
          <Cart />
        </div>
      </main>
    </>
  );
}
