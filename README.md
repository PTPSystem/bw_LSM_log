# Papa John's LSM (Local Store Marketing) Tracking

Web application to track Local Store Marketing activities for Papa John's franchise stores. This app integrates with Microsoft Dataverse for data storage and uses Azure AD for authentication.

## Features

- **LSM Activity Logging**: Track marketing activities including store, coupon code, date, and labor hours
- **History View**: View and filter past LSM entries with date range and store filters
- **Store Access Control**: Users only see stores they have access to (via crf63_UserStoreAccess)
- **Azure AD Authentication**: Secure login using Microsoft Azure AD
- **Dataverse Integration**: All data stored in Microsoft Dataverse

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Data Storage**: Microsoft Dataverse
- **Deployment**: Azure Static Web Apps

## Project Structure

```
bw_LSM_log/
├── lsm-frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── config/               # Configuration (auth, etc.)
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services (Dataverse, Auth)
│   │   └── types/                # TypeScript type definitions
│   ├── .env.example              # Environment variables template
│   └── staticwebapp.config.json  # Azure Static Web App config
├── dataverse_table_creation/     # Dataverse table setup scripts
│   ├── create_lsm_entry_table.py # Script to create LSM table
│   └── README.md                 # Setup instructions
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- Azure AD tenant with app registration
- Microsoft Dataverse environment

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PTPSystem/bw_LSM_log.git
   cd bw_LSM_log
   ```

2. **Set up Dataverse tables:**
   ```bash
   cd dataverse_table_creation
   pip install -r requirements.txt
   python create_lsm_entry_table.py
   ```

3. **Configure environment:**
   ```bash
   cd ../lsm-frontend
   cp .env.example .env.local
   # Edit .env.local with your Azure AD and Dataverse settings
   ```

4. **Install dependencies and run:**
   ```bash
   npm install
   npm run dev
   ```

5. **Open browser:**
   Navigate to http://localhost:5173

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_AZURE_CLIENT_ID` | Azure AD application (client) ID |
| `VITE_AZURE_TENANT_ID` | Azure AD tenant ID |
| `VITE_REDIRECT_URI` | OAuth redirect URI (e.g., http://localhost:5173) |
| `VITE_DATAVERSE_URL` | Dataverse environment URL |

## Dataverse Tables

### crf63_lsmentries (LSM Entry)
| Column | Type | Description |
|--------|------|-------------|
| crf63_storenumber | String (20) | Store number |
| crf63_couponcode | String (50) | Coupon code used |
| crf63_activitydate | Date | Activity date |
| crf63_laborhours | Decimal (0-24) | Labor hours spent |
| crf63_description | Memo (2000) | Optional description |

### crf63_userstoreaccesss (User Store Access)
Used to control which stores a user can access. Shared with retail-forecast-plan.

## Integration with Retail Forecast Plan

This application is designed to integrate with the retail-forecast-plan application:
- Shares the same Azure Static Web App
- Uses the same Azure AD authentication
- Uses the same crf63_UserStoreAccess table for user/store permissions
- Navigation allows switching between LSM and Retail Forecast features

## Deployment

### Azure Static Web Apps

1. Create an Azure Static Web App in the Azure Portal
2. Connect to this GitHub repository
3. Set the following build settings:
   - App location: `/lsm-frontend`
   - Output location: `dist`
   - API location: (leave empty)
4. Configure environment variables in Azure portal

## License

Private - Papa John's Internal Use Only

