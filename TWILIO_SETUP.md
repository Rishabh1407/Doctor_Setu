# 📱 Twilio Setup Guide for OTP SMS

## Step 1: Create Twilio Account (5 minutes)

1. Go to: **https://www.twilio.com/try-twilio**
2. Click **"Sign up"**
3. Fill in your details:
   - Email
   - Password
   - First Name, Last Name
4. Verify your email
5. Verify your phone number (they'll send you a code)

---

## Step 2: Get Twilio Credentials (2 minutes)

After login, you'll see the **Twilio Console Dashboard**:

1. Find these on the dashboard:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click "Show" to reveal)

2. Copy both values

---

## Step 3: Get a Twilio Phone Number (3 minutes)

1. In Twilio Console, click **"Get a Trial Number"**
2. Twilio will assign you a free phone number (e.g., +1 234 567 8900)
3. Click **"Choose this Number"**
4. Copy this number

**Note:** Trial accounts can only send SMS to verified phone numbers.

---

## Step 4: Verify Your Phone Number (2 minutes)

Since you're using a trial account:

1. Go to: **Phone Numbers** → **Verified Caller IDs**
2. Click **"Add a new number"**
3. Enter your mobile number (the one you'll test with)
4. Twilio will send you a verification code
5. Enter the code to verify

---

## Step 5: Update .env File (1 minute)

Open `.env` file and add your Twilio credentials:

```env
# Twilio Configuration (for OTP SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Replace with YOUR actual values from Step 2 and Step 3!**

---

## Step 6: Install Twilio Package (1 minute)

Run in terminal:
```bash
npm install
```

---

## Step 7: Restart Backend Server (1 minute)

Stop the backend (Ctrl+C) and restart:
```bash
npm run dev
```

---

## Step 8: Test OTP SMS! 🎉

1. Open browser: **http://localhost:3000**
2. Enter your **verified phone number** (from Step 4)
3. Click **"Send OTP"**
4. You should receive an **actual SMS** on your phone! 📱
5. Enter the OTP and login

---

## 💰 Twilio Pricing (Important!)

### Trial Account (FREE):
- ✅ $15.50 free credit
- ✅ Can send ~500 SMS
- ⚠️ Can only send to verified numbers
- ⚠️ SMS will have "Sent from your Twilio trial account" prefix

### Paid Account:
- 💵 $0.0079 per SMS (India)
- 💵 $1/month per phone number
- ✅ Send to any number
- ✅ No trial message prefix

---

## 🆘 Troubleshooting

### Problem: "Unable to create record: The number is unverified"
**Solution:** You must verify the phone number in Twilio Console (Step 4)

### Problem: "Authentication Error"
**Solution:** Double-check your Account SID and Auth Token in `.env`

### Problem: "Invalid 'To' Phone Number"
**Solution:** Make sure phone number format is correct: `+919876543210` (with country code)

### Problem: "SMS not received"
**Solution:** 
- Check if number is verified in Twilio
- Check Twilio Console → Logs → SMS Logs for errors
- Trial accounts have sending limits

---

## 🌍 Country Code Format

When entering mobile number in the app:
- **India:** Enter `9876543210` (10 digits)
- App automatically adds `+91` prefix
- Twilio sends to: `+919876543210`

To change country code, edit `server/services/sms.js`:
```javascript
to: `+91${mobile}`  // Change +91 to your country code
```

---

## 🚀 Upgrade to Paid Account (Optional)

When ready for production:

1. Go to Twilio Console
2. Click **"Upgrade"**
3. Add payment method
4. Buy a phone number ($1/month)
5. Remove phone number verification requirement

---

## ✅ What's Next?

Once OTP SMS is working, we can add:
- Doctor profile completion
- Appointment booking
- Patient management
- Dashboard

**Start with Step 1 and let me know when you get your Twilio credentials!** 📱
