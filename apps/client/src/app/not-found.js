import { FaExclamationTriangle, FaHome, FaSearch } from "react-icons/fa";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="flex justify-center text-yellow-500 mb-4">
          <FaExclamationTriangle fill="green" className="text-5xl" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          404 - Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            <FaHome className="mr-2" fill="white" color="white" />
            Return to Homepage
          </Link>

          <Link
            href="/products"
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
            <FaSearch className="mr-2" />
            Browse Products
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
