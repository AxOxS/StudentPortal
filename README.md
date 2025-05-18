# StudentPortal

A comprehensive student management system with a React frontend and .NET Core backend.

## Project Overview

The StudentPortal is a full-stack web application designed to manage student information, courses, and academic records. It consists of:

- **Frontend**: React application with React Router for navigation and Tailwind CSS for styling
- **Backend**: .NET 8 API with Entity Framework Core for database operations and JWT authentication

## Technologies Used

### Frontend
- React 19
- React Router 7
- Axios for API requests
- Tailwind CSS for styling
- JWT handling for authentication

### Backend
- .NET 8
- Entity Framework Core 9 with SQL Server
- JWT Authentication
- BCrypt for password hashing
- Swagger for API documentation

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or SQL Server Express)
- IDE of your choice (Visual Studio, VS Code, etc.)

## Project Setup

### Backend Setup

1. Navigate to the API project directory:
   ```
   cd StudentPortal.API
   ```

2. Create your configuration files:
   - Copy appsettings.template.json to appsettings.json
   - Copy secrets.json.example to secrets.json (or use dotnet user-secrets)
   - Update the database connection string and JWT settings in both files

3. Apply database migrations:
   ```
   dotnet ef database update
   ```

4. Run the API:
   ```
   dotnet run
   ```
   The API will be available at https://localhost:7001 (HTTPS) or http://localhost:5155 (HTTP)

### Frontend Setup

1. Navigate to the frontend project directory:
   ```
   cd student-portal
   ```

2. Create your environment configuration:
   ```
   cp .env.example .env
   ```
   Then update the values in `.env` as needed.

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```
   The application will be available at http://localhost:3000

## Configuration

### Backend Configuration

Create an `appsettings.json` file based on the template provided:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",

  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=YOUR_DATABASE;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  },

  "Jwt": {
    "Key": "YOUR_JWT_KEY_HERE",
    "Issuer": "YOUR_ISSUER",
    "Audience": "YOUR_AUDIENCE"
  }
}
```

For security, generate a strong random key for the JWT:Key parameter.

### Frontend Configuration

The frontend is configured to connect to the backend API running on the default ports. If you need to change the API URL, update the axios configuration in the application.

## Development Workflow

1. Run both frontend and backend applications
2. Make changes to the codebase as needed
3. Test your changes locally
4. Commit and push to your repository

## Version Control

This project includes a `.gitattributes` file to ensure consistent line endings across different operating systems and to properly handle binary files. This helps prevent unnecessary merge conflicts and ensures proper handling of different file types.

## Building for Production

### Backend
```
cd StudentPortal.API
dotnet publish -c Release
```

### Frontend
```
cd student-portal
npm run build
```