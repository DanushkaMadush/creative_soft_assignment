# Fish Farm Management System

The repository contains:

- A `React + Vite + TypeScript` frontend in [`frontend`](./frontend)
- An `ASP.NET Core 8 Web API` backend in [`backend`](./backend)
- A test project in [`backend.Testings`](./backend.Testings)

## Overview

This system supports the core workflows needed for a small fish farm management portal:

- List fish farms with search, filters, and pagination
- Create new fish farms with image upload
- View farm details and the employees assigned to a farm
- List employees with search, farm filter, role filter, status filter, and pagination
- Create new employees with optional image upload
- View employee details

The backend uses SQL Server with Entity Framework Core and stores uploaded images under `wwwroot/uploads`. The frontend consumes the API with Axios and renders the UI using Material UI.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Material UI
- React Router
- Axios

### Backend

- ASP.NET Core 8 Web API
- Entity Framework Core 8
- SQL Server
- Swagger / OpenAPI

### Testing

- NUnit

## Implemented Features

### Fish farms

- `GET /api/v1/fish-farms`
  Supports:
  - `searchTerm`
  - `hasBarge`
  - `isActive`
  - `pageNumber`
  - `pageSize`
- `GET /api/v1/fish-farms/{id}`
- `POST /api/v1/fish-farms`
  - `multipart/form-data`
  - requires image upload
- `PUT /api/v1/fish-farms/{id}`
  - `multipart/form-data`
  - supports replacing the farm image
- `DELETE /api/v1/fish-farms/{id}`
  - soft delete by setting `IsActive = false`
- `GET /api/v1/fish-farms/{id}/employees`
  - returns active employees assigned to that farm

### Employees

- `GET /api/v1/employees`
  Supports:
  - `searchTerm`
  - `fishFarmId`
  - `roleId`
  - `isActive`
  - `pageNumber`
  - `pageSize`
- `GET /api/v1/employees/{id}`
- `POST /api/v1/employees`
  - `multipart/form-data`
  - image is optional
- `PUT /api/v1/employees/{id}`
  - `multipart/form-data`
- `DELETE /api/v1/employees/{id}`
  - soft delete by setting `IsActive = false`

### Roles

- `GET /api/v1/roles`
- `POST /api/v1/roles`

## Current UI Coverage

The frontend currently includes:

- Mock login page at `/login`
- Placeholder home page at `/`
- Farm management screens:
  - `/farms`
  - `/farms/add`
  - `/farms/:id`
- Employee management screens:
  - `/employees`
  - `/employees/add`
  - `/employees/:id`

## Project Structure

```text
creative_soft_assignment/
|-- backend/                 ASP.NET Core Web API
|   |-- Controllers/         API endpoints
|   |-- Data/                EF Core DbContext
|   |-- Migrations/          EF Core migrations
|   |-- Models/
|   |   |-- DTOs/            Request/response DTOs
|   |   `-- Entities/        Database entities
|   `-- Services/            Business logic and image handling
|
|-- backend.Testings/        Unit and integration tests
|
`-- frontend/                React application
    |-- src/
    |   |-- api/             Axios API clients
    |   |-- components/      Shared UI components
    |   |-- layouts/         Page layouts
    |   |-- pages/           Feature pages
    |   |-- routes/          Router configuration
    |   `-- types/           TypeScript models
    `-- public/              Static assets
```

## Setup

### Prerequisites

- Node.js 20+ recommended
- npm
- .NET 8 SDK
- SQL Server or SQL Server Express

### 1. Configure the backend

The backend currently uses this connection string in [`backend/appsettings.json`](./backend/appsettings.json):

```json
"FarmsDbConnection": "Server=ServerName;Database=FarmsDb;Trusted_Connection=True;TrustServerCertificate=True;"
```

Update it to match SQL Server instance.

Apply migrations:

```powershell
cd backend
dotnet ef database update
```

If `dotnet ef` is not installed:

```powershell
dotnet tool install --global dotnet-ef
```

### 2. Start the backend

```powershell
cd backend
dotnet run
```

Useful URLs:

- Swagger UI: `https://localhost:<port>/swagger`
- API base URL: `https://localhost:<port>`

### 3. Configure the frontend

Create `frontend/.env` with:

```env
VITE_API_BASE_URL=https://localhost:5001
```

Replace the URL with the actual backend URL shown when the API starts.

### 4. Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

The app will usually be available at `http://localhost:5173`.

## Build and Test

### Frontend

```powershell
cd frontend
npm run build
```

Status:

- Verified in this workspace: `npm run build` succeeded
- Vite reported a large bundle warning for the main client chunk

### Backend tests

```powershell
dotnet test backend.Testings/backend.Testings.csproj
```

Included coverage:

- Unit tests for `FishFarmService`
- Integration tests for `FishFarmController`

Status in this environment:

- Test execution could not be completed here because NuGet restore requires network access to `api.nuget.org`

## Frontend Pages

### Farm pages

- `ManageFarms`
  - search by name
  - filter by barge status
  - filter by active/inactive
  - paginate results
- `AddNewFarm`
  - validates coordinates, cage count, and required image
- `ViewFarm`
  - shows farm details
  - lists employees assigned to the farm

### Employee pages

- `ManageEmployees`
  - search by name or email
  - filter by farm
  - filter by role
  - filter by active/inactive
  - paginate results
- `AddNewEmployee`
  - validates farm, role, email, age, certification date, and optional image
- `ViewEmployee`
  - shows employee profile and related farm/role data

## Backend Architecture

- Controllers handle HTTP requests and responses
- Services contain business logic
- `AppDbContext` maps entities and database constraints
- DTOs shape API input and output
- `ImageUploadService` stores uploaded files in:
  - `wwwroot/uploads/fish_farms`
  - `wwwroot/uploads/employees`

Static files are exposed by `app.UseStaticFiles()`, so stored upload paths can be requested directly from the browser through the backend base URL.

## Known Limitations

- Login is UI-only and does not authenticate users.
- The home page is still a placeholder.
- There is no role management UI.
- There are backend update and delete endpoints, but no frontend edit/delete flows yet.
- CORS is currently configured as fully open with `AllowAnyOrigin`, `AllowAnyMethod`, and `AllowAnyHeader`.
- Environment-specific secrets and connection strings are still stored in local config rather than safer environment-based configuration.

## Suggested Next Improvements

- Add real authentication and route protection
- Add edit and soft-delete actions to the frontend
- Add role management pages
- Add backend validation/error handling middleware for cleaner API responses
- Add more unit and integration tests for employee and role flows
- Add frontend code splitting to reduce the large production bundle
- Add `.env.example` and deployment-ready configuration

## Repository Notes

- The backend solution file is [`backend/backend.sln`](./backend/backend.sln)
- The repository-level README was generated from the current codebase state, not from assumptions

## Screenshots

<img width="1886" height="890" alt="image" src="https://github.com/user-attachments/assets/d2b2414c-3ff8-4528-a57f-e3898a6207bf" />
<img width="1884" height="889" alt="image" src="https://github.com/user-attachments/assets/b2faa372-897f-475d-ab03-25eabc15c32b" />

