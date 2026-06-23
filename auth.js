// Central user base sa localStorage
let registeredUsers = JSON.parse(localStorage.getItem('systemUsers')) || [
    { name: "Gerrald Bicera", email: "gerraldbicerabicera@gmail.com", password: "Gabicera06", status: "Active Now" },
    { name: "Sample Member", email: "member.test@domain.com", password: "userPass123", status: "Active 4 mins ago" }
];

if (!localStorage.getItem('systemUsers')) {
    localStorage.setItem('systemUsers', JSON.stringify(registeredUsers));
}

// === REGISTRATION LOGIC ===
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const regName = document.getElementById('reg-name').value;
        const regEmail = document.getElementById('reg-email').value;
        const regPassword = document.getElementById('reg-password').value;

        if (registeredUsers.some(user => user.email === regEmail)) {
            alert("Email is already registered!");
            return;
        }

        registeredUsers.push({
            name: regName,
            email: regEmail,
            password: regPassword,
            status: "Offline"
        });

        localStorage.setItem('systemUsers', JSON.stringify(registeredUsers));
        alert("Account Successfully Created! Redirecting to login...");
        window.location.href = "login.html";
    });
}

// === LOGIN LOGIC ===
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); 

        const emailInput = document.getElementById('login-email').value;
        const passwordInput = document.getElementById('login-password').value;

        const ADMIN_EMAIL = "gerraldbicerabicera@gmail.com";
        const ADMIN_PASSWORD = "Gabicera06";

        // A. Admin Login Verification
        if (emailInput === ADMIN_EMAIL && passwordInput === ADMIN_PASSWORD) {
            localStorage.setItem('currentUser', JSON.stringify({ email: ADMIN_EMAIL, role: 'admin' }));
            alert("Secret Access Verified. Welcome Back Administrator.");
            window.location.href = "admin.html";
            return;
        }

        // B. Regular Registered Member Verification
        const matchedMember = registeredUsers.find(user => user.email === emailInput && user.password === passwordInput);

        if (matchedMember) {
            matchedMember.status = "Active Now";
            localStorage.setItem('systemUsers', JSON.stringify(registeredUsers));
            
            localStorage.setItem('currentUser', JSON.stringify({ 
                name: matchedMember.name, 
                email: matchedMember.email, 
                role: 'member' 
            }));

            alert(`Welcome back, ${matchedMember.name}! Redirecting to your panel...`);
            window.location.href = "profile.html"; 
        } else {
            alert("Invalid Email or Password!");
        }
    });
}