"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import Link from "next/link";
import { useCookies } from "next-client-cookies";
import { useSelector } from "react-redux";
import { WishlistApi, CartApi } from "@/redux";
import { FiHeart, FiTrash2, FiChevronDown } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";

function CartItem({ item }) {
  const {
    _id: cartProductId,
    user,
    product,
    variant,
    quantity,
    productType,
  } = item;

  const {
    useDeleteCartMutation,
    useUpdateCartVariantMutation,
    useUpdateQuantityCartMutation,
  } = CartApi;
  const { useAddWishlistMutation, useDeleteWishlistMutation } = WishlistApi;

  const wishlistMappedItems = useSelector(
    (state) => state.wishlistSlice.wishlists
  );

  const dispatch = useDispatch();
  const cookiesStore = useCookies();
  const token = cookiesStore.get("token");

  const [productQuantity, setProductQuantity] = useState(quantity);
  const [selectedVariant, setSelectedVariant] = useState(variant);
  const [availableVariants, setAvailableVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [updateVariant] = useUpdateCartVariantMutation();
  const variantModalRef = useRef();
  const [updateCartItemQuantity] = useUpdateQuantityCartMutation();

  useEffect(() => {
    if (productQuantity > 0) {
      updateCartItemQuantity({
        id: cartProductId,
        productType: "buy",
        quantity: productQuantity,
      });
    }
  }, [productQuantity]);

  const quantityModalRef = useRef();

  const [addNewWishlist] = useAddWishlistMutation();
  const [deleteOneCartItem] = useDeleteCartMutation();
  const [deleteOneWishlistItem] = useDeleteWishlistMutation();

  const handleAddToWishlist = (e) => {
    e.stopPropagation();
    if (!token) return toast.success("You need to be logged in first.");
    
    if (wishlistMappedItems?.hasOwnProperty(product._id)) {
      deleteOneCartItem({ id: cartProductId });
    } else {
      addNewWishlist({ id: product._id });
      deleteOneCartItem({ id: cartProductId });
    }
  };

  const handleRemoveFromCart = (e) => {
    e.stopPropagation();
    if (!token) return toast.success("You need to be logged in first.");
    deleteOneCartItem({ id: cartProductId });
  };

  const handleQuantityChange = (newQuantity) => {
    setProductQuantity(newQuantity);
    quantityModalRef.current?.classList.add("hidden");
  };

  useEffect(() => {
    if (product?.isVariantAvailable && !availableVariants.length) {
      fetchProductVariants();
    }
  }, [product]);

  const fetchProductVariants = async () => {
    try {
      setLoadingVariants(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/products/view/${product._id}`,
        { method: "POST" }
      );
      const data = await response.json();
      setAvailableVariants(data.product.productVariant || []);
    } catch (error) {
      console.error("Error fetching variants:", error);
      toast.error("Failed to load variants");
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleVariantChange = async (newVariantId) => {
    try {
      const response = await updateVariant({
        cartItemId: item._id,
        variantId: newVariantId,
        productId: product._id,
      }).unwrap();

      if (response.cartItem) {
        setSelectedVariant(response.cartItem.variant);
        toast.success("Option updated successfully");
        variantModalRef.current?.classList.add("hidden");
      }
    } catch (error) {
      console.error("Error updating variant:", error);
      toast.error(error.data?.message || "Failed to update variant");
    }
  };

  return (
    <>
      {/* Main Cart Item */}
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden mb-4">
        <div className="flex flex-col md:flex-row p-4 gap-4">
          {/* Product Image */}
          <div className="w-full md:w-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
            <Link href={`/products/view/${product._id}`}>
              <img
                className="w-full h-32 object-contain hover:scale-105 transition-transform duration-300"
                src={product.previewImage}
                alt={product.title}
              />
            </Link>
          </div>

          {/* Product Details */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start">
              <Link
                href={`/products/view/${product._id}`}
                className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors"
              >
                {product.title}
              </Link>
              <button
                onClick={handleRemoveFromCart}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <IoIosClose size={24} />
              </button>
            </div>

            {/* Price Section */}
            <div className="mt-2">
              <span className="text-xl font-bold text-gray-900">
                ₹{product.discountedPrice}
              </span>
              {!!product.originalPrice && (
                <>
                  <span className="text-gray-500 ml-2 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-green-600 ml-2 text-sm">
                    Save ₹{product.originalPrice - product.discountedPrice}
                  </span>
                </>
              )}
            </div>

            {/* Variant Info */}
            {selectedVariant && (
              <div className="mt-2 flex flex-wrap gap-2">
                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium ml-1">{selectedVariant.size}</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium ml-1">{selectedVariant.color}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {product?.isVariantAvailable && (
                <button
                  onClick={() => variantModalRef.current?.classList.remove("hidden")}
                  className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Change option
                  <FiChevronDown size={16} />
                </button>
              )}

              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(Math.max(1, productQuantity - 1))}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                  disabled={productQuantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 text-center min-w-[40px]">
                  {productQuantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(productQuantity + 1)}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToWishlist}
                className="ml-auto flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-pink-500 transition-colors"
              >
                <FiHeart
                  size={16}
                  className={wishlistMappedItems?.hasOwnProperty(product._id) ? "fill-pink-500 text-pink-500" : ""}
                />
                Move to wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Sale Badge */}
        {!!product.originalPrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </div>
        )}
      </div>

      {/* Variant Modal */}
      <div
        ref={variantModalRef}
        onClick={() => variantModalRef.current?.classList.add("hidden")}
        className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Select Option
            </h3>
            
            {loadingVariants ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : availableVariants.length > 0 ? (
              <div className="grid gap-3">
                {availableVariants.map((variant) => (
                  <div
                    key={variant._id}
                    onClick={() => handleVariantChange(variant._id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVariant?._id === variant._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          Size: <span className="font-semibold">{variant.size}</span>
                        </p>
                        <p className="text-gray-600">
                          Color: <span className="font-semibold">{variant.color}</span>
                        </p>
                      </div>
                      {selectedVariant?._id === variant._id && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No options available</p>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => variantModalRef.current?.classList.add("hidden")}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CartItem;