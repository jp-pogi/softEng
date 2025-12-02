# ToothTrack - Dental Appointment System

## 📋 Overview

ToothTrack is a comprehensive web-based dental appointment management system designed for modern dental clinics. It provides a complete solution for managing appointments, patients, dental records, and clinic operations with role-based access control.

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Data Storage**: Browser LocalStorage (client-side persistence)
- **Authentication**: Session-based with LocalStorage persistence
- **UI Framework**: Custom CSS with Font Awesome icons
- **Fonts**: Inter (Google Fonts)

### File Structure

```
softEng/
├── app.html                 # Landing page (entry point)
├── homepage.html            # Public homepage with services and doctor listings
├── index.html               # Main dashboard application
├── dental.jpg               # Hero section image
│
├── Core JavaScript Modules:
│   ├── data-manager.js      # Data persistence and CRUD operations
│   ├── auth-manager.js      # Authentication and session management
│   ├── views-handler.js     # Main view controller and UI logic
│   ├── role-permissions.js  # Role-based access control (RBAC)
│   ├── patient-portal.js    # Patient-specific features
│   ├── user-management.js   # Admin user management
│   ├── bulk-operations.js   # Bulk actions for appointments
│   ├── utils.js             # Utility functions (modals, helpers)
│   ├── enhancements.js      # Global enhancements and error handling
│   ├── script.js            # Main application script
│   └── homepage-script.js   # Homepage-specific functionality
│
├── Supporting Modules:
│   ├── pagination-manager.js    # Pagination functionality
│   ├── validation-manager.js    # Form validation
│   ├── keyboard-shortcuts.js    # Keyboard shortcuts
│   ├── advanced-search.js       # Advanced search features
│   ├── audit-log.js             # Audit logging
│   └── data-backup.js           # Data backup/restore
│
├── Styles:
│   ├── styles.css           # Main dashboard styles
│   └── homepage-styles.css  # Homepage styles
│
└── Test Files:
    ├── test-login.html
    ├── test-modal.html
    ├── test-buttons.html
    └── reset-users.html
```

## 👥 User Roles

The system supports three main user roles with distinct permissions:

### 1. Administrator (Admin)
- **Full System Access**: Complete control over all system features
- **User Management**: Create, edit, delete, and manage all user accounts
- **Data Management**: Access to all appointments, patients, and records
- **System Settings**: Configure clinic-wide settings
- **Default Credentials**: `admin@toothtrack.ph` / `password123`

### 2. Dentist
- **Clinical Operations**: Manage own appointments and patients
- **Patient Management**: View and edit patients who have appointments with them
- **Records Management**: Create and edit dental records (medical history only)
- **Clinic Settings**: Manage personal clinic information (name, address, hours)
- **Schedule Management**: View and manage own schedule
- **Restrictions**: Cannot delete appointments/patients, cannot access other dentists' data
- **Default Credentials**: `dentist@toothtrack.ph` / `password123`

### 3. Patient
- **Self-Service**: View and manage own appointments
- **Appointment Booking**: Book appointments with available dentists
- **Profile Management**: Edit own profile and contact information
- **Records Access**: View own dental treatment records
- **Restrictions**: Cannot access other patients' data, cannot create/edit records
- **Default Credentials**: `patient@toothtrack.ph` / `password123`

## 🔑 Key Features

### 1. Appointment Management
- **Multi-Step Booking Flow**:
  1. Service selection with pricing and duration
  2. Dentist selection (filtered by service)
  3. Date & time selection with real-time availability
  4. Patient information form
  5. Confirmation and booking summary
- **Appointment Statuses**: Pending → Confirmed → Completed / Cancelled
- **Service Duration**: Supports 1-hour and 2-hour appointments (affects schedule display)
- **Real-Time Availability**: Blocks booked time slots based on selected dentist
- **Past Date Prevention**: Cannot book appointments in the past

### 2. Patient Management
- **Patient Profiles**: Complete patient information with medical history
- **Role-Based Access**: Dentists only see patients with appointments
- **Medical History**: Dentists can only edit medical history (other fields read-only)
- **Profile Pictures**: Support for user profile pictures (base64 encoded)

### 3. Schedule Management
- **Hourly View**: Schedule displayed in 1-hour increments
- **Working Hours**: Dynamic based on dentist's clinic settings
- **Multi-Hour Appointments**: Visual representation for 2-hour services
- **Time Slot Blocking**: Automatically blocks booked slots
- **Today's Schedule**: Quick view of today's appointments

### 4. Dental Records
- **Treatment Records**: Complete dental treatment history
- **Medical History**: Editable by dentists only
- **Record Linking**: Records linked to appointments and patients
- **Completion Notes**: Notes added when appointments are marked as completed

### 5. User Management (Admin Only)
- **User CRUD**: Create, read, update, delete user accounts
- **Role Assignment**: Assign roles (admin, dentist, patient)
- **Profile Pictures**: View user profile pictures in user list
- **Cascade Deletion**: Deleting a user removes all associated data

### 6. Settings Management
- **Clinic Settings**: Per-dentist clinic information (name, address, phone, hours)
- **Profile Settings**: User profile management
- **System Rating**: Dentists and patients can rate the system (1-5 stars)
- **Working Hours**: Time picker interface for setting clinic hours

### 7. Notification System
- **User-Specific Notifications**: Each user sees only their own notifications
- **Notification Types**: New appointments, cancellations, reviews, status changes
- **Unread Count**: Badge showing number of unread notifications
- **Mark as Read**: Individual and bulk mark-as-read functionality

### 8. System Rating
- **User Ratings**: Dentists and patients can rate the system
- **Homepage Display**: Average rating and "Trusted by" count (ratings ≥ 3)
- **Dynamic Updates**: Ratings update in real-time on homepage

## 💾 Data Storage

### LocalStorage Keys
- `toothtrack_users` - User accounts
- `toothtrack_appointments` - Appointment data
- `toothtrack_patients` - Patient records
- `toothtrack_records` - Dental treatment records
- `toothtrack_settings` - System/clinic settings
- `toothtrack_notifications` - User notifications
- `currentUser` (sessionStorage) - Active session

### Data Relationships
- Users ↔ Patients: Linked by email/ID
- Appointments ↔ Patients: Linked by patientId/email
- Appointments ↔ Dentists: Linked by dentist name
- Records ↔ Patients: Linked by patientId/email
- Records ↔ Appointments: Created when appointments are completed

## 🔒 Security Features

### Role-Based Access Control (RBAC)
- **Data Filtering**: All data filtered by user role
- **View Restrictions**: Users only see data they're permitted to access
- **Action Permissions**: Granular permission system for CRUD operations
- **Security Checks**: Multiple layers of permission validation

### Patient Data Security
- Patients can only view their own appointments, records, and profile
- Dentists only see patients who have appointments with them
- Dentists only see their own appointments and schedule
- Admin has full access to all data

### Authentication
- Session-based authentication
- Password stored in plain text (should be hashed in production)
- Session persistence across page refreshes
- Automatic logout on account deletion

## 🎨 User Interface

### Homepage Features
- **Hero Section**: Welcome message with dental examination image
- **Services Section**: Service cards with pricing and duration
- **Doctor Listings**: "Meet Our Doctors" section with ratings
- **System Ratings**: Dynamic rating display
- **Login/Register**: Modal-based authentication

### Dashboard Features
- **Role-Based Dashboards**: Different views for each role
- **Statistics Cards**: Today's appointments, weekly stats, completed treatments
- **Today's Schedule**: Quick view of today's appointments
- **Pending Actions**: Items requiring attention
- **Quick Actions**: Role-specific action buttons

### Responsive Design
- Modern, clean interface
- Mobile-friendly layout
- Consistent color scheme (blue primary: #2563EB)
- Font Awesome icons throughout

## 📱 Key Functionalities

### Appointment Booking
- Service selection with duration-based scheduling
- Dentist selection filtered by service availability
- Real-time time slot availability
- Past date/time prevention
- Multi-step confirmation process

### Schedule Display
- Hourly time slots
- Visual appointment blocks
- Multi-hour appointment indicators
- Working hours highlighting
- Click-to-view appointment details

### Patient Records
- Medical history management
- Treatment notes
- Appointment-linked records
- Dentist-specific editing permissions

### Notifications
- Real-time notification updates
- Unread count badges
- Notification dropdown
- Mark as read functionality

## 🚀 Getting Started

### Initial Setup
1. Open `app.html` in a web browser (or `homepage.html` for public view)
2. System initializes with default users:
   - Admin: `admin@toothtrack.ph` / `password123`
   - Dentist: `dentist@toothtrack.ph` / `password123`
   - Patient: `patient@toothtrack.ph` / `password123`

### Usage Flow
1. **Public Access**: Visit `homepage.html` to view services and book appointments
2. **Login**: Click "Login" button and select role
3. **Dashboard**: Access role-specific dashboard after login
4. **Navigation**: Use sidebar to navigate between views
5. **Actions**: Use action buttons to create, edit, or manage items

## 🔧 Technical Details

### Data Manager (`data-manager.js`)
- Centralized data access layer
- CRUD operations for all entities
- LocalStorage persistence
- Data filtering and search
- Cascade deletion support

### Views Handler (`views-handler.js`)
- Main UI controller
- View rendering and updates
- Form handling
- Modal management
- Real-time data refresh

### Role Permissions (`role-permissions.js`)
- Permission definitions per role
- Data filtering by role
- Action permission checks
- View access control

### Patient Portal (`patient-portal.js`)
- Patient-specific features
- Appointment cancellation
- Dashboard customization
- Patient view restrictions

## 📝 Important Notes

### Current Limitations
- **Password Security**: Passwords stored in plain text (should be hashed in production)
- **Data Persistence**: LocalStorage is browser-specific (not shared across devices)
- **No Backend**: All data stored client-side (consider API integration for production)
- **Single Browser**: Data not synchronized across browsers/devices

### Production Considerations
1. **Backend API**: Replace LocalStorage with REST API
2. **Password Hashing**: Implement bcrypt or similar
3. **Database**: Use proper database (PostgreSQL, MySQL, etc.)
4. **Authentication**: Implement JWT or session-based auth
5. **Data Validation**: Server-side validation
6. **Error Handling**: Comprehensive error logging
7. **Backup System**: Automated data backups

## 🎯 Recent Improvements

- ✅ Dentists can only edit medical history (not other patient fields)
- ✅ Appointments sorted latest to oldest
- ✅ Location shows dentist's specific clinic address
- ✅ System rating feature (dentists and patients)
- ✅ Service duration affects schedule (1hr/2hr appointments)
- ✅ User-specific notification system
- ✅ Patient appointment cancellation
- ✅ Per-dentist clinic settings
- ✅ Past date/time booking prevention
- ✅ Real-time availability checking
- ✅ Profile picture support
- ✅ Cascade deletion for user accounts

## 📞 Support

For issues or questions, refer to the code comments in individual files or examine the implementation in:
- `data-manager.js` - Data operations
- `views-handler.js` - UI logic
- `role-permissions.js` - Access control

## 📄 License

This is a custom dental appointment management system. All rights reserved.

---

**Last Updated**: Current System Status  
**Version**: 1.0  
**Status**: Production Ready (with LocalStorage backend)

