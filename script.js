// Emergency Contact Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// Initialize page functionality
function initializePage() {
    updateAge();
    updateLastUpdatedTimestamp();
    setupPhotoHandling();
    addAccessibilityFeatures();
}

// Calculate and update age
function updateAge() {
    const birthDate = new Date('1985-03-15');
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    const ageElement = document.getElementById('age');
    if (ageElement) {
        ageElement.textContent = age;
    }
}

// Update timestamp functionality
function updateTimestamp() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    const timestamp = now.toLocaleDateString('en-US', options);
    const lastUpdatedElement = document.getElementById('lastUpdated');
    
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = timestamp;
        localStorage.setItem('emergencyContactLastUpdated', timestamp);
        
        // Show confirmation
        showNotification('Timestamp updated successfully!', 'success');
    }
}

// Initialize last updated timestamp
function updateLastUpdatedTimestamp() {
    const savedTimestamp = localStorage.getItem('emergencyContactLastUpdated');
    const lastUpdatedElement = document.getElementById('lastUpdated');
    
    if (lastUpdatedElement) {
        if (savedTimestamp) {
            lastUpdatedElement.textContent = savedTimestamp;
        } else {
            updateTimestamp(); // Set initial timestamp
        }
    }
}

// Print functionality
function printPage() {
    // Hide interactive elements before printing
    const interactiveElements = document.querySelectorAll(
        '.print-btn, .photo-update-btn, .quick-call-btn, .emergency-call-btn, .service-btn, .update-btn'
    );
    
    interactiveElements.forEach(element => {
        element.style.display = 'none';
    });
    
    // Add print-specific styles
    const printStyles = document.createElement('style');
    printStyles.innerHTML = `
        @media print {
            .emergency-header { 
                background: #dc2626 !important; 
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            .info-card { 
                page-break-inside: avoid; 
                margin-bottom: 1rem;
            }
        }
    `;
    document.head.appendChild(printStyles);
    
    window.print();
    
    // Restore interactive elements after printing
    setTimeout(() => {
        interactiveElements.forEach(element => {
            element.style.display = '';
        });
        document.head.removeChild(printStyles);
    }, 1000);
}

// Call functionality
function callNumber(phoneNumber) {
    if ('navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(200);
    }
    
    window.location.href = `tel:${phoneNumber}`;
    
    // Log the call attempt
    logCallAttempt(phoneNumber);
}

// Emergency call with confirmation
function emergencyCall(phoneNumber, contactName) {
    const modal = document.getElementById('callModal');
    const contactNameElement = document.getElementById('contactName');
    const modalPhoneElement = document.getElementById('modalPhone');
    
    if (modal && contactNameElement && modalPhoneElement) {
        contactNameElement.textContent = contactName;
        modalPhoneElement.textContent = formatPhoneNumber(phoneNumber);
        
        modal.style.display = 'block';
        
        // Store current call info for confirmation
        modal.dataset.phoneNumber = phoneNumber;
        modal.dataset.contactName = contactName;
    }
}

// Confirm emergency call
function confirmCall() {
    const modal = document.getElementById('callModal');
    const phoneNumber = modal.dataset.phoneNumber;
    const contactName = modal.dataset.contactName;
    
    if (phoneNumber) {
        callNumber(phoneNumber);
        logEmergencyCall(phoneNumber, contactName);
    }
    
    closeModal();
}

// Close modal
function closeModal() {
    const modal = document.getElementById('callModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Format phone number for display
function formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different phone number formats
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned === '911') {
        return '911';
    }
    
    return phoneNumber; // Return original if formatting fails
}

// Log call attempts for emergency tracking
function logCallAttempt(phoneNumber) {
    const callLog = JSON.parse(localStorage.getItem('emergencyCallLog') || '[]');
    const timestamp = new Date().toISOString();
    
    callLog.push({
        phoneNumber: phoneNumber,
        timestamp: timestamp,
        type: 'call_attempt'
    });
    
    // Keep only last 50 entries
    if (callLog.length > 50) {
        callLog.splice(0, callLog.length - 50);
    }
    
    localStorage.setItem('emergencyCallLog', JSON.stringify(callLog));
}

// Log emergency calls specifically
function logEmergencyCall(phoneNumber, contactName) {
    const callLog = JSON.parse(localStorage.getItem('emergencyCallLog') || '[]');
    const timestamp = new Date().toISOString();
    
    callLog.push({
        phoneNumber: phoneNumber,
        contactName: contactName,
        timestamp: timestamp,
        type: 'emergency_call'
    });
    
    localStorage.setItem('emergencyCallLog', JSON.stringify(callLog));
}

// Photo handling functionality
function setupPhotoHandling() {
    // Create file input for photo updates
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.id = 'photoInput';
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const profileImage = document.getElementById('profileImage');
                if (profileImage) {
                    profileImage.src = e.target.result;
                    
                    // Save to localStorage for persistence
                    localStorage.setItem('emergencyContactPhoto', e.target.result);
                    
                    showNotification('Photo updated successfully!', 'success');
                }
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.body.appendChild(fileInput);
    
    // Load saved photo if exists
    const savedPhoto = localStorage.getItem('emergencyContactPhoto');
    if (savedPhoto) {
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            profileImage.src = savedPhoto;
        }
    }
}

// Show photo options
function showPhotoOptions() {
    const options = [
        'Upload new photo',
        'Take photo with camera',
        'Reset to default'
    ];
    
    const choice = prompt(`Choose an option:\n1. ${options[0]}\n2. ${options[1]}\n3. ${options[2]}\n\nEnter 1, 2, or 3:`);
    
    switch(choice) {
        case '1':
            document.getElementById('photoInput').click();
            break;
        case '2':
            openCamera();
            break;
        case '3':
            resetPhoto();
            break;
        default:
            break;
    }
}

// Open camera for photo capture
function openCamera() {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        // Create camera modal
        const cameraModal = createCameraModal();
        document.body.appendChild(cameraModal);
    } else {
        alert('Camera access is not supported in this browser. Please use the upload option instead.');
    }
}

// Create camera modal
function createCameraModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h3>Take Photo</h3>
            <video id="cameraVideo" width="400" height="300" autoplay style="border-radius: 8px;"></video>
            <div style="margin-top: 1rem;">
                <button onclick="capturePhoto()" class="confirm-btn">📸 Capture</button>
                <button onclick="closeCameraModal()" class="cancel-btn">Cancel</button>
            </div>
        </div>
    `;
    
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = modal.querySelector('#cameraVideo');
            video.srcObject = stream;
            modal.stream = stream;
        })
        .catch(err => {
            console.error('Error accessing camera:', err);
            alert('Could not access camera. Please use the upload option instead.');
            document.body.removeChild(modal);
        });
    
    return modal;
}

// Capture photo from camera
function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    
    // Update profile image
    const profileImage = document.getElementById('profileImage');
    if (profileImage) {
        profileImage.src = dataURL;
        localStorage.setItem('emergencyContactPhoto', dataURL);
    }
    
    closeCameraModal();
    showNotification('Photo captured successfully!', 'success');
}

// Close camera modal
function closeCameraModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal.stream) {
            const tracks = modal.stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        document.body.removeChild(modal);
    });
}

// Reset photo to default
function resetPhoto() {
    const profileImage = document.getElementById('profileImage');
    if (profileImage) {
        profileImage.src = 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
        localStorage.removeItem('emergencyContactPhoto');
        showNotification('Photo reset to default', 'info');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add accessibility features
function addAccessibilityFeatures() {
    // Add keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey || event.metaKey) {
            switch(event.key) {
                case 'p':
                    event.preventDefault();
                    printPage();
                    break;
                case '1':
                    event.preventDefault();
                    emergencyCall('911', 'Emergency Services');
                    break;
                case '2':
                    event.preventDefault();
                    emergencyCall('+15553456789', 'David Johnson');
                    break;
            }
        }
        
        if (event.key === 'Escape') {
            closeModal();
            closeCameraModal();
        }
    });
    
    // Add focus management
    const interactiveElements = document.querySelectorAll('button, a[href^="tel:"]');
    interactiveElements.forEach((element, index) => {
        element.setAttribute('tabindex', index + 1);
    });
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('callModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Service Worker registration for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Emergency contact page ready
console.log('Emergency Contact Information Page loaded successfully');