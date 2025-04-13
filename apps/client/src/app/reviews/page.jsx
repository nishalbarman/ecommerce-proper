import Head from "next/head";
import ReviewList from "@/components/ReviewForm/ReviewList";

export default function ReviewsPage() {
  return (
    <>
      <Head>
        <title>Product Reviews | Our Store</title>
        <meta name="description" content="Read and submit product reviews" />
      </Head>
      <ReviewList />
    </>
  );
}
