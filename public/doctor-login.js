const API_URL = 'http://localhost:3000/api/doctor/auth';
let currentMobile = '';

function showMessage(msg, isError = false) {
  const messageEl = document.getElementById('message');
  messageEl.textContent = msg;
  messageEl.style.color = isError ? '#e74c3c' : '#27ae60';
}

async function sendOTP() {
  const mobile = document.getElementById('mobile').value;
  
  if (!/^[0-9]{10}$/.test(mobile)) {
    showMessage('Please enter a valid 10-digit mobile number', true);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile })
    });

    const data = await response.json();

    if (response.ok) {
      currentMobile = mobile;
      document.getElementById('mobileStep').style.display = 'none';
      document.getElementById('otpStep').style.display = 'block';
      showMessage('OTP sent successfully! Check console for OTP.');
    } else {
      showMessage(data.error, true);
    }
  } catch (error) {
    showMessage('Error sending OTP', true);
  }
}

async function verifyOTP() {
  const otp = document.getElementById('otp').value;

  if (!/^[0-9]{6}$/.test(otp)) {
    showMessage('Please enter a valid 6-digit OTP', true);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: currentMobile, otp })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('doctorToken', data.token);
      showMessage('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = 'doctor-dashboard.html';
      }, 1500);
    } else {
      showMessage(data.error, true);
    }
  } catch (error) {
    showMessage('Error verifying OTP', true);
  }
}
