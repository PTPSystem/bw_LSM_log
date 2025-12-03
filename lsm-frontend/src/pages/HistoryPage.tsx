/**
 * History Page
 * View and manage historical LSM entries with filtering
 */

import { useState, useEffect, useCallback } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { useAuth } from "../services/authContext";
import { DataverseService } from "../services/dataverseService";
import { LsmEntryTable } from "../components/LsmEntryTable";
import type { LsmEntry } from "../types";

type DateRangePreset = "7days" | "30days" | "thisMonth" | "custom";

export function HistoryPage() {
  const { isAuthenticated, user, getAccessToken, login } = useAuth();
  const [accessibleStores, setAccessibleStores] = useState<string[]>([]);
  const [entries, setEntries] = useState<LsmEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("30days");
  const [startDate, setStartDate] = useState<string>(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  // Get date range based on preset
  const getDateRange = useCallback(() => {
    const now = new Date();
    switch (dateRangePreset) {
      case "7days":
        return {
          start: format(subDays(now, 7), "yyyy-MM-dd"),
          end: format(now, "yyyy-MM-dd"),
        };
      case "30days":
        return {
          start: format(subDays(now, 30), "yyyy-MM-dd"),
          end: format(now, "yyyy-MM-dd"),
        };
      case "thisMonth":
        return {
          start: format(startOfMonth(now), "yyyy-MM-dd"),
          end: format(endOfMonth(now), "yyyy-MM-dd"),
        };
      case "custom":
        return { start: startDate, end: endDate };
      default:
        return { start: startDate, end: endDate };
    }
  }, [dateRangePreset, startDate, endDate]);

  // Load entries
  const loadEntries = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      const service = new DataverseService(token);

      // Get user's accessible stores if not already loaded
      let stores = accessibleStores;
      if (stores.length === 0) {
        stores = await service.getUserStoreAccess(user.localAccountId || user.username);
        setAccessibleStores(stores);
      }

      const { start, end } = getDateRange();
      const filterStores =
        selectedStore === "all" ? stores : [selectedStore];

      const fetchedEntries = await service.getLsmEntriesByDateRange(
        start,
        end,
        filterStores
      );
      setEntries(fetchedEntries);
    } catch (err) {
      console.error("Failed to load entries:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load entries. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, getAccessToken, accessibleStores, selectedStore, getDateRange]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDelete = async (entry: LsmEntry) => {
    if (!entry.id) return;
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      const token = await getAccessToken();
      const service = new DataverseService(token);
      await service.deleteLsmEntry(entry.id);
      await loadEntries();
    } catch (err) {
      console.error("Failed to delete entry:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete entry. Please try again."
      );
    }
  };

  // Calculate summary stats
  const summary = {
    totalEntries: entries.length,
    totalLaborHours: entries.reduce((sum, e) => sum + e.laborHours, 0),
    uniqueCoupons: new Set(entries.map((e) => e.couponCode)).size,
    uniqueStores: new Set(entries.map((e) => e.storeNumber)).size,
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view LSM history.
          </p>
          <button
            onClick={() => login()}
            className="bg-red-700 text-white px-6 py-3 rounded-md font-medium hover:bg-red-800 transition-colors"
          >
            Sign In with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">LSM History</h1>
        <p className="text-gray-600 mt-2">
          View and manage your store's marketing activity history.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Entries</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalEntries}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Labor Hours</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary.totalLaborHours.toFixed(1)}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Unique Coupons</p>
          <p className="text-2xl font-bold text-gray-900">{summary.uniqueCoupons}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Stores Active</p>
          <p className="text-2xl font-bold text-gray-900">{summary.uniqueStores}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Store Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Stores</option>
              {accessibleStores.map((store) => (
                <option key={store} value={store}>
                  Store #{store}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Preset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRangePreset}
              onChange={(e) =>
                setDateRangePreset(e.target.value as DateRangePreset)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateRangePreset === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Entries Table */}
      <LsmEntryTable
        entries={entries}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}

export default HistoryPage;
