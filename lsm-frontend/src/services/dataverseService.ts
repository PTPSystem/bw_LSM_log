/**
 * Dataverse API Service
 * Handles all Dataverse operations for LSM tracking
 */

import { dataverseUrl } from "../config/authConfig";
import type {
  LsmEntry,
  DataverseLsmEntry,
  ApiResponse,
  DataverseUserStoreAccess,
} from "../types";

// LSM Entry table name in Dataverse
const LSM_ENTRY_TABLE = "crf63_lsmentries";
const USER_STORE_ACCESS_TABLE = "crf63_userstoreaccesss";

/**
 * Convert Dataverse LSM entry to application format
 */
const mapFromDataverse = (entry: DataverseLsmEntry): LsmEntry => ({
  id: entry.crf63_lsmentryid,
  storeNumber: entry.crf63_storenumber,
  couponCode: entry.crf63_couponcode,
  activityDate: entry.crf63_activitydate,
  laborHours: entry.crf63_laborhours,
  description: entry.crf63_description,
  createdBy: entry.createdby?.name,
  createdOn: entry.createdon,
  modifiedBy: entry.modifiedby?.name,
  modifiedOn: entry.modifiedon,
});

/**
 * Convert application LSM entry to Dataverse format
 */
const mapToDataverse = (
  entry: Omit<LsmEntry, "id" | "createdBy" | "createdOn" | "modifiedBy" | "modifiedOn">
): Partial<DataverseLsmEntry> => ({
  crf63_storenumber: entry.storeNumber,
  crf63_couponcode: entry.couponCode,
  crf63_activitydate: entry.activityDate,
  crf63_laborhours: entry.laborHours,
  crf63_description: entry.description,
});

/**
 * DataverseService class for LSM operations
 */
export class DataverseService {
  private accessToken: string;
  private baseUrl: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.baseUrl = `${dataverseUrl}/api/data/v9.2`;
  }

  /**
   * Make authenticated request to Dataverse
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      Accept: "application/json",
      Prefer: 'odata.include-annotations="*"',
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dataverse API error: ${response.status} - ${errorText}`);
    }

    // Handle empty responses (e.g., DELETE, successful POST without return)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Get all LSM entries for accessible stores
   */
  async getLsmEntries(storeNumbers?: string[]): Promise<LsmEntry[]> {
    let filter = "";
    if (storeNumbers && storeNumbers.length > 0) {
      const storeFilters = storeNumbers
        .map((s) => `crf63_storenumber eq '${s}'`)
        .join(" or ");
      filter = `?$filter=${encodeURIComponent(storeFilters)}`;
    }

    const response = await this.request<ApiResponse<DataverseLsmEntry>>(
      `/${LSM_ENTRY_TABLE}${filter}&$orderby=crf63_activitydate desc&$expand=createdby($select=name),modifiedby($select=name)`
    );

    return response.value.map(mapFromDataverse);
  }

  /**
   * Get a single LSM entry by ID
   */
  async getLsmEntry(id: string): Promise<LsmEntry> {
    const response = await this.request<DataverseLsmEntry>(
      `/${LSM_ENTRY_TABLE}(${id})?$expand=createdby($select=name),modifiedby($select=name)`
    );
    return mapFromDataverse(response);
  }

  /**
   * Create a new LSM entry
   */
  async createLsmEntry(
    entry: Omit<LsmEntry, "id" | "createdBy" | "createdOn" | "modifiedBy" | "modifiedOn">
  ): Promise<LsmEntry> {
    const dataverseEntry = mapToDataverse(entry);
    const response = await this.request<DataverseLsmEntry>(
      `/${LSM_ENTRY_TABLE}`,
      {
        method: "POST",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify(dataverseEntry),
      }
    );
    return mapFromDataverse(response);
  }

  /**
   * Update an existing LSM entry
   */
  async updateLsmEntry(id: string, entry: Partial<LsmEntry>): Promise<void> {
    const dataverseEntry: Partial<DataverseLsmEntry> = {};
    if (entry.storeNumber !== undefined) {
      dataverseEntry.crf63_storenumber = entry.storeNumber;
    }
    if (entry.couponCode !== undefined) {
      dataverseEntry.crf63_couponcode = entry.couponCode;
    }
    if (entry.activityDate !== undefined) {
      dataverseEntry.crf63_activitydate = entry.activityDate;
    }
    if (entry.laborHours !== undefined) {
      dataverseEntry.crf63_laborhours = entry.laborHours;
    }
    if (entry.description !== undefined) {
      dataverseEntry.crf63_description = entry.description;
    }

    await this.request(`/${LSM_ENTRY_TABLE}(${id})`, {
      method: "PATCH",
      body: JSON.stringify(dataverseEntry),
    });
  }

  /**
   * Delete an LSM entry
   */
  async deleteLsmEntry(id: string): Promise<void> {
    await this.request(`/${LSM_ENTRY_TABLE}(${id})`, {
      method: "DELETE",
    });
  }

  /**
   * Get user's accessible stores from UserStoreAccess table
   */
  async getUserStoreAccess(userId: string): Promise<string[]> {
    const filter = `?$filter=crf63_userid eq '${userId}'`;
    const response = await this.request<ApiResponse<DataverseUserStoreAccess>>(
      `/${USER_STORE_ACCESS_TABLE}${filter}`
    );

    return response.value.map((access) => access.crf63_storenumber);
  }

  /**
   * Get LSM entries for a specific date range
   */
  async getLsmEntriesByDateRange(
    startDate: string,
    endDate: string,
    storeNumbers?: string[]
  ): Promise<LsmEntry[]> {
    let filter = `crf63_activitydate ge ${startDate} and crf63_activitydate le ${endDate}`;
    
    if (storeNumbers && storeNumbers.length > 0) {
      const storeFilters = storeNumbers
        .map((s) => `crf63_storenumber eq '${s}'`)
        .join(" or ");
      filter = `(${filter}) and (${storeFilters})`;
    }

    const response = await this.request<ApiResponse<DataverseLsmEntry>>(
      `/${LSM_ENTRY_TABLE}?$filter=${encodeURIComponent(filter)}&$orderby=crf63_activitydate desc&$expand=createdby($select=name),modifiedby($select=name)`
    );

    return response.value.map(mapFromDataverse);
  }
}

export default DataverseService;
