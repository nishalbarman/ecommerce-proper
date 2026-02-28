"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAddAddressMutation } from "@/redux/apis/addressApi";

export default function AddressForm({ onSuccess, onCancel }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    streetName: "",
    city: "",
    state: "",
    postalCode: "",
    landmark: "",
    country: "India",
    isDefault: false,
  });

  const [
    addAddress,
    { isLoading: isAddAddressLoading, error: addAddressError },
  ] = useAddAddressMutation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await addAddress({ address: formData }).unwrap();

      toast.success("Address added successfully");
      onSuccess?.();
      router.push("/profile/address");
    } catch (error) {
      console.error("Failed to add address", error);
      toast.error(error.response?.data?.message || "Failed to add address");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name*</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile Number*
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Address (House No, Building, Street)*
        </label>
        <textarea
          name="streetName"
          value={formData.streetName}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">City*</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State*</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pincode*</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Landmark (Optional)
        </label>
        <input
          type="text"
          name="landmark"
          value={formData.landmark}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex items-center">
        <label className="text-sm flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="h-4 w-4 text-primary rounded"
          />
          <span>Make this my default address</span>
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isAddAddressLoading}
          className={`px-4 py-2 bg-primary text-white rounded-md cursor-pointer disabled:cursor-not-allowed ${
            isAddAddressLoading ? "opacity-70" : ""
          }`}>
          {isAddAddressLoading ? "Saving..." : "Save Address"}
        </button>
      </div>
    </form>
  );
}
