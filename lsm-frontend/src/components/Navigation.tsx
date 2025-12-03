/**
 * Navigation Component
 * Top navigation bar with links to different sections
 * Designed for integration with retail-forecast-plan
 */

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../services/authContext";

interface NavItem {
  path: string;
  label: string;
  external?: boolean;
}

const navItems: NavItem[] = [
  { path: "/", label: "LSM Entry" },
  { path: "/history", label: "History" },
  // External link to retail-forecast-plan when integrated
  // { path: "https://retail-forecast.example.com", label: "Retail Forecast", external: true },
];

export function Navigation() {
  const location = useLocation();
  const { user, logout, isAuthenticated, login } = useAuth();

  return (
    <nav className="bg-red-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold">🍕 Papa John's</span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) =>
                  item.external ? (
                    <a
                      key={item.path}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-800 transition-colors"
                    >
                      {item.label} ↗
                    </a>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === item.path
                          ? "bg-red-900"
                          : "hover:bg-red-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>

          {/* User info and logout */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <span className="text-sm hidden sm:block">
                  Welcome, {user.name || user.username}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-800 hover:bg-red-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => login()}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-3">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-800 transition-colors"
                >
                  {item.label} ↗
                </a>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-red-900"
                      : "hover:bg-red-800"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
