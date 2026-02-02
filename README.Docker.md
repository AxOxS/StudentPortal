# Docker Setup Guide

This project uses Docker to simplify development and deployment.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Compose)
- Git

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd StudentPortal
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

   This will:
   - Start SQL Server container
   - Build and start the .NET API
   - Build and start the React frontend
   - Create a network for all services to communicate

3. **Run database migrations** (first time only):
   ```bash
   docker-compose exec api dotnet ef database update
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - API: http://localhost:5000
   - API Swagger: http://localhost:5000/swagger (if enabled)

## Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db
```

### Rebuild after code changes
```bash
# Rebuild specific service
docker-compose up -d --build api
docker-compose up -d --build web

# Rebuild all
docker-compose up -d --build
```

### Run migrations
```bash
docker-compose exec api dotnet ef database update
```

### Access database
```bash
# Using SQL Server Management Studio or Azure Data Studio
Server: localhost,1433
User: sa
Password: YourStrong@Passw0rd
Database: StudentPortal
```

### Clean up everything (including volumes)
```bash
docker-compose down -v
```

### Execute commands in containers
```bash
# API container
docker-compose exec api bash

# Database container
docker-compose exec db /bin/bash
```

## Environment Variables

The default configuration uses environment variables in `docker-compose.yml`. To customize:

1. Create a `.env` file in the root directory
2. Override any variables:
   ```env
   SA_PASSWORD=YourCustomPassword123!
   API_PORT=5001
   WEB_PORT=8080
   ```

## Troubleshooting

### Database connection issues
- Wait for SQL Server to fully start (takes ~30 seconds on first run)
- Check logs: `docker-compose logs db`
- Verify health: `docker-compose ps`

### Port conflicts
If ports 3000, 5000, or 1433 are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "3001:80"  # Change left side to available port
```

### API not connecting to database
- Ensure database container is healthy: `docker-compose ps`
- Check connection string in `docker-compose.yml`
- Run migrations: `docker-compose exec api dotnet ef database update`

### Frontend can't reach API
- API should be accessible at http://api:5000 from within containers
- From browser (outside containers), use http://localhost:5000

## Development Workflow

### With hot reload (recommended for active development)
For the best development experience, you might want to run services locally:
- Run only the database in Docker: `docker-compose up db -d`
- Run API locally: `dotnet run` (in StudentPortal.API folder)
- Run frontend locally: `npm start` (in student-portal folder)

### Full Docker workflow
1. Make code changes
2. Rebuild affected service: `docker-compose up -d --build api`
3. View logs: `docker-compose logs -f api`

## Production Deployment

For production, you should:
1. Use production-grade secrets (not hardcoded in docker-compose.yml)
2. Use environment-specific configuration files
3. Consider using Docker Swarm or Kubernetes
4. Set up proper SSL/TLS certificates
5. Use a managed database service instead of containerized SQL Server

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [.NET Docker Images](https://hub.docker.com/_/microsoft-dotnet)
- [SQL Server Docker Images](https://hub.docker.com/_/microsoft-mssql-server)
