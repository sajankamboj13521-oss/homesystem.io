/**
 * Background lead submission — EmailJS and/or Web3Forms only (no mailto, no WhatsApp popups).
 */
const LeadSubmit = {
    init() {
        if (typeof emailjs !== 'undefined' && isEmailJsConfigured()) {
            emailjs.init(LEAD_CONFIG.emailjs.publicKey);
        }
    },

    formatMessage(data) {
        const lines = [
            `Source: ${data.source || 'website'}`,
            `Role / Type: ${data.role}`,
            `Name: ${data.lead_name}`,
            `Phone: +91 ${data.lead_phone}`,
            `Email: ${data.lead_email}`,
            '',
            data.role_details || '',
        ];
        if (data.transcript) {
            lines.push('', '--- Additional ---', data.transcript);
        }
        return lines.filter(Boolean).join('\n');
    },

    async sendViaWeb3Forms(data) {
        const body = {
            access_key: LEAD_CONFIG.web3forms.accessKey,
            subject: `[${LEAD_CONFIG.siteName}] ${data.role} — ${data.lead_name}`,
            from_name: data.lead_name,
            email: data.lead_email,
            phone: `+91 ${data.lead_phone}`,
            message: this.formatMessage(data),
            botcheck: false,
        };

        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(body),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || 'Web3Forms submission failed');
        }
        return { success: true, method: 'web3forms' };
    },

    async sendViaEmailJs(data) {
        const payload = {
            role: data.role,
            lead_name: data.lead_name,
            lead_phone: data.lead_phone,
            lead_email: data.lead_email,
            role_details: data.role_details || '',
            transcript: data.transcript || '',
            reply_to: data.lead_email,
            message: this.formatMessage(data),
            to_email: LEAD_CONFIG.ownerEmail,
        };

        await emailjs.send(
            LEAD_CONFIG.emailjs.serviceId,
            LEAD_CONFIG.emailjs.templateId,
            payload
        );
        return { success: true, method: 'emailjs' };
    },

    async send(data) {
        if (!isLeadDeliveryConfigured()) {
            const err = new Error('FORM_NOT_CONFIGURED');
            err.code = 'FORM_NOT_CONFIGURED';
            throw err;
        }

        let lastError = null;

        if (isEmailJsConfigured() && typeof emailjs !== 'undefined') {
            try {
                return await this.sendViaEmailJs(data);
            } catch (err) {
                console.error('EmailJS error:', err);
                lastError = err;
                if (!isWeb3FormsConfigured()) throw err;
            }
        }

        if (isWeb3FormsConfigured()) {
            return await this.sendViaWeb3Forms(data);
        }

        throw lastError || new Error('Submission failed');
    },

    successMessage() {
        return 'Thank you! Your details have been submitted successfully. Our team will contact you shortly.';
    },

    errorMessage(err) {
        if (err && err.code === 'FORM_NOT_CONFIGURED') {
            return 'Online submission is not active yet. Please try again later or call +91 9467584013.';
        }
        return 'We could not send your message. Please check your connection and try again.';
    },

    maybeRedirect() {
        const url = LEAD_CONFIG.redirectAfterSuccess;
        const delay = LEAD_CONFIG.redirectDelayMs || 0;
        if (url && delay > 0) {
            setTimeout(() => {
                window.location.href = url;
            }, delay);
        }
    },
};
