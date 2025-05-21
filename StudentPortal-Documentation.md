# Student Portal Documentation

## Table of Contents
- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Front-End Documentation](#front-end-documentation)
  - [Technologies Used](#front-end-technologies)
  - [Project Structure](#project-structure)
  - [Pages and Components](#pages-and-components)
  - [Authentication System](#authentication-system)
  - [State Management](#state-management)
- [Back-End Documentation](#back-end-documentation)
  - [Technologies Used](#back-end-technologies)
  - [API Endpoints](#api-endpoints)
  - [Data Models](#data-models)
  - [Authentication & Security](#authentication--security)
- [Installation & Setup](#installation--setup)
- [User Guide](#user-guide)
- [Future Enhancements](#future-enhancements)

## Project Overview

The Student Portal is a comprehensive educational management system that facilitates interactions between students, teachers, and administrators. It provides features for managing user profiles, viewing and updating academic records, scheduling classes, and administrative operations.

Key features include:
- User authentication with role-based access control
- Student dashboard with grades, schedules, and personal information
- Teacher interface for managing students and grades
- Admin panel for user management and system settings
- Profile management for all users
- Schedule management for students and teachers
- Grade tracking and reporting

## System Architecture

The Student Portal follows a client-server architecture:

1. **Front-End**: A React-based single-page application (SPA) that provides the user interface
2. **Back-End**: A .NET Core API that handles data processing, business logic, and database operations
3. **Database**: SQL Server database storing user, academic, and system data

### Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React          │     │  .NET Core API  │     │   SQL Server    │
│  Front-End      │◄────►  Back-End       │◄────►   Database      │
│  (SPA)          │     │  Services       │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Front-End Documentation

### Front-End Technologies

The front-end of the Student Portal utilizes:

- **React**: JavaScript library for building user interfaces
- **Context API**: For state management
- **React Router**: For navigation and routing
- **Axios**: For HTTP requests to the back-end API
- **CSS Modules**: For component-specific styling

### Project Structure

```
student-portal/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── api/           # API service functions
│   ├── components/    # Reusable components
│   ├── context/       # React context providers
│   ├── pages/         # Page components
│   ├── styles/        # CSS stylesheets
│   ├── App.js         # Main application component
│   └── index.js       # Entry point
└── package.json      # Dependencies and scripts
```

### Pages and Components

#### Key Pages

1. **Dashboard.js**
   - Entry point for authenticated users
   - Shows personalized statistics and quick access links
   - Role-specific content for students, teachers, and admins
   - Displays announcements and recent activity

2. **StudentPage.js**
   - Student-specific dashboard
   - Displays grades organized by subject
   - Shows student information
   - Integrates ScheduleManager for class schedules

3. **TeacherPage.js**
   - Teacher interface for managing students and grades
   - Grade entry and management functionality
   - Student performance overview

4. **AdminPage.js**
   - User management (add, edit, delete users)
   - System statistics and settings
   - Activity logging
   - Password reset functionality

5. **ProfilePage.js**
   - Personal information display
   - Email update functionality
   - Password management
   - User-specific settings

6. **Login.js** & **Register.js**
   - Authentication interfaces
   - Form validation
   - Error handling

#### Key Components

1. **ScheduleManager**
   - Weekly schedule display
   - Add/edit/delete schedule entries
   - Day and time organization

2. **Navbar**
   - Navigation between pages
   - User authentication status
   - Role-specific navigation options

### Authentication System

The authentication system uses JWT (JSON Web Tokens) for secure user sessions:

1. **Login Flow**:
   - User submits credentials via Login.js
   - Back-end authenticates and returns JWT token
   - Token is stored in localStorage with user information
   - AuthContext updates with user state

2. **Authentication State**:
   - AuthContext.js maintains global authentication state
   - Components can access user information and authentication status
   - Protected routes redirect unauthenticated users

3. **Token Management**:
   - Automatic token inclusion in API requests
   - Role-based access control using token claims
   - Token expiration handling

### State Management

The application uses React Context API for state management:

1. **AuthContext**:
   - Manages user authentication state
   - Provides login, logout, and registration functions
   - Stores user role and permissions

## Back-End Documentation

### Back-End Technologies

The back-end of the Student Portal uses:

- **ASP.NET Core**: Web API framework
- **Entity Framework Core**: ORM for database operations
- **SQL Server**: Relational database
- **JWT Authentication**: For secure user sessions
- **AutoMapper**: For object mapping

### API Endpoints

#### Authentication

- **POST /api/auth/login**
  - Authenticates users and returns JWT token
  - Parameters: `email`, `password`

- **POST /api/auth/register**
  - Registers new users
  - Parameters: `name`, `email`, `password`, `role`

#### Users

- **GET /api/users**
  - Returns all users (admin only)

- **GET /api/users/{id}**
  - Returns specific user details

- **PUT /api/users/{id}**
  - Updates user information
  - Parameters: `email`, `currentPassword`, `newPassword`

- **DELETE /api/users/{id}**
  - Deletes a user (admin only)

- **POST /api/users/{id}/reset-password**
  - Initiates password reset process

#### Students

- **GET /api/students**
  - Returns all students

- **GET /api/students/user/{userId}**
  - Returns student information for a specific user

- **GET /api/students/{id}**
  - Returns specific student details

- **POST /api/students**
  - Creates a new student record

- **PUT /api/students/{id}**
  - Updates student information

#### Grades

- **GET /api/grades/{studentId}**
  - Returns grades for a specific student

- **POST /api/grades**
  - Creates a new grade entry
  - Parameters: `studentId`, `subject`, `score`, `maxScore`, `gradeType`, `semester`, `date`, `comments`

- **PUT /api/grades/{id}**
  - Updates an existing grade entry

- **DELETE /api/grades/{id}**
  - Removes a grade entry

#### Schedules

- **GET /api/schedules/{studentId}**
  - Returns schedule for a specific student

- **POST /api/schedules**
  - Creates a new schedule entry
  - Parameters: `studentId`, `subject`, `startTime`, `endTime`, `dayOfWeek`, `room`, `semester`, `isActive`

- **PUT /api/schedules/{id}**
  - Updates an existing schedule entry

- **DELETE /api/schedules/{id}**
  - Removes a schedule entry

#### Admin

- **GET /api/admin/stats**
  - Returns system statistics (admin only)

### Data Models

#### User Model
```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string Role { get; set; } // "Student", "Teacher", "Admin"
}
```

#### Student Model
```csharp
public class Student
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string GradeLevel { get; set; }
    public string ProfileImageUrl { get; set; }
}
```

#### Grade Model
```csharp
public class Grade
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string Subject { get; set; }
    public int Score { get; set; }
    public int MaxScore { get; set; }
    public int GradeType { get; set; } // 0: Homework, 1: Quiz, etc.
    public string Semester { get; set; }
    public DateTime Date { get; set; }
    public string Comments { get; set; }
}
```

#### Schedule Model
```csharp
public class Schedule
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string Subject { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public string Room { get; set; }
    public string Semester { get; set; }
    public bool IsActive { get; set; }
}
```

### Authentication & Security

The back-end implements several security measures:

1. **JWT Authentication**
   - Tokens issued on successful login
   - Claims-based authorization for role management
   - Token expiration and refresh mechanisms

2. **Password Security**
   - Passwords stored using bcrypt hashing
   - Minimum password complexity requirements
   - Secure password reset workflow

3. **Authorization Policies**
   - Role-based access control to endpoints
   - Resource-based authorization for specific operations
   - Data filtering based on user context

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- .NET Core SDK (v6.0 or higher)
- SQL Server (2019 or higher)
- Git

### Front-End Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/student-portal.git
   ```

2. Navigate to the front-end directory:
   ```bash
   cd student-portal
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file with configuration:
   ```
   REACT_APP_API_URL=http://localhost:5267/api
   ```

5. Start the development server:
   ```bash
   npm start
   ```

### Back-End Setup

1. Navigate to the back-end directory:
   ```bash
   cd StudentPortal.API
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Update the database connection string in `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=StudentPortal;Trusted_Connection=True;"
   }
   ```

4. Apply database migrations:
   ```bash
   dotnet ef database update
   ```

5. Run the API:
   ```bash
   dotnet run
   ```

## User Guide

### Student Role

Students can:

1. **View Dashboard**
   - See quick statistics and announcements
   - Access recent grades and activities

2. **Manage Profile**
   - Update personal information
   - Change password and email

3. **View Grades**
   - See grades organized by subject
   - Track performance over time

4. **Manage Schedule**
   - View weekly class schedule
   - Add/edit personal schedule entries

### Teacher Role

Teachers can:

1. **View Student Information**
   - Access student profiles and performance data

2. **Manage Grades**
   - Add new grades for students
   - Edit or remove existing grades
   - Add comments and feedback

3. **Update Profile**
   - Manage personal information and credentials

### Admin Role

Administrators can:

1. **Manage Users**
   - Create new user accounts
   - Edit user information
   - Delete users when necessary
   - Reset user passwords

2. **Configure System**
   - Update system settings
   - Monitor system statistics
   - View activity logs

3. **Manage Site**
   - Control registration settings
   - Configure email notifications
   - Enable/disable features

## Future Enhancements

Planned features for future development:

1. **Advanced Analytics Dashboard**
   - Performance trend visualization
   - Attendance tracking graphs
   - Comparative statistics

2. **Messaging System**
   - Direct communication between students and teachers
   - Group discussions and announcements

3. **File Storage and Sharing**
   - Upload/download assignments and materials
   - Resource library for course materials

4. **Mobile Application**
   - Native mobile experience for Android and iOS
   - Push notifications for grades and announcements

5. **Calendar Integration**
   - Visual calendar for classes and assignments
   - Integration with external calendar services

6. **Attendance Tracking**
   - QR code-based attendance system
   - Automated attendance reporting

7. **Theme Customization**
   - Light/dark mode support
   - Custom color themes for institutions 