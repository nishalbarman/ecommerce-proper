import React, { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { Tooltip, Chip } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Define types for our data
type Transaction = {
  _id: string;
  totalPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  order?: {
    _id: string;
  };
};

type User = {
  _id: string;
  name: string;
  email: string;
  mobileNo?: string;
  createdAt: string;
  role?: {
    roleName: string;
  };
};

type DataTableProps = {
  data: Transaction[] | User[];
  type: "transactions" | "users";
  loading?: boolean;
  onDateChange?: (date: Dayjs | null) => void;
};

const DataTable = ({ data, type, loading, onDateChange }: DataTableProps) => {
  const [dateFilter, setDateFilter] = React.useState<Dayjs | null>(dayjs());

  const handleDateChange = (newValue: Dayjs | null) => {
    setDateFilter(newValue);
    if (onDateChange) {
      onDateChange(newValue);
    }
  };

  // Columns for transactions
  const transactionColumns = useMemo<MRT_ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "user.name",
        header: "Customer",
        size: 150,
        Cell: ({ cell }) => (
          <div>
            <div>{cell.getValue<string>()}</div>
            <div className="text-xs text-gray-500">
              {cell.row.original.user?.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "totalPrice",
        header: "Amount",
        size: 100,
        Cell: ({ cell }) => (
          <span>Rs. {cell.getValue<number>().toLocaleString()}</span>
        ),
      },
      // {
      //   accessorKey: "paymentMethod",
      //   header: "Method",
      //   size: 100,
      // },
      {
        accessorKey: "paymentStatus",
        header: "Status",
        size: 100,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<string>()}
            color={cell.getValue<string>() === "Paid" ? "success" : "default"}
            size="small"
          />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        size: 120,
        Cell: ({ cell }) => (
          <span>{dayjs(cell.getValue<string>()).format("DD MMM YYYY")}</span>
        ),
      },
    ],
    []
  );

  // Columns for users
  const userColumns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 200,
      },
      {
        accessorKey: "mobileNo",
        header: "Phone",
        size: 120,
        Cell: ({ cell }) => (
          <span>{cell.getValue<string>() || "Not provided"}</span>
        ),
      },
      {
        accessorKey: "role.roleName",
        header: "Role",
        size: 100,
        Cell: ({ cell }) => (
          <span>{cell.getValue<string>() || "Customer"}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        size: 120,
        Cell: ({ cell }) => (
          <span>{dayjs(cell.getValue<string>()).format("DD MMM YYYY")}</span>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable<any>({
    columns: type === "transactions" ? transactionColumns : userColumns,
    data,
    state: {
      isLoading: loading,
    },
    enableHiding: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    renderTopToolbarCustomActions: () => (
      <Tooltip arrow title="Filter by date">
        <div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={["year", "month"]}
              value={dateFilter}
              onChange={handleDateChange}
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>
        </div>
      </Tooltip>
    ),
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "0.5rem",
        border: "1px solid #e0e0e0",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: "600",
      },
    },
  });

  return <MaterialReactTable table={table} />;
};

export default DataTable;
