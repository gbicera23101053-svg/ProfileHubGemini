let activeUser = JSON.parse(localStorage.getItem('currentUser')) || { email: 'guest@member.com', name: 'New Member', role: 'member' };

const memberProfileKey = `profile_${activeUser.email}`;
const memberAvatarKey = `avatar_${activeUser.email}`;

let uploadedMemberAvatarBase64 = localStorage.getItem(memberAvatarKey) || '';

function triggerAvatarUpload() { document.getElementById('avatarFileInput').click(); }

function handleAvatarChange(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarBubble = document.getElementById('avatarPreview');
            if (avatarBubble) {
                avatarBubble.style.backgroundImage = `url('${e.target.result}')`;
                avatarBubble.style.backgroundSize = 'cover';
                avatarBubble.style.backgroundPosition = 'center';
            }
            if (document.getElementById('avatarInitial')) document.getElementById('avatarInitial').style.display = 'none';
            uploadedMemberAvatarBase64 = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sysNameInput = document.getElementById('sysNameInput');
    const sysBioInput = document.getElementById('sysBioInput');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const avatarBubble = document.getElementById('avatarPreview');
    const avatarInitial = document.getElementById('avatarInitial');

    const savedMemberProfile = localStorage.getItem(memberProfileKey);
    if (sysNameInput && sysBioInput) {
        if (savedMemberProfile) {
            const data = JSON.parse(savedMemberProfile);
            sysNameInput.value = data.systemName || "";
            sysBioInput.value = data.bio || "";
        } else {
            sysNameInput.value = activeUser.name;
            sysBioInput.value = "Hello! I am a new member of this system.";
        }
    }

    if (uploadedMemberAvatarBase64 && avatarBubble) {
        avatarBubble.style.backgroundImage = `url('${uploadedMemberAvatarBase64}')`;
        avatarBubble.style.backgroundSize = 'cover';
        avatarBubble.style.backgroundPosition = 'center';
        if (avatarInitial) avatarInitial.style.display = 'none';
    } else if (avatarInitial) {
        avatarInitial.textContent = activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'M';
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            localStorage.setItem(memberProfileKey, JSON.stringify({ systemName: sysNameInput.value, bio: sysBioInput.value }));
            if (uploadedMemberAvatarBase64) localStorage.setItem(memberAvatarKey, uploadedMemberAvatarBase64);
            
            let globalUsers = JSON.parse(localStorage.getItem('systemUsers')) || [];
            let userIndex = globalUsers.findIndex(u => u.email === activeUser.email);
            if (userIndex !== -1) {
                globalUsers[userIndex].name = sysNameInput.value;
                localStorage.setItem('systemUsers', JSON.stringify(globalUsers));
            }

            alert('Your personal interface modifications are permanently cached!');
        });
    }
});