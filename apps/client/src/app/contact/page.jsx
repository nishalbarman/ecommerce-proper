import React from "react";
import toast from "react-hot-toast";

import submitContactMessage from "@/actions/contact/sendMessage";

export default async function ContactUsRoute(props) {
  const seachParams = await props.searchParams;
  const status = seachParams.status || "";

  let webData = {};
  try {
    const response = await fetch(`/api/web-config`);
    webData = await response.json();
    console.log("fetch web config:", webData);
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
          <form action={submitContactMessage}>
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
                    placeholder="Your name"
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
                    placeholder="demo@email.com"
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
                  className="flex mx-auto text-white bg-[rgb(219,69,69)] border-0 py-2 px-8 focus:outline-none hover:bg-[rgba(219,69,69,0.5)] rounded text-lg cursor-pointer">
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center">
          <div className="flex justify-center w-full">
            <p className="leading-normal mb-2 text-center  lg:w-2/10 ">
              {webData.address.split("\n").map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>
          <a className="font-bold" href="mailto:jharnamehendi@example.com">
            {webData.brandEmail}
          </a>

          <div className="mt-4">
            <div className="flex items-center justify-center gap-2">
              <a
                href={webData.whatsAppLink}
                target="_blank"
                className="text-gray-500 underline">
                {/* <FaWhatsapp color={"gray"} size={24} /> */}
                WhatsApp
              </a>
              ·
              <a
                href={webData.facebookLink}
                target="_blank"
                className="text-gray-500 underline">
                {/* <PiFacebookLogoBold color={"gray"} size={25} /> */}
                Facebook
              </a>
              ·
              <a
                href={webData.instagramLink}
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
