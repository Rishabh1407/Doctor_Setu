#!/bin/bash

echo "🏗️ Building frontend..."
cd client
npm run build

echo "📤 Deploying to S3..."
BUCKET_NAME="doctorsetu-frontend-$(date +%s)"

aws s3 mb s3://$BUCKET_NAME --region us-east-1
aws s3 sync dist/ s3://$BUCKET_NAME --acl public-read
aws s3 website s3://$BUCKET_NAME --index-document index.html

echo "✅ Frontend deployed!"
echo "🌐 URL: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
