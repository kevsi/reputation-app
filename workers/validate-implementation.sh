#!/bin/bash
# 🚀 Script de Validation du Refactoring
# 
# Exécuter tous les tests de validation après l'implémentation
# Usage: bash validate-implementation.sh

set -e

echo ""
echo "================================================================================"
echo "🚀 VALIDATION DU REFACTORING - SYSTÈME DE COLLECTORS"
echo "================================================================================"
echo ""

# 1. Vérifier la compilation TypeScript
echo "1️⃣  Checking TypeScript compilation..."
echo "   Running: npx tsc --noEmit src/config/collectors.config.ts src/collectors/base.collector.ts"

if npx tsc --noEmit src/config/collectors.config.ts src/collectors/base.collector.ts 2>/dev/null; then
  echo "   ✅ TypeScript compilation SUCCESS"
else
  echo "   ❌ TypeScript compilation FAILED"
  exit 1
fi

echo ""

# 2. Vérifier que les fichiers existent
echo "2️⃣  Checking that all files exist..."

files=(
  "src/config/collectors.config.ts"
  "src/collectors/base.collector.ts"
  "src/collectors/index.ts"
  "src/collectors/news.collector.ts"
  "src/processors/scraping.processor.ts"
  "src/scripts/validate-sources.ts"
  "REFACTORING_PLAN.md"
  "IMPLEMENTATION_SUMMARY.md"
  "USAGE_GUIDE.md"
  "COMPLETION_SUMMARY.md"
  "FILES_CHANGES.md"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file (NOT FOUND)"
    all_exist=false
  fi
done

if [ "$all_exist" = false ]; then
  echo ""
  echo "   ❌ Some files are missing!"
  exit 1
fi

echo ""

# 3. Vérifier les imports
echo "3️⃣  Checking imports..."
echo "   Verifying collectors.config.ts imports..."

if grep -q "export function isCollectorEnabled" src/config/collectors.config.ts; then
  echo "   ✅ isCollectorEnabled exported"
else
  echo "   ❌ isCollectorEnabled not found"
  exit 1
fi

if grep -q "export type CollectorType" src/config/collectors.config.ts; then
  echo "   ✅ CollectorType exported"
else
  echo "   ❌ CollectorType not found"
  exit 1
fi

echo ""

# 4. Vérifier les modifications dans base.collector.ts
echo "4️⃣  Checking CollectorFactory modifications..."

if grep -q "initialize()" src/collectors/base.collector.ts; then
  echo "   ✅ initialize() method exists"
else
  echo "   ❌ initialize() method not found"
  exit 1
fi

if grep -q "registerCollector" src/collectors/base.collector.ts; then
  echo "   ✅ registerCollector() method exists"
else
  echo "   ❌ registerCollector() method not found"
  exit 1
fi

echo ""

# 5. Vérifier les modifications dans index.ts
echo "5️⃣  Checking collectors/index.ts modifications..."

if grep -q "initializeCollectors()" src/collectors/index.ts; then
  echo "   ✅ initializeCollectors() function exists"
else
  echo "   ❌ initializeCollectors() function not found"
  exit 1
fi

if grep -q "isCollectorEnabled" src/collectors/index.ts; then
  echo "   ✅ isCollectorEnabled import exists"
else
  echo "   ❌ isCollectorEnabled import not found"
  exit 1
fi

echo ""

# 6. Vérifier les modifications dans scraping.processor.ts
echo "6️⃣  Checking scraping.processor.ts modifications..."

if grep -q "isCollectorEnabled" src/processors/scraping.processor.ts; then
  echo "   ✅ isCollectorEnabled import exists"
else
  echo "   ❌ isCollectorEnabled import not found"
  exit 1
fi

if grep -q "isValidCollectorType" src/processors/scraping.processor.ts; then
  echo "   ✅ isValidCollectorType check exists"
else
  echo "   ❌ isValidCollectorType check not found"
  exit 1
fi

echo ""

# 7. Vérifier les lignes de code
echo "7️⃣  Checking line counts..."

collectors_config_lines=$(wc -l < src/config/collectors.config.ts)
echo "   src/config/collectors.config.ts: $collectors_config_lines lines"

if [ "$collectors_config_lines" -ge 140 ]; then
  echo "   ✅ Configuration file has sufficient content"
else
  echo "   ⚠️  Configuration file seems small"
fi

echo ""

# 8. Résumé
echo "================================================================================"
echo "✅ ALL VALIDATION CHECKS PASSED!"
echo "================================================================================"
echo ""
echo "📊 Next Steps:"
echo "   1. Review USAGE_GUIDE.md for implementation details"
echo "   2. Start your application to see auto-registration logs"
echo "   3. Run: npx ts-node src/scripts/validate-sources.ts (to check DB sources)"
echo "   4. Test scraping with enabled collectors"
echo "   5. Try scraping with disabled collector (should show error message)"
echo ""
echo "📚 Documentation:"
echo "   • REFACTORING_PLAN.md - Complete implementation plan"
echo "   • IMPLEMENTATION_SUMMARY.md - Technical summary"
echo "   • USAGE_GUIDE.md - How to use the system"
echo "   • COMPLETION_SUMMARY.md - Executive summary"
echo "   • FILES_CHANGES.md - Detailed file changes"
echo ""
