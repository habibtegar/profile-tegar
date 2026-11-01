/**
 * contact.js — Habib Tegar Portfolio
 * Enhanced contact form validation, real-time feedback, and WhatsApp redirection.
 */

(function initContactForm() {
    const WA_NUMBER = "6281271447069";
    const contactForm = document.getElementById("contactForm");

    if (!contactForm) return;

    const fullNameInput = document.getElementById("fullName");
    const emailInput    = document.getElementById("email");
    const subjectInput  = document.getElementById("subject");
    const messageInput  = document.getElementById("message");
    const submitBtn     = document.getElementById("submitBtn");
    const formStatus    = document.getElementById("formStatus");

    function clearErrors() {
        document.querySelectorAll('.field-error').forEach(el => {
            el.textContent = '';
            el.classList.remove('active');
        });
        document.querySelectorAll('.input-wrap').forEach(w => {
            w.classList.remove('has-error');
        });
        if (formStatus) {
            formStatus.textContent = '';
            formStatus.className = 'form-status';
        }
    }

    function showError(fieldId, msg) {
        const err = document.getElementById(fieldId + 'Error');
        if (err) {
            err.textContent = msg;
            err.classList.add('active');
        }
        const input = document.getElementById(fieldId);
        if (input) {
            const wrap = input.closest('.input-wrap');
            if (wrap) {
                wrap.classList.add('has-error');
                wrap.classList.remove('is-valid');
            }
        }
    }

    function clearFieldError(field) {
        const err = document.getElementById(field.id + 'Error');
        if (err) {
            err.textContent = '';
            err.classList.remove('active');
        }
        const wrap = field.closest('.input-wrap');
        if (wrap) {
            wrap.classList.remove('has-error');
        }
    }

    // Real-time input validation feedback
    if (fullNameInput) {
        fullNameInput.addEventListener('input', function() {
            clearFieldError(this);
            const val = this.value.trim();
            const wrap = this.closest('.input-wrap');
            if (val.length >= 2) {
                if (wrap) wrap.classList.add('is-valid');
            } else if (wrap) {
                wrap.classList.remove('is-valid');
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', function() {
            clearFieldError(this);
            const val = this.value.trim();
            const wrap = this.closest('.input-wrap');
            if (!val || /^\S+@\S+\.\S+$/.test(val)) {
                if (wrap && val) wrap.classList.add('is-valid');
            } else if (wrap) {
                wrap.classList.remove('is-valid');
            }
        });
    }

    if (messageInput) {
        messageInput.addEventListener('input', function() {
            clearFieldError(this);
            const val = this.value.trim();
            const wrap = this.closest('.input-wrap');
            if (val.length >= 5) {
                if (wrap) wrap.classList.add('is-valid');
            } else if (wrap) {
                wrap.classList.remove('is-valid');
            }
        });
    }

    contactForm.addEventListener("submit", function(e) {
        e.preventDefault();
        clearErrors();

        const name    = fullNameInput ? fullNameInput.value.trim() : "";
        const email   = emailInput ? emailInput.value.trim() : "";
        const subject = subjectInput ? subjectInput.value.trim() : "";
        const message = messageInput ? messageInput.value.trim() : "";

        let isValid = true;
        let firstInvalidField = null;

        // 1. Full Name validation (Required, min 2 chars)
        if (!name) {
            showError('fullName', 'Please enter your full name.');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = fullNameInput;
        } else if (name.length < 2) {
            showError('fullName', 'Name should be at least 2 characters.');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = fullNameInput;
        }

        // 2. Email validation (Optional, but validated if provided)
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            showError('email', 'Please enter a valid email address (e.g. name@example.com).');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = emailInput;
        }

        // 3. Message validation (Required, min 5 chars)
        if (!message) {
            showError('message', 'Please write your message.');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = messageInput;
        } else if (message.length < 5) {
            showError('message', 'Please provide a bit more detail (minimum 5 characters).');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = messageInput;
        }

        // Handle invalid state with prominent user feedback
        if (!isValid) {
            if (firstInvalidField) firstInvalidField.focus();
            if (formStatus) {
                formStatus.textContent = 'Please complete the required fields highlighted above.';
                formStatus.className = 'form-status form-status-error active';
            }
            showToast('Please check the highlighted fields.', 'error', 3500);
            return;
        }

        // Build structured WhatsApp message
        let intro = `Hi Tegar, I am ${name}`;
        if (email) {
            intro += ` (${email})`;
        }
        intro += `.`;

        const subjectLine = subject ? `Subject: ${subject}` : `Subject: -`;
        const waMessage = `${intro}\n${subjectLine}\n\nMessage:\n${message}`;
        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;

        // Provide clear visual feedback before redirect
        submitBtn.disabled = true;
        submitBtn.classList.add("loading");
        submitBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> <span>Redirecting to WhatsApp...</span>";

        if (formStatus) {
            formStatus.textContent = '✓ Validated! Opening WhatsApp chat...';
            formStatus.className = 'form-status form-status-success active';
        }

        showToast('Connecting to WhatsApp...', 'success', 3000);

        // Brief delay so user clearly sees positive validation and feedback
        setTimeout(() => {
            try {
                const newWindow = window.open(waUrl, "_blank");
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    window.location.href = waUrl;
                }
            } catch (err) {
                window.location.href = waUrl;
            }

            // Always restore button with full prominence and correct markup
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove("loading");
                    submitBtn.style.opacity = "1";
                    submitBtn.style.visibility = "visible";
                    submitBtn.innerHTML = "<i class='bx bxl-whatsapp'></i> <span>Send via WhatsApp</span>";
                }
                if (formStatus) {
                    formStatus.textContent = 'Message ready in WhatsApp! You can send another message anytime.';
                }
            }, 1000);
        }, 450);
    });
})();

/**
 * Toast notification utility
 * @param {string} message - Notification text
 * @param {string} type - 'success' or 'error'
 * @param {number} timeout - Duration in milliseconds
 */
function showToast(message, type = 'success', timeout = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'success' ? ' toast-success' : ' toast-error');
    const icon = type === 'success' ? '✓' : '!';
    toast.innerHTML = `<span class="icon">${icon}</span><span class="msg">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 250ms, transform 250ms';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => {
            if (toast.parentNode) container.removeChild(toast);
        }, 260);
    }, timeout);
}
