// Dynamic HTML to PDF Generation using html2canvas and jsPDF
async function generateAndDownloadCertificate(name, certId) {
    const { jsPDF } = window.jspdf;

    // 1. Populate the hidden HTML template with the dynamic data
    document.getElementById('pdfName').textContent = name;
    document.getElementById('pdfId').textContent = `Certificate ID: ${certId}`;

    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('pdfDate').textContent = `Date: ${dateStr}`;

    // 2. Prepare the DOM element for html2canvas
    const certContainer = document.getElementById('certificate-container');
    const certDom = document.getElementById('certificate-dom');

    // Temporarily bring it on-screen (but hidden behind everything) so html2canvas can render it properly
    certContainer.style.left = '0';
    certContainer.style.top = '0';
    certContainer.style.zIndex = '-1000';
    certContainer.style.opacity = '1';

    try {
        // 3. Capture the DOM as a high-resolution canvas
        const canvas = await html2canvas(certDom, {
            scale: 2, // 2x scale for higher resolution
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        // 4. Convert the canvas to an image data URL
        const imgData = canvas.toDataURL('image/png');

        // 5. Create the PDF document (Landscape, A4 size)
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: 'a4'
        });

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();

        // 6. Add the captured image to the PDF
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // Make the "Verify at: https://syntrocertverify.vercel.app/" text clickable
        // Creating an invisible clickable rectangle over the bottom-left text area
        doc.link(60, pdfHeight - 80, 200, 30, { url: 'https://syntrocertverify.vercel.app/' });

        // 7. Trigger the download
        doc.save(`${name.replace(/\s+/g, '_')}_Certificate.pdf`);

    } catch (error) {
        console.error("Error generating PDF from HTML:", error);
        throw error;
    } finally {
        // 8. Hide the container again
        certContainer.style.left = '-9999px';
        certContainer.style.top = '-9999px';
    }
}
