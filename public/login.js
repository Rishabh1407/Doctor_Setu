const API = 'http://localhost:3000/api';
let currentRole = '';
let currentMobile = '';

// ── ROLE SELECTION ────────────────────────────────────────
function selectRole(role) {
  currentRole = role;

  const label = role === 'patient'
    ? `<i class="fas fa-user"></i> Patient`
    : `<i class="fas fa-user-md"></i> Doctor`;

  document.getElementById('roleLabel').innerHTML = label;
  document.getElementById('roleLabel').className = `role-label ${role}`;
  document.getElementById('roleLabel2').innerHTML = label;
  document.getElementById('roleLabel2').className = `role-label ${role}`;

  showStep('mobileStep');
}

// ── NAVIGATION ────────────────────────────────────────────
function showStep(stepId) {
  ['roleStep', 'mobileStep', 'otpStep'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById(stepId).style.display = 'block';
  clearMessage();
}

function goBack(stepId) {
  showStep(stepId);
}

// ── SEND OTP ──────────────────────────────────────────────
async function sendOTP() {
  const mobile = document.getElementById('mobile').value.trim();

  if (!/^[0-9]{10}$/.test(mobile)) {
    showMessage('Please enter a valid 10-digit mobile number.', true);
    return;
  }

  const endpoint = currentRole === 'doctor'
    ? `${API}/doctor/auth/send-otp`
    : `${API}/patient/auth/send-otp`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile })
    });

    const data = await res.json();

    if (res.ok) {
      currentMobile = mobile;
      document.getElementById('mobileDisplay').textContent = mobile;
      document.querySelectorAll('.otp-input').forEach(i => i.value = '');
      showStep('otpStep');
      showMessage('OTP sent! Check server console.', false);
    } else {
      showMessage(data.error || 'Failed to send OTP.', true);
    }
  } catch {
    showMessage('Server error. Please try again.', true);
  }
}

// ── OTP BOX NAVIGATION ────────────────────────────────────
function otpMove(input, index) {
  input.value = input.value.replace(/[^0-9]/g, '');
  if (input.value && index < 6) {
    document.querySelectorAll('.otp-input')[index].focus();
  }
}

function getOTPValue() {
  return Array.from(document.querySelectorAll('.otp-input'))
    .map(i => i.value)
    .join('');
}

// ── VERIFY OTP ────────────────────────────────────────────
async function verifyOTP() {
  const otp = getOTPValue();

  if (otp.length !== 6) {
    showMessage('Please enter the complete 6-digit OTP.', true);
    return;
  }

  const endpoint = currentRole === 'doctor'
    ? `${API}/doctor/auth/verify-otp`
    : `${API}/patient/auth/verify-otp`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: currentMobile, otp })
    });

    const data = await res.json();

    if (res.ok) {
      if (currentRole === 'doctor') {
        localStorage.setItem('doctorToken', data.token);
        showMessage('Login successful! Redirecting...', false);
        setTimeout(() => {
          window.location.href = data.isProfileComplete
            ? 'doctor-dashboard.html'
            : 'doctor-profile.html';
        }, 1200);
      } else {
        localStorage.setItem('patientToken', data.token);
        localStorage.setItem('patientMobile', currentMobile);
        showMessage('Login successful! Redirecting...', false);
        setTimeout(() => {
          window.location.href = data.hasProfile
            ? 'patient-select.html'
            : 'patient-create-profile.html';
        }, 1200);
      }
    } else {
      showMessage(data.error || 'Invalid OTP.', true);
    }
  } catch {
    showMessage('Server error. Please try again.', true);
  }
}

// ── HELPERS ───────────────────────────────────────────────
function showMessage(msg, isError) {
  const el = document.getElementById('message');
  el.textContent = msg;
  el.style.color = isError ? '#e74c3c' : '#27ae60';
}

function clearMessage() {
  const el = document.getElementById('message');
  el.textContent = '';
}

// Redirect if already logged in
if (localStorage.getItem('doctorToken')) {
  window.location.href = 'doctor-dashboard.html';
} else if (localStorage.getItem('patientToken')) {
  window.location.href = 'patient-select.html';
}
