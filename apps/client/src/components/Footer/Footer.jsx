import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { PiFacebookLogoBold } from "react-icons/pi";

import tree_leaf from "../../../public/bg.png";
// import green_leaf_falling from "../../../public/green_leaf_falling.gif";
import axios from "axios";

async function Footer() {
  let webData = {};
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/web-config`
    );
    webData = response.data;
    console.log("fetch web config:", response.data);
  } catch (error) {
    console.log("Failed to fetch web config:", error);
    // Fallback data
    webData = {
      brandName: "..........",
      brandEmail: "..........",
      address: "..........",
      whatsAppLink: "#",
      facebookLink: "#",
      instagramLink: "#",
      websiteUrl: "..........",
      about:
        "Hi, I’m Nishal, a passionate full-stack developer specializing in the MERN stack (MongoDB, Express.js, React.js, and Node.js). I love building clean, responsive, and user-friendly web applications. While I’m confident in my coding skills, I’m still learning how to explain technical concepts in fluent English — but I’m improving every day!",
    };
  }

  return (
    <div className="bg-black relative">
      {/* Tree leaf image with pointer-events: none; */}
      <div className="h-full w-full absolute top-0 left-0 pointer-events-none">
        <Image
          className="select-none drag-none"
          src={tree_leaf}
          alt=""
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>

      {/* Green leaf falling image */}
      {/* <div className="h-full absolute top-0 left-[45%] opacity-[0.1]">
        <Image
          className="select-none drag-none"
          src={green_leaf_falling}
          alt=""
          width={500}
          height={500}
          objectFit="contain"
        />
      </div> */}

      <div className="flex flex-wrap justify-between gap-8 w-full p-6 sm:p-8 md:p-10 lg:px-[10%] w-full">
        {/* Exclusive */}
        <div className="w-full sm:w-[45%] lg:w-[20%]">
          <p className="font-andika text-white text-xl font-bold mb-6 max-sm:mb-4">
            About Me
          </p>
          <div className="flex flex-col gap-4">
            {/* <p className=" font-andika text-white font-semibold mb-[10px]">
              Subscribe
            </p> */}
            <p className="text-white max-sm:text-sm">{webData?.about}</p>
            {/* <p className="font-andika text-white text-sm">
              Get 10% of your first order
            </p>
            <div className="flex items-center justify-between gap-1 w-full h-[45px] border-white border rounded-lg pr-4">
              <input
                placeholder="Enter your email"
                className="outline-none border-none pl-4 rounded-lg bg-[black] h-full w-full placeholder:text-[#D9D9D9] text-white bg-primary"
              />
              <Image
                src="/assets/right-triangle.svg"
                width={20}
                height={20}
                alt="right arrow"
              />
            </div> */}
          </div>
        </div>

        {/* Supports */}
        <div className="w-full sm:w-[45%] lg:w-[20%]">
          <p className="font-andika text-white text-xl font-bold mb-6 max-sm:mb-4">
            Support
          </p>
          {/* socials */}
          <div className="mb-5 max-sm:mb-4 text-white">
            <div className="flex justify-center sm:justify-start items-center gap-2 rounded w-fit">
              <a
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/10 transition-colors"
                href={webData.whatsAppLink}
                target="_blank">
                <FaWhatsapp color={"#FFFFFF"} fill="white" size={22} />
              </a>
              <a
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors bg-white/10"
                href={`${webData.facebookLink}`}
                target="_blank">
                <PiFacebookLogoBold color={"white"} fill="white" size={23} />
              </a>
              <a
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors bg-white/10"
                href={`${webData.instagramLink}`}
                target="_blank">
                <FaInstagram color={"white"} fill="white" size={22} />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-white max-sm:text-sm">{webData.address}</p>
            {/* <p className="text-white">
              Vill./P.O. :- Bongsar Chariali/Sualkuchi, District :- Kamrup,
              Assam, 781***
            </p> */}
            <p className="text-white max-sm:text-sm">
              <a
                href={`mailto:${webData.BrandEmail}`}
                className="hover:underline">
                {webData.brandEmail}
              </a>
            </p>
          </div>
        </div>

        {/* My accounts */}
        <div className="max-sm:hidden block w-full sm:w-[45%] lg:w-[20%]">
          <p className="font-andika text-white text-xl font-bold mb-6 max-sm:mb-4">
            Account
          </p>
          <div className="font-andika flex flex-col gap-4 max-sm:gap-2">
            <Link
              href="/my-account"
              className="text-white underline max-sm:text-sm">
              My Account
            </Link>
            <Link
              href="/auth/login"
              className="text-white underline max-sm:text-sm">
              Login / Register
            </Link>
            <Link href="/cart" className="text-white underline max-sm:text-sm">
              Cart
            </Link>
            <Link
              href="/wishlist"
              className="text-white underline max-sm:text-sm">
              Wishlist
            </Link>
          </div>
        </div>

        {/* quick links */}
        <div className="max-sm:hidden block w-full sm:w-[45%] lg:w-[20%]">
          <p className="font-andika text-white text-xl font-bold mb-6 max-sm:mb-4">
            Quick Link
          </p>
          <div className="font-andika flex flex-col gap-4 max-sm:gap-2">
            <Link
              href={"/dynamic/refund-policy"}
              className="text-white underline max-sm:text-sm">
              Refund Policy
            </Link>
            <Link
              href={"/dynamic/privacy-policy"}
              className="text-white underline max-sm:text-sm">
              Privacy Policy
            </Link>
            <Link
              href={"/dynamic/terms-and-conditions"}
              className="text-white underline max-sm:text-sm">
              Terms Of Use
            </Link>
            <Link
              href={"/dynamic/faq"}
              className="text-white underline max-sm:text-sm">
              Faq
            </Link>
            <Link
              href={"/dynamic/about"}
              className="text-white underline max-sm:text-sm">
              About Me
            </Link>
            <Link
              href={"/contact"}
              className="text-white underline max-sm:text-sm">
              Contact
            </Link>
          </div>
        </div>

        <div className="hidden max-sm:flex flex-row justify-between max-sm:gap-8 max-[358px]:flex-col w-full">
          {/* My accounts */}
          <div className="w-full sm:w-[45%] lg:w-[20%]">
            <p className="font-andika text-white text-xl font-bold mb-6 max-sm:mb-4">
              Account
            </p>
            <div className="font-andika flex flex-col gap-4 max-sm:gap-2">
              <Link
                href="/my-account"
                className="text-white underline max-sm:text-sm">
                My Account
              </Link>
              <Link
                href="/auth/login"
                className="text-white underline max-sm:text-sm">
                Login / Register
              </Link>
              <Link
                href="/cart"
                className="text-white underline max-sm:text-sm">
                Cart
              </Link>
              <Link
                href="/wishlist"
                className="text-white underline max-sm:text-sm">
                Wishlist
              </Link>
            </div>
          </div>

          {/* quick links */}
          <div className="w-full sm:w-[45%] lg:w-[20%]">
            <p className="font-andika text-white text-xl font-bold mb-6 max-sm:mb-4">
              Quick Link
            </p>
            <div className="font-andika flex flex-col gap-4 max-sm:gap-2">
              <Link
                href={"/dynamic/refund-policy"}
                className="text-white underline max-sm:text-sm">
                Refund Policy
              </Link>
              <Link
                href={"/dynamic/privacy-policy"}
                className="text-white underline max-sm:text-sm">
                Privacy Policy
              </Link>
              <Link
                href={"/dynamic/terms-and-conditions"}
                className="text-white underline max-sm:text-sm">
                Terms Of Use
              </Link>
              <Link
                href={"/dynamic/faq"}
                className="text-white underline max-sm:text-sm">
                Faq
              </Link>
              <Link
                href={"/dynamic/about"}
                className="text-white underline max-sm:text-sm">
                About Me
              </Link>
              <Link
                href={"/contact"}
                className="text-white underline max-sm:text-sm">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[rgba(223,223,223,0.1)] h-[1px] w-full"></div>

      <div className="bg-white py-6">
        <div className="container px-4 sm:px-6 mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 max-sm:gap-2">
          <div className="flex items-center">
            <span className="text-xl max-sm:font-inconsolata max-sm:hidden">
              {webData.brandName || "..."}
            </span>
          </div>
          <p className="text-sm text-gray-500 font-andika">
            © {new Date().getFullYear()}{" "}
            <Link href={`/`} className="hover:underline">
              {webData.websiteUrl || "..."}
            </Link>
          </p>
          <div className="text-black font-marker">
            🧑‍💻 Made By{" "}
            <a
              title="Nishal Barman"
              href="https://nisha-char.web.app/"
              target="_blank"
              className="underline hover:no-underline">
              Nishachar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
