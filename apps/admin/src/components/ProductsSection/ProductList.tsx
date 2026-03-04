import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { LuPencilLine } from "react-icons/lu";
import { FiMoreVertical } from "react-icons/fi";

import ConfirmModal from "../ConfirmModal";
import ProductUpdateModal from "./ProductUpdateModal";
import ViewImage from "../ViewImage/ViewImage";

import {
  useGetProductsQuery,
  useDeleteProductsMutation,
  useDuplicateProductMutation,
} from "../../redux/apis/productApi";
import { FaRegCopy, FaRegEye } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";

const ListProduct = () => {
  const navigate = useNavigate();

  // Pagination
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [searchTerm, setSearchTerms] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading, isFetching, refetch } = useGetProductsQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
    sort: "newest",
    query: !!debouncedSearch ? debouncedSearch : undefined,
  });

  const debouncedSearchTimer = useRef(null);

  useEffect(() => {
    if (debouncedSearchTimer.current) {
      clearTimeout(debouncedSearchTimer.current);
    }
    debouncedSearchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({
        ...prev,
        pageIndex: 0, // reset page when searching
      }));
    }, 500); // Debounce for 500ms
  }, [searchTerm]);

  const totalCount = data?.totalProductCount || 0;
  const totalPages = Math.ceil(totalCount / pagination.pageSize);

  const [deleteProducts] = useDeleteProductsMutation();
  const [duplicateProduct] = useDuplicateProductMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteProductId, setDeleteProductId] = useState<string[] | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [productImageModal, setProductImageModal] = useState("");
  const [productImageModalBg, setProductImageModalBg] = useState("");

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Select All
  const handleSelectAll = () => {
    if (!data?.data) return;

    if (selectedIds.length === data.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.data.map((p: any) => p._id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    try {
      setDeleteLoading(true);
      await deleteProducts(deleteProductId).unwrap();
      toast.success("Product(s) deleted successfully");
      setDeleteProductId(null);
      setSelectedIds([]);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    const toastId = toast.loading("Creating duplicate...");
    try {
      await duplicateProduct({ productId: id }).unwrap();
      toast.update(toastId, {
        render: "Duplicate created",
        type: "success",
        isLoading: false,
      });
      refetch();
    } catch {
      toast.update(toastId, {
        render: "Failed to duplicate",
        type: "error",
        isLoading: false,
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Product</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
        {/* Header */}
        <div className="min-w-[600px]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">List of Products</h1>
          </div>
          <div className="flex justify-between items-center mb-6 w-full">
            <div className="flex flex-col justify-between mb-3 w-full">
              <label className="text-md font-semibold mb-1">Search</label>
              <input
                onChange={(e) => {
                  setSearchTerms(e.target.value);
                }}
                type="text"
                className="border px-3 py-2 rounded w-1/3"
                placeholder="Search by ..."
              />
            </div>

            {selectedIds.length > 0 && (
              <button
                onClick={() => setDeleteProductId(selectedIds)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-nowrap">
                Delete Selected
              </button>
            )}
          </div>

          {/* Table */}
          <div className={`overflow-x-auto ${isFetching && "animate-pulse"}`}>
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 border">
                    <input
                      type="checkbox"
                      checked={
                        data?.data?.length > 0 &&
                        selectedIds.length === data.data.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-3 border text-left">Image</th>
                  <th className="p-3 border text-left">Title</th>
                  <th className="p-3 border text-left">Category</th>
                  <th className="p-3 border text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-6">
                      <ClipLoader />
                    </td>
                  </tr>
                ) : (
                  data?.data?.map((product: any) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="p-3 border text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product._id)}
                          onChange={() => handleSelect(product._id)}
                        />
                      </td>

                      <td className="p-3 border rounded-md">
                        <div
                          style={{
                            backgroundColor: product.previewImage?.bgColor,
                          }}
                          className="w-16 border rounded-md">
                          <img
                            src={product.previewImage?.imageUrl}
                            alt=""
                            className="w-16 h-16 object-contain cursor-pointer"
                            onClick={() => {
                              setProductImageModal(
                                product.previewImage?.imageUrl,
                              );
                              setProductImageModalBg(
                                product.previewImage?.bgColor,
                              );
                            }}
                          />
                        </div>
                      </td>

                      <td className="p-3 border">{product.title}</td>

                      <td className="p-3 border">
                        {product.category?.categoryName || "NA"}
                      </td>

                      <td className="p-3 border space-x-2">
                        <button
                          onClick={() =>
                            setActiveMenuId(
                              activeMenuId === product._id ? null : product._id,
                            )
                          }
                          className="p-2 rounded-full hover:bg-gray-200 transition">
                          <FiMoreVertical size={18} />
                        </button>

                        {activeMenuId === product._id && (
                          <div
                            ref={menuRef}
                            className="absolute right-4 mt-2 w-44 bg-white border rounded-lg shadow-xl z-50 animate-fadeIn">
                            <button
                              onClick={() =>
                                navigate(
                                  `/product/view?productSlug=${product.slug}`,
                                )
                              }
                              className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm">
                              <FaRegEye className="mr-2" /> View
                            </button>

                            <button
                              onClick={() => {
                                sessionStorage.setItem(
                                  "productId",
                                  product._id,
                                );
                                setUpdateModalVisible(true);
                              }}
                              className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm">
                              <LuPencilLine className="mr-2" /> Update
                            </button>

                            <button
                              onClick={() => handleDuplicate(product._id)}
                              className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm">
                              <FaRegCopy className="mr-2" /> Duplicate
                            </button>

                            <button
                              onClick={() => setDeleteProductId([product._id])}
                              className="flex items-center w-full px-4 py-2 hover:bg-red-50 text-red-600 text-sm">
                              <MdOutlineDelete className="mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={pagination.pageIndex === 0}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex - 1,
                }))
              }
              className="px-4 py-2 bg-[#101826] text-white rounded disabled:opacity-50">
              Previous
            </button>

            <span>
              Page {pagination.pageIndex + 1} of {totalPages}
            </span>

            <button
              disabled={pagination.pageIndex + 1 >= totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex + 1,
                }))
              }
              className="px-4 py-2 bg-[#101826] text-white rounded disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {!!deleteProductId && (
        <ConfirmModal
          title="Are you sure?"
          closeModal={() => setDeleteProductId(null)}>
          <>
            <div className="w-full">
              <strong className="text-red-400">
                Warning: Permanent Deletion of Product Information
              </strong>
              <p className="mt-1 text-base">
                Deleting this product will permanently remove all associated
                information from the server and erase any related data from the
                database, including variants.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                disabled={deleteLoading}
                onClick={handleDeleteProduct}
                className="bg-red-500 text-white px-4 py-2 rounded">
                {deleteLoading ? (
                  <ClipLoader color="white" size={15} />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </>
        </ConfirmModal>
      )}

      {/* Update Modal */}
      {updateModalVisible && (
        <ProductUpdateModal
          visible={updateModalVisible}
          setVisible={setUpdateModalVisible}
          fetchProductData={refetch}
        />
      )}

      {/* Image Modal */}
      {productImageModal && (
        <ViewImage
          imageUrl={productImageModal}
          bgColor={productImageModalBg || "rgba(0,0,0,0.8)"}
          clearItem={() => setProductImageModal("")}
        />
      )}
    </div>
  );
};

export default ListProduct;
