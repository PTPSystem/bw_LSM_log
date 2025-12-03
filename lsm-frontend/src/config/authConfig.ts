/**
 * MSAL Authentication Configuration
 * For integration with Azure AD authentication
 */

import type { Configuration, PopupRequest } from "@azure/msal-browser";

// Environment variables
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string | undefined;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID as string | undefined;
const dataverseUrlEnv = import.meta.env.VITE_DATAVERSE_URL as string | undefined;

// Default Dataverse URL (can be overridden via environment)
const DEFAULT_DATAVERSE_URL = "https://orgbf93e3c3.crm.dynamics.com";

// MSAL configuration - environment variables are required in production
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId || "",
    authority: `https://login.microsoftonline.com/${tenantId || "common"}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Dataverse API base URL
export const dataverseUrl = dataverseUrlEnv || DEFAULT_DATAVERSE_URL;

// Dataverse API scope for accessing Dataverse
export const dataverseScope = `${dataverseUrl}/.default`;

// Login request configuration
export const loginRequest: PopupRequest = {
  scopes: [dataverseScope],
};
