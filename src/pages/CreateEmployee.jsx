// Importing React hook and necessary Ant Design components
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Row,
  Col,
  message,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance"; // Custom axios instance with interceptor and token

const { Title } = Typography;
const { Option } = Select;

const CreateEmployee = () => {
  const navigate = useNavigate();

  // Handler function to submit the form
  const handleSubmit = async (values) => {
    // Destructure and format values
    const {
      firstName,
      lastName,
      patronymic,
      login,
      password,
      email,
      role,
      birthDay,
      phoneNumber,
      address,
    } = values;

    const employeeData = {
      firstName,
      lastName,
      patronymic,
      login,
      password,
      email,
      role,
      birthDay: birthDay ? birthDay.format("YYYY-MM-DD") : "",
      phoneNumber,
      address,
    };

    try {
      const response = await axios.post("/auth/create", employeeData);

      if (response.status >= 200 && response.status < 300) {
        message.success("Hodim yaratildi");
        navigate("/admin/employees");
      } else {
        message.error("Nimadir xato ketdi, qaytadan urinib ko'ring!");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error.response && error.response.status === 400) {
        message.error(error.response.data?.error);
      }
    }
  };

  return (
    // Page container styling
    <div
      style={{
        maxWidth: "900px",
        margin: "50px auto",
        padding: "40px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
    >
      {/* Page title */}
      <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
        Create New Employee
      </Title>

      {/* Ant Design vertical form */}
      <Form layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col span={12}>
            {/* Left column fields */}
            <Form.Item
              label={<span className="form-label">First Name</span>}
              name="firstName"
              rules={[{ required: true, message: "Please enter first name!" }]}
            >
              <Input size="large" placeholder="John" />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">Last Name</span>}
              name="lastName"
              rules={[{ required: true, message: "Please enter last name!" }]}
            >
              <Input size="large" placeholder="Doe" />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">Patronymic</span>}
              name="patronymic"
            >
              <Input size="large" placeholder="Wilson" />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">Login</span>}
              name="login"
              rules={[{ required: true, message: "Please enter login!" }]}
            >
              <Input size="large" placeholder="Login" />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">Password</span>}
              name="password"
              rules={[{ required: true, message: "Please enter password!" }]}
            >
              <Input.Password size="large" placeholder="Password" />
            </Form.Item>
          </Col>

          <Col span={12}>
            {/* Right column fields */}
            <Form.Item
              label={<span className="form-label">Email</span>}
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter valid email!",
                },
              ]}
            >
              <Input size="large" placeholder="johndoe@gmail.com" />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">Role</span>}
              name="role"
              rules={[{ required: true, message: "Please select a role!" }]}
            >
              <Select size="large" placeholder="Select role">
                <Option value="ROLE_ADMIN">Admin</Option>
                <Option value="ROLE_MODERATOR">Moderator</Option>
                <Option value="ROLE_USER">User</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={<span className="form-label">Birthday</span>}
              name="birthDay"
              rules={[{ required: true, message: "Please select birthday!" }]}
            >
              <DatePicker size="large" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">Phone Number</span>}
              name="phoneNumber"
              rules={[
                { required: true, message: "Please enter phone number!" },
              ]}
            >
              <Input size="large" placeholder="+998912345678" />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">Address</span>}
              name="address"
              rules={[{ required: true, message: "Please enter address!" }]}
            >
              <Input size="large" placeholder="Address" />
            </Form.Item>
          </Col>
        </Row>

        {/* Submit button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: "100%" }}
          >
            Create Employee
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateEmployee;
