import { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Box,
  MenuItem,
  Tab,
  Tabs,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/index";
import { OrderGroup } from "../../types";
import cAxios from "../../axios/cutom-axios";
import { FaEye } from "react-icons/fa";

type PaymentStatus = "all" | "pending" | "completed" | "failed";
type OrderStatusFilter = "all" | "processed" | "unprocessed" | "cancelled";

const OrderList = () => {
  const navigate = useNavigate();
  const { jwtToken } = useAppSelector((state) => state.auth);

  // State for tab selections
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("all");
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderStatusFilter>("all");

  // Data and fetching state
  const [data, setData] = useState<OrderGroup[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  // Table state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchOrderData = async () => {
    if (!data.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }

    const url = new URL("/orders/list", process.env.VITE_APP_API_URL);

    url.searchParams.set("page", `${pagination.pageIndex}`);
    url.searchParams.set("limit", `${pagination.pageSize}`);

    // Add filters if not 'all'
    if (paymentStatus !== "all") {
      url.searchParams.set("paymentStatus", paymentStatus);
    }
    if (orderStatusFilter !== "all") {
      url.searchParams.set("orderStatus", orderStatusFilter);
    }

    try {
      const res: {
        data: { groupedOrders: OrderGroup[]; globalTotalDocumentCount: number };
      } = await cAxios.get(url.href, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      setData(res.data?.groupedOrders || []);
      setRowCount(res.data?.globalTotalDocumentCount || 0);
    } catch (error) {
      setIsError(true);
      console.error(error);
    }
    setIsError(false);
    setIsLoading(false);
    setIsRefetching(false);
  };

  useEffect(() => {
    fetchOrderData();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    paymentStatus,
    orderStatusFilter,
  ]);

  const columns = useMemo<MRT_ColumnDef<OrderGroup>[]>(
    () => [
      {
        id: "payment_info",
        header: "Payment Info",
        columns: [
          {
            header: "Transaction ID",
            accessorKey: "paymentTransactionId",
            enableClickToCopy: true,
            size: 200,
            Cell: ({ renderedCellValue }) => (
              <Box component="span">
                {renderedCellValue || "Not Applicable"}
              </Box>
            ),
          },
          {
            header: "Payment Status",
            accessorKey: "paymentStatus",
            size: 150,
            Cell: ({ renderedCellValue }) => {
              let color = "";
              let text = "";

              switch (renderedCellValue) {
                case "Pending":
                  color = "orange";
                  text = "Pending";
                  break;
                case "Success":
                  color = "green";
                  text = "Completed";
                  break;
                case "Failed":
                  color = "red";
                  text = "Failed";
                  break;
                default:
                  color = "gray";
                  text = "N/A";
              }

              return (
                <Chip
                  label={text}
                  sx={{
                    color: "white",
                    backgroundColor: color,
                    fontWeight: "bold",
                    minWidth: 100,
                  }}
                />
              );
            },
          },
          {
            header: "Amount",
            accessorKey: "totalPrice",
            size: 120,
            Cell: ({ renderedCellValue }) => (
              <Box component="span" sx={{ fontWeight: "bold" }}>
                ₹{renderedCellValue?.toLocaleString() || "0"}
              </Box>
            ),
          },
        ],
      },
      {
        id: "order_info",
        header: "Order Info",
        columns: [
          {
            header: "Order Group ID",
            accessorKey: "orderGroupID",
            size: 200,
            Cell: ({ renderedCellValue }) => (
              <Box component="span" sx={{ fontFamily: "monospace" }}>
                {renderedCellValue}
              </Box>
            ),
          },
          {
            header: "Status",
            accessorKey: "orderStatus",
            size: 150,
            Cell: ({ renderedCellValue }) => {
              let color = "";
              let text = (renderedCellValue || "N/A") as string;

              // Color coding based on order status
              if (["Delivered", "Completed", "PickUp Ready"].includes(text)) {
                color = "green";
              } else if (
                ["On Hold", "Pending", "On Progress", "Accepted"].includes(text)
              ) {
                color = "orange";
              } else if (["Cancelled", "Rejected"].includes(text)) {
                color = "red";
              } else {
                color = "blue";
              }

              return (
                <Chip
                  label={text}
                  sx={{
                    color: "white",
                    backgroundColor: color,
                    fontWeight: "bold",
                    minWidth: 120,
                  }}
                />
              );
            },
          },
          {
            header: "Items",
            accessorKey: "totalDocumentCount",
            size: 100,
            Cell: ({ renderedCellValue }) => (
              <Box component="span">
                <strong>{renderedCellValue}</strong>
              </Box>
            ),
          },
          {
            header: "Type",
            accessorKey: "orderType",
            size: 100,
            Cell: ({ renderedCellValue }) => (
              <Box component="span" sx={{ textTransform: "capitalize" }}>
                {renderedCellValue}
              </Box>
            ),
          },
        ],
      },
      {
        id: "Date",
        header: "Date",
        columns: [
          {
            accessorKey: "createdAt",
            header: "Order Date",
            size: 150,
            enableColumnFilter: false,
            Cell: ({ renderedCellValue }: { renderedCellValue: any }) => (
              <Box>
                {new Date(renderedCellValue).toLocaleDateString()}
                <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                  {new Date(renderedCellValue).toLocaleTimeString()}
                </Box>
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
    enableRowSelection: false,
    getRowId: (row) => row.orderGroupID,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      columnPinning: {
        left: ["mrt-row-expand"],
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
    onPaginationChange: setPagination,
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
          navigate(
            `/orders/view?groupId=${encodeURI(row.original.orderGroupID)}`
          );
          closeMenu();
        }}
        sx={{ m: 0 }}>
        <FaEye style={{ marginRight: "8px" }} />
        View Order Details
      </MenuItem>,
    ],
  });

  const handlePaymentStatusChange = (event: any, newValue: PaymentStatus) => {
    setPaymentStatus(newValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleOrderStatusChange = (event: any, newValue: OrderStatusFilter) => {
    setOrderStatusFilter(newValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="grid grid-cols-1 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Orders Management
          </h1>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
          </div>

          {/* Order Status Tabs */}
          <FormControl fullWidth sx={{ mb: 2 }} size="medium">
            <InputLabel id="order-status-label">Order Status</InputLabel>
            <Select
              value={orderStatusFilter}
              onChange={(e) => {
                handleOrderStatusChange(e, e.target.value as OrderStatusFilter);
              }}
              aria-label="order status select"
              label="Payment Status">
              <MenuItem value="all">All Orders</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Accepted">Accepted</MenuItem>
              <MenuItem value="On Progress">On Progress</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
              <MenuItem value="On The Way">On The Way</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
              <MenuItem value="PickUp Ready">PickUp Ready</MenuItem>
            </Select>
          </FormControl>

          {/* Payment Status Tabs */}
          <FormControl fullWidth sx={{ mb: 2 }} size="medium">
            <InputLabel id="payment-status-label">Payment Status</InputLabel>
            <Select
              labelId="payment-status-label"
              id="payment-status-select"
              value={paymentStatus}
              label="Payment Status"
              onChange={(e) =>
                handlePaymentStatusChange(e, e.target.value as PaymentStatus)
              }>
              <MenuItem value="all">All Payments</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Success">Success</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </Select>
          </FormControl>

          <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MaterialReactTable table={table} />
            </LocalizationProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
