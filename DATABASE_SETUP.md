# ToothTrack Database Setup Guide

This guide explains how to initialize the ToothTrack database system on a new device or computer.

## Quick Start

### Method 1: Using the HTML Interface (Recommended)

1. Open `init-database.html` in your web browser
2. Click **"Initialize Database"** to create all databases
3. If databases already exist, click **"Reset & Initialize"** to overwrite them
4. Use **"Check Status"** to verify database initialization

### Method 2: Using Browser Console

1. Open any ToothTrack page (e.g., `homepage.html` or `app.html`)
2. Open browser console (F12 or Right-click → Inspect → Console)
3. Load the initialization script:
   ```javascript
   // Load the script
   const script = document.createElement('script');
   script.src = 'init-database.js';
   document.head.appendChild(script);
   
   // Wait a moment, then run
   setTimeout(() => {
       initializeToothTrackDatabase();
   }, 500);
   ```

### Method 3: Direct Function Call

If `init-database.js` is already loaded:

```javascript
// Initialize (will skip if databases exist)
initializeToothTrackDatabase();

// Or force reset and initialize
initializeToothTrackDatabase(true);

// Short alias
initDB(true);
```

## What Gets Created

The initialization script creates the following LocalStorage databases:

1. **`toothtrack_users`** - User accounts (Admin, Dentist, Patient)
   - Also stores: System ratings (`systemRating`, `systemRatingUpdatedAt`)
2. **`toothtrack_appointments`** - Appointment records
3. **`toothtrack_patients`** - Patient profiles
4. **`toothtrack_records`** - Dental treatment records
   - Also stores: Dentist ratings and reviews (`rating`, `review`)
5. **`toothtrack_settings`** - System/clinic settings
6. **`toothtrack_notifications`** - User notifications

### Ratings & Reviews Storage

**Important:** Ratings and reviews are NOT stored in separate databases. They are embedded within existing databases:

- **System Ratings**: Stored as properties in user objects (`toothtrack_users`)
  - `systemRating`: Number (1-5)
  - `systemRatingUpdatedAt`: Timestamp
  - Only dentists and patients can rate the system

- **Dentist Ratings/Reviews**: Stored as properties in records (`toothtrack_records`)
  - `rating`: Number (1-5)
  - `review`: Text string
  - Created when patients complete appointments and leave feedback

## Default User Accounts

After initialization, you can log in with these default credentials:

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@toothtrack.ph      | password123 |
| Dentist | dentist@toothtrack.ph    | password123 |
| Patient | patient@toothtrack.ph    | password123 |

⚠️ **Important:** Change these passwords after first login in a production environment!

## Default Dentist Profile

The default dentist account includes:
- **Name:** Dr. Juan Dela Cruz
- **Clinic:** Smile Dental Clinic
- **Branch:** Ilocos Norte Branch
- **Address:** 123 Rizal St, Laoag City
- **Phone:** (077) 123-4567
- **Working Hours:**
  - Weekdays: 8:00 AM - 6:00 PM
  - Saturday: 8:00 AM - 4:00 PM
  - Sunday: Closed

## Verification

After initialization, verify the setup:

1. Open browser console (F12)
2. Run:
   ```javascript
   // Check if all databases exist
   const dbs = ['toothtrack_users', 'toothtrack_appointments', 'toothtrack_patients', 
                'toothtrack_records', 'toothtrack_settings', 'toothtrack_notifications'];
   dbs.forEach(db => {
       const data = localStorage.getItem(db);
       console.log(db + ':', data ? '✅ Exists (' + JSON.parse(data).length + ' items)' : '❌ Missing');
   });
   ```

## Troubleshooting

### Databases Already Exist
- Use `initializeToothTrackDatabase(true)` to force reset
- Or manually clear LocalStorage: `localStorage.clear()`

### Data Not Persisting
- Ensure LocalStorage is enabled in your browser
- Check browser storage settings
- Try using a different browser

### Function Not Found
- Ensure `init-database.js` is loaded before calling the function
- Check browser console for script loading errors

## Next Steps

After initialization:

1. Open `homepage.html` to view the public-facing page
2. Open `app.html` to access the dashboard
3. Log in with one of the default accounts
4. Customize settings, add users, and start using the system!

## Notes

- All data is stored in browser LocalStorage (client-side only)
- Data is browser-specific (not shared across browsers)
- Data persists until manually cleared or browser data is deleted
- For production use, consider migrating to a backend database

