import React from "react";
import toast from "react-hot-toast";
// import { FaInstagram, FaWhatsapp } from "react-icons/fa";
// import { PiFacebookLogoBold } from "react-icons/pi";

import submitContactMessage from "@/actions/contact/sendMessage";

export default async function ContactUsRoute(props) {
  const seachParams = await props.searchParams;
  const status = seachParams.status || "";

  return (
    <section className="text-gray-600 body-font relative min-h-[100vh]">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <h1 className="sm:text-3xl text-2xl font-bold title-font mb-4 text-gray-900">
            Contact Us
          </h1>
          <p className="lg:w-2/4 mx-auto leading-relaxed text-base">
            Do you have any query related to our bussiness or want to know if am
            I available for collabration, then drop a message for me using the
            form below.⭐
          </p>
        </div>
        {status && (
          <div className="lg:w-1/2 md:w-2/3 mx-auto mb-5">
            {status === "success" ? (
              <div className="p-4 shadow bg-[#e7f5e1] rounded">
                <p className="text-green-900 font-bold">
                  We recieved your message, expect contact.
                </p>
              </div>
            ) : (
              <div className="p-4 shadow bg-red-200 rounded">
                <p className="text-red-900 font-bold">
                  Message Sent Failed, Please try again later.
                </p>
              </div>
            )}
          </div>
        )}
        <div className="lg:w-1/2 md:w-2/3 mx-auto">
          <form method="POST" action={submitContactMessage}>
            <div className="flex flex-wrap -m-2">
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="leading-7 text-sm text-gray-600">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your sweet name"
                    className="w-full bg-white bg-opacity-50 rounded border border-gray-300 focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  />
                </div>
              </div>
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label
                    htmlFor="email"
                    className="leading-7 text-sm text-gray-600">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="cutie@pie.you"
                    className="w-full bg-white bg-opacity-50 rounded border border-gray-300 focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  />
                </div>
              </div>
              <div className="p-2 w-full">
                <div className="relative">
                  <label
                    htmlFor="message"
                    className="leading-7 text-sm text-gray-600">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Your important message!✌️"
                    className="w-full bg-white bg-opacity-50 rounded border border-gray-300 focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-200 h-32 text-base outline-none text-gray-700 py-3 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                  />
                </div>
              </div>
              <div className="p-2 w-full">
                <button
                  type="submit"
                  className="flex mx-auto text-white bg-[#91BC78] border-0 py-2 px-8 focus:outline-none hover:bg-[#79BD82] rounded text-lg cursor-pointer">
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center">
          <div className="flex justify-center w-full">
            <p className="leading-normal mb-2 text-center  lg:w-2/10 ">
              Vill./P.O. :- Bongsar Chariali/Sualkuchi, District :- Kamrup,
              Assam, 781***
            </p>
          </div>
          <a className="font-bold" href="mailto:jharnamehendi@example.com">
            jharna-mehendi@gmail.com
          </a>

          <div className="mt-4">
            <div className="flex items-center justify-center gap-2">
              <a
                href={"https://api.whatsapp.com/send?phone=919395150257"}
                target="_blank"
                className="text-gray-500 underline">
                {/* <FaWhatsapp color={"gray"} size={24} /> */}
                WhatsApp
              </a>
              ·
              <a
                href="https://www.facebook.com/profile.php?id=100073430207446"
                target="_blank"
                className="text-gray-500 underline">
                {/* <PiFacebookLogoBold color={"gray"} size={25} /> */}
                Facebook
              </a>
              ·
              <a
                href="https://www.instagram.com/__jharna__01/?hl=en"
                target="_blank"
                className="text-gray-500 underline">
                {/* <FaInstagram color={"gray"} size={24} /> */}
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
