// Importing necessary React hooks and libraries
import { useRef, useState } from "react";
import { Table, Tag, Space, Modal, message, Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";
import { useEmployee } from "../context/EmployeeContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosInstance";
import { useTranslation } from "react-i18next";

// Fetch function to retrieve all employees
const fetchEmployees = async () => {
  const response = await axios.get("/employees");
  if (response.status !== 200) throw new Error(t("fetchEmployeesError"));
  return response.data;
};

// Main Employees component
const Employees = () => {
  const { t } = useTranslation();
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
    mutationFn: async (id) =>
      await axios.delete(`/employees/passive-delete/${id}`),
    onSuccess: () => {
      message.success(t("employeeDeleted"));
      queryClient.invalidateQueries(["employees"]); // Refetch employees after deletion
    },
    onError: () => {
      message.error(t("employeeDeleteError"));
    },
  });

  // Confirm delete dialog and mutation trigger
  const handleDelete = (id) => {
    Modal.confirm({
      title: t("confirmDeleteEmployee"),
      content: t("cannotBeUndone"),
      okText: t("yes"),
      okType: "danger",
      cancelText: t("no"),
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
          // placeholder={`Search ${dataIndex}`}
          placeholder={t("searchPlaceholder", { field: t(dataIndex) })}
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
            {t("search")}
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            {t("reset")}
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
      title: t("firstName"),
      dataIndex: "firstName",
      key: "firstName",
      ...getColumnSearchProps("firstName"),
    },
    {
      title: t("lastName"),
      dataIndex: "lastName",
      key: "lastName",
      ...getColumnSearchProps("lastName"),
    },
    {
      title: t("phoneNumber"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: t("email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("role"),
      dataIndex: "role",
      key: "role",
      filters: [
        { text: t("admin"), value: "ROLE_ADMIN" },
        { text: t("manager"), value: "ROLE_MODERATOR" },
        { text: t("dentist"), value: "ROLE_USER" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => {
        let color = "green";
        if (role === "ROLE_ADMIN") color = "volcano";
        else if (role === "ROLE_MODERATOR") color = "geekblue";
        // return <Tag color={color}>{t(`${role.replace("ROLE_", "")}`)}</Tag>;
        return <Tag color={color}>{t(role.toLowerCase()).toUpperCase()}</Tag>;
      },
    },
    {
      title: t("action"),
      key: "operation",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" danger onClick={() => handleDelete(record.id)}>
            {t("delete")}
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
        locale={{
          filterConfirm: t("yes"),
          filterReset: t("reset"),
        }}
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
