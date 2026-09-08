# Setup & Deployment Guide

## 1. Prerequisites

- **Node.js**: v18+ (Node v26.x supported)
- **Package Manager**: npm or yarn
- **Google Account**: Access to Google Drive, Google Sheets, and Google Apps Script
- **Expo CLI**: For React Native development and mobile preview

---

## 2. Google Sheets & Apps Script Setup

### Step 1: Create Google Spreadsheet
1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it: `Jewel Loan Daily Cash Management Database`.
3. Note your **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### Step 2: Open Apps Script Editor
1. In your Google Sheet, click **Extensions** > **Apps Script**.
2. Rename the project to `JewelLoanCashManagementBackend`.

### Step 3: Copy Apps Script Files
1. Copy the code files from the `backend/` directory in this repository:
   - `Code.js` (Main controller, `doPost`, `doGet`, and action routing)
   - `Auth.js` (Password hashing, token generation, user verification)
   - `FinancialEngine.js` (Cash formulas, balances, calculations)
   - `Transactions.js` (Create, list, filter, void logic)
   - `Closing.js` (Opening cash, actual cash, finalize, reopen)
   - `Reports.js` (Daily, staff, and type summaries)
   - `Admin.js` (User management, audit logs)
   - `Schema.js` (Automatic sheet initialization & schema migration)
2. Run the `initSpreadsheet` function once from the Apps Script editor toolbar. This automatically creates the 6 worksheets (`Companies`, `Users`, `Transactions`, `DailyClosing`, `AuditLogs`, `Config`) with column headers and default test accounts.

### Step 4: Deploy as Web App
1. Click **Deploy** > **New deployment**.
2. Select type: **Web app**.
3. Description: `Production v1.0`.
4. Execute as: **Me** (your Google account).
5. Who has access: **Anyone** (allows the mobile app to send authenticated requests).
6. Click **Deploy** and copy the **Web App URL**:
   `https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec`

---

## 3. React Native / Mobile Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your Apps Script Web App URL:
```env
EXPO_PUBLIC_API_URL=https://script.google.com/macros/s/{YOUR_DEPLOYMENT_ID}/exec
EXPO_PUBLIC_USE_MOCK_API=false
```
*(Note: Setting `EXPO_PUBLIC_USE_MOCK_API=true` enables local development with zero network latency using our built-in in-memory mock engine).*

### Step 3: Run Mobile Application
```bash
# Start Expo dev server
npx expo start

# Run on Web browser for immediate testing
npx expo start --web

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

---

## 4. Default Seed Test Accounts

All initial seed accounts share the default password: `Password@123`

| Company | Role | Username | Display Name |
| :--- | :--- | :--- | :--- |
| **CBE** | `ADMIN` | `admin_cbe` | CBE Admin |
| **CBE** | `STAFF` | `staff_cbe` | Staff One |
| **SMG** | `ADMIN` | `admin_smg` | SMG Admin |
| **AJ** | `ADMIN` | `admin_aj` | AJ Admin |
