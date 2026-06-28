// Variable to hold the current email being inspected
let currentInspectedEmail = "";
const ADMIN_EMAIL = "gerraldbicerabicera@gmail.com";

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

    // Kuhanin ang central local database array
    let registeredUsers = JSON.parse(localStorage.getItem('systemUsers')) || [];
    let savedAdminProfile = JSON.parse(localStorage.getItem('profile_admin'));

    if (adminTableBody) {
        adminTableBody.innerHTML = ""; 
        let activeCounter = 0;

        registeredUsers.forEach(user => {
            if (user.status === "Active Now") activeCounter++;

            // SYNC CHECK: Kung admin account ang tinutukoy, i-pull ang real-time persistent profile name
            let displayName = user.name;
            if (user.email === ADMIN_EMAIL && savedAdminProfile?.systemName) {
                displayName = savedAdminProfile.systemName;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="user-cell"><strong>${displayName}</strong></td>
                <td><span class="clickable-email" onclick="inspectUser('${user.email}', '${displayName}')">${user.email}</span></td>
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
    
    let savedProfile, savedAvatar;

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
            if (currentInspectedEmail === ADMIN_EMAIL) {
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
// ADMIN PERSONAL ACCOUNT AREA CONFIGURATION (PERMANENT DATA RE-SYNC)
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
    const loggedInAsText = document.querySelector('.admin-control-panel-header p, .admin-header-main p');

    // I-LOAD ANG ADMIN DATA AT SIGURADUHING DI MABUBURA SA HARD REFRESH
    const savedAdminProfile = localStorage.getItem('profile_admin');
    if (savedAdminProfile && sysNameInput && sysBioInput) {
        const data = JSON.parse(savedAdminProfile);
        sysNameInput.value = data.systemName || "Gerrald Bicera";
        sysBioInput.value = data.bio || "System Administrator.";
        if (loggedInAsText) {
            loggedInAsText.innerHTML = `Logged in as: <strong>${sysNameInput.value}</strong> (${ADMIN_EMAIL})`;
        }
    } else {
        if (sysNameInput && sysBioInput) {
            sysNameInput.value = "Gerrald Bicera";
            sysBioInput.value = "System Administrator.";
        }
    }

    if (uploadedAdminAvatarBase64 && preview) {
        preview.style.backgroundImage = `url('${uploadedAdminAvatarBase64}')`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
        if (document.getElementById('avatarInitial')) document.getElementById('avatarInitial').style.display = 'none';
    }

    // CRITICAL FIX: PAG-SAVE AT PAGKABIT NG ADMIN INFO SA SYSTEM_USERS DATA ARRAY
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const updatedProfile = { systemName: sysNameInput.value, bio: sysBioInput.value };
            localStorage.setItem('profile_admin', JSON.stringify(updatedProfile));
            
            if (uploadedAdminAvatarBase64) {
                localStorage.setItem('avatar_admin', uploadedAdminAvatarBase64);
            }

            // RE-SYNC PROCESS: I-update din ang entry sa master array para hindi mag-clash sa directory
            let registeredUsers = JSON.parse(localStorage.getItem('systemUsers')) || [];
            let adminIndex = registeredUsers.findIndex(user => user.email === ADMIN_EMAIL);
            
            if (adminIndex !== -1) {
                registeredUsers[adminIndex].name = sysNameInput.value;
            } else {
                // Kung wala pa sa array ang main admin email mo, kusa itong gagawa para hindi mabura ang record mo kailanman
                registeredUsers.push({
                    name: sysNameInput.value,
                    email: ADMIN_EMAIL,
                    password: "RootPassword123", // Palitan mo ng active password mo kung nais mo
                    status: "Active Now"
                });
            }
            
            localStorage.setItem('systemUsers', JSON.stringify(registeredUsers));

            alert('Admin Profile and Directory DB Sync Success!');
            if (loggedInAsText) {
                loggedInAsText.innerHTML = `Logged in as: <strong>${sysNameInput.value}</strong> (${ADMIN_EMAIL})`;
            }
            renderAdminTable(); 
        });
    }
});