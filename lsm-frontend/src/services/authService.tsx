/**
 * Authentication Provider Component for MSAL
 */

import type { ReactNode } from "react";
import {
  useMsal,
  useIsAuthenticated,
  useMsalAuthentication,
  MsalProvider,
} from "@azure/msal-react";
import { InteractionType, type IPublicClientApplication } from "@azure/msal-browser";
import { loginRequest, dataverseScope } from "../config/authConfig";
import { AuthContext } from "./authContext";

/**
 * Internal Auth Provider Component
 */
function AuthProviderInternal({ children }: { children: ReactNode }) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  // Auto-login if not authenticated
  useMsalAuthentication(InteractionType.Silent, loginRequest);

  const user = accounts[0] || null;

  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: window.location.origin,
    });
  };

  const getAccessToken = async (): Promise<string> => {
    if (!user) {
      throw new Error("No user logged in");
    }

    try {
      const response = await instance.acquireTokenSilent({
        scopes: [dataverseScope],
        account: user,
      });
      return response.accessToken;
    } catch {
      // If silent token acquisition fails, try popup
      const response = await instance.acquireTokenPopup({
        scopes: [dataverseScope],
      });
      return response.accessToken;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Auth Provider with MSAL wrapper
 */
export function AuthProvider({
  children,
  instance,
}: {
  children: ReactNode;
  instance: IPublicClientApplication;
}) {
  return (
    <MsalProvider instance={instance}>
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </MsalProvider>
  );
}

export default AuthProvider;
