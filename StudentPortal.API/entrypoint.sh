#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 10

echo "Running database migrations..."
cd /src
dotnet tool restore 2>/dev/null || true
dotnet ef database update --configuration Release

echo "Starting application..."
cd /app
exec dotnet StudentPortal.API.dll
