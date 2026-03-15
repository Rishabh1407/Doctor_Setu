# AWS Academy Setup Guide

## Step 1: Get AWS Credentials

1. Login to AWS Academy
2. Start your lab
3. Click "AWS Details"
4. Copy credentials to `~/.aws/credentials`:

```ini
[default]
aws_access_key_id = YOUR_KEY
aws_secret_access_key = YOUR_SECRET
aws_session_token = YOUR_TOKEN
region = us-east-1
```

## Step 2: Create AWS Resources

```bash
# Make script executable
chmod +x scripts/setup-aws.sh

# Run setup
./scripts/setup-aws.sh
```

## Step 3: Update .env File

Copy the SNS Topic ARN from the output and update `.env`

## Step 4: Test Locally

```bash
npm run install-all
npm run dev
npm run client
```

## Step 5: Deploy to AWS (Optional)

### Backend (Lambda)
```bash
chmod +x scripts/build-lambda.sh
./scripts/build-lambda.sh
```
Then upload `lambda-deployment.zip` to AWS Lambda via console.

### Frontend (S3)
```bash
chmod +x scripts/deploy-frontend.sh
./scripts/deploy-frontend.sh
```

## AWS Services Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────┐
│   Lambda    │─────▶│ DynamoDB │
│  (Node.js)  │      │ (Doctors)│
└──────┬──────┘      └──────────┘
       │
       ▼
┌─────────────┐
│     SNS     │
│  (OTP SMS)  │
└─────────────┘
```

## Cost Optimization

- DynamoDB: Pay-per-request (free tier: 25GB)
- Lambda: Free tier 1M requests/month
- SNS: $0.50 per 1M requests
- S3: Free tier 5GB storage

## Troubleshooting

### Session Token Expired
AWS Academy sessions expire after 4 hours. Get new credentials from AWS Details.

### SNS SMS Not Working
AWS Academy may have SNS restrictions. OTP will print to console as fallback.

### DynamoDB Access Denied
Ensure your IAM role has DynamoDB permissions in AWS Academy.
