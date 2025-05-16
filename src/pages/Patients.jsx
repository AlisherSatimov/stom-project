import { useEffect, useState } from "react";
import { Badge, Space, Table, Modal, message, Form, Input } from "antd";
import axios from "../utils/axiosInstance";

const Patients = () => {
  // States for storing patient data and expanded rows
  const [patients, setPatients] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form] = Form.useForm();

  // State to keep track of remaining debt
  const [maxDebt, setMaxDebt] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  // Fetch all patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("/patient/find-all");
        if (response && response.data) {
          // Sort by ID descending (latest first)
          setPatients(response.data.sort((a, b) => b.id - a.id));
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  // Handle "Pay" button click: open modal and prefill form
  const handlePay = async (record) => {
    setSelectedPatient(record);
    setIsModalOpen(true);

    try {
      const total = record.teethServiceEntities.reduce(
        (total, service) => total + service.price,
        0
      );
      const response = await axios.get(`/payment/patient/${record.id}`);
      const paymentHistory = response?.data || [];
      const paid = paymentHistory.reduce((sum, entry) => sum + entry.paid, 0);
      const remaining = total - paid;

      setTotalPrice(total);
      setTotalPaid(paid);
      setMaxDebt(remaining);
      form.setFieldsValue({ paidValue: remaining });
    } catch (error) {
      console.error("Error fetching payment history:", error);
      message.error("Failed to load payment history.");
      setTotalPrice(0);
      setTotalPaid(0);
      setMaxDebt(0);
      form.setFieldsValue({ paidValue: 0 });
    }
  };

  // Handle patient delete confirmation
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this patient?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/patient/${id}`);
          if (response.status === 200) {
            message.success("Patient deleted successfully!");
            setPatients((prev) => prev.filter((patient) => patient.id !== id));
          } else {
            message.error("Failed to delete the patient.");
          }
        } catch (error) {
          console.error("Error deleting patient:", error);
          message.error("An error occurred while deleting the patient.");
        }
      },
    });
  };

  // Handle modal confirmation (submit)
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => handleModalSubmit(values))
      .catch((error) => console.error("Validation Failed:", error));
  };

  // Submit payment and update patient list if fully paid
  const handleModalSubmit = async (values) => {
    try {
      const response = await axios.post("/payment/pay", {
        id: selectedPatient.id,
        paidValue: values.paidValue,
      });

      if (response.status === 200) {
        const messageText = response.data;
        message.success(messageText);

        // Extract remaining amount from message
        const match = messageText.match(/(\d+)\s*so`m\s*qoldi/i);
        const remaining = match ? parseInt(match[1], 10) : 0;

        setIsModalOpen(false);
        setSelectedPatient(null);
        form.resetFields();

        // If patient has paid in full, remove from list
        if (remaining === 0) {
          setPatients((prev) =>
            prev.filter((p) => p.id !== selectedPatient.id)
          );
        }
      } else {
        message.error("Failed to process payment.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      message.error("An error occurred while processing payment.");
    }
  };

  // Main table columns (collapsed view)
  const columns = [
    {
      title: "Client Name",
      dataIndex: "patientName",
      key: "patientName",
      render: (text, record) => `${record.patientName} ${record.patientLName}`,
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Birthday",
      dataIndex: "birthDay",
      key: "birthDay",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
  ];

  // Expanded row rendering
  const expandedRowRender = (record) => {
    const expandColumns = [
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "createdAt",
      },
      {
        title: "Dentist Name",
        dataIndex: "empName",
        key: "empName",
        render: (text, record) => `${record.empName} ${record.empLName}`,
      },
      {
        title: "Services",
        dataIndex: "teethServiceEntities",
        key: "teethServiceEntities",
        render: (teethServiceEntities) => (
          <>
            {teethServiceEntities.map((service, index) => (
              <div key={index}>
                {`${service.teethName}-Teeth: ${service.serviceName} (${service.price})`}
              </div>
            ))}
          </>
        ),
      },
      {
        title: "Status",
        key: "state",
        render: (text, record) => (
          <Badge
            status={record.isServiced ? "success" : "processing"}
            text={record.isServiced ? "Finished" : "Pending"}
          />
        ),
      },
      {
        title: "Price",
        dataIndex: "teethServiceEntities",
        key: "price",
        render: (teethServiceEntities) =>
          teethServiceEntities.reduce(
            (total, service) => total + service.price,
            0
          ),
      },
      {
        title: "Action",
        key: "operation",
        width: "16%",
        render: (_, record) => (
          <Space size="middle">
            <a
              onClick={() => handlePay(record)}
              style={{
                color: "green",
                cursor: "pointer",
                border: "1px solid green",
                padding: "8px 26px",
                borderRadius: "5px",
                backgroundColor: "#18ff331e",
              }}
            >
              Pay
            </a>
            <a
              className="text-red-500"
              onClick={() => handleDelete(record.id)}
              style={{
                cursor: "pointer",
                border: "1px solid red",
                padding: "8px 16px",
                borderRadius: "5px",
                backgroundColor: "#ff181809",
              }}
            >
              Delete
            </a>
          </Space>
        ),
      },
    ];

    return (
      <Table columns={expandColumns} dataSource={[record]} pagination={false} />
    );
  };

  return (
    <>
      {/* Main patients table */}
      <Table
        columns={columns}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpand: (expanded, record) => {
            setExpandedRowKeys(expanded ? [record.id] : []);
          },
        }}
        rowClassName={(record) =>
          expandedRowKeys.includes(record.id)
            ? "expanded-row pointer-row"
            : "pointer-row"
        }
        dataSource={patients.map((item) => ({ ...item, key: item.id }))}
        size="middle"
        onRow={(record) => ({
          onClick: () => {
            const isExpanded = expandedRowKeys.includes(record.id);
            setExpandedRowKeys(isExpanded ? [] : [record.id]);
          },
        })}
      />

      {/* Modal for handling payment */}
      <Modal
        title="Process Payment"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
      >
        {/* Summary box */}
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            backgroundColor: "#f6f6f6",
            borderRadius: 8,
          }}
        >
          <div>
            <strong>Total Amount:</strong> {totalPrice.toLocaleString()} so'm
          </div>
          <div>
            <strong>Paid Already:</strong> {totalPaid.toLocaleString()} so'm
          </div>
          <div>
            <strong>Remaining:</strong> {maxDebt.toLocaleString()} so'm
          </div>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label="Paid Value"
            name="paidValue"
            rules={[
              { required: true, message: "Please enter paid value" },
              {
                validator: (_, value) =>
                  value > maxDebt
                    ? Promise.reject(
                        new Error(`Value cannot exceed debt: ${maxDebt} so'm`)
                      )
                    : Promise.resolve(),
              },
            ]}
          >
            <Input
              type="number"
              min={0}
              max={maxDebt}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > maxDebt) {
                  message.warning(`Max allowed is ${maxDebt} so'm`);
                }
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Patients;
