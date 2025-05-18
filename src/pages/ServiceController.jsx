// Import necessary libraries and hooks
import { Table, Button, Space, Modal, Form, Input, message, Spin } from "antd";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosInstance"; // Custom axios instance

const ServiceController = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [isEditing, setIsEditing] = useState(false); // Edit/Add mode
  const [selectedService, setSelectedService] = useState(null); // Editing target
  const [form] = Form.useForm(); // Ant Design form instance

  const queryClient = useQueryClient(); // Access query cache client

  // Fetch all services using React Query
  const {
    data: services,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await axios.get("/service");
      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Mutation to delete a service
  const deleteService = useMutation({
    mutationFn: (id) => axios.delete(`/service/${id}`),
    onSuccess: () => {
      message.success("Service deleted successfully!");
      queryClient.invalidateQueries(["services"]);
    },
    onError: () => message.error("Failed to delete service."),
  });

  // Mutation to create a new service
  const createService = useMutation({
    mutationFn: (data) => axios.post("/service", data),
    onSuccess: () => {
      message.success("Service created successfully!");
      queryClient.invalidateQueries(["services"]);
    },
    onError: () => message.error("Failed to create service."),
  });

  // Mutation to update a service
  const updateService = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/service/${id}`, data),
    onSuccess: () => {
      message.success("Service updated successfully!");
      queryClient.invalidateQueries(["services"]);
    },
    onError: () => message.error("Failed to update service."),
  });

  // Modal open for new service
  const handleAddService = () => {
    setIsEditing(false);
    setSelectedService(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Modal open for editing
  const handleEdit = (service) => {
    setIsEditing(true);
    setSelectedService(service);
    form.setFieldsValue(service);
    setIsModalOpen(true);
  };

  // Modal submit handler (create or update)
  const handleModalSubmit = async (values) => {
    const price = Number(values.price);
    const expense = Number(values.expense);

    if (isNaN(price) || isNaN(expense)) {
      message.error("Price or Expense is not a valid number!");
      return;
    }

    const payload = {
      ...values,
      price,
      expense,
    };

    try {
      if (isEditing) {
        if (!selectedService?.id) {
          message.error("Selected service ID not found!");
          return;
        }

        await updateService.mutateAsync({
          id: selectedService.id,
          data: payload,
        });
      } else {
        await createService.mutateAsync(payload);
      }

      // Modalni yopish va forma yangilash
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Submit error:", error);
      message.error("Service submission failed!");
    }
  };

  // Delete confirmation modal
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this service?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => deleteService.mutate(id),
    });
  };

  // Confirm modal OK
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => handleModalSubmit(values))
      .catch((err) => console.error("Validation Error:", err));
  };

  // Define columns for Ant Design table
  const columns = [
    {
      title: "Service Name",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (value) => `${value.toLocaleString()} UZS`,
    },
    {
      title: "Expense",
      dataIndex: "expense",
      key: "expense",
      render: (value) => `${value.toLocaleString()} UZS`,
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Render loading state
  if (isLoading) return <Spin spinning={true} />;

  // Render error state
  if (isError) return message.error("Failed to load services.");

  return (
    <div>
      <Button
        type="primary"
        onClick={handleAddService}
        style={{ float: "right", marginBottom: "16px" }}
      >
        Add Service
      </Button>

      <Table columns={columns} dataSource={services} rowKey="id" />

      <Modal
        title={isEditing ? "Edit Service" : "Add Service"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Service Name"
            name="serviceName"
            rules={[{ required: true, message: "Please enter service name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Expense"
            name="expense"
            rules={[{ required: true, message: "Please enter expense" }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceController;
