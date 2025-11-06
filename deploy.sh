#!/bin/bash

# IndiDate Deployment Script
# This script helps deploy your app to AWS

echo "🚀 IndiDate Deployment Script"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    echo "Download from: https://aws.amazon.com/cli/"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI found${NC}"
echo ""

# Get deployment type
echo "Select deployment type:"
echo "1) Frontend only (S3 + CloudFront)"
echo "2) Backend only (EC2)"
echo "3) Full deployment (Frontend + Backend)"
read -p "Enter choice (1-3): " DEPLOY_TYPE

case $DEPLOY_TYPE in
    1)
        echo -e "${BLUE}📦 Deploying Frontend...${NC}"
        
        # Build frontend
        echo "Building frontend..."
        npm run build
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Build failed${NC}"
            exit 1
        fi
        
        # Get S3 bucket name
        read -p "Enter S3 bucket name: " S3_BUCKET
        
        # Upload to S3
        echo "Uploading to S3..."
        aws s3 sync dist/ s3://$S3_BUCKET/ --delete
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
            
            # Ask about CloudFront invalidation
            read -p "Do you want to invalidate CloudFront cache? (y/n): " INVALIDATE
            if [ "$INVALIDATE" = "y" ]; then
                read -p "Enter CloudFront Distribution ID: " CF_ID
                aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/*"
                echo -e "${GREEN}✅ CloudFront cache invalidated${NC}"
            fi
        else
            echo -e "${RED}❌ Deployment failed${NC}"
            exit 1
        fi
        ;;
        
    2)
        echo -e "${BLUE}📦 Deploying Backend...${NC}"
        
        # Get EC2 details
        read -p "Enter EC2 IP address: " EC2_IP
        read -p "Enter path to SSH key (.pem file): " SSH_KEY
        
        # Upload code to EC2
        echo "Uploading code to EC2..."
        scp -i $SSH_KEY -r . ubuntu@$EC2_IP:/home/ubuntu/indidate-temp/
        
        # SSH and deploy
        ssh -i $SSH_KEY ubuntu@$EC2_IP << 'EOF'
            cd /home/ubuntu/indidate-temp
            npm install --production
            pm2 restart all || pm2 start ecosystem.config.js
            pm2 save
            echo "✅ Backend deployed and restarted"
EOF
        
        echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
        ;;
        
    3)
        echo -e "${BLUE}📦 Full Deployment...${NC}"
        echo "This will deploy both frontend and backend"
        echo "Please run options 1 and 2 separately for better control"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
