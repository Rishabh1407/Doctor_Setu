const API_URL = 'http://localhost:3000/api/doctor';
let appointments = [];

if (!localStorage.getItem('doctorToken')) {
  window.location.href = 'doctor-login.html';
}

const token = localStorage.getItem('doctorToken');

async function loadDoctorProfile() {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const doctor = await response.json();
    
    document.getElementById('doctorName').textContent = doctor.firstName + ' ' + doctor.lastName;
    if (doctor.profilePhoto) {
      document.getElementById('doctorPhoto').src = doctor.profilePhoto;
    }

    if (!doctor.isProfileComplete) {
      window.location.href = 'doctor-profile.html';
    }

    displayProfile(doctor);
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

function displayProfile(doctor) {
  const profileHTML = `
    <div class="profile-card">
      <div class="profile-header">
        <img src="${doctor.profilePhoto || 'https://via.placeholder.com/150'}" alt="Profile">
        <h3>Dr. ${doctor.firstName} ${doctor.lastName}</h3>
        <p>${doctor.medicalDegree}</p>
      </div>
      <div class="profile-info">
        <div class="info-item">
          <strong>Age:</strong> ${doctor.age}
        </div>
        <div class="info-item">
          <strong>Gender:</strong> ${doctor.gender}
        </div>
        <div class="info-item">
          <strong>Mobile:</strong> ${doctor.mobile}
        </div>
        <div class="info-item">
          <strong>Year of Completion:</strong> ${doctor.yearOfCompletion}
        </div>
        <div class="info-item">
          <strong>Permanent Address:</strong> ${doctor.permanentAddress}
        </div>
        <div class="info-item">
          <strong>Present Address:</strong> ${doctor.presentAddress}
        </div>
      </div>
    </div>
  `;
  document.getElementById('profileDetails').innerHTML = profileHTML;
}

async function loadAppointments() {
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    appointments = await response.json();
    
    updateStats();
    displayAppointments();
  } catch (error) {
    console.error('Error loading appointments:', error);
    document.getElementById('appointmentsList').innerHTML = '<p class="error">Error loading appointments</p>';
  }
}

function updateStats() {
  const pending = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  
  document.getElementById('pendingCount').textContent = pending;
  document.getElementById('confirmedCount').textContent = confirmed;
  document.getElementById('totalCount').textContent = appointments.length;
}

function displayAppointments() {
  const listEl = document.getElementById('appointmentsList');
  
  if (appointments.length === 0) {
    listEl.innerHTML = '<p class="no-data">No appointments yet</p>';
    return;
  }

  const html = appointments.map(apt => {
    const canCancel = apt.status === 'confirmed' && new Date(apt.autoConfirmTimer) > new Date();
    const isLocked = apt.status === 'confirmed' && new Date(apt.autoConfirmTimer) <= new Date();
    
    return `
      <div class="appointment-card ${apt.status}" onclick="viewPatient('${apt._id}')">
        <div class="apt-header">
          <div class="patient-info">
            <i class="fas fa-user-circle"></i>
            <div>
              <h3>${apt.patientId.firstName} ${apt.patientId.lastName}</h3>
              <p>${apt.patientId.mobile}</p>
            </div>
          </div>
          <span class="status-badge ${apt.status}">${apt.status.toUpperCase()}</span>
        </div>
        
        <div class="apt-details">
          <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span>${new Date(apt.appointmentDate).toLocaleDateString()}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>${apt.timeSlot}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-notes-medical"></i>
            <span>${apt.healthProblem || 'Not specified'}</span>
          </div>
        </div>

        <div class="apt-actions" onclick="event.stopPropagation()">
          ${apt.status === 'pending' ? `
            <button class="btn-confirm" onclick="confirmAppointment('${apt._id}')">
              <i class="fas fa-check"></i> Confirm
            </button>
          ` : ''}
          ${canCancel ? `
            <button class="btn-cancel" onclick="cancelAppointment('${apt._id}')">
              <i class="fas fa-times"></i> Cancel
            </button>
            <small class="timer">Can cancel for ${getRemainingTime(apt.autoConfirmTimer)}</small>
          ` : ''}
          ${isLocked ? `
            <small class="locked"><i class="fas fa-lock"></i> Locked</small>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  listEl.innerHTML = html;
}

function getRemainingTime(timerDate) {
  const remaining = Math.max(0, Math.floor((new Date(timerDate) - new Date()) / 1000));
  return `${remaining}s`;
}

async function confirmAppointment(id) {
  try {
    const response = await fetch(`${API_URL}/appointments/${id}/confirm`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      await loadAppointments();
      setTimeout(() => loadAppointments(), 30000);
    }
  } catch (error) {
    alert('Error confirming appointment');
  }
}

async function cancelAppointment(id) {
  if (!confirm('Are you sure you want to cancel this appointment?')) return;

  try {
    const response = await fetch(`${API_URL}/appointments/${id}/cancel`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    
    if (response.ok) {
      await loadAppointments();
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('Error cancelling appointment');
  }
}

async function viewPatient(appointmentId) {
  try {
    const response = await fetch(`${API_URL}/patient/${appointmentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    const html = `
      <div class="patient-card">
        <h3>${data.patient.firstName} ${data.patient.lastName}</h3>
        <div class="patient-info-grid">
          <div><strong>Age:</strong> ${data.patient.age}</div>
          <div><strong>Gender:</strong> ${data.patient.gender}</div>
          <div><strong>Mobile:</strong> ${data.patient.mobile}</div>
          <div><strong>Email:</strong> ${data.patient.email || 'N/A'}</div>
          <div><strong>Address:</strong> ${data.patient.address || 'N/A'}</div>
        </div>
        <div class="health-problem">
          <strong>Health Problem:</strong>
          <p>${data.healthProblem || 'Not specified'}</p>
        </div>
        <div class="appointment-info">
          <strong>Appointment:</strong> ${new Date(data.appointmentDate).toLocaleDateString()} at ${data.timeSlot}
        </div>
      </div>
    `;
    
    document.getElementById('patientDetails').innerHTML = html;
    document.getElementById('patientModal').style.display = 'block';
  } catch (error) {
    alert('Error loading patient details');
  }
}

function closeModal() {
  document.getElementById('patientModal').style.display = 'none';
}

function showSection(section) {
  document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  if (section === 'appointments') {
    document.getElementById('appointmentsSection').style.display = 'block';
    event.target.closest('.nav-item').classList.add('active');
  } else if (section === 'profile') {
    document.getElementById('profileSection').style.display = 'block';
    event.target.closest('.nav-item').classList.add('active');
  } else if (section === 'messages') {
    document.getElementById('messagesSection').style.display = 'block';
    event.target.closest('.nav-item').classList.add('active');
    populateMsgDropdown();
  }
}

function logout() {
  localStorage.removeItem('doctorToken');
  window.location.href = 'doctor-login.html';
}

loadDoctorProfile();
loadAppointments();
setInterval(loadAppointments, 10000);

// ─── MESSAGING ───────────────────────────────────────────────
let selectedMsgType = 'medical_advice';

function populateMsgDropdown() {
  const select = document.getElementById('msgAppointmentSelect');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  select.innerHTML = '<option value="">-- Select Patient --</option>';
  confirmed.forEach(apt => {
    select.innerHTML += `<option value="${apt._id}">${apt.patientId.firstName} ${apt.patientId.lastName} — ${new Date(apt.appointmentDate).toLocaleDateString()} ${apt.timeSlot}</option>`;
  });
  select.onchange = () => loadMsgHistory(select.value);
}

function selectMsgType(btn) {
  document.querySelectorAll('.msg-type').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedMsgType = btn.dataset.type;
}

async function sendMessage() {
  const appointmentId = document.getElementById('msgAppointmentSelect').value;
  const message = document.getElementById('msgText').value.trim();
  const statusEl = document.getElementById('msgStatus');

  if (!appointmentId) {
    statusEl.textContent = 'Please select a patient.';
    statusEl.style.color = '#e74c3c';
    return;
  }
  if (!message) {
    statusEl.textContent = 'Please write a message.';
    statusEl.style.color = '#e74c3c';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ appointmentId, message, type: selectedMsgType })
    });

    const data = await response.json();
    if (response.ok) {
      statusEl.textContent = '✓ Message sent successfully!';
      statusEl.style.color = '#27ae60';
      document.getElementById('msgText').value = '';
      loadMsgHistory(appointmentId);
      setTimeout(() => statusEl.textContent = '', 3000);
    } else {
      statusEl.textContent = data.error;
      statusEl.style.color = '#e74c3c';
    }
  } catch (error) {
    statusEl.textContent = 'Error sending message.';
    statusEl.style.color = '#e74c3c';
  }
}

async function loadMsgHistory(appointmentId) {
  if (!appointmentId) return;
  const listEl = document.getElementById('msgHistoryList');
  listEl.innerHTML = '<p class="loading">Loading...</p>';

  try {
    const response = await fetch(`${API_URL}/messages/${appointmentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const messages = await response.json();

    if (!messages.length) {
      listEl.innerHTML = '<p class="no-data">No messages sent yet.</p>';
      return;
    }

    const typeIcons = {
      medical_advice: 'fa-stethoscope',
      instructions: 'fa-list-check',
      medicine: 'fa-pills',
      general: 'fa-comment'
    };
    const typeLabels = {
      medical_advice: 'Medical Advice',
      instructions: 'Instructions',
      medicine: 'Medicine',
      general: 'General'
    };

    listEl.innerHTML = messages.map(msg => `
      <div class="msg-card msg-${msg.type}">
        <div class="msg-card-header">
          <span class="msg-tag"><i class="fas ${typeIcons[msg.type]}"></i> ${typeLabels[msg.type]}</span>
          <span class="msg-time">${new Date(msg.createdAt).toLocaleString()}</span>
        </div>
        <p class="msg-body">${msg.message}</p>
      </div>
    `).join('');
  } catch (error) {
    listEl.innerHTML = '<p class="error">Error loading messages.</p>';
  }
}
