// // Importing React hooks and required UI components
// import { useEffect, useState } from "react";
// import { Row, Col, Spin, Card, message } from "antd";
// import {
//   UserOutlined,
//   AppstoreOutlined,
//   MedicineBoxOutlined,
//   TeamOutlined,
// } from "@ant-design/icons";
// import axios from "../utils/axiosInstance"; // Custom axios instance with token and error handling
// import SalesCard from "../components/SalesCard"; // Reusable card component for showing stats
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts"; // Charting library for visualizations

// // Main AdminDashboard component
// const AdminDashboard = () => {
//   // Stores aggregated numeric stats for cards
//   const [stats, setStats] = useState({
//     clients: null,
//     services: null,
//     patients: null,
//     employees: null,
//   });

//   // Stores chart data for monthly treated patients
//   const [monthlyPatients, setMonthlyPatients] = useState([]);

//   // Loading spinner flag while data is being fetched
//   const [loading, setLoading] = useState(true);

//   // Month names used for converting numeric months into readable labels
//   const MONTH_NAMES = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];

//   // On component mount, fetch dashboard statistics and chart data
//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         // Perform all API requests in parallel
//         const [clientsRes, servicesRes, patientsRes, employeesRes, monthlyRes] =
//           await Promise.all([
//             axios.get("/client/count-client"),
//             axios.get("/service/count-services"),
//             axios.get("/patient/clients"),
//             axios.get("/employees/count-doctor"),
//             axios.get("/patient/monthly-appointments"),
//           ]);

//         // Set numeric stats for each card
//         setStats({
//           clients: clientsRes.data,
//           services: servicesRes.data,
//           patients: patientsRes.data,
//           employees: employeesRes.data,
//         });

//         // Format monthly appointment data for the bar chart
//         const formattedMonthly = monthlyRes.data.map((item) => ({
//           month: MONTH_NAMES[item.month - 1], // Convert month number to short name
//           count: item.count,
//         }));

//         setMonthlyPatients(formattedMonthly);
//       } catch (error) {
//         console.error("Xatolik yuz berdi:", error);
//         message.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
//       } finally {
//         setLoading(false); // Hide spinner when finished
//       }
//     };

//     fetchStats();
//   }, []);

//   // Array of card details to render overview cards
//   const cardsData = [
//     { title: "All Clients", amount: stats.clients, icon: UserOutlined },
//     { title: "All Services", amount: stats.services, icon: AppstoreOutlined },
//     {
//       title: "All Patients",
//       amount: stats.patients,
//       icon: MedicineBoxOutlined,
//     },
//     { title: "All Employees", amount: stats.employees, icon: TeamOutlined },
//   ];

//   return (
//     // Show loading spinner while fetching data
//     <Spin spinning={loading}>
//       {/* Statistic overview cards */}
//       <Row gutter={[16, 16]} justify="center">
//         {cardsData.map((card, index) => (
//           <Col key={index} xs={24} sm={12} md={8} lg={6} xl={6}>
//             <SalesCard
//               title={card.title}
//               amount={
//                 card.amount !== null && card.amount !== undefined
//                   ? card.amount
//                   : "–" // Fallback if amount is null/undefined
//               }
//               icon={card.icon}
//             />
//           </Col>
//         ))}
//       </Row>

//       {/* Monthly Treated Patients Bar Chart */}
//       <Card
//         title="Monthly Treated Patients"
//         style={{ marginTop: 24, borderRadius: 8 }}
//       >
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart
//             data={monthlyPatients} // Data array of months and counts
//             margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />{" "}
//             {/* Light grid background */}
//             <XAxis dataKey="month" /> {/* X-axis showing month names */}
//             <YAxis allowDecimals={false} /> {/* Y-axis showing patient count */}
//             <Tooltip /> {/* Show data on hover */}
//             <Legend /> {/* Chart legend */}
//             <Bar dataKey="count" fill="#82ca9d" name="Patients" />{" "}
//             {/* Bar data */}
//           </BarChart>
//         </ResponsiveContainer>
//       </Card>
//     </Spin>
//   );
// };

// // Exporting the dashboard component
// export default AdminDashboard;

// Importing React hooks and required UI components
import { useEffect, useState } from "react";
import { Row, Col, Spin, Card, message } from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "../utils/axiosInstance"; // Custom axios instance with token and error handling
import SalesCard from "../components/SalesCard"; // Reusable card component for showing stats
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
} from "recharts"; // Charting library for visualizations

// Main AdminDashboard component
const AdminDashboard = () => {
  // Stores aggregated numeric stats for cards
  const [stats, setStats] = useState({
    clients: null,
    services: null,
    patients: null,
    employees: null,
  });

  // Stores chart data for monthly treated patients
  const [monthlyPatients, setMonthlyPatients] = useState([]);

  // Stores chart data for monthly income & expense
  const [incomeExpense, setIncomeExpense] = useState([]);

  // Loading spinner flag while data is being fetched
  const [loading, setLoading] = useState(true);

  // Month names used for converting numeric months into readable labels
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

  // On component mount, fetch dashboard statistics and chart data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Perform all API requests in parallel
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

        // Set numeric stats for each card
        setStats({
          clients: clientsRes.data,
          services: servicesRes.data,
          patients: patientsRes.data,
          employees: employeesRes.data,
        });

        // Format monthly appointment data for the bar chart
        const formattedMonthly = monthlyRes.data.map((item) => ({
          month: MONTH_NAMES[item.month - 1], // Convert month number to short name
          count: item.count,
        }));

        setMonthlyPatients(formattedMonthly);

        // Format income & expense data for the line chart
        const formattedIncomeExpense = incomeExpenseRes.data.map((item) => ({
          month: MONTH_NAMES[item.month - 1],
          income: item.totalIncome,
          expense: item.totalExpense,
        }));

        setIncomeExpense(formattedIncomeExpense);
      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
        message.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false); // Hide spinner when finished
      }
    };

    fetchStats();
  }, []);

  // Array of card details to render overview cards
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
    // Show loading spinner while fetching data
    <Spin spinning={loading}>
      {/* Statistic overview cards */}
      <Row gutter={[16, 16]} justify="center">
        {cardsData.map((card, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6} xl={6}>
            <SalesCard
              title={card.title}
              amount={
                card.amount !== null && card.amount !== undefined
                  ? card.amount
                  : "–" // Fallback if amount is null/undefined
              }
              icon={card.icon}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          {/* Monthly Treated Patients Bar Chart */}
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

        <Col xs={24} md={12}>
          {/* Monthly Income & Expense Line Chart */}
          <Card title="Monthly Income & Expense" style={{ borderRadius: 8 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={incomeExpense}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
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
    </Spin>
  );
};

// Exporting the dashboard component
export default AdminDashboard;
