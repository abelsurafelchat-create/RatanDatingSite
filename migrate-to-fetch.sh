#!/bin/bash

# Script to migrate from axios to fetch-based api

echo "🔄 Migrating from axios to native fetch API..."
echo ""

# List of files to update
FILES=(
  "src/context/NotificationContext.jsx"
  "src/context/SocketContext.jsx"
  "src/pages/Chat.jsx"
  "src/pages/Home.jsx"
  "src/pages/HomeNew.jsx"
  "src/pages/HomeOld.jsx"
  "src/pages/LandingPage.jsx"
  "src/pages/Matches.jsx"
  "src/pages/Profile.jsx"
  "src/pages/ProfileNew.jsx"
  "src/pages/ProfileOld.jsx"
  "src/pages/RandomVideoCall.jsx"
)

# Backup directory
BACKUP_DIR="axios_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backups in $BACKUP_DIR..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/"
    echo "  ✓ Backed up $file"
  fi
done

echo ""
echo "🔧 Updating imports..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Replace axios import with api import
    # Handle different import path depths
    if [[ $file == src/context/* ]]; then
      sed -i "s|import axios from 'axios';|import api from '../utils/api.js';|g" "$file"
    elif [[ $file == src/pages/* ]]; then
      sed -i "s|import axios from 'axios';|import api from '../utils/api.js';|g" "$file"
    fi
    
    # Replace axios calls with api calls
    sed -i "s|axios\.get('/api/|api.get('/|g" "$file"
    sed -i "s|axios\.post('/api/|api.post('/|g" "$file"
    sed -i "s|axios\.put('/api/|api.put('/|g" "$file"
    sed -i "s|axios\.delete('/api/|api.delete('/|g" "$file"
    sed -i "s|axios\.patch('/api/|api.patch('/|g" "$file"
    
    # Replace response.data with just the variable name
    # This is trickier and may need manual review
    sed -i "s|const response = await api\.|const data = await api.|g" "$file"
    sed -i "s|response\.data|data|g" "$file"
    
    echo "  ✓ Updated $file"
  else
    echo "  ⚠ File not found: $file"
  fi
done

echo ""
echo "✅ Migration complete!"
echo ""
echo "⚠️  IMPORTANT: Manual review needed for:"
echo "  - Error handling (error.response?.data?.error → error.message)"
echo "  - Complex response handling"
echo "  - FormData uploads"
echo ""
echo "📝 Next steps:"
echo "  1. Review the changes in each file"
echo "  2. Test the application: npm run dev"
echo "  3. If everything works: npm uninstall axios"
echo "  4. Rebuild: npm run build"
echo ""
echo "💾 Backups saved in: $BACKUP_DIR"
