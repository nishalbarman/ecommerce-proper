import { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  MRT_ColumnDef,
} from "material-react-table";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import cAxios from "../../axios/cutom-axios";

import { LuPencilLine } from "react-icons/lu";
import { MdDelete, MdOutlineDelete } from "react-icons/md";

import { Box, Button, MenuItem, lighten } from "@mui/material";

import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";

import { ClipLoader } from "react-spinners";
import ConfirmModal from "../ConfirmModal";
import ProductUpdateModal from "./ProductUpdateModal";
import { useAppSelector } from "../../redux/index";
import { Product } from "../../types";
import { FaRegEye } from "react-icons/fa";

const ListProduct = () => {
  // const navigate = useNavigate();

  const { jwtToken } = useAppSelector((state) => state.auth);

  //data and fetching state
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  //table state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchProductData = async () => {
    if (!data.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }

    const url = new URL("/products", process.env.VITE_APP_API_URL);

    url.searchParams.set("page", `${pagination.pageIndex}`);
    url.searchParams.set("limit", `${pagination.pageSize}`);

    try {
      const res = await cAxios.get(url.href, {
        headers: {
          authorization: `Bearer ${jwtToken}`,
        },
      });
      setData(res.data?.data || []);
      setRowCount(res.data?.totalProductCount || 0);
    } catch (error: any) {
      setIsError(true);
      console.error(error);
      return;
    }
    setIsError(false);
    setIsLoading(false);
    setIsRefetching(false);
  };

  //if you want to avoid useEffect, look at the React Query example instead
  useEffect(() => {
    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        id: "prodcut_info", //id used to define `group` column
        header: "Product Information",
        columns: [
          {
            accessorKey: "previewImage", //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
            header: "Preview Image",
            size: 50,
            enableColumnFilter: false,
            enableColumnFilterModes: false,
            enableFilters: false,
            Cell: ({ cell }) => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}>
                <img
                  className="object-contain rounded-md"
                  alt="avatar"
                  height={30}
                  src={cell.getValue() as string}
                  loading="lazy"
                  style={{
                    width: 50,
                    height: 50,
                  }}
                />
              </Box>
            ),
          },
          {
            accessorFn: (row) => `${row.title}`, //accessorFn used to join multiple data into a single cell
            id: "title", //id is still required when using accessorFn instead of accessorKey
            header: "Title",
            size: 250,
            Cell: ({ renderedCellValue }) => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}>
                <span className="font-bold">{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorKey: "category.categoryName",
            filterVariant: "autocomplete",
            header: "Category",
            size: 300,
            Cell: ({ renderedCellValue }) => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}>
                <span className="font-bold">{renderedCellValue || "NA"}</span>
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
    data,
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
    manualFiltering: false,
    manualPagination: true,
    manualSorting: false,
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    // onColumnFiltersChange: setColumnFilters,
    // onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    // onSortingChange: setSorting,
    rowCount,
    state: {
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
    },

    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        key={0}
        onClick={() => {
          // View profile logic...
          // setViewProduct(row);
          closeMenu();
        }}
        sx={{ m: 0 }}>
        <FaRegEye />
        <span style={{ marginLeft: "9px" }}>View</span>
      </MenuItem>,
      <MenuItem
        key={0}
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
        key={1}
        onClick={() => {
          console.log(row);

          setDeleteProductId([row.original._id as string]);
          closeMenu();
        }}
        sx={{ m: 0 }}>
        <MdOutlineDelete />
        <span style={{ marginLeft: "9px" }}>Delete</span>
      </MenuItem>,
    ],
    renderTopToolbar: ({ table }) => {
      const handleDeleted = () => {
        setDeleteProductId(
          table
            .getSelectedRowModel()
            .flatRows.map((row) => row.original._id as string)
        );
      };

      return (
        <Box
          sx={(theme) => ({
            backgroundColor: lighten(theme.palette.background.default, 0.05),
            display: "flex",
            gap: "0.5rem",
            p: "8px",
            justifyContent: "space-between",
          })}>
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {/* import MRT sub-components */}
            <MRT_GlobalFilterTextField table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Box>
          <Box>
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              <Button
                color="error"
                disabled={
                  !(
                    table.getIsSomePageRowsSelected() ||
                    table.getIsAllRowsSelected()
                  )
                }
                onClick={handleDeleted}
                variant="contained">
                Delete
              </Button>
            </Box>
          </Box>
        </Box>
      );
    },
  });

  // const [viewProduct, setViewProduct] = useState(null);

  const [deleteProductId, setDeleteProductId] = useState<string[] | null>(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const handleDeleteProudct = async () => {
    try {
      setDeleteButtonLoading(true);
      const response = await cAxios.post(
        `${process.env.VITE_APP_API_URL}/products/delete`,
        {
          deletableProductIds: deleteProductId,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      console.log(response);

      toast.success("Product deleted");
      setDeleteProductId(null);

      fetchProductData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100 ml-64 max-md:ml-0">
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
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-red-400 hover:bg-red-500"
                disabled={deleteButtonLoading}
                onClick={handleDeleteProudct}>
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
          fetchProductData={fetchProductData}
        />
      )}

      {/* {!!approveCenterIds && !!approveCenterIds.length && (
        <ConfirmModal
          title={"Are you sure about that?"}
          closeModal={() => setApproveCenterId(null)}>
          <>
            <div className="w-full">
              <p>
                By selecting this option, you are confirming approval for the
                selected center. This action will initiate the approval process
                and update relevant records accordingly.
              </p>
            </div>
            <div className="border-t mt-3 pt-3">
              <button
                className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 bg-green-400 hover:bg-green-500"
                disabled={deleteButtonLoading}
                onClick={handleApproveCenter}>
                {deleteButtonLoading ? (
                  <ClipLoader color="white" size={10} />
                ) : (
                  "Approve"
                )}
              </button>
            </div>
          </>
        </ConfirmModal>
      )}

      {!!rejectedCenterId && !!rejectedCenterId.length && (
        <ConfirmModal
          title={"Are you sure about that?"}
          closeModal={() => setRejectCenterId(null)}>
          <>
            <div className="w-full">
              <p>
                Proceeding with this option will result in the rejection of the
                selected center(s), particularly if multiple centers are chosen.
              </p>
            </div>
            <div className="border-t mt-3 pt-3">
              <button
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-indigo-400 hover:bg-indigo-500"
                disabled={deleteButtonLoading}
                onClick={handleRejectCenter}>
                {deleteButtonLoading ? (
                  <ClipLoader color="white" size={10} />
                ) : (
                  "Reject"
                )}
              </button>
            </div>
          </>
        </ConfirmModal>
      )} */}
    </div>
  );
};

export default ListProduct;
