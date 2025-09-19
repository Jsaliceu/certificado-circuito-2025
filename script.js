document.addEventListener('DOMContentLoaded', () => {
    // CAPTURA DOS ELEMENTOS DA PÁGINA
    const formSection = document.getElementById('form-section');
    const certificateSection = document.getElementById('certificate-section');
    const certificateForm = document.getElementById('certificate-form');
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const certificatePreview = document.getElementById('certificate-preview');
    const certNameSpan = document.getElementById('cert-name');
    const certRoleSpan = document.getElementById('cert-role');
    const downloadBtn = document.getElementById('download-btn');

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzNIR1IoSJDqM73c2X1WnMHN4V6pFwRWdBEJlnweOaJTh8HxR9_Okjd2q-yGvipmPOgXg/exec'; // Mantenha sua URL aqui

    // FUNÇÃO ROBUSTA PARA GERAR O PDF
    async function generatePdf(name, role) {
        // 1. Cria o modal de renderização
        const renderModal = document.createElement('div');
        renderModal.id = 'render-modal';
        
        // Adiciona a mensagem de "carregando"
        const loadingText = document.createElement('p');
        loadingText.textContent = 'Gerando seu certificado...';
        renderModal.appendChild(loadingText);
        
        const tempCert = certificatePreview.cloneNode(true);
        tempCert.querySelector('#cert-name').textContent = name;
        tempCert.querySelector('#cert-role').textContent = role;
        
        renderModal.appendChild(tempCert);
        document.body.appendChild(renderModal);

        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    // Aumentamos a escala para máxima qualidade
                    const canvas = await html2canvas(tempCert, { useCORS: true, scale: 4 });
                    
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
                    const imgData = canvas.toDataURL('image/jpeg', 1.0);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                    
                    document.body.removeChild(renderModal);
                    resolve(pdf);
                } catch (error) {
                    document.body.removeChild(renderModal);
                    console.error("Erro ao gerar o canvas/PDF:", error);
                    reject(error);
                }
            }, 200);
        });
    }

    // LÓGICA AO ENVIAR O FORMULÁRIO
    certificateForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const selectedRole = document.querySelector('input[name="role"]:checked').value;

        certNameSpan.textContent = name;
        certRoleSpan.textContent = selectedRole;
        formSection.classList.add('hidden');
        certificateSection.classList.remove('hidden');

        try {
            const pdf = await generatePdf(name, selectedRole);
            
            const pdfOutput = pdf.output('datauristring');
            const base64Data = pdfOutput.split(',')[1];
            const payload = {
                email: email,
                pdfData: base64Data,
                fileName: `Certificado - ${name}.pdf`,
                userName: name,
                role: selectedRole
            };
            fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        } catch (error) {
            alert("Ocorreu um erro ao gerar seu certificado. Por favor, tente novamente.");
        }
    });

    // LÓGICA DE DOWNLOAD MANUAL
    downloadBtn.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const selectedRole = document.querySelector('input[name="role"]:checked').value;
        try {
            const pdf = await generatePdf(name, selectedRole);
            pdf.save(`Certificado - ${name}.pdf`);
        } catch (error) {
            alert("Ocorreu um erro ao gerar o PDF para download. Por favor, tente novamente.");
        }
    });
});





