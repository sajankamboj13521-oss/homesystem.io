(function () {
    function bindPartnerForm(formId, errorId, submitId, successId, wrapId, successMsgId, source, defaultRole) {
        const form = document.getElementById(formId);
        const errorEl = document.getElementById(errorId);
        const submitBtn = document.getElementById(submitId);
        const successBox = document.getElementById(successId);
        const formWrap = document.getElementById(wrapId);
        const successMsg = document.getElementById(successMsgId);

        if (!form) return;

        LeadFormUtils.bindForm({
            form,
            errorEl,
            submitBtn,
            getPayload() {
                const prefix = formId.replace('Form', '');
                const result = LeadFormUtils.validateCommon({
                    name: document.getElementById(`${prefix}-name`),
                    phone: document.getElementById(`${prefix}-phone`),
                    email: document.getElementById(`${prefix}-email`),
                    message: document.getElementById(`${prefix}-message`),
                });
                if (result.error) return result;
                result.data.role = defaultRole;
                result.data.source = source;
                result.data.transcript = `Partner page · ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
                return result;
            },
            onSuccess(message) {
                if (formWrap) formWrap.style.display = 'none';
                if (successMsg) successMsg.textContent = message;
                if (successBox) successBox.classList.add('is-visible');
            },
        });
    }

    bindPartnerForm(
        'materialForm',
        'material-error',
        'material-submit',
        'material-success',
        'material-wrap',
        'material-success-msg',
        'partner-page',
        'Vendor / Partner — Material Supply'
    );

    bindPartnerForm(
        'jvForm',
        'jv-error',
        'jv-submit',
        'jv-success',
        'jv-wrap',
        'jv-success-msg',
        'partner-page',
        'Vendor / Partner — Joint Venture'
    );
})();
