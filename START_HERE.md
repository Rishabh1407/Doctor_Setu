# 🚀 Step-by-Step Setup Guide

## STEP 1: Get AWS Academy Credentials (5 minutes)

1. Open your browser and go to **AWS Academy**
2. Click **"Modules"** → **"Learner Lab"**
3. Click **"Start Lab"** (wait for the dot to turn green ⚫ → 🟢)
4. Click **"AWS Details"** button
5. Click **"Show"** next to AWS CLI credentials
6. You'll see something like this:

```
[default]
aws_access_key_id=ASIAXXX...
aws_secret_access_key=abc123...
aws_session_token=IQoJb3JpZ2luX2VjE...
```

7. **Copy all three lines**

---

## STEP 2: Save AWS Credentials on Your Computer (2 minutes)

### On Mac/Linux:
```bash
# Open terminal and run:
mkdir -p ~/.aws
nano ~/.aws/credentials
```

### On Windows:
```bash
# Open Command Prompt and run:
mkdir %USERPROFILE%\.aws
notepad %USERPROFILE%\.aws\credentials
```

**Paste the credentials** you copied from AWS Academy, then save and close.

---

## STEP 3: Install Node.js (if not installed)

Check if you have Node.js:
```bash
node --version
```

If you see a version number (like v18.x.x), you're good! ✅

If not, download from: https://nodejs.org (choose LTS version)

---

## STEP 4: Install Project Dependencies (3 minutes)

Open terminal in the DoctorSetu folder and run:

```bash
npm run install-all
```

Wait for installation to complete...

---

## STEP 5: Create AWS Resources (2 minutes)

Run this command to create DynamoDB table and SNS topic:

```bash
./scripts/setup-aws.sh
```

**If you get "permission denied"**, run:
```bash
chmod +x scripts/setup-aws.sh
./scripts/setup-aws.sh
```

You should see:
- ✅ DynamoDB table created
- ✅ SNS topic created

---

## STEP 6: Update .env File (1 minute)

Open the `.env` file in DoctorSetu folder and update:

```env
PORT=5000
JWT_SECRET=my_super_secret_key_12345

# AWS Configuration
AWS_REGION=us-east-1
DYNAMODB_TABLE=Doctors
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:YOUR_ACCOUNT:DoctorOTP

# Paste your AWS credentials here (from Step 1)
AWS_ACCESS_KEY_ID=ASIAXXX...
AWS_SECRET_ACCESS_KEY=abc123...
AWS_SESSION_TOKEN=IQoJb3JpZ2luX2VjE...
```

**Important:** Replace the AWS credentials with YOUR actual credentials from Step 1!

---

## STEP 7: Start the Backend Server (1 minute)

In terminal, run:
```bash
npm run dev
```

You should see:
```
✅ Server running on port 5000
✅ AWS Region: us-east-1
✅ DynamoDB Table: Doctors
```

**Keep this terminal open!**

---

## STEP 8: Start the Frontend (1 minute)

Open a **NEW terminal** (keep the first one running), then run:
```bash
npm run client
```

You should see:
```
Local: http://localhost:3000
```

---

## STEP 9: Test the Application! 🎉

1. Open browser: **http://localhost:3000**
2. You'll see the **DoctorSetu** login page
3. Enter a 10-digit mobile number (e.g., `9876543210`)
4. Click **"Send OTP"**
5. Check the **backend terminal** - you'll see the OTP printed there
6. Enter the OTP and click **"Verify OTP"**
7. You're logged in! 🎉

---

## 🎯 What You've Built:

✅ Doctor Login/Signup with Mobile OTP  
✅ AWS DynamoDB Database  
✅ AWS SNS for SMS (console mode for testing)  
✅ JWT Authentication  
✅ React Frontend  
✅ Node.js Backend  

---

## 🆘 Troubleshooting

### Problem: "AWS credentials not found"
**Solution:** Make sure you completed Step 2 correctly and the credentials are in `~/.aws/credentials`

### Problem: "DynamoDB table already exists"
**Solution:** That's fine! It means the table was created before. Continue to next step.

### Problem: "Port 5000 already in use"
**Solution:** Change PORT in `.env` file to 5001 or 5002

### Problem: "SNS SMS not sending"
**Solution:** AWS Academy may restrict SMS. The OTP will print in the terminal instead - that's normal!

### Problem: "Session expired"
**Solution:** AWS Academy sessions expire after 4 hours. Go back to Step 1 and get new credentials.

---

## 📱 Next Steps (After Login Works):

Once the basic login is working, we can add:
- Doctor profile completion
- Appointment scheduling
- Patient management
- Dashboard with statistics

**Start with Step 1 now and let me know if you get stuck anywhere!** 🚀
