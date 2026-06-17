/**
 * Role-based AI Support Desk — conversation engine
 */
(function () {
    const ROLE_FLOWS = {
        client: {
            label: 'Client / Customer',
            intro: 'Thank you for considering Home Systems for your MEP project. I will ask a few brief questions so our consultants can prepare the right proposal for you.',
            steps: [
                { key: 'project_type', prompt: 'What type of project is this? (e.g. industrial factory, commercial office, hospital, data centre)' },
                { key: 'project_scope', prompt: 'Please describe your core requirements — HVAC, electrical, plumbing, firefighting, BIM, or full MEP scope.' },
                { key: 'estimated_budget', prompt: 'What is your estimated budget range for this project? (e.g. ₹50L–₹2Cr, or USD equivalent)' },
                { key: 'financial_limits', prompt: 'Are there any financial limits, payment milestones, or constraints we should plan around?' },
                { key: 'timeline', prompt: 'What is your target timeline? (start date, handover deadline, or critical milestones)' },
            ],
        },
        job_seeker: {
            label: 'Job Seeker / Worker',
            intro: 'Welcome to the Home Systems talent desk. Share your background and we will match you with suitable MEP, HVAC, BIM, or site roles.',
            steps: [
                { key: 'skills', prompt: 'What are your primary skills? (e.g. AutoCAD, Revit MEP, HVAC drafting, electrical, plumbing, site supervision)' },
                { key: 'experience', prompt: 'Summarise your past experience — years in the field, employers, and notable projects.' },
                { key: 'work_sought', prompt: 'What type of work are you looking for? (designation, full-time/contract, preferred location)' },
            ],
        },
        vendor: {
            label: 'Vendor / Partner',
            intro: 'We value strong supply-chain and delivery partners. Tell us about your company so we can explore collaboration on upcoming MEP programmes.',
            steps: [
                { key: 'company_profile', prompt: 'Please share your company profile — legal name, location, team size, and core capabilities.' },
                { key: 'services_proposal', prompt: 'What services or materials do you propose to supply? Include certifications or OEM partnerships if relevant.' },
                { key: 'collaboration_interest', prompt: 'Which project types or regions are you targeting for partnership with Home Systems?' },
            ],
        },
    };

    const CONTACT_STEPS = [
        {
            key: 'lead_name',
            prompt: 'Almost done. Please enter your full name.',
            validate: (v) => v.trim().length >= 2 || 'Please enter your full name (at least 2 characters).',
            inputType: 'text',
            placeholder: 'Full name',
        },
        {
            key: 'lead_phone',
            prompt: 'Your mobile number (10-digit Indian number).',
            validate: (v) => {
                const digits = v.replace(/\D/g, '');
                const num = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
                return (num.length === 10 && /^[6-9]/.test(num)) || 'Enter a valid 10-digit mobile number (e.g. 9467584013).';
            },
            inputType: 'tel',
            placeholder: '10-digit mobile',
            normalize: (v) => {
                const digits = v.replace(/\D/g, '');
                if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
                if (digits.length === 10) return digits;
                return v.trim();
            },
        },
        {
            key: 'lead_email',
            prompt: 'Your Gmail or business email address.',
            validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email address.',
            inputType: 'email',
            placeholder: 'you@gmail.com',
            normalize: (v) => v.trim().toLowerCase(),
        },
    ];

    let roleId = null;
    let phase = 'role';
    let stepIndex = 0;
    let lead = {};
    let transcript = [];

    let chatBox, inputBar, userInput, sendBtn, optsGroup, successScreen;

    function init() {
        chatBox = document.getElementById('chat-box');
        inputBar = document.getElementById('in-bar');
        userInput = document.getElementById('user-in');
        sendBtn = document.getElementById('send-btn');
        optsGroup = document.getElementById('opts');
        successScreen = document.getElementById('success-screen');

        if (!chatBox || !sendBtn) return;

        document.querySelectorAll('.opt-btn[data-role]').forEach((btn) => {
            btn.addEventListener('click', () => selectRole(btn.dataset.role));
        });

        sendBtn.addEventListener('click', onSend);
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onSend();
            }
        });
    }

    function selectRole(id) {
        if (!ROLE_FLOWS[id] || phase !== 'role') return;

        roleId = id;
        lead = { role: ROLE_FLOWS[id].label };
        phase = 'role_questions';
        stepIndex = 0;

        optsGroup.style.display = 'none';
        showInput(true);
        addMessage('I am a ' + ROLE_FLOWS[id].label, 'user');

        setTimeout(() => {
            addMessage(ROLE_FLOWS[id].intro, 'bot');
            setTimeout(() => askCurrentQuestion(), 500);
        }, 400);
    }

    function currentSteps() {
        if (phase === 'role_questions') return ROLE_FLOWS[roleId].steps;
        if (phase === 'contact') return CONTACT_STEPS;
        return [];
    }

    function askCurrentQuestion() {
        const steps = currentSteps();
        const step = steps[stepIndex];
        if (!step) return;

        addMessage(step.prompt, 'bot');
        userInput.type = step.inputType || 'text';
        userInput.placeholder = step.placeholder || 'Type your answer…';
        userInput.focus();
    }

    function onSend() {
        if (phase === 'submitting' || phase === 'done' || phase === 'role') return;

        const raw = userInput.value.trim();
        if (!raw) return;

        const steps = currentSteps();
        const step = steps[stepIndex];
        if (!step) return;

        if (step.validate) {
            const result = step.validate(raw);
            if (result !== true) {
                addMessage(typeof result === 'string' ? result : 'Please check your answer and try again.', 'bot');
                return;
            }
        }

        const value = step.normalize ? step.normalize(raw) : raw;
        lead[step.key] = value;
        addMessage(raw, 'user');
        userInput.value = '';
        stepIndex++;

        if (stepIndex < steps.length) {
            setTimeout(() => askCurrentQuestion(), 450);
            return;
        }

        if (phase === 'role_questions') {
            phase = 'contact';
            stepIndex = 0;
            setTimeout(() => {
                addMessage('To connect you with our team, I need your contact details.', 'bot');
                setTimeout(() => askCurrentQuestion(), 500);
            }, 400);
            return;
        }

        if (phase === 'contact') {
            submitLead();
        }
    }

    function buildRoleDetailsText() {
        const flow = ROLE_FLOWS[roleId];
        if (!flow) return '';
        return flow.steps
            .map((s) => {
                const label = s.prompt.replace(/\?$/, '');
                return `${label}: ${lead[s.key] || '—'}`;
            })
            .join('\n');
    }

    function buildTranscript() {
        return transcript.join('\n');
    }

    function showStatus(success, text) {
        const statusBox = document.getElementById('submissionStatusDisplay');
        if (statusBox) {
            statusBox.style.display = 'block';
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
    }

    async function submitLead() {
        phase = 'submitting';
        showInput(false);
        addMessage('Submitting your details securely…', 'bot');
        sendBtn.disabled = true;

        const roleDetails = buildRoleDetailsText();
        const fullTranscript = buildTranscript();
        const executionParams = {
            category: 'ai_support',
            aiRole: roleId,
            name: lead.lead_name,
            email: lead.lead_email,
            phone: lead.lead_phone,
            role: lead.role,
            roleDetails,
            transcript: fullTranscript,
            message: fullTranscript,
            leadData: { ...lead },
        };

        try {
            await CorporateEmailJs.sendParams(executionParams);
            phase = 'done';
            chatBox.style.display = 'none';
            successScreen.style.display = 'flex';
            const statusEl = document.getElementById('success-status');
            if (statusEl) {
                statusEl.textContent =
                    'Thank you! Your information has been securely transmitted.';
            }
            showStatus(
                true,
                'Thank you! Your information has been securely transmitted.'
            );
        } catch (err) {
            console.error('EmailJS Server Error:', err);
            phase = 'contact';
            stepIndex = CONTACT_STEPS.length - 1;
            showInput(true);
            sendBtn.disabled = false;
            addMessage('Transmission failed. Please try again.', 'bot');
            showStatus(false, 'Transmission failed. Please try again.');
        }
    }

    function addMessage(text, cls) {
        const div = document.createElement('div');
        div.className = `msg ${cls}`;
        div.textContent = text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
        transcript.push((cls === 'bot' ? 'AI: ' : 'User: ') + text);
    }

    function showInput(show) {
        inputBar.style.display = show ? 'flex' : 'none';
        if (show) userInput.focus();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
