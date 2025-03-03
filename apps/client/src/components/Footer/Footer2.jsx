import React from "react";

import { IoCheckmarkSharp, IoSendSharp } from "react-icons/io5";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { PiFacebookLogoBold } from "react-icons/pi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default async function Footer() {
  const webData = {};

  return (
    <>
      <footer>
        <div className="flex justify-center gap-5 w-full bg-primary p-10 pl-[5%] pr-[5%] lg:pl-[10%] lg:pr-[10%]">
          <div className="container flex flex-wrap justify-between w-full py-3">
            {/* Exclusive */}
            <div className="lg:w-1/5 max-md:text-center w-full max-md:pb-8">
              <p className="  text-white text-xl font-bold mb-[24px]">
                {webData.BrandName}
              </p>
              <div className="flex flex-col gap-4">
                {/* <p className="  text-white font-semibold mb-[10px]">
              Subscribe
            </p> */}
                <p className="max-md:text-center text-white text-sm">
                  Join our Newsletter for latest informations.
                </p>
                <div className="flex items-center pr-[15px] justify-between gap-1 w-full h-[45px] border-white border rounded-lg">
                  <input
                    placeholder="Enter your email"
                    className="outline-none border-none pl-[15px] rounded-lg h-full w-fill placeholder:text-white text-white"
                  />
                  <button
                    className="cursor-pointer"
                    onClick={() => {
                      console.log("Newsletter button is being clicked");
                    }}>
                    <IoSendSharp size={20} color="white" />
                  </button>
                  <AiOutlineLoading3Quarters
                    className="animate-spin"
                    size={20}
                    color="white"
                  />
                  <IoCheckmarkSharp size={20} color="white" />
                </div>
                <p className="max-md:text-center text-white text-sm">
                  Joining newsletter will give 5% discount on your first
                  purchase 😌.
                </p>
              </div>
            </div>

            {/* Supports */}
            <div className="lg:w-1/5 max-md:text-center max-md:border-t-1 max-md:border-t-[#e1e1e1] max-md:py-8 w-full">
              <p className="text-white text-xl font-bold mb-[24px]">Support</p>

              {/* socials */}
              <div className="mb-5 max-md:text-center">
                <p className="text-sm underline mb-4">Socials:</p>
                <div className="flex max-md:justify-center items-center gap-2">
                  <a
                    href={webData.WhatsAppLink}
                    target="_blank"
                    className="text-gray-500">
                    <FaWhatsapp color={"white"} size={22} />
                  </a>

                  <a
                    href={`${webData.FacebookLink}`}
                    target="_blank"
                    className="text-gray-500">
                    <PiFacebookLogoBold color={"white"} size={23} />
                    {/* facebook */}
                  </a>

                  <a
                    href={`${webData.InstagramLink}`}
                    target="_blank"
                    className="text-gray-500">
                    <FaInstagram color={"white"} size={22} />
                  </a>
                </div>
              </div>

              <div className=" flex flex-col gap-[16px] max-md:text-center">
                <p className="text-white ">{webData.Address}</p>

                <p className="text-white">
                  <a href={`mailto:${webData.BrandEmail}`}>
                    {webData.BrandEmail}
                  </a>
                </p>
              </div>
            </div>

            {/* My accounts */}
            <div className="lg:w-2/20 w-full max-md:text-center max-md:border-t-1 max-md:border-t-[#e1e1e1] max-md:py-8">
              <p className="  text-white text-xl font-bold mb-[24px]">
                Account
              </p>
              <div className=" flex flex-col gap-[16px]">
                <p className="   text-white">
                  <Link to="/my-account">My Account</Link>
                </p>
                <p className="   text-white">
                  <Link to="/auth/login">Login / Register</Link>
                </p>
                <p className="   text-white">
                  <Link to="/cart">Cart</Link>
                </p>
              </div>
            </div>

            {/* quick links */}
            <div className="lg:w-2/20 w-full max-md:text-center max-md:border-t-1 max-md:border-t-[#e1e1e1] max-md:py-8 max-md:pb-0">
              <p className="  text-white text-xl font-bold mb-[24px]">
                Quick Link
              </p>
              <div className=" flex flex-col gap-[16px]">
                <p className="   text-white">
                  <Link to={"/dynamic/privacy-policy"}>Privacy Policy</Link>
                </p>
                <p className="   text-white">
                  <Link to={"/dynamic/terms-and-condition"}>Terms Of Use</Link>
                </p>
                <p className="   text-white">
                  <Link to={"/dynamic/refund-policy"}>Refund Policy</Link>
                </p>
                <p className="   text-white">
                  <Link to={"/dynamic/faq"}>Faq</Link>
                </p>
                <p className="text-white">
                  <Link to={"/contact"}>Contact</Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(223,223,223,0.1)] h-[1px] w-fill"></div>

        <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col bg-white">
          <a className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
            <span className="ml-3 text-xl">{webData.BrandName}</span>
          </a>
          <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
            © {new Date().getFullYear()}{" "}
            <Link to={`/`}>{webData.websiteUrl}</Link>
          </p>
          <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
            <span className="text-black">
              🧑‍💻 Made By{" "}
              <a
                title="Nishal Barman"
                href="https://nisha-char.web.app/"
                target="_blank"
                className="underline">
                Nishachar
              </a>{" "}
            </span>
          </span>
        </div>
      </footer>
    </>
  );
}
