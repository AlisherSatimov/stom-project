import React from "react";
import { useTranslation } from "react-i18next";
import { Select } from "antd"; // yoki siz foydalanayotgan dropdown

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChange = (value) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select
      defaultValue={i18n.language}
      onChange={handleChange}
      style={{ width: 70, margin: "0 20px 0 0" }}
      options={[
        { value: "uz", label: "UZ" },
        { value: "ru", label: "RU" },
        { value: "en", label: "EN" },
      ]}
    />
  );
};

export default LanguageSwitcher;
