(function() {
    // Dynamically inject EmailJS SDK Script into document head so we don't have to manually paste it in every HTML file
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    document.head.appendChild(script);

    script.onload = function() {
        // HARDCODED SERVICE ID FOR THE USER
        var SERVICE_ID = 'service_cgl3auw'; 
        var TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE'; // User will replace this placeholder later
        var PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE';   // User will replace this placeholder later

        // Initialize EmailJS Engine
        emailjs.init(PUBLIC_KEY);

        // Global initialization function to attach background transmission to forms safely
        window.initCorporateFormSubmission = function(formId, statusId) {
            var form = document.getElementById(formId);
            if (!form) return;

            // Instantly strip out any existing hardcoded mailto or whatsapp attributes
            form.removeAttribute('action');
            form.removeAttribute('method');

            form.addEventListener('submit', function(event) {
                event.preventDefault(); // Complete lock on browser popups, outlook, or whatsapp redirects

                var submitBtn = form.querySelector('button[type="submit"]');
                var statusBox = document.getElementById(statusId);

                if (submitBtn) {
                    submitBtn.innerText = 'Processing Securely...';
                    submitBtn.disabled = true;
                }
                if (statusBox) {
                    statusBox.style.display = 'none';
                }

                // Parse input fields cleanly
                var executionParams = {
                    name: form.querySelector('input[type="text"]') ? form.querySelector('input[type="text"]').value : 'N/A',
                    email: form.querySelector('input[type="email"]') ? form.querySelector('input[type="email"]').value : 'N/A',
                    phone: form.querySelector('input[type="tel"]') ? form.querySelector('input[type="tel"]').value : 'N/A',
                    message: form.querySelector('textarea') ? form.querySelector('textarea').value : 'N/A'
                };

                // Background runtime dispatch
                emailjs.send(SERVICE_ID, TEMPLATE_ID, executionParams)
                    .then(function() {
                        if (submitBtn) {
                            submitBtn.innerText = 'Submit Details';
                            submitBtn.disabled = false;
                        }
                        if (statusBox) {
                            statusBox.style.display = 'block';
                            statusBox.style.backgroundColor = '#d4edda';
                            statusBox.style.color = '#155724';
                            statusBox.style.border = '1px solid #c3e6cb';
                            statusBox.style.padding = '12px';
                            statusBox.style.borderRadius = '4px';
                            statusBox.style.textAlign = 'center';
                            statusBox.innerText = 'Thank you! Your information has been securely transmitted.';
                        }
                        form.reset(); // Clear input fields safely
                    }, function(error) {
                        if (submitBtn) {
                            submitBtn.innerText = 'Submit Details';
                            submitBtn.disabled = false;
                        }
                        if (statusBox) {
                            statusBox.style.display = 'block';
                            statusBox.style.backgroundColor = '#f8d7da';
                            statusBox.style.color = '#721c24';
                            statusBox.style.border = '1px solid #f5c6cb';
                            statusBox.style.padding = '12px';
                            statusBox.style.borderRadius = '4px';
                            statusBox.style.textAlign = 'center';
                            statusBox.innerText = 'Transmission failed. Please try again.';
                        }
                        console.error('EmailJS Execution Failure:', error);
                    });
            });
        };
    };
})();
