#!/bin/bash

# Script to fix Firebase Auth URL handling in iOS AppDelegate.swift
# This script replaces the JavaScript-style toLowerCase() with Swift's lowercased()
# and adds optional chaining for url.host

DELEGATE_PATH="ios/Nightly/AppDelegate.swift"

if [ ! -f "$DELEGATE_PATH" ]; then
    echo "⚠️  AppDelegate.swift not found at $DELEGATE_PATH"
    exit 1
fi

echo "🔍 Fixing Firebase Auth URL handling in AppDelegate.swift..."

# Use sed to replace toLowerCase() with lowercased() and add optional chaining
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS requires an empty string after -i
    sed -i '' 's/url\.host\.toLowerCase()/url.host?.lowercased()/g' "$DELEGATE_PATH"
else
    # Linux version
    sed -i 's/url\.host\.toLowerCase()/url.host?.lowercased()/g' "$DELEGATE_PATH"
fi

if [ $? -eq 0 ]; then
    echo "✅ Successfully fixed AppDelegate.swift"
else
    echo "❌ Failed to fix AppDelegate.swift"
    exit 1
fi
