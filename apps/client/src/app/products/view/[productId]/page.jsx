"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaHeart, FaShoppingCart, FaShare, FaStar } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/slices/cartSlice";
import { addToWishlist } from "@/redux/slices/wishlistSlice";

const ProductDetailPage = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
  };

  const handleAddToWishlist = () => {
    dispatch(addToWishlist(product));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="lg:w-1/2">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                    selectedImage === index ? "ring-2 ring-primary" : ""
                  }`}>
                  <Image
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < product.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-primary mb-4">
                ₹{product.price}
              </div>

              {/* Description */}
              <div className="prose max-w-none mb-6">
                <p>{product.description}</p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center mb-6">
                <span className="mr-4">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 touch-button">
                    -
                  </button>
                  <span className="px-4 py-1 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 touch-button">
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-white py-3 rounded-lg flex items-center justify-center space-x-2 touch-button">
                  <FaShoppingCart />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="flex-1 border border-primary text-primary py-3 rounded-lg flex items-center justify-center space-x-2 touch-button">
                  <FaHeart />
                  <span>Add to Wishlist</span>
                </button>
              </div>

              {/* Share Button - Mobile Only */}
              {isMobile && (
                <button className="w-full mt-4 border border-gray-300 py-3 rounded-lg flex items-center justify-center space-x-2 touch-button">
                  <FaShare />
                  <span>Share</span>
                </button>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Product Details</h2>
              <div className="space-y-4">
                {Object.entries(product.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
