// Importing necessary React hooks and libraries
import { useRef, useState } from "react";
import { Table, Tag, Space, Modal, message, Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";
import { useEmployee } from "../context/EmployeeContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosInstance";

// Fetch function to retrieve all employees
const fetchEmployees = async () => {
  const response = await axios.get("/employees");
  if (response.status !== 200) throw new Error("Failed to fetch employees");
  return response.data;
};

// Main Employees component
const Employees = () => {
  // Global query client instance
  const queryClient = useQueryClient();

  // Context setters to share selected employee ID and data
  const { setEmployeeId, setEmployeeData } = useEmployee();

  // Navigation hook
  const navigate = useNavigate();

  // Ref used for focusing on the search input
  const searchInput = useRef(null);

  // Search-related state
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  // React Query to fetch and cache employees
  const {
    data: employees,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Mutation to delete employee
  const deleteMutation = useMutation({
    mutationFn: async (id) => await axios.delete(`/employees/${id}`),
    onSuccess: () => {
      message.success("Employee deleted successfully!");
      queryClient.invalidateQueries(["employees"]); // Refetch employees after deletion
    },
    onError: () => {
      message.error("An error occurred while deleting the employee.");
    },
  });

  // Confirm delete dialog and mutation trigger
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this employee?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  // Column search behavior
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // Table columns
  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      ...getColumnSearchProps("firstName"),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      ...getColumnSearchProps("lastName"),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "Admin", value: "ROLE_ADMIN" },
        { text: "Moderator", value: "ROLE_MODERATOR" },
        { text: "User", value: "ROLE_USER" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => {
        let color = "green";
        if (role === "ROLE_ADMIN") color = "volcano";
        else if (role === "ROLE_MODERATOR") color = "geekblue";
        return <Tag color={color}>{role.replace("ROLE_", "")}</Tag>;
      },
    },
    {
      title: "Action",
      key: "operation",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={employees || []}
        rowKey="id"
        onRow={(record) => ({
          onClick: (e) => {
            const target = e.target;
            if (
              target.tagName === "BUTTON" ||
              target.closest("button") ||
              target.tagName === "A" ||
              target.closest("a") ||
              target.tagName === "svg" ||
              target.closest(".ant-btn")
            ) {
              return;
            }
            setEmployeeId(record.id);
            setEmployeeData(record);
            navigate(`/admin/employeeID/${record.id}`);
          },
          style: { cursor: "pointer" },
        })}
      />
    </div>
  );
};

export default Employees;
