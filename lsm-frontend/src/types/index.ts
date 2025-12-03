/**
 * LSM Entry Type Definitions
 */

// LSM Log Entry - represents a local store marketing activity
export interface LsmEntry {
  id?: string;
  storeNumber: string;
  couponCode: string;
  activityDate: string; // ISO date string
  laborHours: number;
  description?: string;
  createdBy?: string;
  createdOn?: string;
  modifiedBy?: string;
  modifiedOn?: string;
}

// Dataverse LSM Entry format (with Dataverse field prefixes)
export interface DataverseLsmEntry {
  crf63_lsmentryid?: string;
  crf63_storenumber: string;
  crf63_couponcode: string;
  crf63_activitydate: string;
  crf63_laborhours: number;
  crf63_description?: string;
  createdby?: { name?: string };
  createdon?: string;
  modifiedby?: { name?: string };
  modifiedon?: string;
}

// Store information
export interface Store {
  storeNumber: string;
  storeName: string;
  address?: string;
  city?: string;
  state?: string;
}

// User Store Access mapping from Dataverse
export interface UserStoreAccess {
  userId: string;
  storeNumber: string;
  accessLevel: "read" | "write" | "admin";
}

// Dataverse User Store Access format
export interface DataverseUserStoreAccess {
  crf63_userstoreaccessid: string;
  crf63_userid: string;
  crf63_storenumber: string;
  crf63_accesslevel: number; // 1 = read, 2 = write, 3 = admin
}

// Form state for LSM entry
export interface LsmFormData {
  storeNumber: string;
  couponCode: string;
  activityDate: string;
  laborHours: number;
  description?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  value: T[];
  "@odata.count"?: number;
  "@odata.nextLink"?: string;
}
