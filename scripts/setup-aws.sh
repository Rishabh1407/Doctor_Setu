#!/bin/bash

echo "🚀 Setting up AWS resources for DoctorSetu..."

# Create DynamoDB Table
echo "📦 Creating DynamoDB table..."
aws dynamodb create-table \
  --table-name Doctors \
  --attribute-definitions AttributeName=mobile,AttributeType=S \
  --key-schema AttributeName=mobile,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create SNS Topic
echo "📱 Creating SNS topic..."
aws sns create-topic --name DoctorOTP --region us-east-1

echo "✅ AWS resources created successfully!"
echo "📝 Update your .env file with the SNS Topic ARN"
