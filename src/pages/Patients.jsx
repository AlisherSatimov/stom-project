import { useState } from "react";
import { Badge, Space, Table, Modal, message, Form, Input } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const Patients = () => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form] = Form.useForm();
  const [maxDebt, setMaxDebt] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const aToken = localStorage.getItem("aToken");

  if (aToken == null) {
    navigate("/login");
  }

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const response = await axios.get("/patient/find-debt");
      return response.data.sort((a, b) => b.id - a.id);
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/patient/${id}`),
    onSuccess: () => {
      message.success("Patient deleted successfully!");
      queryClient.invalidateQueries(["patients"]);
    },
    onError: () => {
      message.error("An error occurred while deleting the patient.");
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (data) => axios.post("/payment/pay", data),
    onSuccess: (response) => {
      const messageText = response.data;
      message.success(messageText);
      const match = messageText.match(/(\d+)\s*so`m\s*qoldi/i);
      const remaining = match ? parseInt(match[1], 10) : 0;
      setIsModalOpen(false);
      setSelectedPatient(null);
      form.resetFields();
      if (remaining === 0) {
        queryClient.invalidateQueries(["patients"]);
      }
    },
    onError: () => {
      message.error("An error occurred while processing payment.");
    },
  });

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

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this patient?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  // const handleOk = () => {
  //   form
  //     .validateFields()
  //     .then((values) => {
  //       paymentMutation.mutate({
  //         id: selectedPatient.id,
  //         paidValue: values.paidValue,
  //       });
  //     })
  //     .catch((error) => console.error("Validation Failed:", error));
  // };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const paidInput = values.paidValue;
        const willRemain = maxDebt - paidInput;

        paymentMutation.mutate({
          id: selectedPatient.id,
          paidValue: paidInput,
        });

        // 💡 Agar foydalanuvchi to‘liq to‘lasa, query yangilansin
        if (willRemain === 0) {
          queryClient.invalidateQueries(["patients"]);
        }
      })
      .catch((error) => console.error("Validation Failed:", error));
  };

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
        loading={isLoading}
      />

      <Modal
        title="Process Payment"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
      >
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
