/**
 * Exibe um pop-up de notificação superior
 * @param {string} tipo - 'success', 'error' ou 'loading'
 * @param {string} mensagem - O texto a ser exibido
 */
function showNotification(tipo, mensagem) {
    // 1. Remove qualquer notificação anterior para não encavalar na tela
    const toastAntigo = document.getElementById('medlife-toast');
    if (toastAntigo) {
        toastAntigo.remove();
    }

    // 2. Cria o container do pop-up
    const toast = document.createElement('div');
    toast.id = 'medlife-toast';
    toast.className = `toast-notification toast-${tipo}`;

    // 3. Define o ícone de acordo com o tipo solicitado
    let iconClass = '';
    if (tipo === 'success') {
        iconClass = 'fas fa-check-circle';
    } else if (tipo === 'error') {
        iconClass = 'fas fa-exclamation-triangle'; // Pode trocar por fa-exclamation-circle
    } else if (tipo === 'loading') {
        iconClass = 'fas fa-circle-notch w3-spin'; // O w3-spin cuida da rotação!
    }

    // 4. Monta o conteúdo interno
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="toast-message">${mensagem}</div>
    `;

    // 5. Adiciona ao corpo da página
    document.body.appendChild(toast);

    // 6. Pequeno delay para permitir que o navegador processe o CSS antes de animar
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 7. Remove a notificação após 3.5 segundos (3500ms)
    setTimeout(() => {
        toast.classList.remove('show');
        
        // Aguarda a animação de subida terminar (400ms) para remover o HTML do DOM
        setTimeout(() => toast.remove(), 400); 
    }, 3500);
}