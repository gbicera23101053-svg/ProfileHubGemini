// ==========================================================================
// 🔥 FIREBASE CORE MODULES INFRASTRUCTURE LOADERS
// ==========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ⚠️ MISMONG SUSI NG DATABASE MO (HETO ANG GALING KAY GOOGLE FIREBASE)
const firebaseConfig = {
    apiKey: "AIzaSyDtJz-W92bA9uYz9GRKMqmYFRjE134gxSCI",
    authDomain: "matrix-hub-a449e.firebaseapp.com",
    databaseURL: "https://matrix-hub-a449e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "matrix-hub-a449e",
    storageBucket: "matrix-hub-a449e.firebasestorage.app",
    messagingSenderId: "298256043433",
    appId: "1:298256043433:web:ac11e2cc98badba79b6838"
};

// Initialize Firebase Realtime Data System
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Helper function para gawing ligtas ang email string bilang Firebase Node key
function encodeEmailKey(email) {
    return email.replace(/\./g, '_');
}

// Global Avatar Storage Register Variable
let uploadedMemberAvatarBase64 = "";

// Gawing available sa window scope ang avatar triggers dahil naka-ES6 Module na tayo ngayon
window.triggerAvatarUpload = function() {
    const fileInput = document.getElementById('avatarFileInput');
    if (fileInput) fileInput.click();
};

window.handleAvatarChange = function(input) {
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
            if (initial) initial.style.display = 'none';
            
            uploadedMemberAvatarBase64 = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Kinukuha pa rin natin ang active session sa local para malaman kung sino ang kasalukuyang naka-login
    const activeSession = JSON.parse(localStorage.getItem('currentUser'));

    if (!activeSession) {
        alert("System Notification: Access denied. Active authentication token missing.");
        window.location.href = "login.html";
        return;
    }

    const currentEmail = activeSession.email;
    const userFirebaseKey = encodeEmailKey(currentEmail);

    // ==========================================================================
    // 🌓 PART 1: LOCAL ENVIRONMENT THEME TRACKER
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
    // 👤 PART 2: CLOUD DATA HYDRATION & MEMORY STATE SAVER (REAL-TIME FETCH)
    // ==========================================================================
    const sysNameInput = document.getElementById('sysNameInput');
    const sysBioInput = document.getElementById('sysBioInput');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarInitial = document.getElementById('avatarInitial');

    // 🔄 Humila ng data mula sa Cloud Database pagka-load ng profile panel
    const userProfileRef = ref(db, 'users/' + userFirebaseKey);
    get(userProfileRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (sysNameInput) sysNameInput.value = userData.name || activeSession.name;
            if (sysBioInput) sysBioInput.value = userData.bio || "";
            
            if (userData.avatar && avatarPreview) {
                uploadedMemberAvatarBase64 = userData.avatar;
                avatarPreview.style.backgroundImage = `url('${userData.avatar}')`;
                avatarPreview.style.backgroundSize = 'cover';
                avatarPreview.style.backgroundPosition = 'center';
                if (avatarInitial) avatarInitial.style.display = 'none';
            } else if (avatarInitial) {
                avatarInitial.textContent = (userData.name || activeSession.name).charAt(0).toUpperCase();
            }
        } else {
            if (sysNameInput) sysNameInput.value = activeSession.name;
            if (avatarInitial) avatarInitial.textContent = activeSession.name.charAt(0).toUpperCase();
        }
    }).catch((error) => console.error("Error pulling database state: ", error));

    // 💾 I-commit ang binagong profile data diretso sa Cloud Server!
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const updatedName = sysNameInput.value.trim();
            const updatedBio = sysBioInput.value.trim();

            const profilePayload = {
                name: updatedName,
                email: currentEmail,
                bio: updatedBio,
                avatar: uploadedMemberAvatarBase64,
                status: "Online"
            };

            // Isulat sa Firebase DB path: users/email_key/
            set(ref(db, 'users/' + userFirebaseKey), profilePayload)
                .then(() => {
                    // Panatilihing updated din ang local mirror token ng active logging data
                    localStorage.setItem('currentUser', JSON.stringify({
                        name: updatedName,
                        email: currentEmail
                    }));
                    alert("Cloud Registry State committed successfully! Reflecting cross-device.");
                })
                .catch((error) => alert("Database transmission block encountered: " + error));
        });
    }

    // ==========================================================================
    // 🛡️ PART 3: ADMINISTRATOR FEED LOADER (REAL-TIME SYNC FROM ROOT CLOUD)
    // ==========================================================================
    const memberViewAdminName = document.getElementById('memberViewAdminName');
    const memberViewAdminBio = document.getElementById('memberViewAdminBio');
    const memberViewAdminAvatar = document.getElementById('memberViewAdminAvatar');
    const memberViewAdminInitial = document.getElementById('memberViewAdminInitial');

    const adminFirebaseKey = encodeEmailKey("gerraldbicerabicera@gmail.com");
    const adminProfileRef = ref(db, 'users/' + adminFirebaseKey);

    // 🔥 Gagamit tayo ng onValue para kapag binago mo ang profile mo sa laptop mo,
    // instant na magbabago ang info mo sa screen ng phone ng tester nang walang refresh!
    onValue(adminProfileRef, (snapshot) => {
        const DEFAULT_ADMIN_NAME = "Gerrald Bicera";
        const DEFAULT_ADMIN_BIO = "I am a computer science student and I love to explore what technology can do including how far I can go with AI.";

        if (snapshot.exists()) {
            const adminData = snapshot.val();
            if (memberViewAdminName) memberViewAdminName.textContent = adminData.name || DEFAULT_ADMIN_NAME;
            if (memberViewAdminBio) memberViewAdminBio.textContent = adminData.bio || DEFAULT_ADMIN_BIO;
            
            if (adminData.avatar && memberViewAdminAvatar) {
                memberViewAdminAvatar.style.backgroundImage = `url('${adminData.avatar}')`;
                memberViewAdminAvatar.style.backgroundSize = 'cover';
                memberViewAdminAvatar.style.backgroundPosition = 'center';
                if (memberViewAdminInitial) memberViewAdminInitial.style.display = 'none';
            } else {
                if (memberViewAdminAvatar) memberViewAdminAvatar.style.backgroundImage = 'none';
                if (memberViewAdminInitial) {
                    memberViewAdminInitial.textContent = "G";
                    memberViewAdminInitial.style.display = 'block';
                }
            }
        } else {
            if (memberViewAdminName) memberViewAdminName.textContent = DEFAULT_ADMIN_NAME;
            if (memberViewAdminBio) memberViewAdminBio.textContent = DEFAULT_ADMIN_BIO;
            if (memberViewAdminInitial) {
                memberViewAdminInitial.textContent = "G";
                memberViewAdminInitial.style.display = 'block';
            }
        }
    });

    // ==========================================================================
    // 🚪 PART 4: SECURITY GATEWAY HUB EXCLUSION
    // ==========================================================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // I-update ang status sa Firebase database bago mag-sign out
            set(ref(db, `users/${userFirebaseKey}/status`), "Offline").then(() => {
                localStorage.removeItem('currentUser');
                alert("Cryptographic network channel severed. Returning to gateway hub.");
                window.location.href = "login.html";
            });
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
                onmouseout = () => { 
                    if(!cell.dataset.active) {
                        cell.style.background = document.body.classList.contains('light-mode') ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)";
                    } 
                };

                cell.addEventListener('click', () => {
                    if (isGameOver || cell.dataset.active) return;
                    cell.dataset.active = "true";

                    if (minePositions.includes(i)) {
                        cell.style.background = "rgba(255,0,127,0.3)";
                        cell.style.borderColor = "#ff007f";
                        cell.textContent = "💣";
                        isGameOver = true;
                        revealAllMines();
                        statusText.textContent = "💥 Game Over";
                        statusText.style.cssText = "color: #ff007f; background: rgba(255,0,127,0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid #ff007f;";
                        return;
                    }

                    cell.style.background = "rgba(0,255,255,0.2)";
                    cell.style.borderColor = "#00ffff";
                    cell.textContent = "💎";
                    revealedCells++;

                    if (revealedCells === (GRID_SIZE - desiredMines)) {
                        isGameOver = true;
                        revealAllMines();
                        statusText.textContent = "🎉 Sector Clear!";
                        statusText.style.cssText = "color: #00ff00; background: rgba(0,255,0,0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid #00ff00;";
                        alert("Outstanding strategy! Vector fully clear!");
                    }
                });

                gridBoard.appendChild(cell);
            }
        });
    }

    function revealAllMines() {
        if (!gridBoard) return;
        const items = gridBoard.children;
        minePositions.forEach(pos => {
            if (items[pos]) {
                items[pos].style.background = "rgba(255,0,127,0.3)";
                items[pos].style.borderColor = "#ff007f";
                items[pos].textContent = "💣";
            }
        });
    }

    // ==========================================================================
    // 🔀 CORE TAB SWITCHING INTERACTION MECHANISM
    // ==========================================================================
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    const contentPanels = document.querySelectorAll('.tab-content-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            contentPanels.forEach(panel => panel.style.display = 'none');

            button.classList.add('active');
            const targetId = button.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.style.display = 'block';
            }
        });
    });
});