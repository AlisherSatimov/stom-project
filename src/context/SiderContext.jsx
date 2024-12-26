// SiderContext.js
import React, { createContext, useContext, useState } from "react";

// Contextni yaratamiz
const SiderContext = createContext();

// Provider komponentni yaratamiz
export const SiderProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSider = () => setCollapsed((prev) => !prev);

  return (
    <SiderContext.Provider value={{ collapsed, toggleSider }}>
      {children}
    </SiderContext.Provider>
  );
};

// Contextni qulayroq ishlatish uchun custom hook
export const useSider = () => useContext(SiderContext);
