import React, { useEffect, useState } from "react";
import { SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Input,
  Space,
  Table,
  Modal,
  message,
  Select,
  DatePicker,
  Form,
} from "antd";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { useClient } from "../context/ClientContext";

const { confirm } = Modal;
const { Option } = Select;

const Clients = () => {
  // === STATE MANAGEMENT ===
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const navigate = useNavigate();
  const { setClientId } = useClient();

  // === FETCH CLIENT AND EMPLOYEE DATA ON LOAD ===
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("/client");
        if (response && response.data) {
          const formattedData = response.data
            .sort((a, b) => b.id - a.id)
            .map((item) => ({
              key: item.id,
              name: `${item.name} ${item.lastName} ${item.patronymic}`,
              birthday: item.birthday || "N/A",
              gender: item.gender,
              phoneNumber: item.phoneNumber || "N/A",
              address: item.address || "N/A",
            }));
          setClients(formattedData);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        message.error("Failed to fetch client data.");
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/employees");
        if (response && response.data) {
          const filteredEmployees = response.data.filter(
            (employee) => employee.role === "ROLE_USER"
          );
          setEmployees(filteredEmployees);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        message.error("Failed to fetch employees. Please try again later.");
      }
    };

    fetchClients();
    fetchEmployees();
  }, [navigate]);

  // === SEARCH AND FILTER HANDLERS ===
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  // === SEARCH CONFIGURATION FOR TABLE COLUMNS ===
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          autoFocus
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
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
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

  // === HANDLE CLIENT ROW CLICK ===
  const handleClientClick = (clientId) => {
    if (!clientId) {
      console.error("Client ID is undefined");
      return;
    }
    setClientId(clientId); // Store clientId in context
    navigate(`/clientID/${clientId}`); // Navigate to detail page
  };

  // === DELETE CLIENT WITH CONFIRMATION MODAL ===
  const handleDelete = (clientId) => {
    confirm({
      title: "Are you sure you want to delete this client?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/client/${clientId}`);
          if (response.status === 200) {
            message.success("Client deleted successfully!");
            setClients((prev) =>
              prev.filter((client) => client.key !== clientId)
            );
          } else {
            message.error("Failed to delete client.");
          }
        } catch (error) {
          console.error("Error deleting client:", error);
          message.error("An error occurred while deleting the client.");
        }
      },
      onCancel() {
        console.log("Delete action canceled.");
      },
    });
  };

  // === HANDLE QUEUE MODAL OPEN ===
  const handleAddQueue = (client) => {
    setSelectedClient(client);
    setIsModalVisible(true);
  };

  // === HANDLE QUEUE FORM SUBMISSION ===
  const handleModalOk = async (values) => {
    const payload = {
      employeeId: values.employeeId,
      clientId: selectedClient.key,
      appointmentTime: values.appointmentTime[0].toISOString(),
      endTime: values.appointmentTime[1].toISOString(),
    };

    try {
      const response = await axios.post("/patient/create", payload);
      if (response.status === 200) {
        message.success("Queue successfully created!");
        setIsModalVisible(false);
      } else {
        message.error("Failed to create queue.");
      }
    } catch (error) {
      console.error("Error creating queue:", error);
      message.error("An error occurred. Please try again.");
    }
  };

  // === TABLE COLUMN DEFINITIONS ===
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Birthday",
      dataIndex: "birthday",
      key: "birthday",
      width: "10%",
      ...getColumnSearchProps("birthday"),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: "10%",
      ...getColumnSearchProps("gender"),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: "30%",
      ...getColumnSearchProps("address"),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: "15%",
      ...getColumnSearchProps("phoneNumber"),
    },
    {
      title: "Action",
      key: "operation",
      width: "15%",
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={(e) => {
              e.stopPropagation();
              handleAddQueue(record);
            }}
            style={{
              cursor: "pointer",
              border: "1px solid green",
              padding: "8px 16px",
              borderRadius: "5px",
              backgroundColor: "#18ff331e",
              color: "green",
            }}
          >
            Add_Queue
          </a>
          <a
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record.key);
            }}
            style={{
              cursor: "pointer",
              border: "1px solid red",
              padding: "8px 28px",
              borderRadius: "5px",
              backgroundColor: "#ff181809",
              color: "red",
            }}
          >
            Delete
          </a>
        </Space>
      ),
    },
  ];

  // === RENDER TABLE AND MODAL FORM ===
  return (
    <>
      <Table
        columns={columns}
        dataSource={clients}
        onRow={(record) => ({
          onClick: () => handleClientClick(record.key),
          style: { cursor: "pointer" },
        })}
      />

      <Modal
        title="Add Queue"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form onFinish={handleModalOk}>
          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: true, message: "Please select an employee!" }]}
          >
            <Select placeholder="Select an employee">
              {employees.map((employee) => (
                <Option key={employee.id} value={employee.id}>
                  {`${employee?.firstName || ""} ${employee?.lastName || ""}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="appointmentTime"
            label="Appointment Time"
            rules={[{ required: true, message: "Please select time!" }]}
          >
            <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Clients;
