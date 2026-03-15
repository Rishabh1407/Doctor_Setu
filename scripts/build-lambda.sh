#!/bin/bash

echo "📦 Building Lambda deployment package..."

cd server
zip -r ../lambda-deployment.zip . -x "node_modules/*"
cd ..

echo "✅ Lambda package created: lambda-deployment.zip"
echo "📤 Upload to AWS Lambda via AWS Academy Console"
