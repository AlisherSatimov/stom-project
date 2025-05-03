import React, { createContext, useContext, useState } from "react";

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeData, setEmployeeData] = useState(null); // <-- YANGI

  return (
    <EmployeeContext.Provider
      value={{ employeeId, setEmployeeId, employeeData, setEmployeeData }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);

  if (!context) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }

  return context;
};
