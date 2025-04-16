"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import toast from "react-hot-toast";
import Link from "next/link";
import { useCookies } from "next-client-cookies";
import { updateCartItemQuantity } from "@/lib/cart";

import { useSelector } from "react-redux";
import { WishlistApi, CartApi } from "@/redux";

function CartItem({ item }) {
  const {
    _id: cartProductId,
    user,
    product,
    variant,
    quantity,
    productType,
  } = item;

  const { useDeleteCartMutation, useUpdateCartVariantMutation } = CartApi;
  const { useAddWishlistMutation, useDeleteWishlistMutation } = WishlistApi;

  const wishlistMappedItems = useSelector(
    (state) => state.wishlistSlice.wishlists
  );
  const cartMappedItems = useSelector((state) => state.cartSlice.cart);

  const dispatch = useDispatch();
  const cookiesStore = useCookies();

  const token = cookiesStore.get("token");

  const [productQuantity, setProductQuantity] = useState(quantity);

  const [selectedVariant, setSelectedVariant] = useState(variant);
  const [availableVariants, setAvailableVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [updateVariant] = useUpdateCartVariantMutation();
  const variantModalRef = useRef();

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
  const sizeModalRef = useRef();

  const [addNewWishlist] = useAddWishlistMutation();
  const [deleteOneCartItem] = useDeleteCartMutation();
  const [deleteOneWishlistItem] = useDeleteWishlistMutation();

  const handleAddToWishlist = (e) => {
    e.stopPropagation();

    if (!token) {
      return toast.success("You need to be logged in first.");
    }

    if (wishlistMappedItems?.hasOwnProperty(product._id)) {
      deleteOneCartItem({
        id: cartProductId,
      });
    } else {
      addNewWishlist({ id: product._id });
      // if (cartMappedItems?.hasOwnProperty(product._id)) {
      deleteOneCartItem({ id: cartProductId });
      // }
    }
  };

  const handleRemoveFromCart = (e) => {
    e.stopPropagation();
    if (!token) {
      return toast.success("You need to be logged in first.");
    }
    deleteOneCartItem({ id: cartProductId });
    // dispatch(removeCartProduct(cartProductId));
  };

  const handleOnQuanityChangeClick = (e) => {
    quantityModalRef.current?.classList.remove("hidden");
  };

  useEffect(() => {
    // Fetch variants when component mounts if product has variants
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
      console.log("Updating Variant Data", {
        cartItemId: item._id,
        variantId: newVariantId,
        productId: product._id,
      });

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

  const handleOnVariantChangeClick = () => {
    variantModalRef.current?.classList.remove("hidden");
  };

  return (
    <>
      {/* cart item */}
      <div className="p-[2.5%_2.5%_0_2.5%] border-[1px] border-[rgb(204,204,204)] rounded-[5px] mb-[20px]">
        <div className="upper flex justify-between max-[588px]:flex-col-reverse">
          <div>
            <Link
              className="text-[rgba(0,0,0,0.7)] font-semibold text-[16px] mb-[8px] cursor-pointer w-[100%] hover:text-[rgba(0,0,0,0.9)] font-andika text-left"
              href={`/products/view/${product._id}`}>
              <p className="text-[rgba(0,0,0,0.7)] font-semibold text-[16px] mb-[8px] cursor-pointer w-[100%] hover:text-[rgba(0,0,0,0.9)] font-andika text-left">
                {product.title}
              </p>
            </Link>
            <p className="mb-[8px]">
              <span className="text-[rgb(51,51,51)] text-[18px] font-bold">
                ₹{product.discountedPrice}
              </span>{" "}
              {!!product.originalPrice && (
                <span className="text-[rgb(94,99,107)] ml-[5px] text-[14px] line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </p>
            {!!product.originalPrice && (
              <p className="text-[rgb(50,140,91)] text-[16px] mb-[10px]">
                You saved{" "}
                <span>
                  ₹{product.originalPrice - product.discountedPrice} INR
                </span>
              </p>
            )}

            {/* Show selected variant details */}
            {selectedVariant && (
              <p className="mb-2">
                Size: <span className="font-bold">{selectedVariant.size}</span>,
                Color:{" "}
                <span className="font-bold">{selectedVariant.color}</span>
              </p>
            )}

            {/* max-[961px]:flex-col max-[961px]:gap-2 */}
            <div className="qp flex justify-start mt-[20px] mb-[30px]  w-fit">
              {product?.isVariantAvailable && (
                <div
                  onClick={handleOnVariantChangeClick}
                  className="mr-[16px] cursor-pointer p-[8px_12px] border-[1px] border-[rgba(0,0,0,0.12)] rounded-[5px]"
                  id="variantButton">
                  <span>Change:</span>{" "}
                  <b>
                    <span id="variant">
                      <span className="font-bold">{selectedVariant.size}</span>,{" "}
                      <span className="font-bold">{selectedVariant.color}</span>
                    </span>
                  </b>{" "}
                  <i className="fa-solid fa-angle-down mr-[3px]" />
                </div>
              )}
              <div
                onClick={handleOnQuanityChangeClick}
                className="mr-[16px] cursor-pointer p-[8px_12px] border-[1px] border-[rgba(0,0,0,0.12)] rounded-[5px]"
                id="qtyButton">
                <span>Qty:</span>{" "}
                <b>
                  {" "}
                  <span id="qty">{productQuantity}</span>{" "}
                </b>{" "}
                <i className="fa-solid fa-angle-down mr-[3px]" />
              </div>
            </div>
          </div>

          <div className="ml-[40px] max-[588px]:ml-0 max-[588px]:w-[100%] max-[588px]:flex max-[588px]:items-center max-[588px]:justify-center">
            <img
              className="h-[150px] rounded-md w-60 object-contain max-[500px]:aspcet-square"
              src={product.previewImage}
              alt={product.title}
            />
          </div>
        </div>

        <div className="bottom_section flex w-[100%] text-center text-[rgba(0,0,0,0.7)] border-t-[2px] border-t-[rgba(0,0,0,0.04)] m-[0px_10px] text-[12px] mt-[15px] mb-0">
          <div
            onClick={handleRemoveFromCart}
            id="removeButton"
            className="p-[18px_0px] w-[35%] border-r-[2px] border-r-[rgba(0,0,0,0.04)] cursor-pointer text-[14px]">
            Remove
          </div>

          <div
            onClick={handleAddToWishlist}
            id="wishList"
            className="p-[18px_0px] w-[65%] cursor-pointer text-[14px]">
            Move to Wishlist
          </div>
        </div>
      </div>

      {/* Variant Modal */}
      <div
        ref={variantModalRef}
        onClick={() => variantModalRef.current?.classList.add("hidden")}
        className="hidden bg-[rgba(0,0,0,0.5)] fixed top-0 left-0 w-[100%] h-[100%] z-[1]">
        <div
          onClick={(e) => e.stopPropagation()}
          className="variant_model_container absolute overflow-y-auto w-fit max-h-[80%] top-[50%] left-[50%] bg-[#fff] transform translate-x-[-50%] translate-y-[-50%] p-[20px] rounded-[5px]">
          <p className="text-center mb-[15px] text-[14px] opacity-[0.7] block">
            Select Option
          </p>

          {loadingVariants ? (
            <p>Loading ...</p>
          ) : availableVariants.length > 0 ? (
            availableVariants.map((variant) => (
              <div
                key={variant._id}
                onClick={() => handleVariantChange(variant._id)}
                className={`p-3 mb-2 border rounded cursor-pointer hover:bg-gray-100 ${
                  selectedVariant?._id === variant._id
                    ? "bg-green-50 border-green-300"
                    : ""
                }`}>
                <p>
                  Size: <span className="font-bold">{variant.size}</span>
                </p>
                <p>
                  Color: <span className="font-bold">{variant.color}</span>
                </p>
              </div>
            ))
          ) : (
            <p>No Options available</p>
          )}
        </div>
      </div>

      {/* quantity modal  */}
      <div
        ref={quantityModalRef}
        onClick={() => {
          quantityModalRef.current?.classList.add("hidden");
        }}
        className="hidden bg-[rgb(0,0,0,0.5)] fixed top-0 left-0 w-[100%] h-[100%] z-[1]"
        id="qty_modal">
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="qty_model_container absolute overflow-hidden w-fit max-h-[100%] top-[50%] left-[50%] bg-[#fff] transform translate-x-[-50%] translate-y-[-50%] p-[20px] text-center rounded-[5px]">
          <p className="mb-[15px] text-[14px] opacity-[0.7] block">
            Select Quantity
          </p>
          <p
            onClick={() => {
              setProductQuantity(1);
              quantityModalRef.current?.classList.add("hidden");
            }}
            className="text-center hover:bg-[rgb(230,230,230)] text-[18px] p-[19px_40px] border-none tracking-[2px] leading-[1.428571429px] bg-[#fff] cursor-pointer rounded"
            id="1">
            1
          </p>
          <p
            onClick={() => {
              setProductQuantity(2);
              quantityModalRef.current?.classList.add("hidden");
            }}
            className="text-center hover:bg-[rgb(230,230,230)] text-[18px] p-[19px_40px] border-none tracking-[2px] leading-[1.428571429px] bg-[#fff] cursor-pointer rounded"
            id="2">
            2
          </p>
          <p
            onClick={() => {
              setProductQuantity(3);
              quantityModalRef.current?.classList.add("hidden");
            }}
            className="text-center hover:bg-[rgb(230,230,230)] text-[18px] p-[19px_40px] border-none tracking-[2px] leading-[1.428571429px] bg-[#fff] cursor-pointer rounded"
            id="3">
            3
          </p>
          <p
            onClick={() => {
              setProductQuantity(4);
              quantityModalRef.current?.classList.add("hidden");
            }}
            className="text-center hover:bg-[rgb(230,230,230)] text-[18px] p-[19px_40px] border-none tracking-[2px] leading-[1.428571429px] bg-[#fff] cursor-pointer rounded"
            id="4">
            4
          </p>
          <p
            onClick={() => {
              setProductQuantity(5);
              quantityModalRef.current?.classList.add("hidden");
            }}
            className="text-center hover:bg-[rgb(230,230,230)] text-[18px] p-[19px_40px] border-none tracking-[2px] leading-[1.428571429px] bg-[#fff] cursor-pointer rounded"
            id="5">
            5
          </p>
          <p
            onClick={() => {
              setProductQuantity(6);
              quantityModalRef.current?.classList.add("hidden");
            }}
            className="text-center hover:bg-[rgb(230,230,230)] text-[18px] p-[19px_40px] border-none tracking-[2px] leading-[1.428571429px] bg-[#fff] cursor-pointer rounded"
            id="6">
            6
          </p>
          <p
            onClick={() => {
              setProductQuantity(7);
              quantityModalRef.current?.classList.add("hidden");
            }}
            className="text-center hover:bg-[rgb(230,230,230)] text-[18px] p-[19px_40px] border-none tracking-[2px] leading-[1.428571429px] bg-[#fff] cursor-pointer rounded"
            id="7">
            7
          </p>
          <p
            onClick={() => {
              setProductQuantity(8);
              quantityModalRef.current?.classList.add("hidden");
            }}
            className="text-center hover:bg-[rgb(230,230,230)] text-[18px] p-[19px_40px] border-none tracking-[2px] leading-[1.428571429px] bg-[#fff] cursor-pointer rounded"
            id="8">
            8
          </p>
          <p
            onClick={() => {
              setProductQuantity(9);
              quantityModalRef.current?.classList.add("hidden");
            }}
            className="text-center hover:bg-[rgb(230,230,230)] text-[18px] p-[19px_40px] border-none tracking-[2px] leading-[1.428571429px] bg-[#fff] cursor-pointer rounded"
            id="9">
            9
          </p>
          <p
            onClick={() => {
              setProductQuantity(10);
              quantityModalRef.current?.classList.add("hidden");
            }}
            className="text-center hover:bg-[rgb(230,230,230)] text-[18px] p-[19px_40px] border-none tracking-[2px] leading-[1.428571429px] bg-[#fff] cursor-pointer rounded"
            id="10">
            10
          </p>
        </div>
      </div>
    </>
  );
}

export default CartItem;
