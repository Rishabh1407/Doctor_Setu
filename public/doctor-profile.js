const API_URL = 'http://localhost:3000/api/doctor';

if (!localStorage.getItem('doctorToken')) {
  window.location.href = 'doctor-login.html';
}

document.getElementById('photoInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('photoPreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const token = localStorage.getItem('doctorToken');

  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('Profile saved successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = 'doctor-dashboard.html';
      }, 1500);
    } else {
      showMessage(data.error, true);
    }
  } catch (error) {
    showMessage('Error saving profile', true);
  }
});

function showMessage(msg, isError = false) {
  const messageEl = document.getElementById('message');
  messageEl.textContent = msg;
  messageEl.style.color = isError ? '#e74c3c' : '#27ae60';
}
