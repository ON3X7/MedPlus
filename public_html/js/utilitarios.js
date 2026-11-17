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


// ==========================================
//   CONTROLO DO DROPDOWN DE PERFIL
// ==========================================
function toggleProfileDropdown(event) {
    // Evita que o clique se propague e ative o fechamento automático instantaneamente
    event.stopPropagation(); 
    
    const profile = document.querySelector('.profile');
    if (profile) {
        profile.classList.toggle('active');
    }
}

// Escuta cliques globais na tela para fechar o menu se clicar fora
document.addEventListener('click', (event) => {
    const profile = document.querySelector('.profile');
    // Verifica se o menu está aberto e se o clique foi fora do contentor .profile
    if (profile && profile.classList.contains('active') && !profile.contains(event.target)) {
        profile.classList.remove('active');
    }
});

// ==========================================
//   NAVEGAÇÃO INTERNA DE SUB-PÁGINAS (AJUSTES)
// ==========================================
window.abrirSubPagina = function(idSubPagina) {
    const painelPrincipal = document.getElementById('painel-ajustes-main');
    const subPagina = document.getElementById(idSubPagina);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 0 : 150; // var(--anim-fast)

    if (!painelPrincipal || !subPagina) return;

    // 1. Anima o painel principal a sair
    painelPrincipal.classList.remove('anim-module-in');
    painelPrincipal.classList.add('anim-module-out');

    // 2. Aguarda a saída e anima a sub-página a entrar
    setTimeout(() => {
        painelPrincipal.style.display = 'none';
        painelPrincipal.classList.remove('anim-module-out');

        subPagina.style.display = 'block';
        subPagina.classList.remove('anim-module-out');
        void subPagina.offsetWidth; // Força o navegador a reiniciar a animação
        subPagina.classList.add('anim-module-in');
    }, duration);
};

window.fecharSubPagina = function(idSubPagina) {
    const painelPrincipal = document.getElementById('painel-ajustes-main');
    const subPagina = document.getElementById(idSubPagina);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 0 : 150;

    if (!painelPrincipal || !subPagina) return;

    // 1. Anima a sub-página a sair
    subPagina.classList.remove('anim-module-in');
    subPagina.classList.add('anim-module-out');

    // 2. Aguarda a saída e traz o painel principal de volta
    setTimeout(() => {
        subPagina.style.display = 'none';
        subPagina.classList.remove('anim-module-out');

        painelPrincipal.style.display = 'block';
        painelPrincipal.classList.remove('anim-module-out');
        void painelPrincipal.offsetWidth; 
        painelPrincipal.classList.add('anim-module-in');
    }, duration);
};