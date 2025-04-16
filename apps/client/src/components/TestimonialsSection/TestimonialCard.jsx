import React from "react";
import Image from "next/image";
import { VscVerifiedFilled } from "react-icons/vsc";
import { FaQuoteLeft } from "react-icons/fa";

function TestimonialCard({ clientName, clientAvatar, clientSpeech, imageUrl }) {
  return (
    <div className="p-4 w-full h-full cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-green-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
      <div className="bg-green-50 p-8 rounded-lg h-full shadow-lg overflow-hidden">
        <FaQuoteLeft />
        <div className="py-2 mt-3 overflow-hidden mt-5">
          <p className="leading-relaxed text-gray-600">{clientSpeech}</p>
        </div>

        {/* Client info with slide-up effect */}
        <div className="inline-flex items-center mt-8 group-hover:mt-6 transition-all duration-300">
          {clientAvatar && (
            <div className="relative overflow-hidden rounded-full border-2 border-white group-hover:border-blue-200 transition-all duration-300 shadow-md">
              <Image
                alt="testimonial"
                src={clientAvatar}
                width={56}
                height={56}
                className="w-14 h-14 object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          )}
          <span className="flex-grow flex flex-col pl-4">
            <span className="title-font font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 text-lg">
              {clientName}
            </span>
            <div className="flex justify-start gap-1 items-center">
              <span className="text-gray-500 text-sm group-hover:text-blue-500 transition-colors duration-300">
                Verified Buyer
              </span>
              <VscVerifiedFilled className="text-blue-400 group-hover:text-blue-600 transition-colors duration-300" />
            </div>
          </span>
        </div>
      </div>
    </div>
  );
}

export default TestimonialCard;
