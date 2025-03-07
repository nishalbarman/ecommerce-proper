import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Navbar from "@/components/Navbar/Navbar";
import BannerTop from "@/components/SliderTop/TopSlider";
import FlashSale from "@/components/FlashSale/FlashSale";
import BestSelling from "@/components/BestSelling/BestSelling";
import MiddleBanner from "@/components/MiddleBanner/MiddleBanner";
import Categories from "@/components/Categories/Category";
import ExploreProducts from "@/components/ExploreProducts/ExploreProducts";
import NewArrivalSection from "@/components/NewArrivalSection/NewArrivalSection";
import Features from "@/components/Features/Features";
import FeatureSection from "@/components/FeatureSection/FeatureSection";
import Footer from "@/components/Footer/Footer";
import { getBackendUrl } from "@/helpter/utils";
import HeroProduct from "@/components/HeroSection/HeroSection";
import Testimonials from "@/components/TestimonialsSection/TestimonialsSection";

const getSaleDetails = async () => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    const response = await fetch(`${backendUrl}/sale-details`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {};
  }
};

export default async function Page() {
  const data = await getSaleDetails();
  const isFlashSaleEnabled = data?.isFlashSaleEnabled || null;
  const saleEndTime = data?.saleEndTime || null;

  return (
    <>
      {/* <BannerTop /> */}
      <HeroProduct />
      {isFlashSaleEnabled && <FlashSale saleEndTime={saleEndTime} />}
      {/* <div className="w-full h-[1px] bg-black opacity-[0.1] mt-[3.6rem]"></div> */}
      <div className="w-full h-[1px] bg-black opacity-[0.1] mt-0"></div>

      <BestSelling />
      <div className="w-full h-[1px] bg-black opacity-[0.1] mt-20 max-sm:mt-3"></div>

      <Categories />
      <div className="w-full h-[1px] mt-20 max-sm:mt-10 mb-10"></div>

      <Testimonials />

      {/* <div className="w-full h-[1px] bg-black opacity-[0.1] mt-[3.6rem]"></div> */}

      {/* <MiddleBanner /> */}
      {/* <ExploreProducts /> */}
      {/* <NewArrivalSection /> */}
      <div className="w-full h-[1px] mt-20 max-sm:mt-10"></div>
      <FeatureSection />
      <div className="w-full h-[1px] mt-20 max-sm:mt-10 mb-10"></div>
      {/* <div className="w-full h-[1px] bg-black opacity-[0.1] mb-3"></div> */}

      {/* <div className="w-full h-[1px] bg-black opacity-[0.1] mt-20"></div> */}
      {/* <Features /> */}
      <div className="w-full h-[1px] bg-black opacity-[0.1]"></div>
    </>
  );
}
