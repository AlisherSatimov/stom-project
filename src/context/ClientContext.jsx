import React, { createContext, useContext, useState } from "react";

const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
  const [clientId, setClientId] = useState(null);

  return (
    <ClientContext.Provider value={{ clientId, setClientId }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);

  if (!context) {
    throw new Error("useClient must be used within a ClientProvider");
  }

  return context;
};
