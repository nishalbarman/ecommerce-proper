import React from "react";
import Image from "next/image";
import { VscVerifiedFilled } from "react-icons/vsc";
import { FaQuoteLeft } from "react-icons/fa";

function TestimonialCard({ clientName, clientAvatar, clientSpeech, imageUrl }) {
  return (
    <div className="group relative p-4 w-full h-full cursor-pointer transition-all duration-500 ">
      {/* Background gradient that appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30 opacity-0 opacity-100 transition-opacity duration-500 rounded-2xl -z-10" />
      
      {/* Main card container */}
      <div className="bg-white p-8 rounded-2xl h-full shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full transition-all duration-700 group-hover:bg-blue-100" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-50 rounded-tr-full opacity-70 transition-all duration-700 group-hover:bg-green-100" />
        
        {/* Quote icon with animation */}
        <div className="relative z-10">
          <FaQuoteLeft className="text-4xl text-blue-400 opacity-20 group-hover:opacity-30 transition-all duration-500 mb-2" />
          
          {/* Testimonial text */}
          <div className="py-2 relative z-10">
            <p className="leading-relaxed text-lg font-medium italic transition-all duration-300 group-hover:text-gray-800 text-gray-600">
              {clientSpeech}
            </p>
          </div>

          {/* Client info */}
          <div className="flex items-center mt-8 max-sm:mt-3 transition-transform duration-500">
            {clientAvatar && (
              <div className="relative overflow-hidden rounded-full border-4 border-white group-hover:border-blue-100 transition-all duration-500 shadow-lg mr-4">
                <Image
                  alt="testimonial"
                  src={clientAvatar}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover transition-transform duration-500"
                />
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300 text-lg flex items-center">
                {clientName}
                <VscVerifiedFilled className="ml-2 text-green-400 group-hover:text-green-600 transition-colors duration-300" />
              </span>
              <span className="text-gray-500 text-sm group-hover:text-green-500 transition-colors duration-300">
                Verified Buyer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestimonialCard;