
# School Admission System

A web-based school admission system built with React, ASP.NET Core Web API (.NET 8), and PostgreSQL. It supports class management, admission seat reservations, temporary seat holds, and admission confirmation.

## Technology Stack

- Frontend: React, Vite
- Backend: ASP.NET Core Web API (.NET 8)
- Database: PostgreSQL
- ORM: Entity Framework Core
- Containerization: Docker and Docker Compose
- Automated Testing: xUnit

## Features

### Guardian
- View available classes and seat counts.
- Apply for admission using a 17-digit Birth Registration Number.
- Provide student and guardian information.
- Temporarily reserve an available seat.
- Confirm admission through the simulated payment button.
- View admission records.
- Cancel an active reservation.

### Admin
- Access the admin panel.
- Create classes with a name, shift, and seat capacity.
- View the available classes.

### Admission Rules
- Admissions follow First-Come, First-Served (FCFS).
- Each class and shift combination has an independent seat capacity.
- A temporary hold reserves a seat for 10 minutes.
- An expired hold releases its seat.
- A confirmed admission permanently occupies a seat.
- Concurrent reservation requests are protected using database transactions and row-level locking.

## Requirements

- Docker
- Docker Compose

## Run the Project with Docker

1. Clone the repository:

   ```bash
   git clone https://github.com/Niaz-r/School-Admission-System.git
   cd School-Admission-System
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

3. Open `.env` and change `POSTGRES_PASSWORD` to a secure password.

4. Start the application:

   ```bash
   sudo docker compose up -d --build
   ```

   Docker Compose starts PostgreSQL, the backend, and the frontend. The backend automatically applies pending database migrations.

5. Open the application:

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - Swagger (API documentation): http://localhost:8080/swagger

To stop the application:

```bash
sudo docker compose down
```

To stop the application without deleting the database volume, use the command above. Do not use `docker compose down -v` if you want to preserve database data.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/classes` | Get all classes and seat counts |
| POST | `/classes` | Create a class |
| GET | `/classes/{classId}` | Get class details |
| POST | `/classes/{classId}/holds` | Create an admission hold |
| GET | `/holds/{holdId}` | Get a hold |
| POST | `/holds/{holdId}/confirm` | Confirm an admission |
| DELETE | `/holds/{holdId}` | Cancel an admission hold |
| GET | `/me/holds` | Get the current student's holds |

Student-specific endpoints use the `X-Student-Id` request header. Its value must contain exactly 17 digits.

## Automated Tests

The test project is located at:

`backend/SchoolAdmission.Tests`

The tests use a separate PostgreSQL database named `school_admission_test` to avoid modifying the application database.

After starting Docker Compose, create the test database:

```bash
sudo docker exec school-postgres psql -U schooladmin -d postgres -c "CREATE DATABASE school_admission_test;"
```

Configure the API project's User Secret with the local PostgreSQL connection string (use the same password configured in `.env`):

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=school_admission;Username=schooladmin;Password=YOUR_PASSWORD" --project backend/SchoolAdmission.Api
```

Run the tests:

```bash
cd backend
dotnet test SchoolAdmission.Tests
```

The tests cover invalid student IDs, duplicate applications, and concurrent reservations against a one-seat class.

## Project Structure

```text
School-Admission-System/
├── backend/
│   ├── SchoolAdmission.Api/
│   ├── SchoolAdmission.Tests/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── README.md
├── ASSUMPTIONS.md
└── AI_USAGE.md
```

## Repository

GitHub: https://github.com/Niaz-r/School-Admission-System
