const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderGroupID: { type: String, required: false },

    paymentTxnId: { type: String, required: false },

    user: { type: mongoose.Types.ObjectId, ref: "users" },

    product: { type: mongoose.Types.ObjectId, ref: "products" },

    previewImage: {
      imageUrl: { type: String, required: true },
      bgColor: { type: String, required: true },
    },
    title: { type: String, required: true },

    // pricing
    // price: { type: Number, required: true },
    // shippingPrice: { type: Number, default: 0 },

    // variant related info
    color: { type: String, required: false },
    size: { type: String, required: false },
    quantity: { type: Number, default: null },

    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },


    address: {
      physicalAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        landmark: { type: String, required: false },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        streetName: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
      },
      location: {
        type: [Number, Number], // Array of [longitude, latitude]
        required: false,
      },
    },

    orderType: { type: String, required: true, enums: ["buy", "rent"] },

    // status related
    orderStatus: {
      type: String,
      default: "On Hold",
      enums: [
        "On Hold",
        "Pending",
        "On Progress",
        "Accepted",
        "Processing",
        "Rejected",
        "Cancelled",
        "Shipped",
        "PickUp Ready",
        "Delivered",
      ],
    },

    paymentMode: {
      type: String,
      enums: ["Prepaid", "Cash On Delivery", "Cash On Pickup"],
    },

    paymentStatus: {
      type: String,
      default: "Pending",
      enums: ["Success", "Failed", "Pending"],
    },

    shipmentType: {
      type: String,
      required: false,
      enums: ["self_pickup", "delivery_partner"],
      default: "delivery_partner",
    },

    // renting related
    rentDays: { type: Number, required: false, default: undefined },

    pickupDate: { type: Date, requied: false, default: null },
    center: { type: Object, required: false, default: null },

    rentPickedUpDate: { type: Date, required: false, default: null },
    rentReturnDueDate: { type: Date, default: null },

    // tracking link for the order track
    trackingLink: { type: String, default: "" },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ "$**": "text" });

const orderListSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    orders: [{ type: mongoose.Types.ObjectId, ref: "orders" }],
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.models.orders || mongoose.model("orders", orderSchema);
// const OrderList =
//   mongoose.models.order_list || mongoose.model("order_list", orderListSchema);

module.exports = Order;
// module.exports = { OrderList };
