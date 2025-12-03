# Dataverse Table Creation

This folder contains scripts to create the `crf63_lsmentries` table in Dataverse for tracking Local Store Marketing (LSM) activities.

## Script: create_lsm_entry_table.py

Creates the LSM Entry table with the following columns:
- **crf63_storenumber** (String, 20) - Store number where the activity took place
- **crf63_couponcode** (String, 50) - Coupon code used for the marketing activity
- **crf63_activitydate** (Date) - Date of the LSM activity
- **crf63_laborhours** (Decimal, 0-24) - Labor hours spent on the activity
- **crf63_description** (Memo, 2000) - Optional description of the activity

### Prerequisites

1. **Install Required Python Packages:**
   ```bash
   pip install msal requests
   ```

2. **Verify Access:**
   - You must have System Administrator or System Customizer role in Dataverse
   - Dataverse environment: https://orgbf93e3c3.crm.dynamics.com

### Usage

```bash
# Navigate to this folder
cd dataverse_table_creation

# Run the script
python create_lsm_entry_table.py
```

### Authentication Flow

The script uses **interactive device code authentication**:

1. Script will display a code and URL
2. Open browser and navigate to the URL
3. Enter the code when prompted
4. Sign in with your Microsoft account
5. Script will continue automatically

### User Store Access (crf63_UserStoreAccess)

The LSM application uses the existing `crf63_UserStoreAccess` table to control which stores a user can access. This table should already exist from the retail-forecast-plan integration.

If it doesn't exist, you'll need to create it with:
- **crf63_userid** (String) - User's Azure AD ID or username
- **crf63_storenumber** (String) - Store number the user has access to
- **crf63_accesslevel** (Number) - Access level (1=read, 2=write, 3=admin)

### Integration with Retail Forecast Plan

This LSM tracking application is designed to integrate with the retail-forecast-plan application:
- Shares the same Azure Static Web App deployment
- Uses the same Azure AD authentication
- Uses the same crf63_UserStoreAccess for user/store permissions
- Navigation allows switching between LSM and Retail Forecast features
