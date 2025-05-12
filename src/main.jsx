import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// SiderProvider import qilish
import { SiderProvider } from "./context/SiderContext";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SiderProvider>
      <App />
    </SiderProvider>
  </BrowserRouter>
);
