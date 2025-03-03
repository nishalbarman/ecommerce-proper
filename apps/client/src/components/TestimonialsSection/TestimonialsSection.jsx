import React from "react";
import TestimonialCardSkeleton from "./TestimonialCardSkeleton";
import TestimonialCard from "./TestimonialCard";

// Fetch data on the server
const fetchTestimonials = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_SERVER_URL}/testimonials`);
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return null;
  }
};

const Testimonials = async () => {
  // Fetch the testimonials data
  const testimonials = await fetchTestimonials();

  // If data is not available, show the skeleton loader
  if (!testimonials) {
    return (
      <div className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="mx-auto text-center w-2/4">
              <h1 className="text-white text-4xl mb-3 leading-[47px] font-bold">
                Our Customer Said{" "}
                <span className="text-black font-light">
                  About Our Mehendi Products
                </span>
              </h1>
              <p className="my-6">
                Hear from our happy customers about their experiences.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-8 text-black">
            <TestimonialCardSkeleton />
            <TestimonialCardSkeleton />
            <TestimonialCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="mx-auto text-center w-2/4">
            <h1 className="text-white text-4xl mb-3 leading-11 font-bold">
              Our Customer Said{" "}
              <span className="text-black font-light">
                About Our Mehendi Products
              </span>
            </h1>
            <p className="mb-5">
              Hear from our happy customers about their experiences.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-8 text-black">
          {testimonials.map(({ Name, Avatar, Review, ImgurLink }, index) => (
            <TestimonialCard
              key={index}
              Name={Name}
              Avatar={Avatar}
              Review={Review}
              ImgurLink={ImgurLink}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
