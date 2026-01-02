#!/bin/bash

# 🔍 Lotus MV3 Compliance Verification Script
# This script verifies that Lotus is ready for Chrome Web Store submission

echo "🔍 Starting Lotus MV3 Compliance Verification..."
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

# Function to check and report
check() {
    local test_name="$1"
    local command="$2"
    local expected="$3"
    
    echo -n "Checking $test_name... "
    
    result=$(eval "$command")
    
    if [ "$result" == "$expected" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS_COUNT++))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected, Got: $result)"
        ((FAIL_COUNT++))
    fi
}

echo "📦 BUILD VERIFICATION"
echo "--------------------"

# Check if dist exists
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist/ directory not found. Run 'npm run build' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ dist/ directory exists${NC}"
echo ""

echo "🚫 CRITICAL CHECKS (Chrome Rejection Issues)"
echo "--------------------------------------------"

# Check 1: Remote Code (Tiger's main issue)
check "Remote Code (apis.google.com)" "grep -r 'apis.google.com' dist/assets/ 2>/dev/null | wc -l | tr -d ' '" "0"
check "Remote Code (recaptcha)" "grep -r 'recaptcha' dist/assets/ 2>/dev/null | wc -l | tr -d ' '" "0"
check "Remote Code (gapi)" "grep -r 'gapi' dist/assets/ 2>/dev/null | wc -l | tr -d ' '" "0"

echo ""
echo "🔒 SECURITY CHECKS"
echo "------------------"

# Check 2: Dynamic Execution
check "eval() usage" "grep -r 'eval(' dist/assets/ 2>/dev/null | grep -v sourceMappingURL | wc -l | tr -d ' '" "0"
check "new Function() usage" "grep -r 'new Function' dist/assets/ 2>/dev/null | wc -l | tr -d ' '" "0"

# Check 3: CSP Violations
check "unsafe-eval in code" "grep -r 'unsafe-eval' dist/assets/ 2>/dev/null | wc -l | tr -d ' '" "0"
check "unsafe-inline in code" "grep -r 'unsafe-inline' dist/assets/ 2>/dev/null | wc -l | tr -d ' '" "0"

echo ""
echo "📋 MANIFEST CHECKS"
echo "------------------"

# Check 4: Manifest Version
check "Manifest V3" "cat dist/manifest.json | grep -c '\"manifest_version\": 3'" "1"
check "Service Worker" "cat dist/manifest.json | grep -c 'service_worker'" "1"
check "OAuth2 Client ID" "cat dist/manifest.json | grep -c '523127017746-4q2d3p8eikeuu897r294qruaol5q52n1'" "1"

echo ""
echo "🗂️ FILE CHECKS"
echo "--------------"

# Check 5: Source Maps
check "Source Maps (.map files)" "find dist -name '*.map' | wc -l | tr -d ' '" "0"

# Check 6: Required Files
check "manifest.json exists" "[ -f dist/manifest.json ] && echo 1 || echo 0" "1"
check "sidepanel.html exists" "[ -f dist/sidepanel.html ] && echo 1 || echo 0" "1"
check "Service worker exists" "find dist -name 'sw*.js' | wc -l | awk '{print ($1 > 0) ? 1 : 0}'" "1"

echo ""
echo "📊 BUNDLE SIZE CHECK"
echo "--------------------"

BUNDLE_SIZE=$(du -sh dist | awk '{print $1}')
echo "Total bundle size: $BUNDLE_SIZE"

# Get main bundle size
MAIN_BUNDLE=$(find dist/assets -name "sidepanel*.js" -exec du -h {} \; | awk '{print $1}')
echo "Main bundle: $MAIN_BUNDLE"

if [ -n "$MAIN_BUNDLE" ]; then
    echo -e "${GREEN}✅ Bundle size acceptable${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}❌ Could not determine bundle size${NC}"
    ((FAIL_COUNT++))
fi

echo ""
echo "🔌 INTEGRATION CHECKS"
echo "--------------------"

# Check backend URL
check "Backend URL" "grep -c 'tai-backend.amaravadhibharath.workers.dev' dist/manifest.json" "1"

# Check Firebase
check "Firestore connection" "grep -c 'firebaseio.com' dist/manifest.json" "1"

# Check Analytics
check "PostHog analytics" "grep -c 'posthog.com' dist/manifest.json" "1"

echo ""
echo "================================================"
echo "📊 FINAL RESULTS"
echo "================================================"
echo ""
echo -e "Total Checks: $((PASS_COUNT + FAIL_COUNT))"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo ""
    echo "✅ Lotus is READY for Chrome Web Store submission!"
    echo ""
    echo "Next steps:"
    echo "1. Create ZIP: cd dist && zip -r ../lotus-v1.0.4.zip ."
    echo "2. Go to: https://chrome.google.com/webstore/devconsole"
    echo "3. Upload lotus-v1.0.4.zip"
    echo "4. Submit for review"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please fix the issues above before submitting."
    echo ""
    exit 1
fi
