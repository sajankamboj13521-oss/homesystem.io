/**
 * Unified silent EmailJS submission — service_cgl3auw
 * No mailto, no WhatsApp redirects.
 */
(function () {
    function parseFormParams(form) {
        const name =
            form.querySelector('[name="name"]')?.value?.trim() ||
            form.querySelector('input[type="text"]')?.value?.trim() ||
            'N/A';
        const email =
            form.querySelector('[name="email"]')?.value?.trim() ||
            form.querySelector('input[type="email"]')?.value?.trim() ||
            'N/A';
        const phone =
            form.querySelector('[name="phone"]')?.value?.trim() ||
            form.querySelector('input[type="tel"]')?.value?.trim() ||
            'N/A';
        let message =
            form.querySelector('[name="message"]')?.value?.trim() ||
            form.querySelector('textarea')?.value?.trim() ||
            '';
        const select = form.querySelector('select');
        const hiddenType = form.querySelector('input[type="hidden"][name="type"]');
        if (select && select.value) {
            message = `[${select.value}]\n${message}`;
        } else if (hiddenType && hiddenType.value) {
            message = `[${hiddenType.value}]\n${message}`;
        }
        return {
            name,
            email,
            phone,
            message: message || 'N/A',
        };
    }

    function bindCorporateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', function (event) {
            event.preventDefault();

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
                .send(
                    EMAILJS_CORPORATE.serviceId,
                    EMAILJS_CORPORATE.templateId,
                    executionParams
                )
                .then(function () {
                    if (submitBtn) {
                        submitBtn.innerText = 'Submit Details';
                        submitBtn.disabled = false;
                    }
                    if (statusBox) {
                        statusBox.style.display = 'block';
                        statusBox.style.backgroundColor = '#d4edda';
                        statusBox.style.color = '#155724';
                        statusBox.style.border = '1px solid #c3e6cb';
                        statusBox.innerText =
                            'Thank you! Your information has been securely transmitted.';
                    }
                    form.reset();
                })
                .catch(function (error) {
                    if (submitBtn) {
                        submitBtn.innerText = 'Submit Details';
                        submitBtn.disabled = false;
                    }
                    if (statusBox) {
                        statusBox.style.display = 'block';
                        statusBox.style.backgroundColor = '#f8d7da';
                        statusBox.style.color = '#721c24';
                        statusBox.style.border = '1px solid #f5c6cb';
                        statusBox.innerText = 'Transmission failed. Please try again.';
                    }
                    console.error('EmailJS Server Error:', error);
                });
        });
    }

    /** AI chat & programmatic sends */
    function sendParams(executionParams) {
        return emailjs.send(
            EMAILJS_CORPORATE.serviceId,
            EMAILJS_CORPORATE.templateId,
            executionParams
        );
    }

    window.CorporateEmailJs = { sendParams, parseFormParams };

    document.addEventListener('DOMContentLoaded', function () {
        bindCorporateForm('corporateContactForm');
        bindCorporateForm('corporateContactFormJv');
    });
})();
