#!/bin/bash

echo "🚀 Creating JournalX Project Structure..."

# Root folders
mkdir -p frontend
mkdir -p backend

# ===========================
# Frontend
# ===========================

mkdir -p frontend/app/'(auth)'/login
mkdir -p frontend/app/'(auth)'/signup
mkdir -p frontend/app/dashboard
mkdir -p frontend/app/journal
mkdir -p frontend/app/analytics
mkdir -p frontend/app/risk
mkdir -p frontend/app/funded
mkdir -p frontend/app/settings

mkdir -p frontend/components/sidebar
mkdir -p frontend/components/navbar
mkdir -p frontend/components/dashboard
mkdir -p frontend/components/cards
mkdir -p frontend/components/charts
mkdir -p frontend/components/tables
mkdir -p frontend/components/ui
mkdir -p frontend/components/common

mkdir -p frontend/hooks
mkdir -p frontend/lib
mkdir -p frontend/services
mkdir -p frontend/types
mkdir -p frontend/public
mkdir -p frontend/styles

# ===========================
# Backend
# ===========================

mkdir -p backend/app/api
mkdir -p backend/app/auth
mkdir -p backend/app/database
mkdir -p backend/app/models
mkdir -p backend/app/schemas
mkdir -p backend/app/services
mkdir -p backend/app/analytics
mkdir -p backend/app/mt5
mkdir -p backend/app/ai

# ===========================
# Root Files
# ===========================

touch README.md
touch .env
touch docker-compose.yml
touch .gitignore

# ===========================
# Frontend Files
# ===========================

touch frontend/app/layout.tsx
touch frontend/app/page.tsx

touch frontend/components/sidebar/Sidebar.tsx
touch frontend/components/navbar/Navbar.tsx

# ===========================
# Backend Files
# ===========================

touch backend/app/main.py
touch backend/requirements.txt

echo ""
echo "✅ JournalX Project Structure Created Successfully!"