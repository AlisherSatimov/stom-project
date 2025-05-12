// Importing necessary React hooks and libraries
import { useEffect, useState, useRef } from "react";
import { Table, Tag, Space, Modal, message, Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useEmployee } from "../context/EmployeeContext";

// Main Employees component
const Employees = () => {
  // State to store the list of employees
  const [employees, setEmployees] = useState([]);

  // States to manage search functionality
  const [searchText, setSearchText] = useState(""); // Holds the search query
  const [searchedColumn, setSearchedColumn] = useState(""); // Tracks which column is being searched

  // Context setters to share selected employee ID and data
  const { setEmployeeId, setEmployeeData } = useEmployee();

  // Ref used for focusing on the search input
  const searchInput = useRef(null);

  // Hook for navigating to another route
  const navigate = useNavigate();

  // Fetch employee list on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/employees");

        // Check if response is valid and contains an array
        if (response.status === 200 && Array.isArray(response.data)) {
          // Notify if the array is empty
          if (response.data.length === 0) {
            message.warning("No employees found.");
          }
          setEmployees(response.data); // Store employees in state
        } else {
          message.warning("No employees found.");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        message.error("Failed to fetch employees.");
      }
    };

    fetchEmployees();
  }, []);

  // Handler to delete a selected employee
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this employee?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/employees/${id}`);

          if (response.status === 200) {
            message.success("Employee deleted successfully!");
            // Remove the deleted employee from the list
            setEmployees((prev) => prev.filter((emp) => emp.id !== id));
          } else {
            message.error("Failed to delete employee.");
          }
        } catch (error) {
          console.error("Error deleting employee:", error);
          message.error("An error occurred while deleting the employee.");
        }
      },
    });
  };

  // Handles search execution
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  // Clears search input and resets the filter
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  // Generates searchable props for a given column
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

  // Table columns definition
  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      ...getColumnSearchProps("firstName"), // Enables search on this column
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      ...getColumnSearchProps("lastName"), // Enables search on this column
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

        // Render role with color-coded tag
        return <Tag color={color}>{role.replace("ROLE_", "")}</Tag>;
      },
    },
    {
      title: "Action",
      key: "operation",
      render: (_, record) => (
        <Space size="middle">
          {/* Delete button per row */}
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
        columns={columns}
        dataSource={employees}
        rowKey="id"
        // Custom row behavior
        onRow={(record) => ({
          onClick: (e) => {
            const target = e.target;

            // Ignore row click if it's on a button or link
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

            // Store employee data in context and navigate
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

// Exporting the component
export default Employees;
