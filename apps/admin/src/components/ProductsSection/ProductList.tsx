import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  MRT_ColumnDef,
} from "material-react-table";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { LuPencilLine } from "react-icons/lu";
import { MdOutlineDelete } from "react-icons/md";

import { Box, Button, MenuItem, lighten } from "@mui/material";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { ClipLoader } from "react-spinners";
import ConfirmModal from "../ConfirmModal";
import ProductUpdateModal from "./ProductUpdateModal";
import { Product } from "../../types";
import { FaRegEye } from "react-icons/fa";
import {
  useGetProductsQuery,
  useDeleteProductsMutation,
} from "../../redux/apis/productApi";
import ViewImage from "../ViewImage/ViewImage";

const ListProduct = () => {
  const navigate = useNavigate();

  // RTK Query hooks
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { data, isError, isLoading, isFetching, refetch } = useGetProductsQuery(
    {
      page: pagination.pageIndex,
      limit: pagination.pageSize,
    }
  );

  const [deleteProducts] = useDeleteProductsMutation();

  const [deleteProductId, setDeleteProductId] = useState<string[] | null>(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    try {
      setDeleteButtonLoading(true);
      await deleteProducts(deleteProductId).unwrap();
      toast.success("Product(s) deleted successfully");
      setDeleteProductId(null);
      refetch(); // Refetch data after deletion
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to delete product(s)");
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  const [produtImageModal, setProductImageModal] = useState<string>("");

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        id: "product_info",
        header: "Product Information",
        columns: [
          {
            accessorKey: "previewImage",
            header: "Preview Image",
            size: 50,
            enableColumnFilter: false,
            Cell: ({ cell }) => (
              <Box
                className="cursor-pointer"
                onClick={() => {
                  setProductImageModal(cell.getValue() as string);
                }}
                sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <img
                  className="object-contain rounded-md select-none"
                  alt="avatar"
                  height={30}
                  src={cell.getValue() as string}
                  loading="lazy"
                  style={{ width: 50, height: 50 }}
                />
              </Box>
            ),
          },
          {
            accessorFn: (row) => row.title,
            id: "title",
            header: "Title",
            size: 250,
            Cell: ({ renderedCellValue }) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className="">{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorKey: "category.categoryName",
            filterVariant: "autocomplete",
            header: "Category",
            size: 300,
            Cell: ({ renderedCellValue }) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className="">{renderedCellValue || "NA"}</span>
              </Box>
            ),
          },
        ],
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: data?.data || [],
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: false,
    enableFacetedValues: true,
    enableRowActions: true,
    enableRowSelection: true,
    getRowId: (row) => row._id as string,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: true,
      columnPinning: {
        left: ["mrt-row-expand", "mrt-row-select"],
        right: ["mrt-row-actions"],
      },
    },
    manualPagination: true,
    onPaginationChange: setPagination,
    rowCount: data?.totalProductCount || 0,
    state: {
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isFetching,
    },
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        key={0}
        onClick={() => {
          navigate(`/product/view?productId=${row.original._id}`);
          closeMenu();
        }}
        sx={{ m: 0 }}>
        <FaRegEye />
        <span style={{ marginLeft: "9px" }}>View</span>
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          sessionStorage.setItem("productId", row.original._id as string);
          setUpdateModalVisible(true);
          closeMenu();
        }}
        sx={{ m: 0 }}>
        <LuPencilLine />
        <span style={{ marginLeft: "9px" }}>Update</span>
      </MenuItem>,
      <MenuItem
        key={2}
        onClick={() => {
          setDeleteProductId([row.original._id as string]);
          closeMenu();
        }}
        sx={{ m: 0 }}>
        <MdOutlineDelete />
        <span style={{ marginLeft: "9px" }}>Delete</span>
      </MenuItem>,
    ],
    renderTopToolbar: ({ table }) => (
      <Box
        sx={(theme) => ({
          backgroundColor: lighten(theme.palette.background.default, 0.05),
          display: "flex",
          gap: "0.5rem",
          p: "8px",
          justifyContent: "space-between",
        })}>
        <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <MRT_GlobalFilterTextField table={table} />
          <MRT_ToggleFiltersButton table={table} />
        </Box>
        <Box>
          <Button
            color="error"
            disabled={!table.getIsSomeRowsSelected()}
            onClick={() =>
              setDeleteProductId(
                table
                  .getSelectedRowModel()
                  .flatRows.map((row) => row.original._id as string)
              )
            }
            variant="contained">
            Delete
          </Button>
        </Box>
      </Box>
    ),
  });

  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="grid grid-cols-1 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Product</h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              List of products
            </h2>
          </div>
          <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MaterialReactTable table={table} />
            </LocalizationProvider>
          </div>
        </div>
      </div>

      {!!deleteProductId && !!deleteProductId.length && (
        <ConfirmModal
          title={"Are you sure about that?"}
          closeModal={() => setDeleteProductId(null)}>
          <>
            <div className="w-full">
              <strong className="text-red-400">
                Warning: Permanent Deletion of Product Information
              </strong>
              <p>
                Deleting this product will permanently remove all associated
                information from the server and erase any related data from the
                database, including variants.
              </p>
            </div>
            <div className="border-t mt-3 pt-3">
              <button
                className="inline-flex justify-center rounded-md border border-transparent bg-red-400 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:bg-red-500"
                disabled={deleteButtonLoading}
                onClick={handleDeleteProduct}>
                {deleteButtonLoading ? (
                  <ClipLoader color="white" size={15} />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </>
        </ConfirmModal>
      )}

      {updateModalVisible && (
        <ProductUpdateModal
          visible={updateModalVisible}
          setVisible={setUpdateModalVisible}
          fetchProductData={refetch}
        />
      )}

      {produtImageModal && (
        <ViewImage
          imageUrl={produtImageModal}
          clearItem={() => {
            setProductImageModal("");
          }}
        />
      )}
    </div>
  );
};

export default ListProduct;
