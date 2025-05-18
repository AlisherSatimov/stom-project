import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import { SiderProvider } from "./context/SiderContext";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <SiderProvider>
        <App />
        {/* Devtools faqat dev muhitda ishlaydi */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </SiderProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
