// ==========================================================================
// 🌌 GLOBAL STATE REGISTERS & AVATAR LOADER ENGINE
// ==========================================================================
let uploadedMemberAvatarBase64 = "";

function triggerAvatarUpload() { 
    const fileInput = document.getElementById('avatarFileInput');
    if (fileInput) fileInput.click(); 
}

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
            const initial = document.getElementById('avatarInitial');
            if (initial) {
                initial.style.display = 'none';
            }
            uploadedMemberAvatarBase64 = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_EMAIL = "gerraldbicerabicera@gmail.com";
    const activeSession = JSON.parse(localStorage.getItem('currentUser'));

    // Secure Verification Check Gateway
    if (!activeSession) {
        alert("System Notification: Access denied. Active authentication token missing.");
        window.location.href = "login.html";
        return;
    }

    const currentEmail = activeSession.email;

    // ==========================================================================
    // 🌓 PART 1: DYNAMIC ENVIRONMENT THEME TRACKER
    // ==========================================================================
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const bodyEl = document.getElementById('dashboardBody');

    const savedTheme = localStorage.getItem(`theme_${currentEmail}`) || 'dark-mode';
    if (bodyEl) bodyEl.className = savedTheme;

    if (themeToggleBtn && bodyEl) {
        themeToggleBtn.addEventListener('click', () => {
            if (bodyEl.classList.contains('dark-mode')) {
                bodyEl.classList.replace('dark-mode', 'light-mode');
                localStorage.setItem(`theme_${currentEmail}`, 'light-mode');
            } else {
                bodyEl.classList.replace('light-mode', 'dark-mode');
                localStorage.setItem(`theme_${currentEmail}`, 'dark-mode');
            }
        });
    }

    // ==========================================================================
    // 👤 PART 2: DATA HYDRATION & MEMORY STATE SAVER
    // ==========================================================================
    const sysNameInput = document.getElementById('sysNameInput');
    const sysBioInput = document.getElementById('sysBioInput');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarInitial = document.getElementById('avatarInitial');

    const savedMemberProfile = localStorage.getItem(`profile_${currentEmail}`);
    uploadedMemberAvatarBase64 = localStorage.getItem(`avatar_${currentEmail}`) || '';

    if (savedMemberProfile && sysNameInput && sysBioInput) {
        const data = JSON.parse(savedMemberProfile);
        sysNameInput.value = data.systemName || activeSession.name;
        sysBioInput.value = data.bio || "";
    } else if (sysNameInput) {
        sysNameInput.value = activeSession.name;
    }

    if (uploadedMemberAvatarBase64 && avatarPreview) {
        avatarPreview.style.backgroundImage = `url('${uploadedMemberAvatarBase64}')`;
        avatarPreview.style.backgroundSize = 'cover';
        avatarPreview.style.backgroundPosition = 'center';
        if (avatarInitial) avatarInitial.style.display = 'none';
    } else if (avatarInitial && sysNameInput && sysNameInput.value) {
        avatarInitial.textContent = sysNameInput.value.charAt(0).toUpperCase();
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const profilePayload = {
                systemName: sysNameInput.value.trim(),
                bio: sysBioInput.value.trim()
            };

            localStorage.setItem(`profile_${currentEmail}`, JSON.stringify(profilePayload));
            if (uploadedMemberAvatarBase64) {
                localStorage.setItem(`avatar_${currentEmail}`, uploadedMemberAvatarBase64);
            }

            // Sync sa central master accounts list array
            let registeredUsers = JSON.parse(localStorage.getItem('systemUsers')) || [];
            registeredUsers = registeredUsers.map(user => {
                if (user.email === currentEmail) {
                    user.name = profilePayload.systemName;
                }
                return user;
            });
            localStorage.setItem('systemUsers', JSON.stringify(registeredUsers));

            // Sync structural session models
            localStorage.setItem('currentUser', JSON.stringify({
                name: profilePayload.systemName,
                email: currentEmail
            }));

            alert("Member directory data state committed successfully!");
        });
    }

    // ==========================================================================
    // 🛡️ PART 3: ADMINISTRATOR FEED LOADER (SOLID DEVICE FALLBACK PATCHED)
    // ==========================================================================
    const memberViewAdminName = document.getElementById('memberViewAdminName');
    const memberViewAdminBio = document.getElementById('memberViewAdminBio');
    const memberViewAdminAvatar = document.getElementById('memberViewAdminAvatar');
    const memberViewAdminInitial = document.getElementById('memberViewAdminInitial');

    // Mga permanenteng default values para kapag walang nakitang admin profile sa laptop ng nag-te-test
    const DEFAULT_ADMIN_NAME = "Gerrald Bicera";
    const DEFAULT_ADMIN_BIO = "I am a computer science student and I love to explore what technology can do including how far I can go with AI.";

    const savedAdminProfile = localStorage.getItem('profile_admin');
    if (savedAdminProfile) {
        const adminData = JSON.parse(savedAdminProfile);
        if (memberViewAdminName) memberViewAdminName.textContent = adminData.systemName || DEFAULT_ADMIN_NAME;
        if (memberViewAdminBio) memberViewAdminBio.textContent = adminData.bio || DEFAULT_ADMIN_BIO;
    } else {
        if (memberViewAdminName) memberViewAdminName.textContent = DEFAULT_ADMIN_NAME;
        if (memberViewAdminBio) memberViewAdminBio.textContent = DEFAULT_ADMIN_BIO;
    }

    const savedAdminAvatar = localStorage.getItem('avatar_admin');
    if (savedAdminAvatar && memberViewAdminAvatar) {
        memberViewAdminAvatar.style.backgroundImage = `url('${savedAdminAvatar}')`;
        memberViewAdminAvatar.style.backgroundSize = 'cover';
        memberViewAdminAvatar.style.backgroundPosition = 'center';
        if (memberViewAdminInitial) memberViewAdminInitial.style.display = 'none';
    } else {
        if (memberViewAdminAvatar) {
            // Kung walang custom base64 image sa device ng tester, tanggalin ang background url para lumitaw ang neon initial text background
            memberViewAdminAvatar.style.backgroundImage = 'none';
        }
        if (memberViewAdminInitial) {
            memberViewAdminInitial.textContent = "G";
            memberViewAdminInitial.style.display = 'block';
        }
    }

    // ==========================================================================
    // 🚪 PART 4: SECURITY GATEWAY HUB EXCLUSION
    // ==========================================================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            let registeredUsers = JSON.parse(localStorage.getItem('systemUsers')) || [];
            registeredUsers = registeredUsers.map(user => {
                if (user.email === currentEmail) {
                    user.status = "Offline";
                }
                return user;
            });
            localStorage.setItem('systemUsers', JSON.stringify(registeredUsers));
            
            localStorage.removeItem('currentUser');
            alert("Cryptographic network channel severed. Returning to gateway hub.");
            window.location.href = "login.html";
        });
    }

    // ==========================================================================
    // 💣 PART 5: EMBEDDED MATRIX MINES LOOP ENGINE
    // ==========================================================================
    const gridBoard = document.getElementById('minesGridBoard');
    const startBtn = document.getElementById('startGameBtn');
    const mineInput = document.getElementById('mineCountInput');
    const statusText = document.getElementById('gameStatusText');

    const GRID_SIZE = 16; 
    let minePositions = [];
    let revealedCells = 0;
    let isGameOver = false;

    if (gridBoard) {
        gridBoard.innerHTML = '';
        for (let i = 0; i < GRID_SIZE; i++) {
            const blankCell = document.createElement('div');
            blankCell.style.cssText = "background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: not-allowed; opacity: 0.5;";
            gridBoard.appendChild(blankCell);
        }
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            let desiredMines = parseInt(mineInput.value) || 3;
            if (desiredMines < 1) desiredMines = 1;
            if (desiredMines > 10) desiredMines = 10;
            mineInput.value = desiredMines;

            gridBoard.innerHTML = '';
            minePositions = [];
            revealedCells = 0;
            isGameOver = false;

            statusText.textContent = "Playing";
            statusText.style.cssText = "color: #00ffff; background: rgba(0,255,255,0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid #00ffff;";

            while (minePositions.length < desiredMines) {
                let rPos = Math.floor(Math.random() * GRID_SIZE);
                if (!minePositions.includes(rPos)) minePositions.push(rPos);
            }

            for (let i = 0; i < GRID_SIZE; i++) {
                const cell = document.createElement('div');
                cell.style.cssText = "background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer; user-select: none; transition: 0.15s;";
                
                cell.onmouseover = () => { 
                    if(!cell.dataset.active) {
                        cell.style.background = document.body.classList.contains('light-mode') ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)";
                    } 
                };
                cell.onmouseout = () => { 
                    if(!cell.dataset.active) {