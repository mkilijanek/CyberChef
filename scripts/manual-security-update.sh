#!/bin/bash
# Manual Dependency Security Update Script
# Run this when npm audit fix fails due to network restrictions

set -e

echo "🔒 Manual Security Dependency Updates"
echo "======================================"
echo ""
echo "This script manually updates vulnerable dependencies"
echo "identified in npm audit to their secure versions."
echo ""

# Backup package files
echo "📋 Creating backup..."
cp package.json package.json.backup.$(date +%Y%m%d_%H%M%S)
cp package-lock.json package-lock.json.backup.$(date +%Y%m%d_%H%M%S)

echo "✅ Backup created"
echo ""

# Critical vulnerabilities (must fix)
echo "🔴 Installing CRITICAL security updates..."
echo ""

echo "1/5 crypto-js: Fixing PBKDF2 weakness..."
npm install crypto-js@^4.2.0 --save 2>/dev/null || echo "⚠️  Failed to update crypto-js"

echo "2/5 form-data: Fixing unsafe random boundary..."
npm install form-data@^4.0.4 --save-dev 2>/dev/null || echo "⚠️  Failed to update form-data"

echo "3/5 jsonpath-plus: Fixing RCE vulnerability..."
npm install jsonpath-plus@^10.2.0 --save 2>/dev/null || echo "⚠️  Failed to update jsonpath-plus"

echo "4/5 pbkdf2: Fixing Uint8Array input issue..."
npm install pbkdf2@^3.1.3 --save 2>/dev/null || echo "⚠️  Failed to update pbkdf2"

echo "5/5 sha.js: Fixing type check bypass..."
npm install sha.js@^2.4.12 --save 2>/dev/null || echo "⚠️  Failed to update sha.js"

echo ""
echo "🟠 Installing HIGH severity updates..."
echo ""

echo "1/6 axios: Fixing DoS vulnerability..."
npm install axios@^1.12.0 --save 2>/dev/null || echo "⚠️  Failed to update axios"

echo "2/6 glob: Fixing command injection..."
npm install glob@^10.5.0 --save-dev 2>/dev/null || echo "⚠️  Failed to update glob"

echo "3/6 jsonwebtoken: Fixing unrestricted key type..."
npm install jsonwebtoken@^9.0.0 --save 2>/dev/null || echo "⚠️  Failed to update jsonwebtoken"

echo "4/6 jws: Fixing HMAC signature verification..."
npm install jws@^3.2.3 --save 2>/dev/null || echo "⚠️  Failed to update jws"

echo "5/6 node-forge: Fixing unbounded recursion..."
npm install node-forge@^1.3.2 --save 2>/dev/null || echo "⚠️  Failed to update node-forge"

echo "6/6 ws: Fixing DoS with many headers..."
npm install ws@^8.0.0 --save 2>/dev/null || echo "⚠️  Failed to update ws"

echo ""
echo "🟡 Installing MODERATE severity updates..."
echo ""

echo "1/3 @babel/runtime: Fixing ReDoS..."
npm install @babel/runtime@^7.26.10 --save 2>/dev/null || echo "⚠️  Failed to update @babel/runtime"

echo "2/3 webpack-dev-server: Fixing source code theft..."
npm install webpack-dev-server@^5.2.2 --save-dev 2>/dev/null || echo "⚠️  Failed to update webpack-dev-server"

echo "3/3 tmp: Fixing symlink vulnerability..."
npm install tmp@^0.2.5 --save-dev 2>/dev/null || echo "⚠️  Failed to update tmp"

echo ""
echo "🔍 Running post-update audit..."
npm audit --json > audit-post-update.json 2>/dev/null || true

# Generate report
python3 <<'PYTHON'
import json
import sys

try:
    with open('audit-post-update.json') as f:
        data = json.load(f)

    meta = data.get('metadata', {}).get('vulnerabilities', {})

    print("\n📊 UPDATED VULNERABILITY STATUS")
    print("=" * 50)
    print(f"🔴 Critical: {meta.get('critical', 0)}")
    print(f"🟠 High:     {meta.get('high', 0)}")
    print(f"🟡 Moderate: {meta.get('moderate', 0)}")
    print(f"⚪ Low:      {meta.get('low', 0)}")
    print(f"📦 Total:    {meta.get('total', 0)}")
    print("=" * 50)

    if meta.get('critical', 0) == 0 and meta.get('high', 0) == 0:
        print("\n✅ All critical and high vulnerabilities resolved!")
        sys.exit(0)
    else:
        print(f"\n⚠️  Still have {meta.get('critical', 0)} critical and {meta.get('high', 0)} high vulnerabilities")
        print("   These may require manual intervention or are unfixable.")
        sys.exit(1)

except FileNotFoundError:
    print("\n⚠️  Could not generate post-update report")
    print("   Run: npm audit")
    sys.exit(2)
PYTHON

audit_exit=$?

echo ""
echo "📝 Next steps:"
if [ $audit_exit -eq 0 ]; then
    echo "  ✅ Run tests: npm test"
    echo "  ✅ Build: npm run build"
    echo "  ✅ Commit changes"
elif [ $audit_exit -eq 1 ]; then
    echo "  ⚠️  Review unfixable vulnerabilities"
    echo "  ⚠️  Check CODEQL_FINDINGS_ASSESSMENT.md"
    echo "  ⚠️  Consider alternative packages if needed"
else
    echo "  ⚠️  Run: npm audit"
    echo "  ⚠️  Review output manually"
fi

echo ""
echo "🔄 Rollback if needed:"
echo "   mv package.json.backup.* package.json"
echo "   mv package-lock.json.backup.* package-lock.json"
echo "   npm install"
echo ""
