#!/bin/bash
# Security Fix Script for CyberChef
# This script updates vulnerable dependencies identified in the security audit

set -e  # Exit on error

echo "🔒 CyberChef Security Auto-Fix"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the CyberChef root directory.${NC}"
    exit 1
fi

# Backup package-lock.json
echo -e "${YELLOW}📋 Creating backup of package-lock.json...${NC}"
if [ -f "package-lock.json" ]; then
    cp package-lock.json package-lock.json.backup
    echo -e "${GREEN}✓ Backup created: package-lock.json.backup${NC}"
else
    echo -e "${YELLOW}⚠ No package-lock.json found, skipping backup${NC}"
fi

echo ""
echo -e "${YELLOW}📦 Updating critical security dependencies...${NC}"
echo ""

# Update @babel packages (ReDoS vulnerability)
echo "1. Updating @babel/runtime (GHSA-968p-4wvh-cqc8)..."
npm install @babel/runtime@^7.26.10 || echo -e "${RED}Failed to update @babel/runtime${NC}"

echo "2. Updating @babel/helpers (GHSA-968p-4wvh-cqc8)..."
npm install --save-dev @babel/helpers@^7.26.10 || echo -e "${RED}Failed to update @babel/helpers${NC}"

# Update webpack-dev-server (Source code theft vulnerability)
echo "3. Updating webpack-dev-server (GHSA-9jgg-88mc-972h)..."
npm install --save-dev webpack-dev-server@^5.2.2 || echo -e "${RED}Failed to update webpack-dev-server${NC}"

# Update tmp (Symlink vulnerability)
echo "4. Updating tmp (GHSA-52f5-9888-hmc6)..."
npm install --save-dev tmp@^0.2.5 || echo -e "${RED}Failed to update tmp${NC}"

# Update bcryptjs (Recommended update)
echo "5. Updating bcryptjs (recommended)..."
npm install bcryptjs@^3.0.3 || echo -e "${RED}Failed to update bcryptjs${NC}"

echo ""
echo -e "${YELLOW}🔍 Running npm audit fix...${NC}"
npm audit fix || echo -e "${YELLOW}⚠ npm audit fix completed with warnings${NC}"

echo ""
echo -e "${YELLOW}📊 Final security audit:${NC}"
echo "================================"
npm audit || true

echo ""
echo -e "${GREEN}✅ Security fixes applied!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Please test the application thoroughly before deploying.${NC}"
echo ""
echo "Next steps:"
echo "  1. Run: npm test"
echo "  2. Run: npm run build"
echo "  3. Test all critical functionality"
echo ""
echo "If you encounter any issues, restore the backup:"
echo "  mv package-lock.json.backup package-lock.json"
echo "  npm install"
echo ""
