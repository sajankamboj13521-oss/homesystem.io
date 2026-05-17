(function () {
    const form = document.getElementById('helpForm');
    const errorEl = document.getElementById('help-error');
    const submitBtn = document.getElementById('help-submit');
    const successBox = document.getElementById('help-success');
    const successMsg = document.getElementById('help-success-msg');
    const formWrap = document.getElementById('help-form-wrap');

    if (!form) return;

    LeadFormUtils.bindForm({
        form,
        errorEl,
        submitBtn,
        getPayload() {
            const result = LeadFormUtils.validateCommon({
                name: document.getElementById('help-name'),
                phone: document.getElementById('help-phone'),
                email: document.getElementById('help-email'),
                message: document.getElementById('help-message'),
                role: document.getElementById('help-topic'),
            });
            if (result.error) return result;
            result.data.source = 'help-desk';
            result.data.transcript = `Help desk · ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
            return result;
        },
        onSuccess(message) {
            if (formWrap) formWrap.style.display = 'none';
            if (successMsg) successMsg.textContent = message;
            if (successBox) successBox.classList.add('is-visible');
        },
    });
})();
