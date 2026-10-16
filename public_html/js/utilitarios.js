// --- Navegacao ---
function abrirModal(id) {
	document.getElementById(id).style.display = 'block';
}

function fecharModal(id) {
	document.getElementById(id).style.display = 'none';
}

// --- Tratamento Dinâmico de Cores ---
// Converte uma cor Hex (#RRGGBB) para RGBA com a opacidade desejada
function hexToRgba(hex, alpha) {
    // Remove o hash caso exista
    hex = hex.replace('#', '');
    
    // Converte para RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// --- Gestão de Módulos (Abas) e Estado ---
// Remove acentos e espaços para transformar "Início" em "inicio"
function normalizarNomeModulo(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function mudarModulo(moduloNome) {
    // 1. Guarda o estado no navegador (memória)
    localStorage.setItem('medplus_last_module', moduloNome);

    // 2. Atualiza a aparência dos botões no Menu (Desktop e Mobile)
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.module === moduloNome) {
            btn.classList.add('active');
        }
    });

    // 3. Oculta todos os módulos e mostra apenas o correto
    document.querySelectorAll('.module-page').forEach(page => {
        page.style.display = 'none';
    });

    const idPagina = 'pag-' + normalizarNomeModulo(moduloNome);
    const paginaAlvo = document.getElementById(idPagina);
    
    if (paginaAlvo) {
        paginaAlvo.style.display = 'block';
    } else {
        console.warn('Página não construída ainda: ' + idPagina);
    }
}

// Inicializa a navegação quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
    // Adiciona o evento de clique em todos os botões do menu
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.addEventListener('click', function() {
            mudarModulo(this.dataset.module);
        });
    });

    // Recupera o último módulo visitado (ou usa 'Início' como padrão)
    const moduloSalvo = localStorage.getItem('medplus_last_module') || 'Início';
    mudarModulo(moduloSalvo);
});