// Variable to hold the current email being inspected
let currentInspectedEmail = "";

function switchAdminTab(tabId) {
    const contents = document.querySelectorAll('.admin-tab-content');
    contents.forEach(content => content.classList.remove('active'));
    const buttons = document.querySelectorAll('.tab-nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) selectedTab.classList.add('active');
    if (window.event && window.event.target) window.event.target.classList.add('active');
}

// ==========================================================================
// LIVE MONITORING, INSPECTION & ACCOUNT DELETION LOGIC
// ==========================================================================
function renderAdminTable() {
    const adminTableBody = document.getElementById('adminTableBody');
    const totalRegisteredCard = document.querySelector('.stats-grid .stat-card:nth-child(1) h3');
    const liveActiveCard = document.querySelector('.stats-grid .stat-card:nth-child(2) h3');

    let registeredUsers = JSON.parse(localStorage.getItem('systemUsers')) || [];

    if (adminTableBody) {
        adminTableBody.innerHTML = ""; 
        let activeCounter = 0;

        registeredUsers.forEach(user => {
            if (user.status === "Active Now") activeCounter++;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="user-cell"><strong>${user.name}</strong></td>
                <td><span class="clickable-email" onclick="inspectUser('${user.email}', '${user.name}')">${user.email}</span></td>
                <td><code class="pass-code">${user.password}</code></td>
                <td><span class="status-indicator ${user.status === 'Active Now' ? 'live' : 'offline'}">${user.status}</span></td>
            `;
            adminTableBody.appendChild(row);
        });

        if (totalRegisteredCard) totalRegisteredCard.textContent = registeredUsers.length;
        if (liveActiveCard) liveActiveCard.textContent = activeCounter;
    }
}

// Run render logic upon document startup
document.addEventListener('DOMContentLoaded', renderAdminTable);

// --- OPEN AND POPULATE PREVIEW MODAL (FIXED FOR ADMIN LOOKUP) ---
function inspectUser(email, name) {
    currentInspectedEmail = email;
    const ADMIN_EMAIL = "gerraldbicerabicera@gmail.com";
    
    let savedProfile, savedAvatar;

    // FIX: Kung admin ang ini-inspect, kunin ang admin specific keys, kung hindi, gamitin ang dynamic email keys
    if (email === ADMIN_EMAIL) {
        const adminData = JSON.parse(localStorage.getItem('profile_admin'));
        savedProfile = adminData ? { systemName: adminData.systemName, bio: adminData.bio } : null;
        savedAvatar = localStorage.getItem('avatar_admin');
    } else {
        savedProfile = JSON.parse(localStorage.getItem(`profile_${email}`));
        savedAvatar = localStorage.getItem(`avatar_${email}`);
    }

    // Map ang data sa loob ng elements ng Modal Pop-up
    document.getElementById('modalUserName').textContent = savedProfile?.systemName || name;
    document.getElementById('modalUserEmail').textContent = email;
    document.getElementById('modalUserBio').textContent = savedProfile?.bio || "Hello! I am a new member of this system.";

    const modalAvatarBox = document.getElementById('modalUserAvatar');
    const modalInitial = document.getElementById('modalUserInitial');

    if (savedAvatar && modalAvatarBox) {
        modalAvatarBox.style.backgroundImage = `url('${savedAvatar}')`;
        modalAvatarBox.style.backgroundSize = 'cover';
        modalAvatarBox.style.backgroundPosition = 'center';
        if (modalInitial) modalInitial.style.display = 'none';
    } else {
        modalAvatarBox.style.backgroundImage = 'none';
        if (modalInitial) {
            modalInitial.style.display = 'block';
            modalInitial.textContent = name.charAt(0).toUpperCase();
        }
    }

    // Isalang at ipakita ang pop-up window
    document.getElementById('userPreviewModal').style.display = 'flex';
}

function closeInspectorModal() {
    document.getElementById('userPreviewModal').style.display = 'none';
}

// --- DELETE / TERMINATE ACCOUNT MECHANISM ---
document.addEventListener('DOMContentLoaded', () => {
    const deleteUserBtn = document.getElementById('deleteUserBtn');
    
    if (deleteUserBtn) {
        deleteUserBtn.addEventListener('click', () => {
            if (currentInspectedEmail === "gerraldbicerabicera@gmail.com") {
                alert("Security Error: Root administrator channel cannot be deleted from the system tracker.");
                return;
            }

            const confirmDelete = confirm(`Are you absolutely sure you want to permanently delete and wipe the account data of ${currentInspectedEmail}?`);
            
            if (confirmDelete) {
                let registeredUsers = JSON.parse(localStorage.getItem('systemUsers')) || [];
                
                registeredUsers = registeredUsers.filter(user => user.email !== currentInspectedEmail);
                localStorage.setItem('systemUsers', JSON.stringify(registeredUsers));

                localStorage.removeItem(`profile_${currentInspectedEmail}`);
                localStorage.removeItem(`avatar_${currentInspectedEmail}`);

                alert('Account database line successfully wiped and cleared.');
                closeInspectorModal();
                renderAdminTable(); 
            }
        });
    }
});

// ==========================================================================
// ADMIN PERSONAL ACCOUNT AREA CONFIGURATION
// ==========================================================================
function triggerAvatarUpload() { document.getElementById('avatarFileInput').click(); }
let uploadedAdminAvatarBase64 = localStorage.getItem('avatar_admin') || '';

function handleAvatarChange(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('avatarPreview');
            if (preview) {
                preview.style.backgroundImage = `url('${e.target.result}')`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
            }
            if (document.getElementById('avatarInitial')) document.getElementById('avatarInitial').style.display = 'none';
            uploadedAdminAvatarBase64 = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sysNameInput = document.getElementById('sysNameInput');
    const sysBioInput = document.getElementById('sysBioInput');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const preview = document.getElementById('avatarPreview');

    const savedAdminProfile = localStorage.getItem('profile_admin');
    if (savedAdminProfile && sysNameInput && sysBioInput) {
        const data = JSON.parse(savedAdminProfile);
        sysNameInput.value = data.systemName || "Gerrald Bicera";
        sysBioInput.value = data.bio || "System Administrator.";
    }

    if (uploadedAdminAvatarBase64 && preview) {
        preview.style.backgroundImage = `url('${uploadedAdminAvatarBase64}')`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
        if (document.getElementById('avatarInitial')) document.getElementById('avatarInitial').style.display = 'none';
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            localStorage.setItem('profile_admin', JSON.stringify({ systemName: sysNameInput.value, bio: sysBioInput.value }));
            if (uploadedAdminAvatarBase64) localStorage.setItem('avatar_admin', uploadedAdminAvatarBase64);
            alert('Admin Profile Permanently Saved!');
            renderAdminTable(); // Siguraduhing updated din ang table list sa bagong pangalan
        });
    }
});