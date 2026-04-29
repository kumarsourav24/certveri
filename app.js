// Main Application Logic
document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const verifyBtn = document.getElementById('verifyBtn');
    const statusMessage = document.getElementById('statusMessage');
    const downloadSection = document.getElementById('downloadSection');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const certNameEl = document.getElementById('certName');
    const certIdEl = document.getElementById('certId');
    const downloadBtn = document.getElementById('downloadBtn');

    // Verification Modal Elements
    const navVerifyBtn = document.getElementById('navVerifyBtn');
    const verifyModal = document.getElementById('verifyModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const verifyIdInput = document.getElementById('verifyIdInput');
    const submitVerifyBtn = document.getElementById('submitVerifyBtn');
    const verifyResultContainer = document.getElementById('verifyResultContainer');
    const verifyLoading = document.getElementById('verifyLoading');

    let currentCertData = null;

    verifyBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        
        if (!email) {
            showStatus('Please enter an email address.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showStatus('Please enter a valid email address.', 'error');
            return;
        }

        // Hide previous messages and download section
        statusMessage.classList.add('hidden');
        downloadSection.classList.add('hidden');
        
        // Show loading state
        loadingOverlay.classList.remove('hidden');

        try {
            // Call mock backend
            const result = await verifyEmailAndGetCertificate(email);

            if (result.success) {
                currentCertData = result.data;
                certNameEl.textContent = currentCertData.name;
                certIdEl.textContent = `ID: ${currentCertData.certificate_id}`;
                
                showStatus('Certificate found! Ready to download.', 'success');
                downloadSection.classList.remove('hidden');
            } else {
                showStatus(result.error || 'No certificate found.', 'error');
            }
        } catch (error) {
            console.error(error);
            showStatus('An error occurred while verifying. Please try again.', 'error');
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    });

    downloadBtn.addEventListener('click', async () => {
        if (!currentCertData) return;
        
        // Provide feedback that generation is starting
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Generating PDF...';
        downloadBtn.disabled = true;

        try {
            await generateAndDownloadCertificate(currentCertData.name, currentCertData.certificate_id);
            downloadBtn.textContent = 'Downloaded!';
            setTimeout(() => {
                downloadBtn.textContent = originalText;
                downloadBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('Error generating PDF:', error);
            showStatus('Error generating certificate. Please try again.', 'error');
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    });

    // Handle Enter key on input
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyBtn.click();
        }
    });

    // Verification Modal Logic
    navVerifyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        verifyModal.classList.remove('hidden');
        verifyIdInput.value = '';
        verifyResultContainer.classList.add('hidden');
        verifyIdInput.focus();
    });

    closeModalBtn.addEventListener('click', () => {
        verifyModal.classList.add('hidden');
    });

    // Close on click outside
    verifyModal.addEventListener('click', (e) => {
        if (e.target === verifyModal || e.target.classList.contains('modal-backdrop')) {
            verifyModal.classList.add('hidden');
        }
    });

    submitVerifyBtn.addEventListener('click', async () => {
        const certId = verifyIdInput.value.trim();
        if (!certId) return;

        verifyResultContainer.classList.add('hidden');
        verifyLoading.classList.remove('hidden');
        submitVerifyBtn.disabled = true;

        try {
            const result = await verifyCertificateById(certId);
            verifyLoading.classList.add('hidden');
            verifyResultContainer.classList.remove('hidden');

            if (result.success) {
                const dateIssued = new Date(result.data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                verifyResultContainer.className = 'verify-result success';
                verifyResultContainer.innerHTML = `
                    <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Certificate Verified</h3>
                    <p class="result-detail"><strong>Status:</strong> <span style="color: #059669;">Authentic</span></p>
                    <p class="result-detail"><strong>Recipient:</strong> ${result.data.name}</p>
                    <p class="result-detail"><strong>Course:</strong> Build Your First E-Commerce App LIVE - Frontend</p>
                    <p class="result-detail"><strong>Issued On:</strong> ${dateIssued}</p>
                `;
            } else {
                verifyResultContainer.className = 'verify-result error';
                verifyResultContainer.innerHTML = `
                    <h3>Verification Failed</h3>
                    <p>${result.error || 'Invalid Certificate ID.'}</p>
                `;
            }
        } catch (error) {
            verifyLoading.classList.add('hidden');
            verifyResultContainer.classList.remove('hidden');
            verifyResultContainer.className = 'verify-result error';
            verifyResultContainer.innerHTML = `<p>An error occurred. Please try again.</p>`;
        } finally {
            submitVerifyBtn.disabled = false;
        }
    });

    verifyIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitVerifyBtn.click();
    });

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message status-${type}`;
        statusMessage.classList.remove('hidden');
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
