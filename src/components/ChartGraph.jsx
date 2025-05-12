// Import necessary libraries
import React from "react";
import { Card } from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", income: 4500, clients: 2200 },
  { month: "Feb", income: 7000, clients: 4000 }, // katta o'sish
  { month: "Mar", income: 3200, clients: 1700 }, // katta tushish
  { month: "Apr", income: 4800, clients: 2700 },
  { month: "May", income: 9000, clients: 5000 }, // katta o'sish
  { month: "Jun", income: 5200, clients: 3100 },
  { month: "Jul", income: 2500, clients: 1200 }, // katta tushish
  { month: "Aug", income: 4900, clients: 3000 },
  { month: "Sep", income: 10500, clients: 7000 }, // katta o'sish
  { month: "Oct", income: 6100, clients: 4100 },
  { month: "Nov", income: 2800, clients: 1400 }, // katta tushish
  { month: "Dec", income: 7700, clients: 4500 }, // katta o'sish
];

const RechartsGraphs = () => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        marginTop: "22px",
      }}
    >
      {/* Line Chart for Income */}
      <Card title="Income Overview" style={{ flex: "1 1 48%" }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
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
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Bar Chart for Clients */}
      <Card title="Monthly Clients" style={{ flex: "1 1 48%" }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="clients" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default RechartsGraphs;
