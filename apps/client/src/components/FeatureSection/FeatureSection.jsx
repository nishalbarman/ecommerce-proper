import React from "react";
import NeutralCard from "../NeutralCard";
import FeaturesSkeleton from "../Features/FeaturesSkeleton";

// Fetch data on the server
const fetchFeatures = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_SERVER_URL}/features`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching features:", error);
    return null;
  }
};

const Features = async () => {
  // Fetch the features data
  const features = await fetchFeatures();

  // If data is not available, show the skeleton loader
  if (!features) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeaturesSkeleton />
            <FeaturesSkeleton />
            <FeaturesSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <NeutralCard
              key={index}
              title={feature.Title}
              icon={feature.Icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
