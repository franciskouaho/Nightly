#!/bin/bash
# Script pour corriger automatiquement l'import ExpoModulesPackage dans PackageList.java

PACKAGE_LIST_FILE="app/build/generated/autolinking/src/main/java/com/facebook/react/PackageList.java"

if [ -f "$PACKAGE_LIST_FILE" ]; then
    # Remplacer expo.core par expo.modules
    sed -i '' 's/import expo\.core\.ExpoModulesPackage;/import expo.modules.ExpoModulesPackage;/g' "$PACKAGE_LIST_FILE"
    echo "✅ PackageList.java corrigé"
else
    echo "⚠️  PackageList.java non trouvé"
fi

