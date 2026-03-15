const API     = 'http://localhost:3000/api/patient';
const token   = localStorage.getItem('patientToken');
const profile = JSON.parse(localStorage.getItem('patientProfile') || 'null');
const mobile  = localStorage.getItem('patientMobile') || '';

if (!token || !profile) {
  window.location.href = 'patient-select.html';
}

let allPatients     = [];
let allAppointments = [];
let allMessages     = [];

const relationIcons = {
  Self: 'fa-user', Parent: 'fa-person-cane', Child: 'fa-child',
  Spouse: 'fa-heart', Sibling: 'fa-people-group', Other: 'fa-user-tag'
};

const typeIcons = {
  medical_advice: 'fa-stethoscope', instructions: 'fa-list-check',
  medicine: 'fa-pills', general: 'fa-comment'
};

const typeLabels = {
  medical_advice: 'Medical Advice', instructions: 'Instructions',
  medicine: 'Medicine', general: 'General'
};

// ── INIT ──────────────────────────────────────────────────
function init() {
  document.getElementById('sidebarName').textContent     = profile.name || 'Patient';
  document.getElementById('sidebarRelation').textContent = profile.relation || 'Self';
  document.getElementById('topMobile').textContent       = mobile;
  document.getElementById('pdName').textContent          = profile.name || 'Patient';
  document.getElementById('pdMobile').textContent        = mobile;
  document.getElementById('epModalMobile').textContent   = mobile;
  loadAll();

  document.addEventListener('click', e => {
    const drop = document.getElementById('profileDropdown');
    const avatar = document.getElementById('topAvatar');
    if (!drop.contains(e.target) && !avatar.contains(e.target)) {
      drop.classList.remove('open');
    }
  });
}

async function loadAll() {
  await Promise.all([loadPatients(), loadAppointments(), loadMessages()]);
  renderFullPatients();
}

// ── PATIENTS ──────────────────────────────────────────────
async function loadPatients() {
  try {
    const res = await fetch(`${API}/auth/profiles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    allPatients = await res.json();
  } catch { allPatients = []; }
}

function renderFullPatients() {
  const el = document.getElementById('fullPatientList');
  if (!allPatients.length) {
    el.innerHTML = '<p class="empty-state"><i class="fas fa-users"></i><br>No family members added yet.</p>';
    return;
  }
  el.innerHTML = allPatients.map(p => patientGridCardHTML(p)).join('');
}

function patientGridCardHTML(p) {
  const rel  = (p.relation || 'other').toLowerCase();
  const icon = relationIcons[p.relation] || 'fa-user';
  return `
    <div class="pg-card" onclick="openAddModalForPatient('${p._id}')" style="cursor:pointer;">
      <div class="pg-avatar ${rel}"><i class="fas ${icon}"></i></div>
      <h3>${p.name || p.firstName}</h3>
      <span class="rel-tag">${p.relation || 'Self'}</span>
      <p class="pg-meta">${p.gender} &bull; ${p.age} yrs${p.bloodGroup ? '<br>' + p.bloodGroup : ''}</p>
      <button class="btn-book-apt"><i class="fas fa-calendar-plus"></i> Book Appointment</button>
    </div>`;
}

// ── APPOINTMENTS ──────────────────────────────────────────
async function loadAppointments() {
  try {
    const res = await fetch(`${API}/appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    allAppointments = await res.json();
  } catch { allAppointments = []; }
}

function renderFullAppointments(filter = 'all') {
  const el   = document.getElementById('fullAptList');
  const list = filter === 'all'
    ? allAppointments
    : allAppointments.filter(a => a.status === filter);

  el.innerHTML = list.length
    ? list.map(a => aptCardHTML(a)).join('')
    : `<p class="empty-state"><i class="fas fa-calendar-times"></i><br>No ${filter === 'all' ? '' : filter} appointments.</p>`;
}

function aptCardHTML(a) {
  const icons = { pending: 'fa-clock', confirmed: 'fa-check-circle', cancelled: 'fa-times-circle' };
  const patientName = a.patientId ? (a.patientId.name || a.patientId.firstName || 'Patient') : 'Patient';
  const doctorName  = a.doctorId  ? `Dr. ${a.doctorId.firstName || ''} ${a.doctorId.lastName || ''}`.trim() : 'Doctor';

  return `
    <div class="apt-card ${a.status}">
      <div class="apt-icon"><i class="fas ${icons[a.status] || 'fa-calendar'}"></i></div>
      <div class="apt-info">
        <h4>${patientName}</h4>
        <p>${doctorName} &bull; ${a.healthProblem || 'General Checkup'}</p>
      </div>
      <div class="apt-meta">
        <span class="status-badge ${a.status}">${a.status}</span>
        <p>${new Date(a.appointmentDate).toLocaleDateString()} &bull; ${a.timeSlot}</p>
      </div>
    </div>`;
}

function filterApts(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFullAppointments(filter);
}

// ── MESSAGES ──────────────────────────────────────────────
async function loadMessages() {
  try {
    const res = await fetch(`${API}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    allMessages = await res.json();
  } catch { allMessages = []; }
}

function renderMessages() {
  const el = document.getElementById('messagesList');
  if (!allMessages.length) {
    el.innerHTML = '<p class="empty-state"><i class="fas fa-inbox"></i><br>No messages from doctor yet.</p>';
    return;
  }
  el.innerHTML = allMessages.map(m => `
    <div class="msg-card ${m.type}">
      <div class="msg-top">
        <span class="msg-type-tag"><i class="fas ${typeIcons[m.type]}"></i> ${typeLabels[m.type]}</span>
        <span class="msg-time">${new Date(m.createdAt).toLocaleString()}</span>
      </div>
      <p class="msg-text">${m.message}</p>
      <p class="msg-from"><i class="fas fa-user-md"></i> From your doctor</p>
    </div>`).join('');
}

// ── SECTION NAVIGATION ────────────────────────────────────
const sectionMeta = {
  patients:    { title: 'My Patients',  sub: 'Manage all family member profiles' },
  appointments:{ title: 'Appointments', sub: 'Track all your booking statuses' },
  messages:    { title: 'Messages',     sub: 'Messages received from your doctor' }
};

function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  event.currentTarget.classList.add('active');

  document.getElementById(`${name}Section`).style.display = 'block';
  document.getElementById('sectionTitle').textContent = sectionMeta[name].title;
  document.getElementById('sectionSub').textContent   = sectionMeta[name].sub;

  if (name === 'patients')     renderFullPatients();
  if (name === 'appointments') renderFullAppointments();
  if (name === 'messages')     renderMessages();
}

// ── PROFILE DROPDOWN & EDIT MODAL ────────────────────────
function toggleProfileMenu() {
  document.getElementById('profileDropdown').classList.toggle('open');
}

function openEditProfileModal() {
  document.getElementById('profileDropdown').classList.remove('open');
  const p = JSON.parse(localStorage.getItem('patientProfile') || 'null');
  if (!p) return;
  document.getElementById('ep_name').value  = p.name  || '';
  document.getElementById('ep_age').value   = p.age   || '';
  document.getElementById('ep_email').value = p.email || '';
  const radio = document.querySelector(`input[name="ep_gender"][value="${p.gender}"]`);
  if (radio) radio.checked = true;
  document.getElementById('epErrMsg').textContent     = '';
  document.getElementById('epSuccessMsg').textContent = '';
  document.getElementById('editProfileModal').classList.add('open');
}

function closeEditProfileModal() {
  document.getElementById('editProfileModal').classList.remove('open');
}

document.getElementById('editProfileModal').addEventListener('click', e => {
  if (e.target === document.getElementById('editProfileModal')) closeEditProfileModal();
});

document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const p      = JSON.parse(localStorage.getItem('patientProfile') || 'null');
  const errEl  = document.getElementById('epErrMsg');
  const sucEl  = document.getElementById('epSuccessMsg');
  const name   = document.getElementById('ep_name').value.trim();
  const age    = document.getElementById('ep_age').value;
  const gender = document.querySelector('input[name="ep_gender"]:checked')?.value;
  const email  = document.getElementById('ep_email').value.trim();

  if (!name)   { errEl.textContent = 'Please enter your name.';    sucEl.textContent = ''; return; }
  if (!age)    { errEl.textContent = 'Please enter your age.';     sucEl.textContent = ''; return; }
  if (!gender) { errEl.textContent = 'Please select your gender.'; sucEl.textContent = ''; return; }
  errEl.textContent = '';

  try {
    const res  = await fetch(`${API}/auth/profiles/${p._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, age, gender, email })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('patientProfile', JSON.stringify(data.patient));
      document.getElementById('sidebarName').textContent = data.patient.name;
      document.getElementById('pdName').textContent      = data.patient.name;
      sucEl.style.color = '#27ae60';
      sucEl.textContent = '✓ Profile updated successfully!';
      setTimeout(() => { sucEl.textContent = ''; closeEditProfileModal(); }, 1500);
    } else {
      errEl.textContent = data.error || 'Update failed.';
    }
  } catch {
    errEl.textContent = 'Server error. Please try again.';
  }
});

// ── ADD PATIENT WIZARD ────────────────────────────────────
let selectedDoctorId  = null;
let selectedAptType   = null;
let selectedHomeVisitType = null;
let selectedSlot      = null;
let selectedDate      = null;
let uploadedFiles     = [];
let currentStep       = 1;

function openAddModal() {
  openAddModalForPatient(null);
}

function openAddModalForPatient(patientId) {
  resetWizard();
  document.getElementById('addModal').classList.add('open');

  if (patientId) {
    const p = allPatients.find(x => x._id === patientId);
    if (p) {
      document.getElementById('s1_name').value = p.name || p.firstName || '';
      document.getElementById('s1_age').value  = p.age || '';
      document.getElementById('s1_gender').value = p.gender || '';
      document.getElementById('s1_relation').value = p.relation || 'Self';
      if (p.bloodGroup) document.getElementById('s1_bloodGroup').value = p.bloodGroup;
    }
  }
}

function closeAddModal() {
  document.getElementById('addModal').classList.remove('open');
  resetWizard();
}

document.getElementById('addModal').addEventListener('click', e => {
  if (e.target === document.getElementById('addModal')) closeAddModal();
});

function resetWizard() {
  currentStep = 1; selectedDoctorId = null; selectedAptType = null;
  selectedHomeVisitType = null; selectedSlot = null; selectedDate = null;
  selectedNurseId = null; selectedNurseSlot = null; uploadedFiles = [];
  ['step1','step2','step3','step4','stepNurse','stepSuccess'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  document.getElementById('step1').style.display = 'block';
  ['wp1','wp2','wp3','wp4'].forEach(id => {
    const el = document.getElementById(id); if (el) el.classList.remove('active','done');
  });
  document.getElementById('wp1').classList.add('active');
  ['s1_name','s1_age','s1_address','s3_healthProblem','s3_currentTreatment'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  ['s1_gender','s1_relation','s1_bloodGroup'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = el.tagName === 'SELECT' ? el.options[0].value : '';
  });
  document.getElementById('filePreview').innerHTML = '';
  document.getElementById('homeVisitOptions').style.display = 'none';
  document.querySelectorAll('.apt-type-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.hv-card').forEach(c => c.classList.remove('selected'));
  ['step1Err','step2Err','step3Err','step4Err'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '';
  });
}

function goStep(n) {
  if (n > currentStep) {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
  }
  document.getElementById(`step${currentStep}`).style.display = 'none';
  const wpCurrent = document.getElementById(`wp${currentStep}`);
  if (wpCurrent) { wpCurrent.classList.remove('active'); if (n > currentStep) wpCurrent.classList.add('done'); }
  currentStep = n;
  document.getElementById(`step${currentStep}`).style.display = 'block';
  const wpNext = document.getElementById(`wp${currentStep}`);
  if (wpNext) wpNext.classList.add('active');
  if (currentStep === 4) loadDoctors();
}

function validateStep1() {
  const err = document.getElementById('step1Err');
  const ok  = document.getElementById('s1_name').value.trim()   &&
              document.getElementById('s1_age').value            &&
              document.getElementById('s1_gender').value         &&
              document.getElementById('s1_address').value.trim();
  if (!ok) { err.textContent = 'Please fill all required fields.'; return false; }
  err.textContent = ''; return true;
}

function validateStep2() {
  const err = document.getElementById('step2Err');
  if (!selectedAptType) { err.textContent = 'Please select an appointment type.'; return false; }
  if (selectedAptType === 'home_visit' && !selectedHomeVisitType) {
    err.textContent = 'Please select a home visit type.'; return false;
  }
  err.textContent = ''; return true;
}

function validateStep3() {
  const err = document.getElementById('step3Err');
  if (!document.getElementById('s3_healthProblem').value.trim()) {
    err.textContent = 'Please describe the health problem.'; return false;
  }
  err.textContent = ''; return true;
}

function handleStep2Next() {
  if (!validateStep2()) return;
  if (selectedAptType === 'home_visit' && selectedHomeVisitType === 'nurse') {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('wp2').classList.remove('active');
    document.getElementById('wp2').classList.add('done');
    document.getElementById('stepNurse').style.display = 'block';
    currentStep = 'nurse';
    return;
  }
  // Doctor Home Visit or Online/Clinic — go to Medical Info
  const isHV = selectedAptType === 'home_visit' && selectedHomeVisitType === 'doctor';
  const banner   = document.getElementById('hvEmergencyBanner');
  const label    = document.getElementById('s3_problemLabel');
  const treatGrp = document.getElementById('s3_treatmentGroup');
  const nextBtn  = document.getElementById('step3NextBtn');
  if (isHV) {
    banner.style.display = 'flex';
    label.textContent = 'Emergency / Health Problem *';
    treatGrp.style.display = 'none';
    nextBtn.innerHTML = '<i class="fas fa-search-location"></i> Find Nearest Doctor';
  } else {
    banner.style.display = 'none';
    label.textContent = 'Health Problem / Reason for Visit *';
    treatGrp.style.display = 'block';
    nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
  }
  goStep(3);
}

function selectAptType(el) {
  document.querySelectorAll('.apt-type-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedAptType = el.dataset.type;
  const hvOpts = document.getElementById('homeVisitOptions');
  if (selectedAptType === 'home_visit') {
    hvOpts.style.display = 'block';
    selectedHomeVisitType = null;
    document.querySelectorAll('.hv-card').forEach(c => c.classList.remove('selected'));
  } else {
    hvOpts.style.display = 'none';
  }
}

function selectHomeVisitType(el) {
  document.querySelectorAll('.hv-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedHomeVisitType = el.dataset.hv;
}

// ── FILE UPLOAD ───────────────────────────────────────────
function handleFiles(files) {
  Array.from(files).forEach(f => uploadedFiles.push(f));
  renderFilePreviews();
}

function openCamera() { document.getElementById('cameraInput').click(); }

function renderFilePreviews() {
  document.getElementById('filePreview').innerHTML = uploadedFiles.map((f, i) => {
    const isImg = f.type.startsWith('image/');
    return `<div class="file-chip">
      <i class="fas ${isImg ? 'fa-image' : 'fa-file-pdf'}" style="color:${isImg ? '#3498db' : '#e74c3c'}"></i>
      <span>${f.name.length > 20 ? f.name.substring(0,18)+'...' : f.name}</span>
      <i class="fas fa-times remove-file" onclick="removeFile(${i})"></i>
    </div>`;
  }).join('');
}

function removeFile(i) { uploadedFiles.splice(i, 1); renderFilePreviews(); }

const uploadZone = document.getElementById('uploadZone');
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });

// ── LOCATION ──────────────────────────────────────────────
function useCurrentLocation() {
  if (!navigator.geolocation) {
    document.getElementById('step1Err').textContent = 'Geolocation is not supported by your browser.';
    return;
  }

  const btn      = document.getElementById('locationBtn');
  const icon     = document.getElementById('locationIcon');
  const btnText  = document.getElementById('locationBtnText');

  btn.disabled   = true;
  icon.className = 'fas fa-spinner fa-spin';
  btnText.textContent = 'Detecting location...';

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        const addr = data.display_name || `${latitude}, ${longitude}`;
        document.getElementById('s1_address').value = addr;
        document.getElementById('step1Err').textContent = '';
      } catch {
        document.getElementById('s1_address').value = `${latitude}, ${longitude}`;
      }
      btn.disabled   = false;
      icon.className = 'fas fa-location-crosshairs';
      btnText.textContent = 'Use Current Location';
    },
    (err) => {
      const msgs = {
        1: 'Location permission denied. Please allow access and try again.',
        2: 'Location unavailable. Please enter address manually.',
        3: 'Location request timed out. Please try again.'
      };
      document.getElementById('step1Err').textContent = msgs[err.code] || 'Could not get location.';
      btn.disabled   = false;
      icon.className = 'fas fa-location-crosshairs';
      btnText.textContent = 'Use Current Location';
    },
    { timeout: 10000 }
  );
}


function handleStep3Next() {
  if (!validateStep3()) return;
  const isHV = selectedAptType === 'home_visit' && selectedHomeVisitType === 'doctor';
  // Update Step 4 UI based on visit type
  const dispatchBanner = document.getElementById('hvDispatchBanner');
  const step4Sub       = document.getElementById('step4Sub');
  const confirmBtn     = document.getElementById('step4ConfirmBtn');
  if (isHV) {
    dispatchBanner.style.display = 'flex';
    step4Sub.textContent = 'Select the nearest available doctor for emergency home visit';
    confirmBtn.innerHTML = '<i class="fas fa-ambulance"></i> Confirm Home Visit';
  } else {
    dispatchBanner.style.display = 'none';
    step4Sub.textContent = 'Choose a doctor and pick your preferred slot';
    confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Booking';
  }
  goStep(4);
}

async function loadDoctors() {
  const statusEl = document.getElementById('doctorsSearchStatus');
  const listEl   = document.getElementById('doctorsList');
  const problem  = document.getElementById('s3_healthProblem').value.trim();
  const isHV     = selectedAptType === 'home_visit' && selectedHomeVisitType === 'doctor';
  statusEl.style.display = 'block';
  listEl.innerHTML = '';
  selectedDoctorId = null; selectedSlot = null; selectedDate = null;

  try {
    const res  = await fetch(`${API}/doctors`, { headers: { 'Authorization': `Bearer ${token}` } });
    const docs = await res.json();
    statusEl.style.display = 'none';

    if (!docs.length) { listEl.innerHTML = '<p class="loading-txt">No doctors available right now.</p>'; return; }

    const slots = [
      '09:00 AM – 09:30 AM','09:30 AM – 10:00 AM','10:00 AM – 10:30 AM',
      '11:00 AM – 11:30 AM','02:00 PM – 02:30 PM','03:00 PM – 03:30 PM',
      '04:00 PM – 04:30 PM','05:00 PM – 05:30 PM'
    ];
    const today = new Date().toISOString().split('T')[0];

    listEl.innerHTML = docs.map(d => {
      const matchTag = problem
        ? `<span class="dc-match"><i class="fas fa-stethoscope"></i> ${problem.substring(0,40)}${problem.length>40?'...':''}</span>`
        : '';

      if (isHV) {
        // Emergency home visit — no date/slot picker, just select doctor
        return `
          <div class="doctor-card-full hv-doctor" id="dc_${d._id}" onclick="selectHVDoctor(this,'${d._id}')">
            <div class="dcf-top">
              <div class="dc-avatar">${d.profilePhoto ? `<img src="${d.profilePhoto}">` : '<i class="fas fa-user-md"></i>'}</div>
              <div class="dc-info">
                <h4>Dr. ${d.firstName} ${d.lastName}</h4>
                <p>${d.medicalDegree || 'General Physician'}</p>
                ${matchTag}
              </div>
              <div class="hv-available-badge"><i class="fas fa-circle"></i> Available</div>
              <div class="dc-check"><i class="fas fa-check-circle"></i></div>
            </div>
          </div>`;
      }

      // Normal flow — expandable with date + slot picker
      return `
        <div class="doctor-card-full" id="dc_${d._id}">
          <div class="dcf-top" onclick="toggleDoctorSlots('${d._id}')">
            <div class="dc-avatar">${d.profilePhoto ? `<img src="${d.profilePhoto}">` : '<i class="fas fa-user-md"></i>'}</div>
            <div class="dc-info">
              <h4>Dr. ${d.firstName} ${d.lastName}</h4>
              <p>${d.medicalDegree || 'General Physician'}</p>
              ${matchTag}
            </div>
            <div class="dc-expand"><i class="fas fa-chevron-down" id="dcArrow_${d._id}"></i></div>
          </div>
          <div class="dcf-slots" id="dcSlots_${d._id}" style="display:none;">
            <div class="slot-date-row">
              <label><i class="fas fa-calendar"></i> Preferred Date *</label>
              <input type="date" id="dcDate_${d._id}" min="${today}" onchange="selectDoctorDate('${d._id}')">
            </div>
            <div class="slot-label">Available Time Slots</div>
            <div class="slot-grid">
              ${slots.map(s => `<div class="slot-chip" data-slot="${s}" data-doc="${d._id}" onclick="selectSlot(this,'${d._id}')">${s}</div>`).join('')}
            </div>
          </div>
        </div>`;
    }).join('');
  } catch {
    statusEl.style.display = 'none';
    listEl.innerHTML = '<p class="loading-txt">Error loading doctors.</p>';
  }
}

function selectHVDoctor(el, id) {
  document.querySelectorAll('.hv-doctor').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedDoctorId = id;
  // For emergency home visit use today's date and an immediate slot
  selectedDate = new Date().toISOString().split('T')[0];
  selectedSlot = 'As soon as possible';
  document.getElementById('step4Err').textContent = '';
}

function toggleDoctorSlots(docId) {
  const slots = document.getElementById(`dcSlots_${docId}`);
  const arrow = document.getElementById(`dcArrow_${docId}`);
  const isOpen = slots.style.display !== 'none';
  // close all others
  document.querySelectorAll('.dcf-slots').forEach(el => el.style.display = 'none');
  document.querySelectorAll('[id^="dcArrow_"]').forEach(el => el.style.transform = '');
  document.querySelectorAll('.doctor-card-full').forEach(el => el.classList.remove('selected'));
  if (!isOpen) {
    slots.style.display = 'block';
    arrow.style.transform = 'rotate(180deg)';
    document.getElementById(`dc_${docId}`).classList.add('selected');
    selectedDoctorId = docId;
    selectedSlot = null; selectedDate = null;
    document.getElementById('step4Err').textContent = '';
  } else {
    selectedDoctorId = null;
  }
}

function selectDoctorDate(docId) {
  if (selectedDoctorId === docId) selectedDate = document.getElementById(`dcDate_${docId}`).value;
}

function selectSlot(el, docId) {
  document.querySelectorAll(`.slot-chip[data-doc="${docId}"]`).forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedSlot = el.dataset.slot;
  document.getElementById('step4Err').textContent = '';
}

// ── SUBMIT BOOKING ────────────────────────────────────────
async function submitBooking() {
  const err = document.getElementById('step4Err');
  if (!selectedDoctorId) { err.textContent = 'Please select a doctor.'; return; }
  if (!selectedDate)     { err.textContent = 'Please select a preferred date.'; return; }
  if (!selectedSlot)     { err.textContent = 'Please select a time slot.'; return; }
  err.textContent = '';

  const fd = new FormData();
  fd.append('name',             document.getElementById('s1_name').value.trim());
  fd.append('age',              document.getElementById('s1_age').value);
  fd.append('gender',           document.getElementById('s1_gender').value);
  fd.append('relation',         document.getElementById('s1_relation').value);
  fd.append('bloodGroup',       document.getElementById('s1_bloodGroup').value);
  fd.append('presentAddress',   document.getElementById('s1_address').value.trim());
  fd.append('appointmentType',  selectedAptType);
  fd.append('appointmentDate',  selectedDate);
  fd.append('timeSlot',         selectedSlot);
  fd.append('healthProblem',    document.getElementById('s3_healthProblem').value.trim());
  fd.append('currentTreatment', document.getElementById('s3_currentTreatment').value.trim());
  uploadedFiles.forEach(f => fd.append('medicalReports', f));
  fd.append('doctorId', selectedDoctorId);

  try {
    const res  = await fetch(`${API}/book`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
    const data = await res.json();
    if (res.ok) {
      document.getElementById('step4').style.display = 'none';
      document.getElementById('wp4').classList.add('done');
      const isHV = selectedAptType === 'home_visit' && selectedHomeVisitType === 'doctor';
      if (isHV) {
        document.getElementById('successTitle').textContent = 'Home Visit Requested!';
        document.getElementById('successMsg').textContent  = 'Your emergency home visit request has been sent.\nThe nearest doctor will be dispatched shortly.';
      } else {
        document.getElementById('successTitle').textContent = 'Appointment Booked!';
        document.getElementById('successMsg').innerHTML    = 'Your appointment request has been sent to the doctor.<br>You\'ll be notified once it\'s confirmed.';
      }
      document.getElementById('stepSuccess').style.display = 'block';
      await loadAll();
    } else {
      err.textContent = data.error || 'Booking failed.';
    }
  } catch {
    err.textContent = 'Server error. Please try again.';
  }
}

// ── NURSE VISIT ──────────────────────────────────────────
let selectedNurseId   = null;
let selectedNurseSlot = null;

function backFromNurse() {
  document.getElementById('stepNurse').style.display = 'none';
  document.getElementById('wp2').classList.remove('done');
  document.getElementById('wp2').classList.add('active');
  document.getElementById('step2').style.display = 'block';
  currentStep = 2;
}

function backToNurseForm() {
  document.getElementById('nurseResultsPanel').style.display = 'none';
  document.getElementById('nurseFormPanel').style.display = 'block';
  selectedNurseId = null;
}

function selectNurseSlot(el) {
  document.querySelectorAll('#nurseFormPanel .slot-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedNurseSlot = el.dataset.slot;
  document.getElementById('stepNurseErr').textContent = '';
}

async function searchNurses() {
  const err     = document.getElementById('stepNurseErr');
  const problem = document.getElementById('sn_healthProblem').value.trim();
  const gender  = document.querySelector('input[name="nurseGender"]:checked')?.value || 'Any';

  if (!problem)          { err.textContent = 'Please describe the service needed.'; return; }
  if (!selectedNurseSlot){ err.textContent = 'Please select a preferred time slot.'; return; }
  err.textContent = '';

  const listEl = document.getElementById('nurseList');
  listEl.innerHTML = '<p class="loading-txt"><i class="fas fa-spinner fa-spin"></i> Searching nurses...</p>';
  document.getElementById('nurseFormPanel').style.display = 'none';
  document.getElementById('nurseResultsPanel').style.display = 'block';
  document.getElementById('nurseResultsSub').textContent =
    `${gender === 'Any' ? 'All' : gender} nurses available for ${selectedNurseSlot}`;
  selectedNurseId = null;

  try {
    const res   = await fetch(`${API}/nurses?gender=${encodeURIComponent(gender)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const nurses = await res.json();

    if (!nurses.length) {
      listEl.innerHTML = '<p class="loading-txt">No nurses available for the selected slot. Try a different time.</p>';
      return;
    }

    listEl.innerHTML = nurses.map(n => `
      <div class="nurse-card" id="nc_${n._id}" onclick="selectNurse(this,'${n._id}')">
        <div class="nc-avatar ${n.gender === 'Female' ? 'female' : 'male'}">
          ${n.photo ? `<img src="${n.photo}">` : `<i class="fas fa-user-nurse"></i>`}
        </div>
        <div class="nc-info">
          <h4>${n.name}</h4>
          <p><i class="fas fa-venus-mars"></i> ${n.gender} &nbsp;&bull;&nbsp;
             <i class="fas fa-briefcase-medical"></i> ${n.experience} yr${n.experience !== 1 ? 's' : ''} exp</p>
          <p class="nc-speciality"><i class="fas fa-stethoscope"></i> ${n.speciality || 'General Nursing'}</p>
        </div>
        <div class="nc-right">
          <span class="nc-available"><i class="fas fa-circle"></i> Available</span>
          <div class="nc-check"><i class="fas fa-check-circle"></i></div>
        </div>
      </div>`).join('');
  } catch {
    listEl.innerHTML = '<p class="loading-txt">Error searching nurses. Please try again.</p>';
  }
}

function selectNurse(el, id) {
  document.querySelectorAll('.nurse-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedNurseId = id;
  document.getElementById('stepNurseConfirmErr').textContent = '';
}

async function confirmNurseBooking() {
  const err = document.getElementById('stepNurseConfirmErr');
  if (!selectedNurseId) { err.textContent = 'Please select a nurse.'; return; }
  err.textContent = '';

  const body = {
    name:          document.getElementById('s1_name').value.trim(),
    age:           document.getElementById('s1_age').value,
    gender:        document.getElementById('s1_gender').value,
    relation:      document.getElementById('s1_relation').value,
    bloodGroup:    document.getElementById('s1_bloodGroup').value,
    presentAddress:document.getElementById('s1_address').value.trim(),
    healthProblem: document.getElementById('sn_healthProblem').value.trim(),
    nurseId:       selectedNurseId,
    timeSlot:      selectedNurseSlot,
    nurseGender:   document.querySelector('input[name="nurseGender"]:checked')?.value
  };

  try {
    const res  = await fetch(`${API}/book-nurse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById('stepNurse').style.display = 'none';
      document.getElementById('successTitle').textContent = 'Nurse Visit Booked!';
      document.getElementById('successMsg').innerHTML =
        `Your nurse visit has been confirmed for <strong>${selectedNurseSlot}</strong>.<br>The nurse will arrive at your address shortly.`;
      document.getElementById('stepSuccess').style.display = 'block';
      await loadAll();
    } else {
      err.textContent = data.error || 'Booking failed.';
    }
  } catch {
    err.textContent = 'Server error. Please try again.';
  }
}
function logout() {
  ['patientToken','patientMobile','patientProfile'].forEach(k => localStorage.removeItem(k));
  window.location.href = 'login.html';
}

init();
