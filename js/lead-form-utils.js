/**
 * Shared validation and UI helpers for lead forms
 */
const LeadFormUtils = {
    normalizePhone(raw) {
        const digits = String(raw).replace(/\D/g, '');
        if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
        if (digits.length === 10) return digits;
        return null;
    },

    validateCommon(fields) {
        const name = fields.name.value.trim();
        const phone = this.normalizePhone(fields.phone.value);
        const email = fields.email.value.trim();
        const message = fields.message ? fields.message.value.trim() : '';

        if (name.length < 2) return { error: 'Please enter your full name.' };
        if (!phone || !/^[6-9]/.test(phone)) {
            return { error: 'Please enter a valid 10-digit mobile number.' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { error: 'Please enter a valid email address.' };
        }
        if (fields.message && message.length < 10) {
            return { error: 'Please enter at least 10 characters in your message.' };
        }

        return {
            data: {
                role: fields.role ? fields.role.value : 'General Inquiry',
                lead_name: name,
                lead_phone: phone,
                lead_email: email.toLowerCase(),
                role_details: message || fields.role_details?.value?.trim() || '—',
                transcript: fields.transcriptExtra || '',
                source: fields.source || 'website-form',
            },
        };
    },

    bindForm(options) {
        const {
            form,
            errorEl,
            submitBtn,
            onSuccess,
            getPayload,
        } = options;

        if (!form) return;

        LeadSubmit.init();

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const validated = getPayload();
            if (validated.error) {
                if (errorEl) {
                    errorEl.textContent = validated.error;
                    errorEl.hidden = false;
                }
                return;
            }
            if (errorEl) errorEl.hidden = true;

            const defaultLabel = submitBtn?.textContent || 'Submit';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending…';
            }

            try {
                await LeadSubmit.send(validated.data);
                if (onSuccess) onSuccess(LeadSubmit.successMessage());
                LeadSubmit.maybeRedirect();
            } catch (err) {
                console.error(err);
                if (errorEl) {
                    errorEl.textContent = LeadSubmit.errorMessage(err);
                    errorEl.hidden = false;
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = defaultLabel;
                }
            }
        });
    },
};
