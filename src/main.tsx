import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/mulish/400.css";
import "@fontsource/mulish/500.css";
import "@fontsource/mulish/600.css";
import "@fontsource/mulish/700.css";
import "@fontsource/mulish/800.css";
import "@fontsource/roboto-slab/400.css";
import "@fontsource/roboto-slab/500.css";
import "@fontsource/roboto-slab/600.css";
import "@fontsource/roboto-slab/700.css";

import "./styles/theme.css";
import { Providers } from "@/app/providers/Providers";
import { router } from "@/app/router";
import { RouterProvider } from "react-router-dom";
import { registerServiceWorker } from "./register-sw";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
