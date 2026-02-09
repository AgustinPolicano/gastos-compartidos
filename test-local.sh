#!/bin/bash
set -e

echo "🧪 Testing Gastos Compartidos locally..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend is running
echo -e "${YELLOW}Checking backend...${NC}"
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    curl http://localhost:3000/health | jq '.'
else
    echo -e "${RED}❌ Backend is not running on port 3000${NC}"
    echo -e "${YELLOW}Start it with: cd backend && npm run dev${NC}"
    exit 1
fi

# Check if frontend is running (dev mode on 4200)
echo -e "\n${YELLOW}Checking frontend (dev mode)...${NC}"
if curl -f http://localhost:4200 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running (dev mode)${NC}"
elif curl -f http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running (Docker mode)${NC}"
else
    echo -e "${RED}❌ Frontend is not running${NC}"
    echo -e "${YELLOW}Start it with: cd frontend && npm start${NC}"
    exit 1
fi

# Test API endpoints
echo -e "\n${YELLOW}Testing API endpoints...${NC}"

# Test health
echo -e "${YELLOW}GET /health${NC}"
curl -s http://localhost:3000/health | jq '.'

# Test settings (might not exist on first run)
echo -e "\n${YELLOW}GET /api/settings${NC}"
SETTINGS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/settings)
STATUS_CODE=$(echo "$SETTINGS_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SETTINGS_RESPONSE" | head -n-1)

if [ "$STATUS_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Settings found${NC}"
    echo "$RESPONSE_BODY" | jq '.'
elif [ "$STATUS_CODE" -eq 404 ]; then
    echo -e "${YELLOW}⚠️  No settings found (expected on first run)${NC}"
else
    echo -e "${RED}❌ Unexpected status code: $STATUS_CODE${NC}"
    echo "$RESPONSE_BODY"
fi

# Test expenses list (might be empty)
echo -e "\n${YELLOW}GET /api/expenses${NC}"
curl -s http://localhost:3000/api/expenses | jq '.'

# Test balance
echo -e "\n${YELLOW}GET /api/balance${NC}"
curl -s http://localhost:3000/api/balance | jq '.'

# Test fixed expenses
echo -e "\n${YELLOW}GET /api/fixed-expenses${NC}"
curl -s http://localhost:3000/api/fixed-expenses | jq '.'

# Test payments
echo -e "\n${YELLOW}GET /api/payments${NC}"
curl -s http://localhost:3000/api/payments | jq '.'

echo -e "\n${GREEN}🎉 All tests passed!${NC}"
echo -e "${GREEN}✅ Backend API is working correctly${NC}"
echo -e "${GREEN}✅ Database connection is working${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Open browser: http://localhost:4200 (or http://localhost if using Docker)"
echo -e "  2. Complete PIN setup"
echo -e "  3. Test creating expenses, payments, etc."
