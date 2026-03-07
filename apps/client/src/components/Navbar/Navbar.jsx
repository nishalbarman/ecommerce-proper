import React from "react";
import Link from "next/link";

import { cookies } from "next/headers";

import NavbarPartNonLogged from "./NavbarPartNonLogged";
import Image from "next/image";

import tree_leaf from "../../../public/bg.png";

async function Navbar({ title }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  console.log("Token from Navbar function", token);

  let webData = {
    brandName: "..........",
    brandEmail: "..........",
    address: "..........",
    whatsAppLink: "#",
    facebookLink: "#",
    instagramLink: "#",
    websiteUrl: "..........",
    about: "..........",
  };

  try {
    const webConfig = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN_URL}/api/proxy/web-config`,
      {
        cache: "no-cache",
        // cache: "force-cache",
        // revalidate: 3600,
      },
    );
    webData = await webConfig.json();
    console.log("Web config data in Navbar:", webData);
  } catch (error) {
    console.error("Failed to fetch web config in Navbar:", error);
  }

  return (
    <div className="flex w-full border-[rgb(0,0,0,0.1)] border-b-[1px] justify-between h-[80px] max-md:h-[66px] lg:pl-[10%] lg:pr-[10%] pl-[3%] pr-[3%] bg-gradient-to-r from-[#FFFEE5] to-white relative">
      {/* Tree leaf image with pointer-events: none; */}
      <div className="h-full w-full absolute top-0 left-0 pointer-events-none">
        <Image
          className="select-none drag-none"
          src={tree_leaf}
          alt="Tree Leaf"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>

      <div className="flex flex-row">
        <Link href={"/"} className="flex flex-center items-center w-fit">
          <img
            draggable={false}
            // src="/assets/logo/logo-horizontal.png"
            // src="/assets/logo/new-logo.png"
            src={webData.brandLogo?.imageUrl || "/assets/logo/new-logo.png"}
            className="max-md:hidden h-[90px] max-sm:h-[60px] p-2 select-none user-select-none mix-blend-multiply"
          />

          <img
            draggable={false}
            // src="/assets/logo/logo-horizontal.png"
            // src="/assets/logo/new-logo.png"
            src={webData.brandLogo?.imageUrl || "/assets/logo/new-logo.png"}
            className="md:hidden h-[70px] p-2 select-none user-select-none mix-blend-multiply"
          />
        </Link>
      </div>

      <NavbarPartNonLogged token={token} />
    </div>
  );
}

export default Navbar;
