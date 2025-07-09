import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import DataTable from "./DataTable";
import { useAppSelector } from "../redux";
import cAxios from "../axios/cutom-axios";
import { CircularProgress, Alert } from "@mui/material";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatItem {
  current: number;
  lastMonth: number;
  change: number;
}

interface DashboardStats {
  revenue: StatItem;
  weeklySales: {
    current: number;
    change: number;
  };
  totalOrders: StatItem;
  totalUsers: StatItem;
}

interface ChartDataItem {
  month: string;
  value: number;
}

const DashboardWithData: React.FC<{ setNavbarToogle?: any }> = () => {
  const jwtToken = useAppSelector((state) => state.auth.jwtToken);

  const [selectedYear, setSelectedYear] = useState<Dayjs | null>(dayjs());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueChart, setRevenueChart] = useState<ChartDataItem[]>([]);
  const [ordersChart, setOrdersChart] = useState<ChartDataItem[]>([]);
  const [usersChart, setUsersChart] = useState<ChartDataItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [newRegistrations, setNewRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    stats: true,
    charts: true,
    tables: true,
  });
  const [error, setError] = useState<{
    stats: string | null;
    charts: string | null;
    tables: string | null;
  }>({
    stats: null,
    charts: null,
    tables: null,
  });

  // const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await cAxios.get("/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setStats(statsRes.data);
        setError((prev) => ({ ...prev, stats: null }));
      } catch (err: any) {
        setError((prev) => ({
          ...prev,
          stats: err?.response?.data?.message || "Failed to load statistics",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, stats: false }));
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!selectedYear) return;

      setLoading((prev) => ({ ...prev, charts: true }));
      setError((prev) => ({ ...prev, charts: null }));

      try {
        const year = selectedYear.year();
        const [revenueRes, ordersRes, usersRes] = await Promise.all([
          cAxios.get(`/dashboard/revenue-chart?year=${year}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }),
          cAxios.get(`/dashboard/orders-chart?year=${year}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }),
          cAxios.get(`/dashboard/users-chart?year=${year}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }),
        ]);

        setRevenueChart(
          revenueRes.data.map((d: any) => ({
            month: d.month,
            value: d.revenue,
          }))
        );
        setOrdersChart(
          ordersRes.data.map((d: any) => ({ month: d.month, value: d.orders }))
        );
        setUsersChart(
          usersRes.data.map((d: any) => ({ month: d.month, value: d.users }))
        );
      } catch (err: any) {
        setError((prev) => ({
          ...prev,
          charts: err?.response?.data?.message || "Failed to load chart data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, charts: false }));
      }
    };

    fetchChartData();
  }, [selectedYear]);

  useEffect(() => {
    const fetchTableData = async () => {
      setLoading((prev) => ({ ...prev, tables: true }));
      setError((prev) => ({ ...prev, tables: null }));

      try {
        const [transactionsRes, registrationsRes] = await Promise.all([
          cAxios.get("/dashboard/recent-transactions?limit=5", {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }),
          cAxios.get("/dashboard/new-registrations?limit=5", {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }),
        ]);

        setRecentTransactions(transactionsRes.data);
        setNewRegistrations(registrationsRes.data);
      } catch (err: any) {
        setError((prev) => ({
          ...prev,
          tables: err?.response?.data?.message || "Failed to load table data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, tables: false }));
      }
    };

    fetchTableData();
  }, []);

  const prepareChartData = (
    data: ChartDataItem[],
    label: string,
    color: string
  ) => {
    return {
      labels: data.map((d) => d.month),
      datasets: [
        {
          label,
          data: data.map((d) => d.value),
          backgroundColor: `${color}`, // Adds transparency
          borderColor: color,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading.stats && loading.charts && loading.tables) {
    return (
      <div className="flex justify-center items-center h-96">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={["year"]}
              value={selectedYear}
              onChange={(newValue) => setSelectedYear(newValue)}
              sx={{ width: 120 }}
            />
          </LocalizationProvider>
        </div>
      </div>

      {/* Error messages */}
      {error.stats && (
        <Alert severity="error" className="mb-4">
          {error.stats}
        </Alert>
      )}
      {error.charts && (
        <Alert severity="error" className="mb-4">
          {error.charts}
        </Alert>
      )}
      {error.tables && (
        <Alert severity="error" className="mb-4">
          {error.tables}
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Revenue"
          value={stats?.revenue.current}
          change={stats?.revenue.change}
          loading={loading.stats}
          prefix="Rs. "
        />
        <StatCard
          title="Weekly Sales"
          value={stats?.weeklySales.current}
          change={stats?.weeklySales.change}
          loading={loading.stats}
          prefix="Rs. "
          isGoal={true}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders.current}
          change={stats?.totalOrders.change}
          loading={loading.stats}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers.current}
          change={stats?.totalUsers.change}
          loading={loading.stats}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard
          title="Revenue"
          loading={loading.charts}
          error={error.charts}>
          <Line
            data={prepareChartData(
              revenueChart,
              "Revenue",
              "rgba(75, 192, 192, 1)"
            )}
            options={options}
          />
        </ChartCard>
        <ChartCard title="Orders" loading={loading.charts} error={error.charts}>
          <Bar
            data={prepareChartData(
              ordersChart,
              "Orders",
              "rgba(54, 162, 235, 1)"
            )}
            options={options}
          />
        </ChartCard>
        <ChartCard
          title="User Registrations"
          loading={loading.charts}
          error={error.charts}>
          <Line
            data={prepareChartData(
              usersChart,
              "Users",
              "rgb(228, 96, 52)"
            )}
            options={options}
          />
        </ChartCard>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableCard
          title="Recent Transactions"
          loading={loading.tables}
          error={error.tables}>
          <DataTable data={recentTransactions} type="transactions" />
        </TableCard>
        <TableCard
          title="New Registrations"
          loading={loading.tables}
          error={error.tables}>
          <DataTable data={newRegistrations} type="users" />
        </TableCard>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value?: number;
  change?: number;
  loading: boolean;
  prefix?: string;
  isGoal?: boolean;
}> = ({ title, value, change, loading, prefix = "", isGoal = false }) => {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const changePositive = change !== undefined ? change >= 0 : false;
  const changeText = isGoal
    ? `${change?.toFixed(2)}% of total goals`
    : `${changePositive ? "+" : ""}${change?.toFixed(2)}% vs last month`;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-full">
      <h2 className="text-lg font-semibold mb-2 text-gray-700">{title}</h2>
      <p className="text-2xl font-bold text-gray-900">
        {prefix}
        {value?.toLocaleString() ?? "N/A"}
      </p>
      <p
        className={`mt-2 text-sm ${
          isGoal
            ? "text-blue-500"
            : changePositive
              ? "text-green-500"
              : "text-red-500"
        }`}>
        {change !== undefined ? changeText : "No data available"}
      </p>
    </div>
  );
};

// Chart Card Component
const ChartCard: React.FC<{
  title: string;
  children: React.ReactNode;
  loading: boolean;
  error: string | null;
}> = ({ title, children, loading, error }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      <div className="h-64">
        {error ? (
          <div className="h-full flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <CircularProgress size={40} />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

// Table Card Component
const TableCard: React.FC<{
  title: string;
  children: React.ReactNode;
  loading: boolean;
  error: string | null;
}> = ({ title, children, loading, error }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      {error ? (
        <div className="h-40 flex items-center justify-center text-red-500">
          {error}
        </div>
      ) : loading ? (
        <div className="h-40 flex items-center justify-center">
          <CircularProgress size={40} />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default DashboardWithData;
