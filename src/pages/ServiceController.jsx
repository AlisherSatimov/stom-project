import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, message } from "antd";
import axios from "../utils/axiosInstance"; // Custom axios instance with token and baseURL

const ServiceController = () => {
  // State hooks
  const [services, setServices] = useState([]); // All fetched services
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [isEditing, setIsEditing] = useState(false); // Edit/Add mode
  const [selectedService, setSelectedService] = useState(null); // Service being edited
  const [form] = Form.useForm(); // Ant Design form instance

  // Fetch services when component mounts
  useEffect(() => {
    fetchServices();
  }, []);

  // API call to fetch services
  const fetchServices = async () => {
    try {
      const response = await axios.get("/service");
      if (response.status === 200) {
        setServices(response.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      message.error("Failed to fetch services.");
    }
  };

  // Delete service with confirmation modal
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this service?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/service/${id}`);
          if (response.status === 200) {
            message.success("Service deleted successfully!");
            // Remove deleted item from UI
            setServices((prev) => prev.filter((service) => service.id !== id));
          }
        } catch (error) {
          console.error("Error deleting service:", error);
          message.error("Failed to delete service.");
        }
      },
    });
  };

  // When user clicks Edit, fill form with selected service
  const handleEdit = (service) => {
    setIsEditing(true);
    setSelectedService(service);
    form.setFieldsValue({
      serviceName: service.serviceName,
      price: service.price,
      expense: service.expense,
    });
    setIsModalOpen(true);
  };

  // Clear form for new service creation
  const handleAddService = () => {
    setIsEditing(false);
    setSelectedService(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Submit form (Add or Edit based on mode)
  const handleModalSubmit = async (values) => {
    // Prepare payload with explicit number conversion
    const payload = {
      ...values,
      price: Number(values.price),
      expense: Number(values.expense),
    };

    try {
      if (isEditing) {
        // Check if selected service has ID
        if (!selectedService?.id) {
          message.error("Selected service ID not found!");
          return;
        }

        const response = await axios.put(
          `/service/${selectedService.id}`,
          payload
        );
        if (response.status === 200) {
          message.success("Service updated successfully!");
        }
      } else {
        const response = await axios.post("/service", payload);
        if (response.status === 200 || response.status === 201) {
          message.success("Service created successfully!");
        }
      }

      // Refresh list and close modal
      fetchServices();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting service:", error);
      message.error("Failed to submit service.");
    }
  };

  // Called when modal OK button is clicked
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => handleModalSubmit(values))
      .catch((error) => console.error("Validation Failed:", error));
  };

  // Table columns
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
      render: (price) => `${price.toLocaleString()} UZS`,
    },
    {
      title: "Expense",
      dataIndex: "expense",
      key: "expense",
      render: (expense) => `${expense.toLocaleString()} UZS`,
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <Button type="default" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="primary" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Render
  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: "16px", float: "right" }}
        onClick={handleAddService}
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
