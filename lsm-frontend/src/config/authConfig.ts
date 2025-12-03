/**
 * MSAL Authentication Configuration
 * For integration with Azure AD authentication
 */

import type { Configuration, PopupRequest } from "@azure/msal-browser";

// MSAL configuration - these should be overridden with environment variables
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "your-client-id",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "common"}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Dataverse API scope for accessing Dataverse
export const dataverseScope = import.meta.env.VITE_DATAVERSE_URL
  ? `${import.meta.env.VITE_DATAVERSE_URL}/.default`
  : "https://orgbf93e3c3.crm.dynamics.com/.default";

// Login request configuration
export const loginRequest: PopupRequest = {
  scopes: [dataverseScope],
};

// Dataverse API base URL
export const dataverseUrl = import.meta.env.VITE_DATAVERSE_URL || "https://orgbf93e3c3.crm.dynamics.com";
