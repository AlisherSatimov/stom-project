import React, { useEffect, useState, useRef } from "react";
import { Table, Tag, Space, Modal, message, Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import axios from "axios";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchText, setSearchText] = useState(""); // Qidirilayotgan matnni saqlaydi
  const [searchedColumn, setSearchedColumn] = useState(""); // Qaysi ustunda qidirayotganimizni saqlaydi
  const searchInput = useRef(null);
  const aToken = localStorage.getItem("aToken");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/employees", {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        });

        if (response.status === 200 && Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          message.warning("No employees found.");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        message.error("Failed to fetch employees.");
      }
    };

    fetchEmployees();
  }, [aToken]);

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this employee?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/employees/${id}`, {
            headers: {
              Authorization: `Bearer ${aToken}`,
            },
          });

          if (response.status === 200) {
            message.success("Employee deleted successfully!");
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
      <Table columns={columns} dataSource={employees} rowKey="id" />
    </div>
  );
};

export default Employees;
