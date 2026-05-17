(function () {
    const form = document.getElementById('contactForm');
    const overlay = document.getElementById('successOverlay');
    const statusEl = document.getElementById('success-status');
    const submitBtn = document.getElementById('submit-btn');
    const formError = document.getElementById('form-error');

    if (!form) return;

    LeadFormUtils.bindForm({
        form,
        errorEl: formError,
        submitBtn,
        getPayload() {
            const result = LeadFormUtils.validateCommon({
                name: document.getElementById('name'),
                phone: document.getElementById('phone'),
                email: document.getElementById('email'),
                message: document.getElementById('message'),
                role: document.getElementById('type'),
            });
            if (result.error) return result;
            result.data.source = 'contact-form';
            result.data.transcript = `Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
            return result;
        },
        onSuccess(message) {
            form.style.display = 'none';
            if (statusEl) statusEl.textContent = message;
            overlay.style.display = 'flex';
        },
    });
})();
