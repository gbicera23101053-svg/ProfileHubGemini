document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form'); 
    const ADMIN_EMAIL = "gerraldbicerabicera@gmail.com";

    // ==========================================================================
    // ⚙️ SYSTEM INIT: Siguraduhing ligtas ang Admin at ang Database Array
    // ==========================================================================
    let registeredUsers = JSON.parse(localStorage.getItem('systemUsers')) || [];
    
    // Proteksyon: Siguraduhing laging nakatala ang Admin sa system account array
    const adminExists = registeredUsers.some(user => user.email === ADMIN_EMAIL);
    if (!adminExists) {
        const savedAdminProfile = JSON.parse(localStorage.getItem('profile_admin'));
        const adminName = savedAdminProfile?.systemName || "Gerrald Bicera";

        registeredUsers.push({
            name: adminName,
            email: ADMIN_EMAIL,
            password: "adminpassword123", // Palitan mo ito ng permanenteng password mo
            status: "Active Now"
        });
        localStorage.setItem('systemUsers', JSON.stringify(registeredUsers));
    }

    // ==========================================================================
    // 🔑 SECTION 1: LOGIN SUBSYSTEM HANDLER
    // ==========================================================================
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('login-email').value.trim();
            const passwordInput = document.getElementById('login-password').value;

            let currentUsers = JSON.parse(localStorage.getItem('systemUsers')) || [];

            // Pagpapatunay ng Credentials
            const userFound = currentUsers.find(user => user.email.toLowerCase() === emailInput.toLowerCase() && user.password === passwordInput);

            if (userFound) {
                // I-update ang status ng user na nag-login para sa live monitor ng Admin
                currentUsers = currentUsers.map(user => {
                    if (user.email.toLowerCase() === emailInput.toLowerCase()) {
                        user.status = "Active Now";
                    }
                    return user;
                });
                localStorage.setItem('systemUsers', JSON.stringify(currentUsers));

                // 🌟 PATCH FOR MEMBER.JS DYNAMIC SYNC:
                // Kinukuha muna natin kung may custom profile settings na si member para kapag nag-login siya,
                // ang huling binago niyang Display Name ang babasahin ng portal imbis na yung old structural template name niya.
                const savedCustomProfile = JSON.parse(localStorage.getItem(`profile_${userFound.email}`));
                const finalDisplayName = savedCustomProfile?.systemName || userFound.name;

                // I-save ang Active User Session
                localStorage.setItem('currentUser', JSON.stringify({
                    name: finalDisplayName,
                    email: userFound.email
                }));

                alert(`Welcome back, ${finalDisplayName}!`);

                // Smart Routing Mechanism
                if (userFound.email === ADMIN_EMAIL) {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "profile.html"; 
                }
            } else {
                alert("Access Denied: Invalid Email Address or Password.");
            }
        });
    }

    // ==========================================================================
    // 📝 SECTION 2: REGISTER SUBSYSTEM HANDLER (FIXED MATCHING IDs)
    // ==========================================================================
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // KINABIT SA EKSAKTONG IDs NG REGISTER.HTML MO: reg-name, reg-email, reg-password
            const regName = document.getElementById('reg-name').value.trim();
            const regEmail = document.getElementById('reg-email').value.trim();
            const regPassword = document.getElementById('reg-password').value;

            // Proteksyon laban sa walang laman o space-only submissions
            if (!regName || !regEmail || !regPassword) {
                alert("Registration Error: All system parameters must be completely filled out.");
                return;
            }

            // 1. PULL: Kuhanin muna ang kasalukuyang listahan para walang burahan
            let dbUsers = JSON.parse(localStorage.getItem('systemUsers')) || [];

            // 2. VALIDATE: Suriin kung may kaparehas nang email para iwas duplicate accounts
            const isEmailTaken = dbUsers.some(user => user.email.toLowerCase() === regEmail.toLowerCase());

            if (isEmailTaken) {
                alert("Registration Error: This email address is already registered in the database!");
                return;
            }

            // 3. PUSH: Ligtas na isama ang bagong miyembro nang hindi nagagalaw ang mga lumang records
            dbUsers.push({
                name: regName,
                email: regEmail,
                password: regPassword,
                status: `Offline` 
            });

            // 4. COMMIT: I-save pabalik sa LocalStorage ang pinagsamang listahan
            localStorage.setItem('systemUsers', JSON.stringify(dbUsers));

            alert("Account successfully encrypted and registered to System Directory!");
            window.location.href = "login.html"; 
        });
    }
});