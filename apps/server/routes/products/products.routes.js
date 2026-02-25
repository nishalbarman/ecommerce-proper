const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const slugify = require("slugify");

const getImageColors = require("get-image-colors");

const { Product, ProductVariant } = require("../../models/product.model");
const Wishlist = require("../../models/wishlist.model");
const { isValidUrl } = require("../../utils/validator");
const Order = require("../../models/order.model");
const Cart = require("../../models/cart.model");

const checkRole = require("../../middlewares");
const getTokenDetails = require("../../helpter/getTokenDetails");

const { ImageUploadHelper } = require("../../helpter/imgUploadhelpter");

const TAG = "products/route.js:--";

// product validation function, so we can determine an product has valid or invalid data
const checkProductHasError = ({
  previewImage,
  title,
  category,
  discountedPrice,
  originalPrice,
  slideImages,
  description,
  shippingPrice,
  availableStocks,
  isVariantAvailable,
  productVariant,
  rentingPrice,
}) => {
  const error = [];

  const imageTest = /^https:\/\/i\.ibb\.co\//;

  if (!previewImage) {
    error.push("Preview Image Not Valid");
  }

  if (!imageTest.test(previewImage?.imageUrl)) {
    error.push("Preview Image does not have valid allowed url");
  }

  if (!Array.isArray(slideImages)) {
    let isOk = true;
    for (let i = 0; i < slideImages.length; i++) {
      isOk = isOk && imageTest.test(slideImages[i]);
      if (!isOk) {
        error.push("Slide Images does not have valid allowed url");
        break;
      }
    }
  }

  if (!title || title?.length < 5) {
    error.push("Title should be of minimum 5 characters");
  }

  const ObjectId = mongoose.Types.ObjectId;
  if (
    !category ||
    !(ObjectId.isValid(category) && String(new ObjectId(category)) === category)
  ) {
    error.push("Category is not valid");
  }

  if (!discountedPrice && !rentingPrice) {
    error.push("Discounted price and Renting Price needs to be given");
  }

  if (
    isNaN(Number(rentingPrice)) ||
    isNaN(Number(discountedPrice)) ||
    isNaN(Number(originalPrice))
  ) {
    error.push(
      "Original price, Discounted price and Renting price should be numbers",
    );
  }

  if (
    !!discountedPrice &&
    !!originalPrice &&
    +originalPrice < +discountedPrice
  ) {
    error.push(
      "Discounted price should be lesser than Original price if given",
    );
  }

  try {
    const html = cheerio.load(description);
  } catch (err) {
    error.push("Description is not valid html");
  }

  if (!!shippingPrice && isNaN(parseInt(shippingPrice))) {
    error.push("Shipping price must be a valid number");
  }

  if (!!availableStocks && isNaN(parseInt(availableStocks))) {
    error.push("Stock mube be a valid non zero number");
  }

  if (!!isVariantAvailable) {
    productVariant.forEach((variant, index) => {
      if (Object.keys(variant).length !== 9) {
        return error.push(
          "Variant +" +
            (index + 1) +
            ": " +
            "Does not contain all the required keys",
        );
      }

      const localError = [];

      // if (!isValidUrl(variant?.previewImage)) {
      //   localError.push("Preview Image is not valid");
      // }

      if (!imageTest.test(variant?.previewImage?.imageUrl)) {
        localError.push(
          "Variant +" + (index + 1) + ": " + "Preview Image is not valid",
        );
      }

      if (!variant?.discountedPrice && !variant?.originalPrice) {
        localError.push(
          "Original price and Discounted price needs to be given",
        );
      }

      if (
        isNaN(Number(rentingPrice)) ||
        isNaN(Number(discountedPrice)) ||
        isNaN(Number(originalPrice))
      ) {
        error.push(
          "Original price, Discounted price and Renting price should be numbers",
        );
      }

      if (
        !!variant?.discountedPrice &&
        !!variant?.originalPrice &&
        +variant?.originalPrice < +variant?.discountedPrice
      ) {
        localError.push(
          "Discounted price should be lesser than original price",
        );
      }

      if (!Array.isArray(variant?.slideImages)) {
        let isOk = true;
        for (let i = 0; i < variant?.slideImages.length; i++) {
          isOk = isOk && imageTest.test(variant?.slideImages[i]?.imageUrl);
          if (!isOk) {
            localError.push("Slide Images does not have valid allowed url");
            break;
          }
        }
      }

      if (!!variant?.shippingPrice && isNaN(parseInt(variant?.shippingPrice))) {
        localError.push("Shipping price must be a valid number");
      }

      if (
        !!variant?.availableStocks &&
        isNaN(parseInt(variant?.availableStocks))
      ) {
        localError.push("Stock mube be a valid non zero number");
      }

      if (!variant?.color) {
        localError.push("Color is not vallid");
      }

      if (!variant?.size) {
        localError.push("Size is not vallid");
      }

      if (localError.length > 0) {
        error.push(
          `Variant: ${index + 1}, has errors. Message: ${localError.join(",\n")}`,
        );
      }
    });
  }

  return error;
};

const checkUpdatedProductHasError = ({
  previewImage,
  title,
  category,
  discountedPrice,
  originalPrice,
  slideImages,
  description,
  shippingPrice,
  availableStocks,
  isVariantAvailable,
  productVariant,
  rentingPrice,
}) => {
  const error = [];

  const imageTest = /^https:\/\/i\.ibb\.co\//;

  if (!previewImage) {
    error.push("Preview Image Not Valid");
  }

  if (!imageTest.test(previewImage?.imageUrl)) {
    error.push("Preview Image does not have valid allowed url");
  }

  if (!Array.isArray(slideImages)) {
    let isOk = true;
    for (let i = 0; i < slideImages.length; i++) {
      isOk = isOk && imageTest.test(slideImages[i]?.imageUrl);
      if (!isOk) {
        error.push("Slide Images does not have valid allowed url");
        break;
      }
    }
  }

  if (!title || title?.length < 5) {
    error.push("Title should be of minimum 5 characters");
  }

  const ObjectId = mongoose.Types.ObjectId;
  if (
    (!category ||
      !(
        ObjectId.isValid(category) &&
        String(new ObjectId(category)) === category
      )) &&
    (!category?._id ||
      !(
        ObjectId.isValid(category?._id) &&
        String(new ObjectId(category?._id)) === category?._id
      ))
  ) {
    error.push("Category is not valid");
  }

  if (!discountedPrice && !rentingPrice) {
    error.push("Discounted price and Renting Price needs to be given");
  }

  if (
    isNaN(Number(rentingPrice)) ||
    isNaN(Number(discountedPrice)) ||
    isNaN(Number(originalPrice))
  ) {
    error.push(
      "Original price, Discounted price and Renting price should be numbers",
    );
  }

  if (
    !!discountedPrice &&
    !!originalPrice &&
    +originalPrice < +discountedPrice
  ) {
    error.push(
      "Discounted price should be lesser than Original price if given",
    );
  }

  try {
    const html = cheerio.load(description);
  } catch (err) {
    error.push("Description is not valid html");
  }

  if (!!shippingPrice && isNaN(parseInt(shippingPrice))) {
    error.push("Shipping price must be a valid number");
  }

  if (!!availableStocks && isNaN(parseInt(availableStocks))) {
    error.push("Stock mube be a valid non zero number");
  }

  if (!!isVariantAvailable) {
    console.log("What is product Variants", productVariant);
    Object.values(productVariant).forEach((variant, index) => {
      if (Object.keys(variant)?.length < 8) {
        return error.push(
          "Variant +" +
            (index + 1) +
            ": " +
            "Does not contain all the required keys",
        );
      }

      const localError = [];

      // if (!isValidUrl(variant?.previewImage)) {
      //   localError.push("Preview Image is not valid");
      // }

      if (!imageTest.test(variant?.previewImage?.imageUrl)) {
        localError.push(
          "Variant +" + (index + 1) + ": " + "Preview Image is not valid",
        );
      }

      if (!variant?.discountedPrice && !variant?.originalPrice) {
        localError.push(
          "Original price and Discounted price needs to be given",
        );
      }

      if (
        isNaN(Number(rentingPrice)) ||
        isNaN(Number(discountedPrice)) ||
        isNaN(Number(originalPrice))
      ) {
        error.push(
          "Original price, Discounted price and Renting price should be numbers",
        );
      }

      if (
        !!variant?.discountedPrice &&
        !!variant?.originalPrice &&
        +variant?.originalPrice < +variant?.discountedPrice
      ) {
        localError.push(
          "Discounted price should be lesser than original price",
        );
      }

      if (!Array.isArray(variant?.slideImages)) {
        let isOk = true;
        for (let i = 0; i < variant?.slideImages.length; i++) {
          isOk = isOk && imageTest.test(variant?.slideImages[i]?.imageUrl);
          if (!isOk) {
            localError.push("Slide Images does not have valid allowed url");
            break;
          }
        }
      }

      if (!!variant?.shippingPrice && isNaN(parseInt(variant?.shippingPrice))) {
        localError.push("Shipping price must be a valid number");
      }

      if (
        !!variant?.availableStocks &&
        isNaN(parseInt(variant?.availableStocks))
      ) {
        localError.push("Stock mube be a valid non zero number");
      }

      if (!variant?.color) {
        localError.push("Color is not vallid");
      }

      if (!variant?.size) {
        localError.push("Size is not vallid");
      }

      if (localError.length > 0) {
        error.push(
          `Variant: ${index + 1}, has errors. Message: ${localError.join(",\n")}`,
        );
      }
    });
  }

  return error;
};

router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query;

    const PAGE = parseInt(searchQuery?.page) || 0;
    const LIMIT = parseInt(searchQuery?.limit) || 50;
    const SKIP = PAGE * LIMIT;

    const SORT = searchQuery["sort"] || "popularity";
    const QUERY = searchQuery["query"];

    // Initialize filter object
    const filter = {};

    // Text search
    if (QUERY) {
      filter["$text"] = { $search: QUERY };
    }

    // Category filter (comma-separated string)
    if (searchQuery.category) {
      const categories = searchQuery.category.split(",");
      filter.categorySlug = {
        $in: categories.map(
          (categoryId) => categoryId || new mongoose.Types.ObjectId(categoryId),
        ),
      };
    }

    console.log("What are filters", filter);

    // Price range filter
    const minPrice = parseFloat(searchQuery.minPrice) || 0;
    const maxPrice = parseFloat(searchQuery.maxPrice) || 50000;
    if (minPrice > 0 || maxPrice < 50000) {
      filter.discountedPrice = {
        $gte: minPrice,
        $lte: maxPrice,
      };
    }

    // Sorting logic
    let sortObject = { createdAt: "desc" };

    if (QUERY && !SORT) {
      delete sortObject.createdAt;
      sortObject.score = { $meta: "textScore" };
    }

    if (SORT) {
      delete sortObject.createdAt;
      switch (SORT) {
        case "popularity":
          sortObject.totalOrders = "desc";
          break;
        case "low-to-hight-price":
          sortObject.discountedPrice = "asc";
          break;
        case "hight-to-low-price":
          sortObject.discountedPrice = "desc";
          break;
        case "newest":
          sortObject.createdAt = "desc";
          break;
        default:
          sortObject = undefined;
      }
    }

    // Count documents
    const totalProductsCount = await Product.countDocuments(filter);

    // Fetch products
    const products = await Product.find(filter)
      .populate(["category", "productVariant"])
      .sort(sortObject)
      .skip(SKIP)
      .limit(LIMIT);

    const totalPages = Math.ceil(totalProductsCount / LIMIT);

    return res.status(200).json({
      totalPages,
      data: products,
      totalProductCount: totalProductsCount,
    });
  } catch (error) {
    console.error("Error in product route:", error);
    return res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

router.post("/view/:productId", async (req, res) => {
  try {
    const params = req.params;
    const productType = req.body?.productType || "buy";
    const productId = params?.productId;

    let isSlug = false;
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      String(new mongoose.Types.ObjectId(productId)) !== productId
    ) {
      isSlug = true;
    }

    const token = req.headers["authorization"]?.split(" ")[1];
    let user = null;
    if (token) {
      user = getTokenDetails(token);
    }

    console.log("What are params", params);

    // check whether we have the product id or not
    if (!params?.productId) {
      return res
        .status(400)
        .json({ redirect: "/products", message: "Product ID missing!" });
    }

    const filter = {};
    if (isSlug) {
      filter.slug = productId;
    } else {
      filter._id = productId;
    }

    const product = await Product.findOne({ ...filter }).populate([
      "category",
      "productVariant",
    ]);

    console.log("What is the product", params?.productId, product);

    let hasUserBoughtThisProduct = false;
    if (user && user.userDetails && user.userDetails._id) {
      hasUserBoughtThisProduct = await Order.countDocuments({
        product: product.productId,
        user: user?.userDetails?._id,
        orderType: productType,
        orderStatus: "Delivered",
      });
      console.log("has user bought", {
        product: product.productId,
        user: user?.userDetails?._id || undefined,
        orderType: productType,
        orderStatus: "Delivered",
      });
    }

    if (!product) {
      return res.status(404).json({ message: "No such product found." });
    }

    return res.status(200).json({
      product,
      hasUserBoughtThisProduct: !!hasUserBoughtThisProduct,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/admin-view/:productId", checkRole(1, 2), async (req, res) => {
  try {
    const productId = req.params?.productId;

    // check whether we have the product id or not
    if (!productId) {
      return res
        .status(400)
        .json({ redirect: "/products", message: "Product ID missing!" });
    }

    const product = await Product.findOne({ _id: productId }).populate([
      "category",
      "productVariant",
    ]);

    if (!product) {
      return res.status(404).json({ message: "No such product found." });
    }

    return res.status(200).json({
      product,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

// ADMIN ROUTE : Product create route
router.post("/", checkRole(1, 2), async (req, res) => {
  try {
    const productData = req.body?.productData;

    if (!productData) {
      return res.status(400).json({ message: "Product Data Not Found" });
    }

    if (!productData.originalPrice) {
      productData.originalPrice = productData.discountedPrice;
    }

    productData.productVariant = Object.values(productData.productVariant);

    if (Array.isArray(productData?.productVariant)) {
      const new_Variant_With_Size_Included = [];

      productData.productVariant.forEach((variant) => {
        if (!variant.originalPrice) {
          variant.originalPrice = variant.discountedPrice;
        }

        const sizes = variant?.size;
        // ?.replace(/ /g, "");
        if (!!sizes) {
          sizes.split(",")?.forEach((eachSize) => {
            new_Variant_With_Size_Included.push({ ...variant, size: eachSize });
          });
        }
      });

      productData.productVariant = new_Variant_With_Size_Included;
    }

    const error = checkProductHasError(productData);

    if (error.length > 0) {
      return res.status(400).json({ message: error.join(", ") });
    }

    // Now we are going to save the product to our database

    console.log(productData);

    const imageColors = await getImageColors(categoryData.imageUrl, {
      count: 5,
    });

    const [first, second, third] = imageColors[0]._rgb;

    const averageColor = `rgba(${first},${second},${third},0.8)`;

    // Create a new product document
    const newProduct = new Product({
      slug: slugify(productData.title, { lower: true }),
      previewImage: productData.previewImage,
      title: productData.title,
      category: productData.category,
      categorySlug: productData.categorySlug,
      slideImages: productData.slideImages,
      description: productData.description,
      // productType: productData.productType,
      productType: "buy", // hardcoded to buy cause this project is only for buy
      shippingPrice: +productData.shippingPrice,
      availableStocks: +productData.availableStocks,
      rentingPrice: !!productData.variant
        ? +productData.variant[0].rentingPrice
        : +productData.rentingPrice,
      discountedPrice: !!productData.variant
        ? +productData.variant[0].discountedPrice
        : +productData.discountedPrice,
      originalPrice: !!productData.variant
        ? +productData.variant[0].originalPrice
        : +productData.originalPrice,
      isVariantAvailable: !!productData.isVariantAvailable,
    });

    if (productData?.isVariantAvailable) {
      // variants structure ==> [{key: value},{...}, {...}]
      const variantPromises = Object.entries(productData.productVariant).map(
        async ([key, value]) => {
          const variantData = {
            product: newProduct._id,

            previewImage: value.previewImage,
            slideImages: value.slideImages,

            size: value.size,
            color: value.color,
            availableStocks: +value.availableStocks,
            shippingPrice: +value.shippingPrice,
            rentingPrice: +value.rentingPrice,
            discountedPrice: +value.discountedPrice,
            originalPrice: +value.originalPrice,
          };

          return ProductVariant.create(variantData);
        },
      );
      const variants = await Promise.all(variantPromises);
      newProduct.productVariant = variants.map((variant) => variant._id);
    }

    console.log(newProduct);

    await newProduct.save();

    return res.status(200).json({
      message: `Product created`,
      data: productData,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

router.patch("/update/:productId", checkRole(1, 2), async (req, res) => {
  try {
    const productId = req.params?.productId;
    const productData = req.body?.productData;

    if (!productId) {
      return res.status(400).json({ message: "Product ID Not Found" });
    }

    if (!productData) {
      return res.status(400).json({ message: "Product Data Not Found" });
    }

    // TODO: Need to validate the incoming key values so that it fits the required formate

    // productData.productVariant = Object.values(productData.productVariant)?.map(
    //   (variant) => {
    //     return {
    //       product: productId,
    //       size: variant.size,
    //       color: variant.color,
    //       previewImage: variant.previewImage,
    //       slideImages: variant.slideImages,
    //       availableStocks: variant.availableStocks,
    //       shippingPrice: variant.shippingPrice || 0,
    //       rentingPrice: variant.rentingPrice || 0,
    //       discountedPrice: variant.discountedPrice,
    //       originalPrice: variant.originalPrice,
    //     };
    //   },
    // );

    console.log(
      "What is product variant, I guess it would be the ids of variant thats why product checkupdate is failed because it does not have the keys (it only has variant ids))",
      productData.productVariant,
    );

    const error = checkUpdatedProductHasError(productData);

    if (error.length > 0) {
      return res.status(400).json({ message: error.join(", ") });
    }

    const productUpdatedData = {
      slug: slugify(productData.title, { lower: true }),
      title: productData.title,
      category: productData.category,
      categorySlug: productData.categorySlug,
      description: productData.description,
      productType: productData.productType,
      shippingPrice: +productData.shippingPrice,
      availableStocks: +productData.availableStocks,
      rentingPrice: +productData.rentingPrice,
      discountedPrice: +productData.discountedPrice,
      originalPrice: +productData.originalPrice,
      isVariantAvailable: !!productData.isVariantAvailable,
    };

    if (productData.previewImage) {
      productUpdatedData.previewImage = productData.previewImage;
    }

    if (productData.slideImages.length > 0) {
      productUpdatedData.slideImages = productData.slideImages;
    }

    if (productData?.isVariantAvailable) {
      // variants structure ==> [{key: value},{...}, {...}]

      const existingVariants = [];
      const newVariants = [];

      // this is for final merge, we will collect all the ids for existing variant for faster merge. Later on creating new variant we add push the new ids here.
      const variantIds = [];

      Object.values(productData.productVariant)?.forEach((variant) => {
        if (!!variant?._id) {
          existingVariants.push(variant);
          variantIds.push(variant._id);
        } else {
          newVariants.push({
            product: productId,
            size: variant.size,
            color: variant.color,
            previewImage: variant.previewImage,
            slideImages: variant.slideImages,
            availableStocks: +variant.availableStocks,
            shippingPrice: +variant.shippingPrice || 0,
            rentingPrice: +variant.rentingPrice || 0,
            discountedPrice: +variant.discountedPrice,
            originalPrice: +variant.originalPrice,
          });
        }
      });

      // update process of existing variants
      const variantPromises = existingVariants.map(async (value) => {
        const variantData = {
          size: value.size,
          color: value.color,
          availableStocks: +value.availableStocks,
          shippingPrice: +value.shippingPrice || 0,
          rentingPrice: +value.rentingPrice || 0,
          discountedPrice: +value.discountedPrice,
          originalPrice: +value.originalPrice,
        };

        if (value.previewImage) {
          variantData.previewImage = value.previewImage;
        }

        if (value.slideImages.length) {
          variantData.slideImages = value.slideImages;
        }

        return ProductVariant.findByIdAndUpdate(value._id, variantData);
      });
      await Promise.all(variantPromises);

      // addition process of existing variants
      if (newVariants.length > 0) {
        const newVariantPromises = newVariants.map(async (variantData) => {
          return ProductVariant.create(variantData);
        });
        const newVariantPromiseResponse = await Promise.all(newVariantPromises);
        newVariantPromiseResponse.forEach((variant) => {
          variantIds.push(variant._id);
        });
      }

      productUpdatedData.productVariant = variantIds || [];
      await Product.findByIdAndUpdate(productId, productUpdatedData);
      return res.status(200).json({
        message: `Product Updated`,
      });
    }

    await Product.findByIdAndUpdate(productId, productUpdatedData);

    return res.status(200).json({
      message: `Product Updated`,
    });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

router.post("/duplicate", checkRole(1, 2), async (req, res) => {
  try {
    const productId = req.body.productId;
    const productData = await Product.findOne({ _id: productId });
    // delete product._id;
    // const response = await Product.create(product);

    // Create a new product document
    const newProduct = new Product({
      previewImage: productData.previewImage,
      title: productData.title,
      category: productData.category,
      slideImages: productData.slideImages,
      description: productData.description,
      // productType: productData.productType,
      productType: "buy", // hardcoded to buy cause this project is only for buy
      shippingPrice: +productData.shippingPrice,
      availableStocks: +productData.availableStocks,
      rentingPrice: !!productData.variant
        ? +productData.variant[0].rentingPrice
        : +productData.rentingPrice,
      discountedPrice: !!productData.variant
        ? +productData.variant[0].discountedPrice
        : +productData.discountedPrice,
      originalPrice: !!productData.variant
        ? +productData.variant[0].originalPrice
        : +productData.originalPrice,
      isVariantAvailable: !!productData.isVariantAvailable,
    });
    await newProduct.save();
    console.log(newProduct);

    return res.status(200).json({
      message: `Duplicate product created`,
    });
    // return res.status(400).json({ message: "Failed to create" });
  } catch (err) {
    console.error(TAG, err);
    return res.status(500).json({ message: err.message });
  }
});

/// product instock check
router.post("/variant/instock/:productId", async (req, res) => {
  try {
    console.log("Hit on varian in stockk");

    const productId = req.params?.productId;
    const productType = req.body?.productType || "buy";
    const variant = req.body?.variant;

    console.log("Here what is request body", req.body);

    console.log("Items", { productId, variant, productType });

    let inStock = false;

    if (variant) {
      const Variant = await ProductVariant.findOne({
        _id: variant,
      });

      console.log("Variant Data", Variant);

      inStock = !!Variant && Variant?.availableStocks > 0;

      return res.json({
        inStock,
      });
    }

    let isSlug = true;
    if (
      mongoose.Types.ObjectId.isValid(productId) &&
      String(new mongoose.Types.ObjectId(productId)) === productId
    ) {
      isSlug = false;
    }

    const filterObject = {
      productType: productType,
    };

    if (isSlug) {
      filterObject.slug = productId;
    } else {
      filterObject._id = productId;
    }

    const productItem = await Product.findOne(filterObject);

    inStock = !!productItem && productItem?.availableStocks > 0;

    console.log("in stock response", inStock);

    return res.json({
      inStock,
    });
  } catch (error) {
    console.error(error);
    return res(500).json({
      status: false,
      message: "Internal server error!",
    });
  }
});

router.post("/view-variant/:productVariantId", async (req, res) => {
  try {
    const productVariantId = req.params?.productVariantId;
    const productType = req.body?.productType || "buy";

    console.log(req.body);

    if (!productVariantId) {
      return res.status(400).json({
        status: false,
        message: "Bad request",
      });
    }

    const Variant = await ProductVariant.findOne({
      _id: productVariantId,
    }).populate({ path: "product" });

    console.log("Variant Data", Variant);

    return res.json({
      variant: Variant,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      status: false,
      message: "Internal server error!",
    });
  }
});

// ADMIN ROUTE : Product delete route -- maybe delete method does not allow request body
router.post("/delete", checkRole(1, 2), async (req, res) => {
  try {
    const deletableProductIds = req.body?.deletableProductIds;

    if (!Array.isArray(deletableProductIds)) {
      return res.status(400).json({ message: "Product ID(s) Not Found" });
    }

    const deletePromises = deletableProductIds.map(async (productId) => {
      const product = await Product.findById(productId);
      console.log(product);
      await ProductVariant.deleteMany({
        _id: { $in: product?.productVariant?.map((variant) => variant._id) },
      });
      await Cart.deleteMany({ product: product._id });
      await Wishlist.deleteMany({ product: product._id });
      await Product.findByIdAndDelete(productId);
    });

    await Promise.all(deletePromises);

    // if (!product)
    //   return res
    //     .status(400)
    //     .json({ message: "Product not found with given ID." });

    return res.json({ message: "Product(s) deleted." });
  } catch (error) {
    console.error(TAG, error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
