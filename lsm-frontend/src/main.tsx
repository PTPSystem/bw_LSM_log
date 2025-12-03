/**
 * LSM (Local Store Marketing) Tracking App
 * Application Entry Point
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PublicClientApplication } from "@azure/msal-browser";
import { AuthProvider } from "./services/authService";
import { msalConfig } from "./config/authConfig";
import App from "./App";
import "./index.css";

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL before rendering
msalInstance.initialize().then(() => {
  // Handle redirect promise (for redirect flow)
  msalInstance.handleRedirectPromise().catch(console.error);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AuthProvider instance={msalInstance}>
        <App />
      </AuthProvider>
    </StrictMode>
  );
});
