#!/bin/bash
set -e

echo "🚀 Desplegando Gastos Compartidos..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}Creá un archivo .env basado en .env.example${NC}"
    exit 1
fi

# Source .env
export $(cat .env | grep -v '^#' | xargs)

# Validate required variables
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set in .env${NC}"
    exit 1
fi

if [ -z "$API_URL" ]; then
    echo -e "${YELLOW}⚠️  Warning: API_URL not set, using default http://localhost:3000${NC}"
fi

if [ -z "$CORS_ORIGIN" ]; then
    echo -e "${YELLOW}⚠️  Warning: CORS_ORIGIN not set, allowing all origins${NC}"
fi

echo -e "${GREEN}✅ Environment variables loaded${NC}"

# Stop existing containers
echo -e "\n${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Build images
echo -e "\n${YELLOW}🔨 Building Docker images...${NC}"
docker-compose build --no-cache

# Start containers
echo -e "\n${YELLOW}🚀 Starting containers...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "\n${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check backend health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker-compose logs backend
    exit 1
fi

# Check frontend health
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker-compose logs frontend
    exit 1
fi

echo -e "\n${GREEN}🎉 Deployment successful!${NC}"
echo -e "${GREEN}📱 Frontend: http://localhost${NC}"
echo -e "${GREEN}🔌 Backend: http://localhost:3000${NC}"
echo -e "${GREEN}📊 Backend Health: http://localhost:3000/health${NC}"
echo -e "\n${YELLOW}Para ver logs: docker-compose logs -f${NC}"
echo -e "${YELLOW}Para detener: docker-compose down${NC}"
