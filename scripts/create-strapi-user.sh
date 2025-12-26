#!/bin/bash

# Script to create a Strapi user via API
# Usage: ./create-strapi-user.sh <email> <password> <username>

set -e

STRAPI_URL="${STRAPI_URL:-http://localhost:1337/api}"
EMAIL="${1:-demo@example.com}"
PASSWORD="${2:-DemoPassword123!}"
USERNAME="${3:-demo}"

echo "Creating Strapi user..."
echo "Email: $EMAIL"
echo "Username: $USERNAME"
echo ""

# Register user
RESPONSE=$(curl -s -X POST "$STRAPI_URL/auth/local/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

# Check if successful
if echo "$RESPONSE" | grep -q "jwt"; then
  echo "✅ User created successfully!"
  echo ""
  echo "You can now login with:"
  echo "  Email: $EMAIL"
  echo "  Password: $PASSWORD"
else
  echo "❌ Failed to create user"
  echo "Response: $RESPONSE"
  echo ""
  echo "Note: User might already exist. Try logging in with these credentials."
  exit 1
fi




