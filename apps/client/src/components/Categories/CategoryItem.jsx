import React from "react";
import Image from "next/image";
import Link from "next/link";

function CategoryItem({
  _id: categoryId,
  categoryImageUrl,
  categoryName,
  categoryKey,
}) {
  return (
    <Link href={`/categories/${categoryId}`} passHref>
      <div className="relative group transition-all duration-300 ease-in-out rounded-xl overflow-hidden shadow-md hover:shadow-xl w-full h-48 bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:border-green-200 cursor-pointer">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 opacity-100 transition-opacity duration-300 z-10"></div>

        {/* Category image with zoom effect */}
        <div className="relative w-full h-full">
          <Image
            src={categoryImageUrl}
            alt={categoryName}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Category name with slide-up animation */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 transform  translate-y-0 transition-transform duration-300">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 text-center truncate">
              {categoryName}
            </h3>
            <p className="text-xs text-gray-500 text-center mt-1 opacity-0 opacity-100 transition-opacity duration-200">
              Shop now →
            </p>
          </div>
        </div>

        {/* Floating badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm z-20">
          <span className="text-xs font-medium text-blue-600">Popular</span>
        </div>
      </div>
    </Link>
  );
}

export default CategoryItem;
