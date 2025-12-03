/**
 * LSM Entry Page
 * Main page for creating new LSM (Local Store Marketing) entries
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../services/authContext";
import { DataverseService } from "../services/dataverseService";
import { LsmEntryForm } from "../components/LsmEntryForm";
import { LsmEntryTable } from "../components/LsmEntryTable";
import type { LsmFormData, LsmEntry } from "../types";

export function LsmEntryPage() {
  const { isAuthenticated, user, getAccessToken, login } = useAuth();
  const [accessibleStores, setAccessibleStores] = useState<string[]>([]);
  const [recentEntries, setRecentEntries] = useState<LsmEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load user's accessible stores and recent entries
  const loadData = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      const service = new DataverseService(token);

      // Get user's accessible stores
      const stores = await service.getUserStoreAccess(user.localAccountId || user.username);
      setAccessibleStores(stores);

      // Get recent entries for those stores
      if (stores.length > 0) {
        const entries = await service.getLsmEntries(stores);
        setRecentEntries(entries.slice(0, 5)); // Show last 5 entries
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, getAccessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (data: LsmFormData) => {
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getAccessToken();
      const service = new DataverseService(token);

      await service.createLsmEntry({
        storeNumber: data.storeNumber,
        couponCode: data.couponCode,
        activityDate: data.activityDate,
        laborHours: data.laborHours,
        description: data.description,
      });

      setSuccessMessage("LSM activity logged successfully!");

      // Refresh recent entries
      await loadData();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Failed to create entry:", err);
      setError(
        err instanceof Error ? err.message : "Failed to log activity. Please try again."
      );
    }
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to log LSM activities.
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Local Store Marketing
        </h1>
        <p className="text-gray-600 mt-2">
          Track your store's marketing activities, coupon codes, and labor hours.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* No Store Access Warning */}
      {!isLoading && accessibleStores.length === 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          <p className="font-medium">No Store Access</p>
          <p className="text-sm mt-1">
            You don't have access to any stores yet. Please contact your administrator
            to get access to stores.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Entry Form */}
        <div>
          <LsmEntryForm
            onSubmit={handleSubmit}
            accessibleStores={accessibleStores}
            isLoading={isLoading}
          />
        </div>

        {/* Recent Entries */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Entries
          </h3>
          <LsmEntryTable entries={recentEntries} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default LsmEntryPage;
