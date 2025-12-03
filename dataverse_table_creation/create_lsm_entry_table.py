"""
Create LSM Entry Table in Dataverse

This script creates the crf63_lsmentries table for tracking Local Store Marketing activities.
Uses interactive device code authentication for user access.

Prerequisites:
    pip install msal requests

Usage:
    python create_lsm_entry_table.py
"""

import sys
import time
import requests
from msal import PublicClientApplication

# Dataverse configuration
DATAVERSE_URL = "https://orgbf93e3c3.crm.dynamics.com"
TENANT_ID = "c8b6ba98-3fc0-4153-83a9-01374492c0f5"
CLIENT_ID = "51f81489-12ee-4a9e-aaae-a2591f45987d"  # Microsoft Power Apps CLI client ID (public)

# Table schema
TABLE_SCHEMA = {
    "SchemaName": "crf63_lsmentry",
    "LogicalName": "crf63_lsmentry",
    "DisplayName": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "LSM Entry", "LanguageCode": 1033}]},
    "DisplayCollectionName": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "LSM Entries", "LanguageCode": 1033}]},
    "Description": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "Local Store Marketing activity entries", "LanguageCode": 1033}]},
    "OwnershipType": "UserOwned",
    "TableType": "Standard",
    "HasNotes": False,
    "HasActivities": False,
    "PrimaryNameAttribute": "crf63_couponcode"
}

# Column definitions
COLUMNS = [
    {
        "SchemaName": "crf63_storenumber",
        "LogicalName": "crf63_storenumber",
        "AttributeTypeName": {"Value": "StringType"},
        "DisplayName": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "Store Number", "LanguageCode": 1033}]},
        "Description": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "The store number where the LSM activity took place", "LanguageCode": 1033}]},
        "RequiredLevel": {"Value": "ApplicationRequired"},
        "MaxLength": 20,
        "FormatName": {"Value": "Text"}
    },
    {
        "SchemaName": "crf63_couponcode",
        "LogicalName": "crf63_couponcode",
        "AttributeTypeName": {"Value": "StringType"},
        "DisplayName": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "Coupon Code", "LanguageCode": 1033}]},
        "Description": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "The coupon code used for the marketing activity", "LanguageCode": 1033}]},
        "RequiredLevel": {"Value": "ApplicationRequired"},
        "MaxLength": 50,
        "FormatName": {"Value": "Text"}
    },
    {
        "SchemaName": "crf63_activitydate",
        "LogicalName": "crf63_activitydate",
        "AttributeTypeName": {"Value": "DateTimeType"},
        "DisplayName": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "Activity Date", "LanguageCode": 1033}]},
        "Description": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "The date when the LSM activity took place", "LanguageCode": 1033}]},
        "RequiredLevel": {"Value": "ApplicationRequired"},
        "Format": "DateOnly",
        "DateTimeBehavior": {"Value": "DateOnly"}
    },
    {
        "SchemaName": "crf63_laborhours",
        "LogicalName": "crf63_laborhours",
        "AttributeTypeName": {"Value": "DecimalType"},
        "DisplayName": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "Labor Hours", "LanguageCode": 1033}]},
        "Description": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "Number of labor hours spent on the activity", "LanguageCode": 1033}]},
        "RequiredLevel": {"Value": "ApplicationRequired"},
        "MinValue": 0,
        "MaxValue": 24,
        "Precision": 1
    },
    {
        "SchemaName": "crf63_description",
        "LogicalName": "crf63_description",
        "AttributeTypeName": {"Value": "MemoType"},
        "DisplayName": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "Description", "LanguageCode": 1033}]},
        "Description": {"@odata.type": "Microsoft.Dynamics.CRM.Label", "LocalizedLabels": [{"@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "Optional description of the marketing activity", "LanguageCode": 1033}]},
        "RequiredLevel": {"Value": "None"},
        "MaxLength": 2000,
        "Format": "TextArea"
    }
]


def get_access_token():
    """Authenticate using device code flow and get access token."""
    print("\n" + "=" * 70)
    print("Authentication required...")
    print("=" * 70)

    app = PublicClientApplication(
        CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{TENANT_ID}"
    )

    # Start device code flow
    flow = app.initiate_device_flow(scopes=[f"{DATAVERSE_URL}/.default"])
    if "user_code" not in flow:
        raise Exception(f"Failed to create device flow: {flow.get('error_description', 'Unknown error')}")

    print(f"\n{flow['message']}\n")
    
    # Wait for user to authenticate
    result = app.acquire_token_by_device_flow(flow)
    
    if "access_token" in result:
        print(f"✓ Authenticated as: {result.get('id_token_claims', {}).get('preferred_username', 'Unknown')}")
        return result["access_token"]
    else:
        raise Exception(f"Authentication failed: {result.get('error_description', 'Unknown error')}")


def create_table(token: str) -> bool:
    """Create the LSM Entry table in Dataverse."""
    print("\n" + "-" * 70)
    print("Creating table crf63_lsmentries...")
    print("-" * 70)

    url = f"{DATAVERSE_URL}/api/data/v9.2/EntityDefinitions"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
    }

    response = requests.post(url, json=TABLE_SCHEMA, headers=headers)
    
    if response.status_code in [200, 201, 204]:
        print("✓ Table created successfully!")
        return True
    elif response.status_code == 412 or "already exists" in response.text.lower():
        print("! Table already exists, continuing with column creation...")
        return True
    else:
        print(f"✗ Failed to create table: {response.status_code}")
        print(f"  Response: {response.text}")
        return False


def create_column(token: str, table_name: str, column: dict, index: int, total: int) -> bool:
    """Create a column in the specified table."""
    column_name = column["SchemaName"]
    display_name = column["DisplayName"]["LocalizedLabels"][0]["Label"]
    
    print(f"  [{index}/{total}] Creating {column_name} ({display_name})...")

    url = f"{DATAVERSE_URL}/api/data/v9.2/EntityDefinitions(LogicalName='{table_name}')/Attributes"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
    }

    # Add proper OData type based on attribute type
    attribute_type = column["AttributeTypeName"]["Value"]
    type_map = {
        "StringType": "Microsoft.Dynamics.CRM.StringAttributeMetadata",
        "DateTimeType": "Microsoft.Dynamics.CRM.DateTimeAttributeMetadata",
        "DecimalType": "Microsoft.Dynamics.CRM.DecimalAttributeMetadata",
        "MemoType": "Microsoft.Dynamics.CRM.MemoAttributeMetadata"
    }
    
    column_payload = dict(column)
    column_payload["@odata.type"] = type_map.get(attribute_type, "Microsoft.Dynamics.CRM.AttributeMetadata")

    response = requests.post(url, json=column_payload, headers=headers)
    
    if response.status_code in [200, 201, 204]:
        return True
    elif "already exists" in response.text.lower():
        print(f"    ! Column already exists")
        return True
    else:
        print(f"    ✗ Failed: {response.status_code} - {response.text[:200]}")
        return False


def verify_table(token: str) -> bool:
    """Verify the table was created correctly."""
    print("\n" + "-" * 70)
    print("Verifying table creation...")
    print("-" * 70)

    url = f"{DATAVERSE_URL}/api/data/v9.2/EntityDefinitions(LogicalName='crf63_lsmentry')?$select=SchemaName,DisplayName"
    headers = {
        "Authorization": f"Bearer {token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0"
    }

    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Table found: {data.get('SchemaName', 'Unknown')}")
        print(f"  Display Name: {data.get('DisplayName', {}).get('UserLocalizedLabel', {}).get('Label', 'Unknown')}")
        return True
    else:
        print(f"✗ Table verification failed: {response.status_code}")
        return False


def main():
    """Main entry point."""
    print("\n" + "=" * 70)
    print("Dataverse Table Creation Script")
    print("Table: crf63_lsmentries (LSM Entries)")
    print("=" * 70)

    try:
        # Authenticate
        token = get_access_token()

        # Create table
        if not create_table(token):
            sys.exit(1)

        # Wait for table to be ready
        print("\nWaiting for table to be ready...")
        time.sleep(5)

        # Create columns
        print("\nCreating columns...")
        success_count = 0
        for i, column in enumerate(COLUMNS, 1):
            if create_column(token, "crf63_lsmentry", column, i, len(COLUMNS)):
                success_count += 1

        print(f"\n✓ Created {success_count}/{len(COLUMNS)} columns successfully")

        # Verify
        verify_table(token)

        # Summary
        print("\n" + "=" * 70)
        print("✓ Table creation complete!")
        print("=" * 70)
        print("\nNext steps:")
        print("1. Verify table in Power Apps: https://make.powerapps.com")
        print("2. Configure user store access in crf63_UserStoreAccess table")
        print("3. Deploy the LSM frontend application")
        print("=" * 70 + "\n")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
