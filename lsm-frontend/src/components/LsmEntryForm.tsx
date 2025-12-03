/**
 * LSM Entry Form Component
 * Form for creating new LSM (Local Store Marketing) entries
 */

import { useForm } from "react-hook-form";
import type { LsmFormData } from "../types";
import { format } from "date-fns";

interface LsmEntryFormProps {
  onSubmit: (data: LsmFormData) => Promise<void>;
  accessibleStores: string[];
  isLoading?: boolean;
  initialData?: Partial<LsmFormData>;
}

export function LsmEntryForm({
  onSubmit,
  accessibleStores,
  isLoading = false,
  initialData,
}: LsmEntryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LsmFormData>({
    defaultValues: {
      storeNumber: initialData?.storeNumber || "",
      couponCode: initialData?.couponCode || "",
      activityDate: initialData?.activityDate || format(new Date(), "yyyy-MM-dd"),
      laborHours: initialData?.laborHours || 0,
      description: initialData?.description || "",
    },
  });

  const handleFormSubmit = async (data: LsmFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-white shadow-md rounded-lg p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Log LSM Activity
      </h2>

      {/* Store Number */}
      <div>
        <label
          htmlFor="storeNumber"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Store Number *
        </label>
        <select
          id="storeNumber"
          {...register("storeNumber", { required: "Store number is required" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          disabled={isLoading || isSubmitting}
        >
          <option value="">Select a store...</option>
          {accessibleStores.map((store) => (
            <option key={store} value={store}>
              Store #{store}
            </option>
          ))}
        </select>
        {errors.storeNumber && (
          <p className="mt-1 text-sm text-red-600">
            {errors.storeNumber.message}
          </p>
        )}
      </div>

      {/* Coupon Code */}
      <div>
        <label
          htmlFor="couponCode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Coupon Code *
        </label>
        <input
          type="text"
          id="couponCode"
          {...register("couponCode", {
            required: "Coupon code is required",
            minLength: {
              value: 2,
              message: "Coupon code must be at least 2 characters",
            },
            maxLength: {
              value: 50,
              message: "Coupon code must be at most 50 characters",
            },
          })}
          placeholder="e.g., LSM25OFF"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          disabled={isLoading || isSubmitting}
        />
        {errors.couponCode && (
          <p className="mt-1 text-sm text-red-600">
            {errors.couponCode.message}
          </p>
        )}
      </div>

      {/* Activity Date */}
      <div>
        <label
          htmlFor="activityDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Activity Date *
        </label>
        <input
          type="date"
          id="activityDate"
          {...register("activityDate", {
            required: "Activity date is required",
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          disabled={isLoading || isSubmitting}
        />
        {errors.activityDate && (
          <p className="mt-1 text-sm text-red-600">
            {errors.activityDate.message}
          </p>
        )}
      </div>

      {/* Labor Hours */}
      <div>
        <label
          htmlFor="laborHours"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Labor Hours *
        </label>
        <input
          type="number"
          id="laborHours"
          step="0.5"
          min="0"
          max="24"
          {...register("laborHours", {
            required: "Labor hours is required",
            min: {
              value: 0,
              message: "Labor hours cannot be negative",
            },
            max: {
              value: 24,
              message: "Labor hours cannot exceed 24",
            },
            valueAsNumber: true,
          })}
          placeholder="e.g., 2.5"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          disabled={isLoading || isSubmitting}
        />
        {errors.laborHours && (
          <p className="mt-1 text-sm text-red-600">
            {errors.laborHours.message}
          </p>
        )}
      </div>

      {/* Description (optional) */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          {...register("description", {
            maxLength: {
              value: 500,
              message: "Description must be at most 500 characters",
            },
          })}
          rows={3}
          placeholder="Describe the marketing activity..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          disabled={isLoading || isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || isSubmitting}
        className="w-full bg-red-700 text-white py-3 px-4 rounded-md font-medium hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Log LSM Activity"}
      </button>
    </form>
  );
}

export default LsmEntryForm;
