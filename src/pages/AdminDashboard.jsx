// Importing necessary libraries and UI components
import { Row, Col, Spin, Card, message } from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "../utils/axiosInstance";
import SalesCard from "../components/SalesCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Define month names for formatting monthly data
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Fetch all dashboard data in parallel
const fetchDashboardData = async () => {
  const [
    clientsRes,
    servicesRes,
    patientsRes,
    employeesRes,
    monthlyRes,
    incomeExpenseRes,
  ] = await Promise.all([
    axios.get("/client/count-client"),
    axios.get("/service/count-services"),
    axios.get("/patient/clients"),
    axios.get("/employees/count-doctor"),
    axios.get("/patient/monthly-appointments"),
    axios.get("/patient/monthly-total-income-expense", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("aToken")}`,
      },
    }),
  ]);

  return {
    stats: {
      clients: clientsRes.data,
      services: servicesRes.data,
      patients: patientsRes.data,
      employees: employeesRes.data,
    },
    monthlyPatients: monthlyRes.data.map((item) => ({
      month: MONTH_NAMES[item.month - 1],
      count: item.count,
    })),
    incomeExpense: incomeExpenseRes.data.map((item) => ({
      month: MONTH_NAMES[item.month - 1],
      income: item.totalIncome,
      expense: item.totalExpense,
    })),
  };
};

// AdminDashboard component
const AdminDashboard = () => {
  // Use React Query to fetch and cache dashboard data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,

    // Keep data fresh for 5 minutes
    staleTime: 0,

    // Allow background refetching on mount
    refetchOnMount: true,

    // Enable background update when window is refocused
    refetchOnWindowFocus: true,

    // Auto-refetch on reconnect
    refetchOnReconnect: true,
  });

  // Show spinner while data is being loaded
  if (isLoading) {
    return <Spin spinning={true} />;
  }

  // Show error message if fetching failed
  if (isError) {
    message.error("Failed to load dashboard data.");
    console.error("Dashboard load error:", error);
  }

  // Extract fetched values
  const stats = data?.stats || {};
  const monthlyPatients = data?.monthlyPatients || [];
  const incomeExpense = data?.incomeExpense || [];

  // Define card data for numeric statistics
  const cardsData = [
    { title: "All Clients", amount: stats.clients, icon: UserOutlined },
    { title: "All Services", amount: stats.services, icon: AppstoreOutlined },
    {
      title: "All Patients",
      amount: stats.patients,
      icon: MedicineBoxOutlined,
    },
    { title: "All Employees", amount: stats.employees, icon: TeamOutlined },
  ];

  return (
    <>
      {/* Summary statistic cards */}
      <Row gutter={[16, 16]} justify="center">
        {cardsData.map((card, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6} xl={6}>
            <SalesCard
              title={card.title}
              amount={
                card.amount !== null && card.amount !== undefined
                  ? card.amount
                  : "–"
              }
              icon={card.icon}
            />
          </Col>
        ))}
      </Row>

      {/* Dashboard charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Bar chart: Monthly Treated Patients */}
        <Col xs={24} md={12}>
          <Card title="Monthly Treated Patients" style={{ borderRadius: 8 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyPatients}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Line chart: Monthly Income and Expense */}
        <Col xs={24} md={12}>
          <Card title="Monthly Income & Expense" style={{ borderRadius: 8 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={incomeExpense}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => {
                    if (value >= 1_000_000_000)
                      return `${(value / 1_000_000_000).toFixed(1)} mlrd`;
                    if (value >= 1_000_000)
                      return `${(value / 1_000_000).toFixed(1)} mln`;
                    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
                    return value;
                  }}
                />

                <Tooltip
                  formatter={(value, name) => [
                    value.toLocaleString("de-DE"), // Yevropa uslubidagi format
                    name === "income" ? "Income" : "Expense",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#4caf50"
                  name="Income"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#f44336"
                  name="Expense"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
};

// Export the dashboard component
export default AdminDashboard;
