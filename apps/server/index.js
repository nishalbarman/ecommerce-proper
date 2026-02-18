const dotEnv = require("dotenv");
dotEnv.config();
const express = require("express");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");

const cookieParser = require("cookie-parser");

// dotEnv.config();
const dbConnect = require("./config/dbConfig");

dbConnect(); // connect to databse

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  // limit: 3600, // Limit each IP to 3600 requests per `window` (here, per 1 minutes).
  limit: 240, // Limit each IP to 3600 requests per `window` (here, per 1 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
  message: { message: "Take a break dear, you are sending too much requests." },
});

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5000",
      "http://localhost:3000",
      "https://cartshopping.in",
      "https://bouquet.cartshopping.in",
      "https://trishna.vercel.app",
      "https://petal--perfection.vercel.app",
      "https://petalperfection.cartshopping.in",
      "https://cartshopping.in",
      "https://www.cartshopping.in",
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    exposedHeaders: ["Set-Cookie"],xForwardedForHeader
    // maxAge: 86400, // 24 hours
  }),
);

// In your Express server (development only)
// if (process.env.NODE_ENV === "development") {
//   app.use((req, res, next) => {
//     req.secure = true; // Trick Express into thinking it's HTTPS
//     next();
//   });
// }

app.use(cookieParser());
app.use(limiter);

// payment hooks
/!* these route need raw json data so thats why placing it before experss.json() *!/;
app.use("/stripe/hook", require("./hooks/stripe-hook.routes"));

app.use(express.json({ limit: "50mb" }));

app.use("/user", require("./routes/users/user.routes"));
app.use("/auth", require("./routes/auth/authentication.routes"));
app.use("/auth/sendOtp", require("./routes/otpSend/mobile.routes"));
app.use("/banners", require("./routes/banner/banner.routes"));
app.use("/categories", require("./routes/categories/category.routes"));
app.use("/features", require("./routes/features/feature.routes"));
app.use("/products", require("./routes/products/products.routes"));
app.use("/new-arrival", require("./routes/new-arrival/newArrival.routes"));
app.use("/wishlist", require("./routes/wishlist/wishlist.routes"));
app.use("/cart", require("./routes/cart/cart.routes"));
app.use("/address", require("./routes/address/address.routes"));
app.use("/feedbacks", require("./routes/feedbacks/feedbacks.routes"));
app.use("/orders", require("./routes/order/order.routes"));
app.use("/contact", require("./routes/contact/contact.routes"));

app.use("/testimonials", require("./routes/testimonials/testimonials.routes"));
app.use("/dynamic-pages", require("./routes/dynamicPage/dynamicPage.routes"));
app.use("/hero-products", require("./routes/heroProduct/heroProduct.routes"));
app.use("/roles", require("./routes/roles/roles.routes"));
app.use("/coupons", require("./routes/coupon/coupon.routes"));
app.use("/api/web-config", require("./routes/webConfig/webConfig.routes"));
app.use("/dashboard", require("./routes/dashboard/dashboard.routes"));

app.use(
  "/uploader/image/imgbb",
  require("./routes/uploader/image/imgbb.routes"),
);

app.use(
  "/uploader/image/imgkit",
  require("./routes/uploader/image/imgkit.routes"),
);

app.use(
  "/uploader/image/list",
  require("./routes/uploader/image/getImage.routes"),
);

app.use("/colors", require("./routes/colors/color.routes"));
app.use("/size", require("./routes/sizes/sizes.routes"));

// center related routes
app.use("/center", require("./routes/centers/center.routes"));

// hooks
app.use("/hook/razorpay", require("./hooks/razorpay-hook.routes"));

// stripe payment gateway
/!* ---- paytm */;
app.use("/pay/paytm/cart", require("./routes/payment/paytm/pay-cart.routes"));

/!*---- razorpay */;
app.use(
  "/pay/razorpay/cart",
  require("./routes/payment/razorpay/pay-cart.routes"),
);
app.use(
  "/pay/razorpay/single",
  require("./routes/payment/razorpay/buy-single.routes"),
);

/!* ---- stripe */;
app.use("/stripe/cart", require("./routes/payment/stripe/pay-cart.routes"));
app.use(
  "/stripe/single/purchase",
  require("./routes/payment/stripe/pay-single.routes"),
);

// payment summary
app.use("/payment/summary", require("./routes/payment/summary.routes"));
app.use(
  "/shipping-config",
  require("./routes/shipping-config/shipping-config.routes"),
);

//shiprocket
app.use("/shiprocket/track", require("./routes/shiprocket/track.routes"));

//firebase
app.use("/firebase", require("./routes/firebase/firebase.routes"));

app.use(
  "/image-bg-color",
  require("./routes/image-bg-color/imageColor.routes"),
);

app.get("/", (_, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
