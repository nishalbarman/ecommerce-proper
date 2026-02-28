const express = require("express");
const router = express.Router();
const Cart = require("../../models/cart.model");
const getTokenDetails = require("../../helpter/getTokenDetails");
const { Product } = require("../../models/product.model");
const WebConfig = require("../../models/webConfig.model");

const checkRole = require("../../middlewares");

router.get("/", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userDetails = req.user;

    if (!userDetails) {
      return res.status(400).json({ message: "User Details Not Found" });
    }

    const searchQuery = req.query;

    const PAGE = +searchQuery.page || 1;
    const LIMIT = +searchQuery.limit || 20;
    let SKIP = (PAGE - 1) * LIMIT;
    if (SKIP < 0) {
      SKIP = 0;
    }

    const totalCount = await Cart.countDocuments({});
    const totalPages = Math.ceil(totalCount / LIMIT);

    const cartDetails = await Cart.find({
      user: userDetails._id,
      productType: searchQuery.productType || "buy",
    })
      .sort({ createdAt: "desc" })
      .skip(SKIP)
      .limit(LIMIT)
      .populate([
        {
          path: "product",
          select: "-slideImages -description -stars -productVariant",
        },
        {
          path: "variant",
        },
      ])
      .select("-user");

    let deliveryChargeDetails = await WebConfig.findOne()
      .sort({ createdAt: -1 })
      .select("deliveryPrice freeDeliveryAbove");
    if (!deliveryChargeDetails) {
      deliveryChargeDetails = { deliveryPrice: 100, freeDeliveryAbove: 0 };
    }

    const isFreeDeliveryMinAmntAvailable =
      deliveryChargeDetails?.freeDeliveryAbove > 0;
    const requiredMinimumAmountForFreeDelivery =
      deliveryChargeDetails?.freeDeliveryAbove;

    console.log(deliveryChargeDetails);

    return res.json({
      totalCount: totalCount,
      totalPages: totalPages,
      cart: cartDetails,
      shippingPrice: deliveryChargeDetails?.deliveryPrice,
      requiredMinimumAmountForFreeDelivery,
      isFreeDeliveryMinAmntAvailable: isFreeDeliveryMinAmntAvailable,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Internal server error!",
    });
  }
});

/* ADD TO CART */
router.post("/", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userDetails = req.user;

    if (!userDetails) {
      return res.status(400).json({ message: "User Details Not Found" });
    }

    const productInfo = req.body;
    const productSlug = productInfo.productSlug;

    // maybe these all mongo operations can be done using one aggregate pipeline
    const cartCount = await Cart.countDocuments({
      product: productInfo.productId,
      user: userDetails._id,
      productType: productInfo.productType,
    });

    if (cartCount >= 50) {
      return res.status(400).json({
        message: "Only maximum 50 Cart items allowed!",
      });
    }

    const product = await Product.findById(productInfo.productId);
    if (product?.isVariantAvailable && !productInfo?.variant) {
      productInfo.variant = product?.productVariant[0]?._id;
      // return res.status(400).json({
      //   message:
      //     "Product variant available but not selected, kindly select proper size or color",
      // });
    }

    if (!product) {
      return res.status(400).json({
        message: "Product ID Invalid!",
      });
    }

    const filterObject = {
      product: productInfo.productId,
      user: userDetails._id,
      productType: productInfo.productType,
    };

    if (productInfo?.variant) {
      filterObject.variant = productInfo.variant;
    }

    const cartItem = await Cart.findOneAndUpdate(filterObject, {
      $inc: {
        quantity: productInfo?.quantity || 1,
      },
    });

    if (!!cartItem) {
      return res.json({
        status: true,
        message: "Added to Cart",
      });
    }

    const cart = new Cart({
      user: userDetails._id,
      product: productInfo.productId,
      productType: productInfo.productType,
      quantity: productInfo.quantity,
      rentDays: productInfo.rentDays,
    });

    if (productInfo?.variant) {
      cart.variant = productInfo.variant;
    }

    await cart.save();

    return res.json({
      message: "Added to Cart",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Internal server error!",
    });
  }
});

router.patch("/:productType", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userDetails = req.user;
    if (!userDetails) {
      return res.status(400).json({ message: "User Details Not Found" });
    }

    const productType = req.params?.productType || "buy";

    if (!productType) {
      return res.status(400).json({ message: "Product Type is Missing" });
    }

    const cartItemId = req.query?.cart;

    if (!cartItemId) {
      return res.status(400).send({ message: "Cart Item Id Missing" });
    }

    const rentDays = req.body?.rentDays;
    const quantity = req.body?.quantity;
    // const size = req.body?.size;
    // const color = req.body?.color;

    const cartProduct = await Cart.findOne({
      _id: cartItemId,
      user: userDetails._id,
      productType,
    });

    if (!cartProduct) {
      return res.status(400).json({
        message: "No items in cart",
      });
    }

    if (productType === "rent" && !!rentDays) {
      cartProduct.rentDays = rentDays;
    }

    if (!!quantity) {
      cartProduct.quantity = quantity;
    }

    // if (!!size) {
    //   cartProduct.size = size;
    // }

    // if (!!color) {
    //   cartProduct.color = color;
    // }

    await cartProduct.save({ validateBeforeSave: false });

    return res.json({
      message: "Cart Updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

router.patch(
  "/update-qty/:productType",
  checkRole(0, 1, 2),
  async (req, res) => {
    try {
      const userDetails = req.user;
      if (!userDetails) {
        return res.status(400).json({ message: "User Details Not Found" });
      }

      const productType = req.params?.productType || "buy";

      if (!productType) {
        return res.status(400).json({ message: "Product Type is Missing" });
      }

      const cartItemId = req.query?.cartId;
      const cartItemQuantity = req.body?.quantity;

      const cartProduct = await Cart.findOne({
        _id: cartItemId,
        user: userDetails._id,
        productType,
      });

      if (!cartProduct) {
        return res.status(400).json({
          message: "No items in cart",
        });
      }

      if (!!cartItemQuantity) {
        cartProduct.quantity = cartItemQuantity;
      }

      await cartProduct.save({ validateBeforeSave: false });

      return res.json({
        message: "Cart Updated",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  },
);

router.patch(
  "/update-variant/:cartItemId",
  checkRole(0, 1, 2),
  async (req, res) => {
    try {
      const userDetails = req.user;
      if (!userDetails) {
        return res.status(400).json({ message: "User Details Not Found" });
      }

      const { cartItemId } = req.params;
      const { variantId, productId } = req.body;

      if (!variantId || !productId) {
        return res
          .status(400)
          .json({ message: "Variant ID and Product ID are required" });
      }

      // Verify the variant exists for this product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.isVariantAvailable) {
        const variantExists = product.productVariant.some((v) =>
          v._id.equals(variantId),
        );
        if (!variantExists) {
          return res
            .status(400)
            .json({ message: "Invalid variant for this product" });
        }
      }

      // Update the cart item
      const updatedCart = await Cart.findOneAndUpdate(
        {
          _id: cartItemId,
          user: userDetails._id,
        },
        { variant: variantId },
        { new: true },
      ).populate([
        {
          path: "product",
          select: "-slideImages -description -stars -productVariant",
        },
        {
          path: "variant",
        },
      ]);

      if (!updatedCart) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      return res.json({
        message: "Variant updated successfully",
        cartItem: updatedCart,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

router.delete("/one/:cartItemId", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userDetails = req.user;

    if (!userDetails) {
      return res.status(400).json({
        message: "User Details Not Found",
      });
    }

    const { cartItemId } = req.params;

    const cartDetails = await Cart.findOneAndDelete({
      _id: cartItemId,
      user: userDetails._id,
    });

    if (!cartDetails) {
      return res.status(200).json({
        status: false,
        message: "No items found!",
      });
    }

    return res.json({
      status: true,
      message: "Cart item deleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error!",
    });
  }
});

router.post("/incart/:productId", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userDetails = req.user;

    if (!userDetails) {
      return res.status(400).json({ message: "User Details Not Found" });
    }

    const searchParams = req.params;
    const body = req.body;

    const filterObject = {
      product: searchParams.productId,
      productType: "buy" || body.productType,
      user: userDetails._id,
    };

    if (body?.variant) {
      filterObject.variant = body.variant || null;
    }

    console.log("Filter object for incart check", filterObject);

    const cartItem = await Cart.findOne(filterObject);

    console.log(cartItem)

    // if (!!cartItem) {
    //   return res.json({
    //     incart: true,
    //   });
    // }

    return res.json({
      incart: !!cartItem,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error!, "+error?.message,
    });
  }
});

router.delete("/make-cart-empty", checkRole(0, 1, 2), async (req, res) => {
  try {
    const userDetails = req.user;

    const cartDetails = await Cart.deleteMany({
      user: userDetails._id,
    });

    return res.json({
      message: "Cart items deleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error!",
    });
  }
});

module.exports = router;
