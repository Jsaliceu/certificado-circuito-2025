document.addEventListener('DOMContentLoaded', () => {
    // CAPTURA DOS ELEMENTOS DA PÁGINA (DOM)
    const formSection = document.getElementById('form-section');
    const certificateSection = document.getElementById('certificate-section');
    const certificateForm = document.getElementById('certificate-form');
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const certificatePreview = document.getElementById('certificate-preview');
    const certNameSpan = document.getElementById('cert-name');
    const certRoleSpan = document.getElementById('cert-role');
    const downloadBtn = document.getElementById('download-btn');

    // URL do seu Web App do Google Apps Script
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzedqQABer3dhB2Ae6ym0KXouIaYEGhf5wFzklSxpFH0jb-pudYTtWv6U2ra2-UPOms/exec'; // Lembre-se de manter sua URL aqui

    // LÓGICA PRINCIPAL AO ENVIAR O FORMULÁRIO
    certificateForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const selectedRole = document.querySelector('input[name="role"]:checked').value;

        certNameSpan.textContent = name;
        certRoleSpan.textContent = selectedRole;

        formSection.classList.add('hidden');
        certificateSection.classList.remove('hidden');

        // --- LÓGICA DE GERAÇÃO E ENVIO CORRIGIDA ---
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            
            const canvas = await html2canvas(certificatePreview, { useCORS: true, scale: 4 });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            // Gera a saída do PDF como uma string de dados base64
            const pdfOutput = pdf.output('datauristring');
            
            // Remove o cabeçalho 'data:application/pdf;base64,' para enviar apenas os dados
            const base64Data = pdfOutput.split(',')[1];

            const payload = {
                email: email,
                pdfData: base64Data,
                fileName: `Certificado - ${name}.pdf`,
                userName: name
            };

            // Envia para o Google Apps Script
            fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(payload)
            });
            
        } catch (error) {
            console.error('Erro ao gerar ou enviar o PDF:', error);
        }
    });

    // A LÓGICA DE DOWNLOAD MANUAL CONTINUA IGUAL
    downloadBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        html2canvas(certificatePreview, { useCORS: true, scale: 4 }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificado - ${nameInput.value.trim()}.pdf`);
        });
    });
});