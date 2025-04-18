import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/slices/cartSlice";
import { addToWishlist } from "@/redux/slices/wishlistSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
  };

  const handleAddToWishlist = () => {
    dispatch(addToWishlist(product));
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/view/${product.id}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Quick Actions - Mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent mobile-flex desktop-hidden">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary text-white p-2 rounded-l-md touch-button">
            <FaShoppingCart className="mx-auto" />
          </button>
          <button
            onClick={handleAddToWishlist}
            className="flex-1 bg-primary text-white p-2 rounded-r-md touch-button">
            <FaHeart className="mx-auto" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        <Link href={`/products/view/${product.id}`}>
          <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ₹{product.price}
          </span>

          {/* Quick Actions - Desktop */}
          <div className="hidden md:flex space-x-2">
            <button
              onClick={handleAddToCart}
              className="p-2 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors touch-button">
              <FaShoppingCart />
            </button>
            <button
              onClick={handleAddToWishlist}
              className="p-2 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors touch-button">
              <FaHeart />
            </button>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${
                  i < product.rating ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
