/**
 * Unified EmailJS submission — maps all site forms to template_14vihik variables.
 * Reads credentials from window.emailjsConfig. No mailto / WhatsApp redirects.
 */
(function () {
    function getConfig() {
        return window.emailjsConfig || {};
    }

    function fieldValue(form, name, fallback) {
        const el = form.querySelector(`[name="${name}"]`);
        if (el && el.value && el.value.trim()) return el.value.trim();
        return fallback || '';
    }

    function parseFormFields(form) {
        const name =
            fieldValue(form, 'name') ||
            form.querySelector('input[type="text"]')?.value?.trim() ||
            '';
        const email =
            fieldValue(form, 'email') ||
            form.querySelector('input[type="email"]')?.value?.trim() ||
            '';
        const phone =
            fieldValue(form, 'phone') ||
            form.querySelector('input[type="tel"]')?.value?.trim() ||
            '';
        let message =
            fieldValue(form, 'message') ||
            form.querySelector('textarea')?.value?.trim() ||
            '';
        const select = form.querySelector('select[name="type"]');
        const hiddenType = form.querySelector('input[type="hidden"][name="type"]');
        const type = select?.value || hiddenType?.value || '';

        if (type && message && !message.startsWith('[')) {
            message = `[${type}]\n${message}`;
        }

        return { name, email, phone, message, type };
    }

    function detectCategory(form) {
        const formId = form.id;
        const page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

        if (formId === 'jvForm' || formId === 'corporateContactFormJv') return 'vendor';
        if (formId === 'materialForm') return 'vendor';
        if (page === 'help.html') return 'support';
        if (page === 'about.html') return 'consult';
        if (page.includes('partner') || page.includes('patner')) return 'vendor';

        const typeVal = form.querySelector('select[name="type"]')?.value || '';
        if (typeVal.includes('Job Seeker')) return 'job';
        if (typeVal.includes('Vendor')) return 'vendor';
        if (typeVal.includes('Client')) return 'client';

        return 'client';
    }

    function getSystemMeta(cfg) {
        let sessionId = sessionStorage.getItem('hs_session_id');
        if (!sessionId) {
            sessionId = 'hs_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
            sessionStorage.setItem('hs_session_id', sessionId);
        }

        return {
            submission_timestamp: new Date().toISOString(),
            submission_source_page: window.location.href,
            submission_device_type: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
                ? 'mobile'
                : 'desktop',
            submission_browser_language: navigator.language || 'en',
            submission_session_id: sessionId,
            submission_ip_address: '',
            email_template_id: cfg.templateId || '',
            service_provider_id: cfg.serviceId || '',
            admin_email_notification: cfg.adminEmail || 'info@homesystems-io.com',
            user_email_auto_reply: '',
            debug_log: '',
            captcha_token: '',
            website_url: window.location.origin,
        };
    }

  /**
   * Build EmailJS template payload aligned with template_14vihik variables.
   */
    function buildTemplatePayload(options) {
        const cfg = getConfig();
        const category = options.category || 'client';
        const name = options.name || '';
        const email = options.email || '';
        const phone = options.phone || '';
        const message = options.message || '';
        const type = options.type || '';
        const topic = options.topic || type;
        const roleDetails = options.roleDetails || '';
        const transcript = options.transcript || '';
        const leadData = options.leadData || {};
        const source = options.source || 'website-form';

        const subjectLine =
            options.subject ||
            `[Home Systems] ${topic || category} — ${name || 'New submission'}`;

        const payload = {
            ...getSystemMeta(cfg),
            subject_line: subjectLine,
            message_content: message,
            referral_source: source,
        };

        if (category === 'client') {
            Object.assign(payload, {
                client_name: name,
                client_email: email,
                client_phone: phone,
                client_company: leadData.company_profile || leadData.project_type || '',
                communication_pref: 'email',
                preferred_date: '',
                preferred_time: '',
                time_zone: 'Asia/Kolkata',
                budget_range: leadData.estimated_budget || leadData.financial_limits || '',
                project_deadline: leadData.timeline || '',
                project_description:
                    leadData.project_scope || roleDetails || message,
                industry_type: leadData.project_type || type,
                company_size: '',
                newsletter_optin: '',
                privacy_consent: 'yes',
                terms_agreement: 'yes',
            });
        }

        if (category === 'consult') {
            Object.assign(payload, {
                consult_name: name,
                consult_email: email,
                consult_phone: phone,
                consult_topic: topic || 'Consultation Request',
                consult_goals: message,
                consult_urgency: 'standard',
                consult_experience: '',
                consult_questions: message,
                consult_notes: roleDetails || message,
            });
        }

        if (category === 'vendor') {
            Object.assign(payload, {
                vendor_name: name,
                vendor_email: email,
                vendor_phone: phone,
                vendor_business_type: type || 'Material Supply / Partnership',
                vendor_years_experience: '',
                vendor_portfolio_link: '',
                vendor_services_offered: message,
                vendor_availability: '',
                vendor_hourly_rate: '',
                vendor_team_size: '',
                vendor_certifications: '',
                vendor_references: '',
                vendor_equipment: '',
                vendor_insurance: '',
                vendor_tax_id: '',
                vendor_license_number: '',
                vendor_payment_terms: '',
                vendor_preferred_currency: 'INR',
                vendor_language: navigator.language || 'en',
                vendor_location: 'India',
                vendor_notes: roleDetails || message,
            });
        }

        if (category === 'support') {
            Object.assign(payload, {
                support_name: name,
                support_email: email,
                support_phone: phone,
                support_ticket_id: 'HS-' + Date.now(),
                support_issue_category: topic || type,
                support_priority: 'normal',
                support_subject: topic || 'Help Desk Request',
                support_description: message,
                support_device_info: navigator.userAgent,
                support_browser_info: navigator.userAgent,
                support_os_info: navigator.platform || '',
                support_error_screenshot: '',
                support_steps_to_reproduce: message,
                support_resolution_status: 'open',
                support_feedback: '',
                support_rating: '',
                support_agent_name: '',
                support_notes: message,
            });
        }

        if (category === 'job') {
            Object.assign(payload, {
                job_applicant_name: name,
                job_applicant_email: email,
                job_applicant_phone: phone,
                job_applicant_address: '',
                job_position_applied: leadData.work_sought || type || 'MEP / HVAC / BIM',
                job_resume_file: '',
                job_cover_letter_file: '',
                job_linkedin_url: '',
                job_portfolio_url: '',
                job_experience_years: leadData.experience || '',
                job_current_salary: '',
                job_expected_salary: '',
                job_notice_period: '',
                job_skills: leadData.skills || message,
                job_highest_education: '',
                job_university: '',
                job_graduation_year: '',
                job_reference_name: '',
                job_reference_contact: '',
                job_relocation_willingness: '',
                job_work_authorization_status: '',
                job_background_check_consent: 'pending',
                job_availability_date: '',
            });
        }

        if (category === 'ai_support') {
            const aiCategory =
                options.aiRole === 'job_seeker'
                    ? 'job'
                    : options.aiRole === 'vendor'
                      ? 'vendor'
                      : 'client';
            const aiPayload = buildTemplatePayload({
                category: aiCategory,
                name,
                email,
                phone,
                message,
                type: options.role || type,
                topic: options.role || type,
                roleDetails,
                transcript,
                leadData,
                source: 'AI Support Desk',
            });
            Object.assign(payload, aiPayload);
            payload.message_content = [
                `Source: AI Support Desk`,
                `Role: ${options.role || type}`,
                '',
                roleDetails,
                '',
                '--- Chat transcript ---',
                transcript,
            ]
                .filter(Boolean)
                .join('\n');
            payload.subject_line = `[AI Support] ${options.role || type} — ${name}`;
        }

        return payload;
    }

    function parseFormParams(form) {
        const fields = parseFormFields(form);
        const category = detectCategory(form);
        return buildTemplatePayload({
            category,
            name: fields.name,
            email: fields.email,
            phone: fields.phone,
            message: fields.message,
            type: fields.type,
            topic: fields.type,
            source: window.location.pathname.split('/').pop() || 'contact',
        });
    }

    function showStatusBox(statusBox, success, text) {
        if (!statusBox) return;
        statusBox.style.display = 'block';
        statusBox.style.padding = '12px';
        statusBox.style.borderRadius = '4px';
        statusBox.style.textAlign = 'center';
        if (success) {
            statusBox.style.backgroundColor = '#d4edda';
            statusBox.style.color = '#155724';
            statusBox.style.border = '1px solid #c3e6cb';
        } else {
            statusBox.style.backgroundColor = '#f8d7da';
            statusBox.style.color = '#721c24';
            statusBox.style.border = '1px solid #f5c6cb';
        }
        statusBox.innerText = text;
    }

    function bindCorporateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.removeAttribute('action');
        form.removeAttribute('method');

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const cfg = getConfig();
            const submitBtn =
                form.querySelector('#submitFormBtn') ||
                form.querySelector('button[type="submit"]');
            const statusBox = form.querySelector('#submissionStatusDisplay');

            if (submitBtn) {
                submitBtn.innerText = 'Processing Securely...';
                submitBtn.disabled = true;
            }
            if (statusBox) statusBox.style.display = 'none';

            const executionParams = parseFormParams(form);

            emailjs
                .send(cfg.serviceId, cfg.templateId, executionParams)
                .then(function () {
                    if (submitBtn) {
                        submitBtn.innerText = 'Submit Details';
                        submitBtn.disabled = false;
                    }
                    showStatusBox(
                        statusBox,
                        true,
                        'Thank you! Your information has been securely transmitted.'
                    );
                    form.reset();
                })
                .catch(function (error) {
                    if (submitBtn) {
                        submitBtn.innerText = 'Submit Details';
                        submitBtn.disabled = false;
                    }
                    showStatusBox(
                        statusBox,
                        false,
                        'Transmission failed. Please try again.'
                    );
                    console.error('EmailJS Server Error:', error);
                });
        });
    }

    /** AI chat & programmatic sends */
    function sendParams(data) {
        const cfg = getConfig();
        let executionParams;

        if (data && data.name && !data.category && !data.formCategory) {
            executionParams = buildTemplatePayload({
                category: 'ai_support',
                name: data.name,
                email: data.email,
                phone: data.phone,
                message: data.message,
                role: data.role,
                roleDetails: data.roleDetails,
                transcript: data.transcript,
                leadData: data.leadData,
                aiRole: data.aiRole,
            });
        } else if (data && (data.category || data.formCategory)) {
            executionParams = buildTemplatePayload(data);
        } else {
            executionParams = data;
        }

        return emailjs.send(cfg.serviceId, cfg.templateId, executionParams);
    }

    window.CorporateEmailJs = {
        sendParams,
        parseFormParams,
        buildTemplatePayload,
    };

    document.addEventListener('DOMContentLoaded', function () {
        const cfg = getConfig();
        if (cfg.publicKey && typeof emailjs !== 'undefined') {
            emailjs.init(cfg.publicKey);
        }
        bindCorporateForm('corporateContactForm');
        bindCorporateForm('corporateContactFormJv');
        bindCorporateForm('materialForm');
        bindCorporateForm('jvForm');
    });
})();
