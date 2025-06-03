import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import dayjs from "dayjs"; // yuqorida import qilingan bo‘lishi kerak
import { useQuery, useQueryClient } from "@tanstack/react-query";

const { confirm } = Modal;
const { Option } = Select;

const Clients = () => {
  const { t } = useTranslation();
  // === STATE MANAGEMENT ===
  const [employees, setEmployees] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [canSubmit, setCanSubmit] = useState(false);

  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { setClientId } = useClient();

  const useClients = () => {
    return useQuery({
      queryKey: ["clients"],
      queryFn: async () => {
        const response = await axios.get("/client");
        return response.data
          .sort((a, b) => b.id - a.id)
          .map((item) => ({
            key: item.id,
            name: `${item.name} ${item.lastName} ${item.patronymic}`,
            birthday: item.birthday || "N/A",
            gender: item.gender,
            phoneNumber: item.phoneNumber || "N/A",
            address: item.address || "N/A",
          }));
      },
      staleTime: 0,
    });
  };

  const { data: clients, isLoading, isError } = useClients();
  const queryClient = useQueryClient(); // invalidate uchun kerak

  // === LOAD CLIENT, EMPLOYEE AND APPOINTMENT DATA ===
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [employeeRes, appointmentRes] = await Promise.all([
          axios.get("/employees"),
          axios.get("/patient/find-all-after"),
        ]);

        // === Filter and set employees (only ROLE_USER) ===
        if (employeeRes.data) {
          const filteredEmployees = employeeRes.data.filter(
            (employee) => employee.role === "ROLE_USER"
          );
          setEmployees(filteredEmployees);
        }

        // === Set appointments ===
        if (appointmentRes.data) {
          setAppointments(appointmentRes.data);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        message.error("Failed to load initial data.");
      }
    };

    fetchInitialData();
  }, [navigate]);

  // === HANDLE SLOT SELECTION AND FORM UPDATE ===
  useEffect(() => {
    if (selectedSlots.length >= 2) {
      const sorted = [...selectedSlots].sort((a, b) => a.datetime - b.datetime);
      form.setFieldsValue({
        appointmentTime: [
          dayjs(sorted[0].datetime),
          dayjs(sorted[sorted.length - 1].datetime),
        ],
      });
      setCanSubmit(true); // ✅ Submit faollashadi
    } else {
      form.setFieldsValue({ appointmentTime: null });
      setCanSubmit(false); // ❌ Submit o‘chadi
    }
  }, [selectedSlots]);

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
          const response = await axios.delete(
            `/client/passive-delete/${clientId}`
          );
          if (response.status === 200) {
            message.success("Client deleted successfully!");
            queryClient.invalidateQueries(["clients"]); // 🔄 cache yangilanadi
          } else {
            message.error("Failed to delete client.");
          }
        } catch (error) {
          console.error("Error deleting client:", error);
          message.error("An error occurred while deleting the client.");
        }
      },
    });
  };

  // === GENERATE TIME SLOTS FOR SELECTED DATE ===
  const generateSlots = (employeeId, dateStr) => {
    const allSlots = [];
    const start = new Date(`${dateStr}T09:00`);
    const end = new Date(`${dateStr}T18:00`);

    let current = new Date(start);
    while (current < end) {
      const hour = current.getHours();
      const minute = current.getMinutes();
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0"
      )}`;

      if (!(hour === 12)) {
        allSlots.push({
          time,
          datetime: new Date(current),
          busy: false,
        });
      }

      current.setMinutes(current.getMinutes() + 10);
    }

    // Band vaqtlarni belgilang
    const targetDate = dayjs(dateStr).format("YYYY-MM-DD");

    const busyAppointments = appointments.filter(
      (a) =>
        a.empId === employeeId &&
        dayjs(a.appointmentTime, "DD/MM/YYYY HH:mm").format("YYYY-MM-DD") ===
          targetDate
    );

    busyAppointments.forEach((item) => {
      const start = dayjs(item.appointmentTime, "DD/MM/YYYY HH:mm").toDate();
      const end = dayjs(item.endTime, "DD/MM/YYYY HH:mm").toDate();

      allSlots.forEach((slot) => {
        if (slot.datetime >= start && slot.datetime < end) {
          slot.busy = true;
        }
      });
    });

    return allSlots;
  };

  // === HANDLE SLOT CLICK ===
  const handleSlotClick = (clickedSlot, allSlots) => {
    if (clickedSlot.busy) return;

    const isSelected = selectedSlots.some((s) => s.time === clickedSlot.time);

    if (isSelected) {
      // Toggle slot off
      setSelectedSlots((prev) =>
        prev.filter((s) => s.time !== clickedSlot.time)
      );
      return;
    }

    if (selectedSlots.length === 1) {
      const first = selectedSlots[0].datetime;
      const second = clickedSlot.datetime;

      const range = allSlots.filter((slot) => {
        const d = slot.datetime;
        return (d >= first && d <= second) || (d >= second && d <= first);
      });

      const hasBusy = range.some((slot) => slot.busy);

      if (hasBusy) {
        message.warning("You can't select a range that includes busy slots.");
        return;
      }

      setSelectedSlots(range);
    } else {
      setSelectedSlots([clickedSlot]);
    }
  };

  // === OPEN MODAL TO ADD PATIENT TO QUEUE ===
  const handleAddQueue = async (client) => {
    setSelectedClient(client);
    setIsModalVisible(true);

    try {
      const response = await axios.get("/patient/find-all-after");
      if (response.data) {
        setAppointments(response.data); // ✅ backenddan yangilash
      }
    } catch (error) {
      message.error("Failed to load appointment data.");
    }
  };

  // === HANDLE QUEUE FORM SUBMISSION ===

  const resetModalState = () => {
    form.resetFields();
    setSelectedDate(null);
    setSelectedSlots([]);
    setCanSubmit(false);
    setSelectedClient(null);
  };

  const handleModalOk = async (values) => {
    const payload = {
      employeeId: values.employeeId,
      clientId: selectedClient.key,
      appointmentTime: dayjs(values.appointmentTime[0])
        .add(5, "hour")
        .toDate()
        .toISOString(),
      endTime: dayjs(values.appointmentTime[1])
        .add(5, "hour")
        .toDate()
        .toISOString(),
    };

    try {
      const response = await axios.post("/patient/create", payload);
      if (response.status === 200) {
        message.success("Queue successfully created!");
        setIsModalVisible(false);
        resetModalState(); // ✅ Clear modal state
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
      title: t("name"),
      dataIndex: "name",
      key: "name",
      width: "20%",
      ...getColumnSearchProps("name"),
    },
    {
      title: t("birthday"),
      dataIndex: "birthday",
      key: "birthday",
      width: "10%",
      ...getColumnSearchProps("birthday"),
    },
    {
      title: t("gender"),
      dataIndex: "gender",
      key: "gender",
      width: "10%",
      ...getColumnSearchProps("gender"),
      render: (value) => t(`genderOptions.${value}`, { defaultValue: value }),
    },
    {
      title: t("address"),
      dataIndex: "address",
      key: "address",
      width: "30%",
      ...getColumnSearchProps("address"),
    },
    {
      title: t("phoneNumber"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: "15%",
      ...getColumnSearchProps("phoneNumber"),
    },
    {
      title: t("action"),
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
              whiteSpace: "nowrap",
              cursor: "pointer",
              border: "1px solid green",
              padding: "8px 16px",
              borderRadius: "5px",
              backgroundColor: "#18ff331e",
              color: "green",
            }}
          >
            {t("addQueue")}
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
            {t("delete")}
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
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => handleClientClick(record.key),
          style: { cursor: "pointer" },
        })}
      />

      <Modal
        title="Add Queue"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          resetModalState(); // ✅ Clear modal on cancel too
        }}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} onFinish={handleModalOk}>
          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: true, message: "Please select an employee!" }]}
          >
            <Select
              placeholder="Select an employee"
              onChange={(value) => {
                // reset date and selected slots when employee changes
                setSelectedDate(null);
                setSelectedSlots([]);
                form.setFieldsValue({
                  appointmentTime: null,
                });
                setCanSubmit(false); // submit buttonni o‘chirib qo‘yamiz
              }}
            >
              {employees.map((employee) => (
                <Option key={employee.id} value={employee.id}>
                  {`${employee?.firstName || ""} ${employee?.lastName || ""}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Appointment Date" name="appointmentTime" required>
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < new Date().setHours(0, 0, 0, 0)
              }
              onChange={(date) => setSelectedDate(date)}
            />
          </Form.Item>

          {selectedDate && selectedClient && (
            <div style={{ overflowY: "auto", marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  justifyContent: "center", // Ichki elementlar ham o‘rtada
                  maxWidth: 500, // Maksimal kenglik (ixtiyoriy)
                }}
              >
                {generateSlots(
                  selectedClient.employeeId || form.getFieldValue("employeeId"),
                  selectedDate.format("YYYY-MM-DD")
                ).map((slot, index, allSlots) => (
                  <Button
                    key={slot.time}
                    type={
                      slot.busy
                        ? "default"
                        : selectedSlots.some((s) => s.time === slot.time)
                        ? "primary"
                        : "default"
                    }
                    disabled={slot.busy}
                    onClick={() => handleSlotClick(slot, allSlots)}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={!canSubmit}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Clients;
