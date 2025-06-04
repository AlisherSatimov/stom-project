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
import { useTranslation } from "react-i18next";

const { Title } = Typography;
const { Option } = Select;

const CreateEmployee = () => {
  const { t } = useTranslation();
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
        message.success(t("employeeCreated"));
        navigate("/admin/employees");
      } else {
        message.error(t("somethingWentWrong"));
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error.response && error.response.status === 400) {
        const errorMsg = error.response.data?.error;

        if (errorMsg === "Bunday mail mavjud") {
          message.error(t("errorEmailExists"));
        } else if (errorMsg === "Bunday foydalanuvchi nomi mavjud") {
          message.error(t("errorLoginExists"));
        } else if (errorMsg === "Bunday telefon raqam mavjud") {
          message.error(t("errorPhoneExists"));
        } else {
          message.error(t("unexpectedError")); // noma’lum xatolik matnini to‘g‘ridan-to‘g‘ri chiqarish
        }
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
        {t("createNewEmployee")}
      </Title>

      {/* Ant Design vertical form */}
      <Form layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col span={12}>
            {/* Left column fields */}
            <Form.Item
              label={<span className="form-label">{t("firstName")}</span>}
              name="firstName"
              rules={[{ required: true, message: t("pleaseEnterFirstName") }]}
            >
              <Input size="large" placeholder={t("placeholderFirstName")} />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">{t("lastName")}</span>}
              name="lastName"
              rules={[{ required: true, message: t("pleaseEnterLastName") }]}
            >
              <Input size="large" placeholder={t("placeholderLastName")} />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">{t("patronymic")}</span>}
              name="patronymic"
              rules={[{ required: true, message: t("pleaseEnterPatronymic") }]}
            >
              <Input size="large" placeholder={t("placeholderPatronymic")} />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">{t("login")}</span>}
              name="login"
              rules={[{ required: true, message: t("pleaseEnterLogin") }]}
            >
              <Input size="large" placeholder={t("placeholderLogin")} />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">{t("password")}</span>}
              name="password"
              rules={[{ required: true, message: t("pleaseEnterPassword") }]}
            >
              <Input.Password
                size="large"
                placeholder={t("placeholderPassword")}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            {/* Right column fields */}
            <Form.Item
              label={<span className="form-label">{t("email")}</span>}
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: t("pleaseEnterValidEmail"),
                },
              ]}
            >
              <Input size="large" placeholder={t("placeholderEmail")} />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">{t("role")}</span>}
              name="role"
              rules={[{ required: true, message: t("pleaseSelectRole") }]}
            >
              <Select size="large" placeholder={t("selectRole")}>
                <Option value="ROLE_ADMIN">{t("admin")}</Option>
                <Option value="ROLE_MODERATOR">{t("manager")}</Option>
                <Option value="ROLE_USER">{t("dentist")}</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={<span className="form-label">{t("birthday")}</span>}
              name="birthDay"
              rules={[{ required: true, message: t("pleaseSelectBirthday") }]}
            >
              <DatePicker
                size="large"
                style={{ width: "100%" }}
                placeholder={t("placeholderBirthday")}
              />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">{t("phoneNumber")}</span>}
              name="phoneNumber"
              rules={[{ required: true, message: t("pleaseEnterPhoneNumber") }]}
            >
              <Input size="large" placeholder={t("placeholderPhone")} />
            </Form.Item>
            <Form.Item
              label={<span className="form-label">{t("address")}</span>}
              name="address"
              rules={[{ required: true, message: t("pleaseEnterAddress") }]}
            >
              <Input size="large" placeholder={t("placeholderAddress")} />
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
            {t("createEmployee")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateEmployee;
