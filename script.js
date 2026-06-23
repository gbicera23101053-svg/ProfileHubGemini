// ==========================================================================
// 1. SYSTEM THEME CONFIGURATIONS (DAY & NIGHT DETECTOR)
// ==========================================================================
const toggleSwitch = document.querySelector('#checkbox');
const currentTheme = localStorage.getItem('theme') || 'dark-mode';
const themeText = document.getElementById('theme-text');

document.body.className = currentTheme;

if (toggleSwitch && themeText) {
    if (currentTheme === 'light-mode') {
        toggleSwitch.checked = true;
        themeText.textContent = "Light Mode";
    } else {
        themeText.textContent = "Dark Mode";
    }

    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.body.className = 'light-mode';
            themeText.textContent = "Light Mode";
            localStorage.setItem('theme', 'light-mode');
        } else {
            document.body.className = 'dark-mode';
            themeText.textContent = "Dark Mode";
            localStorage.setItem('theme', 'dark-mode');
        }    
    }, false);
}

// ==========================================================================
// 2. SECRET SECURITY & INTERMEDIATE ROUTING (ADMIN CREDENTIALS CHECKER)
// ==========================================================================
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); 

        const emailInput = loginForm.querySelector('input[type="email"]').value;
        const passwordInput = loginForm.querySelector('input[type="password"]').value;

        const ADMIN_EMAIL = "gerraldbicerabicera@gmail.com";
        const ADMIN_PASSWORD = "Gabicera06";

        if (emailInput === ADMIN_EMAIL && passwordInput === ADMIN_PASSWORD) {
            alert("Secret Access Verified. Welcome Back Administrator.");
            window.location.href = "admin.html";
        } else {
            alert("Login Successful! Redirecting to user interface...");
            window.location.href = "index.html"; 
        }
    });
}

// ==========================================================================
// 3. ADMIN PANEL CONTROL LAYER (TAB FUNCTIONALITY)
// ==========================================================================
function switchAdminTab(tabId) {
    const contents = document.querySelectorAll('.admin-tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const buttons = document.querySelectorAll('.tab-nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    const evt = window.event;
    if (evt && evt.target) {
        evt.target.classList.add('active');
    }
}

// ==========================================================================
// 4. INTERACTIVE DYNAMIC PROFILE AVATAR UPLOADER (IMAGE INJECTOR)
// ==========================================================================
function triggerAvatarUpload() {
    document.getElementById('avatarFileInput').click();
}

// Global variable para pansamantalang hawakan ang bagong upload na avatar base64 string
let uploadedAvatarBase64 = localStorage.getItem('adminAvatar') || '';

function handleAvatarChange(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const avatarBubble = document.getElementById('avatarPreview');
            const avatarInitial = document.getElementById('avatarInitial');

            // I-inject ang base64 image asset bilang CSS background display
            avatarBubble.style.backgroundImage = `url('${e.target.result}')`;
            avatarBubble.style.backgroundSize = 'cover';
            avatarBubble.style.backgroundPosition = 'center';
            
            // Itago ang text initial letter placeholder
            if (avatarInitial) {
                avatarInitial.style.display = 'none';
            }

            // Itabi sa global variable ang base64 string para maisave mamaya sa localstorage pag kinlik ang save button
            uploadedAvatarBase64 = e.target.result;
        };

        reader.readAsDataURL(input.files[0]);
    }
}

// ==========================================================================
// 5. ADMIN PROFILE STORAGE LOGIC (PERSISTENT SAVING VIA LOCALSTORAGE)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const sysNameInput = document.getElementById('sysNameInput');
    const sysBioInput = document.getElementById('sysBioInput');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const avatarBubble = document.getElementById('avatarPreview');
    const avatarInitial = document.getElementById('avatarInitial');

    // --- A. I-LOAD ANG PROFILE AT AVATAR DATA PAGKA-OPEN NG PAGE ---
    if (sysNameInput && sysBioInput) {
        const savedProfile = localStorage.getItem('adminProfileData');
        const savedAvatar = localStorage.getItem('adminAvatar');
        
        // I-load ang System Name at Bio Text
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            sysNameInput.value = profile.systemName || "Welcome to the Mountains";
            sysBioInput.value = profile.bio || "Computer Science student at DMMMSU managing data system assets.";
        }

        // I-load ang Avatar Image kung mayroon
        if (savedAvatar && avatarBubble) {
            avatarBubble.style.backgroundImage = `url('${savedAvatar}')`;
            avatarBubble.style.backgroundSize = 'cover';
            avatarBubble.style.backgroundPosition = 'center';
            if (avatarInitial) {
                avatarInitial.style.display = 'none';
            }
        }
    }

    // --- B. I-SAVE ANG BUONG DATA PAG KINLIK ANG "Save Profile Configuration" ---
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const profileData = {
                systemName: sysNameInput.value,
                bio: sysBioInput.value
            };

            // Isulat sa localStorage ang mga text fields
            localStorage.setItem('adminProfileData', JSON.stringify(profileData));
            
            // Isulat sa localStorage ang avatar image data kung may na-upload
            if (uploadedAvatarBase64) {
                localStorage.setItem('adminAvatar', uploadedAvatarBase64);
            }
            
            alert('Profile configuration permanently saved!');
        });
    }
});