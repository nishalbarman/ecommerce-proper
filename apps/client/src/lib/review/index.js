import axios from "axios";

export const fetchReviews = async (
  productId,
  productType,
  page = 1,
  limit = 10
) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/proxy/feedbacks/list/${productId}?page=${page}&limit=${limit}`,
      { productType }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

export const submitReview = async (reviewData) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/feedbacks`,
      reviewData
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};

export const checkUserPurchase = async (productId, productType) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/check-purchase`,
      { params: { productId, productType } }
    );
    return response.data.hasPurchased;
  } catch (error) {
    console.error("Error checking purchase:", error);
    return false;
  }
};
