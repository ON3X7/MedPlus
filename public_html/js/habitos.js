// ==========================================
//   MÓDULO DE HÁBITOS (Streak Engine)
// ==========================================
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const SUGGESTIONS = [
  { nome: "Beber água", desc: "Manter a hidratação ao longo do dia.", icone: "fa-glass-water", cor: "#0b91c7" },
  { nome: "Caminhar", desc: "Movimentar o corpo por pelo menos 30 minutos.", icone: "fa-person-walking", cor: "#0da99a" },
  { nome: "Dormir bem", desc: "Ter uma noite de sono com 7 a 8 horas.", icone: "fa-moon", cor: "#7650a2" },
  { nome: "Meditar", desc: "Reservar alguns minutos para respirar.", icone: "fa-spa", cor: "#d18435" },
  { nome: "Ler", desc: "Dedicar um momento do dia a uma boa leitura.", icone: "fa-book-open", cor: "#3977c6" },
  { nome: "Exercício", desc: "Praticar uma atividade física que você goste.", icone: "fa-dumbbell", cor: "#d85b63" }
];

let state = {
  habits: [],
  page: 'loading',
  selectedSetup: [],
  activeId: null,
  month: new Date()
};

// --- API Helper ---
async function apiCall(acao, params = {}) {
    let api = new CustomFetch();
    api.add('acao', acao);
    for (let key in params) {
        api.add(key, params[key]);
    }
    
    try {
        const res = await api.send('medplus.php');
		// console.log(res);
        return JSON.parse(res);
    } catch (e) {
        console.error("Erro na API:", e);
        return { status: false, mensagem: "Erro de conexão" };
    }
}

// --- Funções Auxiliares ---
function getSoftColor(hex) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.12)`;
}
function habitStyle(habit) {
    return `--habit-color:${habit.cor};--habit-soft:${getSoftColor(habit.cor)}`;
}

// --- Renderização Dinâmica ---
function renderFull() {
  const content = document.querySelector("#pag-habitos");
  if (!content) return;
  
  content.classList.remove("module-page");
  void content.offsetWidth; 
  
  if (state.page === "setup") content.innerHTML = setupTemplate();
  else if (state.page === "detail") content.innerHTML = detailTemplate();
  else content.innerHTML = listTemplate();
  
  content.classList.add("module-page");
}

// --- Templates ---
function setupTemplate() {
  return `
    <div class="habit-setup">
      <section class="habit-setup-intro">
        <span><i class="fa-solid fa-seedling"></i></span>
        <small>UM PASSO DE CADA VEZ</small>
        <h1>Quais hábitos saudáveis você gostaria de praticar?</h1>
        <p>Escolha os hábitos que combinam com a sua rotina. Você poderá criar outros depois.</p>
      </section>
      <div class="habit-choice-grid">
        ${SUGGESTIONS.map((habit, index) => {
          const selected = state.selectedSetup.includes(index);
          return `
            <button class="habit-choice ${selected ? "selected" : ""} with-ripple" style="--habit-color:${habit.cor};--habit-soft:${getSoftColor(habit.cor)}; animation-delay:${index * 35}ms" onclick="toggleSelectedSetup(${index}, this)" aria-pressed="${selected}">
              <span class="habit-choice-icon"><i class="fa-solid ${habit.icone}"></i></span>
              <span><strong>${habit.nome}</strong><small>${habit.desc}</small></span>
              <i class="fa-solid ${selected ? "fa-circle-check" : "fa-circle-plus"}"></i>
            </button>`;
        }).join("")}
      </div>
      <div class="habit-setup-footer">
        <button class="btn-skip" onclick="skipSetup()">Talvez depois</button>
        <div>
            <span id="setup-count" style="margin-right:15px; color:#8b98a2;">${state.selectedSetup.length} selecionado(s)</span>
            <button class="btn-primary with-ripple" id="btn-save-setup" onclick="salvarSetup()" ${state.selectedSetup.length ? "" : "disabled"}>Criar rotina <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    </div>`;
}

function listTemplate() {
  const completedCount = state.habits.filter(h => h.concluido_hoje).length;
  const total = state.habits.length;
  const progress = total ? Math.round((completedCount / total) * 100) : 0;
  
  return `
    <section class="heading flex-between" style="align-items: flex-end; margin-bottom: 25px;">
      <div><small>BONS HÁBITOS, TODOS OS DIAS</small><h2 style="margin:0; font-size:1.8rem; font-weight:700;">Meus hábitos</h2><p style="margin-top:5px; font-size:13px; color:#6c7a89;">Acompanhe sua rotina e mantenha suas ofensivas vivas.</p></div>
      <button class="btn-primary with-ripple" onclick="abrirEdicaoHabito()"><i class="fa-solid fa-plus"></i> <span class="hide-mobile">Criar hábito</span></button>
    </section>
    <section class="habit-overview">
      <div><span class="overview-icon"><i class="fa-solid fa-bullseye"></i></span><p><small>PROGRESSO DE HOJE</small><strong id="global-progress-text">${completedCount} de ${total} concluídos</strong></p></div>
      <div class="habit-total-progress"><span id="global-progress-bar" style="width:${progress}%"></span></div>
      <b id="global-progress-percent">${progress}%</b>
    </section>
    <div class="habit-card-grid">
      ${state.habits.map((habit, index) => {
        return `
          <article class="habit-card ${habit.concluido_hoje ? "completed" : ""} with-ripple" style="${habitStyle(habit)}; animation-delay:${index * 45}ms" onclick="openHabitDetail(${habit.id})">
            <header>
              <span class="habit-card-icon"><i class="fa-solid ${habit.icone}"></i></span>
              <button onclick="toggleCompleted(${habit.id}, this)" aria-label="Concluir">${habit.concluido_hoje ? '<i class="fa-solid fa-check"></i>' : ""}</button>
            </header>
            <div class="habit-card-title"><small>ACOMPANHAMENTO</small><h3>${habit.nome}</h3></div>
            <div class="habit-card-bottom"><span><i class="fa-solid fa-fire-flame-curved"></i> <b id="card-streak-${habit.id}">${habit.streak}</b> dias</span><i class="fa-solid fa-chevron-right" style="color:#aab9c4;"></i></div>
            <div class="habit-card-progress"><span style="width:${habit.concluido_hoje ? 100 : 72}%"></span></div>
          </article>`;
      }).join("") || '<div class="habit-empty"><p style="font-size:16px; margin-bottom:15px;"><i class="fa-solid fa-seedling w3-text-teal w3-xxlarge"></i><br><br>Sua rotina está vazia.</p><button class="btn-primary" onclick="abrirEdicaoHabito()">Criar meu primeiro hábito</button></div>'}
    </div>`;
}

function detailTemplate() {
  const habit = state.habits.find(h => h.id == state.activeId);
  if (!habit) return "";
  
  return `
    <div class="habit-detail" style="${habitStyle(habit)}">
      <section class="subpage-heading habit-detail-heading">
        <button class="btn-voltar with-ripple" onclick="goBack()"><i class="fa-solid fa-arrow-left"></i> Voltar</button>
        <div><small>ACOMPANHAMENTO</small><h2>${habit.nome}</h2></div>
        <span class="habit-detail-icon" style="color:${habit.cor};background:var(--habit-soft)"><i class="fa-solid ${habit.icone}"></i></span>
      </section>
      <section class="streak-hero">
        <div class="streak-copy"><span class="streak-flame"><i class="fa-solid fa-fire-flame-curved"></i></span><div><small style="color:${habit.cor}">SEQUÊNCIA ATUAL</small><strong id="detail-streak">${habit.streak} dias</strong><p>Continue assim. Cada dia fortalece a sua rotina.</p></div></div>
        <button class="${habit.concluido_hoje ? "done" : ""} with-ripple" onclick="toggleCompleted(${habit.id}, this, true)" id="detail-btn-done"><i class="fa-solid ${habit.concluido_hoje ? "fa-check" : "fa-plus"}"></i> ${habit.concluido_hoje ? "Concluído hoje" : "Marcar como concluído"}</button>
      </section>
      <div class="streak-stats">
        <article><span><i class="fa-solid fa-fire-flame-curved"></i></span><strong id="stat-streak">${habit.streak} dias</strong><small>Sequência atual</small></article>
        <article><span><i class="fa-regular fa-calendar"></i></span><strong id="stat-month">${habit.total_concluido} dias</strong><small>Concluídos no total</small></article>
        <article><span><i class="fa-solid fa-trophy"></i></span><strong id="stat-best">${habit.melhor_streak || habit.streak} dias</strong><small>Melhor sequência</small></article>
      </div>
      
      <section class="habit-month-card" style="--habit-color:${habit.cor}">
        <header>
          <div><small style="color:${habit.cor}">VISÃO MENSAL</small><h3 id="month-title">Mês</h3></div>
          <div><button class="with-ripple" onclick="mudarMes(-1)"><i class="fa-solid fa-chevron-left"></i></button><button class="with-ripple" onclick="mudarMes(1)"><i class="fa-solid fa-chevron-right"></i></button></div>
        </header>
        <div class="habit-weekdays">${["D", "S", "T", "Q", "Q", "S", "S"].map(d => `<span>${d}</span>`).join("")}</div>
        <div class="habit-month-grid" id="calendar-grid">
        </div>
        <footer><span><i class="done-dot" style="background:${habit.cor}"></i> Concluído</span><span><i class="today-dot"></i> Hoje</span><span><i></i> Não realizado</span></footer>
      </section>
      
      <div class="habit-detail-actions" style="display: flex; justify-content: space-between; align-items: center; margin-top: 25px;">
          <button class="btn-outline with-ripple" onclick="abrirEdicaoHabito(${habit.id})"><i class="fa-solid fa-pen"></i> Editar Hábito</button>
          <button class="btn-danger with-ripple" onclick="deleteHabit(${habit.id})"><i class="fa-solid fa-trash"></i> Excluir Hábito</button>
      </div>
    </div>`;
}

// --- Funções de Ação Diretas ---
window.toggleSelectedSetup = function(index, btnEl) {
    const pos = state.selectedSetup.indexOf(index);
    if(pos > -1) {
        state.selectedSetup.splice(pos, 1);
        btnEl.classList.remove('selected');
        btnEl.setAttribute('aria-pressed', 'false');
        btnEl.querySelector('i.fa-solid:last-child').className = 'fa-solid fa-circle-plus';
    } else {
        state.selectedSetup.push(index);
        btnEl.classList.add('selected');
        btnEl.setAttribute('aria-pressed', 'true');
        btnEl.querySelector('i.fa-solid:last-child').className = 'fa-solid fa-circle-check';
    }
    document.getElementById('setup-count').innerText = `${state.selectedSetup.length} selecionado(s)`;
    document.getElementById('btn-save-setup').disabled = state.selectedSetup.length === 0;
};

window.skipSetup = function() {
    state.page = 'list';
    renderFull();
};

window.salvarSetup = async function() {
    const items = state.selectedSetup.map(i => SUGGESTIONS[i]);
    const res = await apiCall('salvarHabitosIniciais', { habitos_json: JSON.stringify(items) });
    if(res.status) {
        showNotification('success', 'Rotina criada com sucesso!');
        init(); 
    }
};

window.toggleCompleted = async function(id, btnEl, isDetail = false) {
    if(event) event.stopPropagation();
    const habit = state.habits.find(h => h.id == id);
    if(!habit) return;

    // 1. Otimismo Visual Local Rápido (Assume +1 temporariamente)
    habit.concluido_hoje = !habit.concluido_hoje;
    habit.total_concluido = habit.concluido_hoje ? parseInt(habit.total_concluido) + 1 : Math.max(0, parseInt(habit.total_concluido) - 1);
    
    if (habit.concluido_hoje) {
        habit.streak = parseInt(habit.streak) + 1; 
        if (habit.streak > (habit.melhor_streak || 0)) habit.melhor_streak = habit.streak;
    } else {
        habit.streak = Math.max(0, parseInt(habit.streak) - 1);
    }
    
    atualizaInterfaceConclusao(id, btnEl, isDetail, habit);

    // 2. Fetch Server para processar a lógica exata baseada no dia de ONTEM com o PostgreSQL
    const todayStr = new Date().toISOString().split('T')[0];
    const res = await apiCall('alternarConclusaoHabito', { id_habito: id, data: todayStr });
    
    if (res.status && res.streak !== undefined) {
        // 3. Corrige o estado com o valor REAL calculado pelo servidor
        habit.streak = res.streak;
        habit.melhor_streak = res.melhor_streak;
        
        // Re-atualiza os números da tela silenciosamente
        atualizaInterfaceConclusao(id, btnEl, isDetail, habit);
        
        if (isDetail) loadMonthHistory(); 
        showNotification('success', habit.concluido_hoje ? "Hábito concluído!" : "Conclusão removida.");
    }
};

function atualizaInterfaceConclusao(id, btnEl, isDetail, habit) {
    if (!isDetail) {
        const card = btnEl.closest('.habit-card');
        if (habit.concluido_hoje) {
            card.classList.add('completed');
            btnEl.innerHTML = '<i class="fa-solid fa-check"></i>';
            card.querySelector('.habit-card-progress span').style.width = '100%';
        } else {
            card.classList.remove('completed');
            btnEl.innerHTML = '';
            card.querySelector('.habit-card-progress span').style.width = '72%';
        }
        document.getElementById(`card-streak-${id}`).innerText = habit.streak;
        updateGlobalProgress();
    } else {
        if (habit.concluido_hoje) {
            btnEl.classList.add('done');
            btnEl.innerHTML = '<i class="fa-solid fa-check"></i> Concluído hoje';
        } else {
            btnEl.classList.remove('done');
            btnEl.innerHTML = '<i class="fa-solid fa-plus"></i> Marcar como concluído';
        }
        document.getElementById('detail-streak').innerText = `${habit.streak} dias`;
        document.getElementById('stat-streak').innerText = `${habit.streak} dias`;
        document.getElementById('stat-month').innerText = `${habit.total_concluido} dias`;
        document.getElementById('stat-best').innerText = `${habit.melhor_streak || habit.streak} dias`;
    }
}

function updateGlobalProgress() {
    const total = state.habits.length;
    const completed = state.habits.filter(h => h.concluido_hoje).length;
    const progress = total ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById('global-progress-text').innerText = `${completed} de ${total} concluídos`;
    document.getElementById('global-progress-bar').style.width = `${progress}%`;
    document.getElementById('global-progress-percent').innerText = `${progress}%`;
}

// --- Lógica de Detalhes e Calendário ---
window.openHabitDetail = async function(id) {
    state.activeId = id;
    state.page = 'detail';
    state.month = new Date(); 
    renderFull();
    await loadMonthHistory();
};

window.goBack = function() {
    state.page = 'list';
    renderFull();
};

window.deleteHabit = async function(id) {
    if(confirm("Deseja realmente excluir este hábito e todo o seu histórico permanentemente?")) {
        const res = await apiCall('apagarHabito', { id_habito: id });
        if(res.status) {
            showNotification('success', 'Hábito excluído.');
            init(); 
        }
    }
};

window.mudarMes = async function(dir) {
    state.month.setMonth(state.month.getMonth() + dir);
    await loadMonthHistory();
};

async function loadMonthHistory() {
    const y = state.month.getFullYear();
    const m = state.month.getMonth() + 1; 
    
    document.getElementById('month-title').innerText = `${MONTHS[m-1]} de ${y}`;
    
    const res = await apiCall('obterHistoricoMes', { id_habito: state.activeId, ano: y, mes: m });
    const datesCompleted = (res.status && res.dados) ? res.dados.map(d => d.data_registro) : [];
    
    renderCalendarGrid(datesCompleted, y, m);
}

function renderCalendarGrid(datesCompleted, year, monthNum) {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    
    grid.innerHTML = "";
    const firstDay = new Date(year, monthNum - 1, 1).getDay();
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    
    for(let i = 0; i < firstDay; i++) grid.insertAdjacentHTML('beforeend', `<span class="blank"></span>`);
    
    const today = new Date();
    const isCurrentMonth = today.getMonth() === monthNum - 1 && today.getFullYear() === year;
    
    for(let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isDone = datesCompleted.includes(dateStr);
        const isToday = isCurrentMonth && d === today.getDate();
        
        let content = d;
        let className = "with-ripple";
        
        if (isDone) {
            className += " done";
            content = `<i class="fa-solid fa-check"></i>`;
        } else if (isToday) {
            className += " today";
        }
        
        grid.insertAdjacentHTML('beforeend', `<button class="${className}" aria-label="Dia ${d}">${content}</button>`);
    }
}

// --- Funções do Modal Nativo (Criação e Edição) ---
window.abrirEdicaoHabito = function(id = null) {
    if (id) {
        // MODO EDIÇÃO
        const habit = state.habits.find(h => h.id == id);
        document.getElementById('hab-id').value = habit.id;
        document.getElementById('hab-nome').value = habit.nome;
        document.getElementById('hab-cor').value = habit.cor;
        document.getElementById('hab-icone').value = habit.icone;
        document.querySelector('#modal-habitos h3').innerHTML = '<i class="fa-solid fa-pen w3-text-teal"></i> Editar Hábito';
    } else {
        // MODO CRIAÇÃO
        document.getElementById('hab-id').value = '';
        document.getElementById('hab-nome').value = '';
        document.getElementById('hab-cor').value = '#0da99a';
        document.getElementById('hab-icone').selectedIndex = 0;
        document.querySelector('#modal-habitos h3').innerHTML = '<i class="fa-solid fa-seedling w3-text-teal"></i> Novo Hábito';
    }
    abrirModal('modal-habitos');
};

window.salvarHabito = async function() {
    const id_habito = document.getElementById('hab-id').value;
    const nome = document.getElementById('hab-nome').value;
    const cor = document.getElementById('hab-cor').value;
    const icone = document.getElementById('hab-icone').value;
    
    if(!nome) { showNotification('error', 'O nome do hábito é obrigatório.'); return; }

    const res = await apiCall('processarHabitoModal', { id_habito, nome, cor, icone });
    
    if(res.status) {
        showNotification('success', id_habito ? 'Hábito atualizado!' : 'Hábito criado com sucesso!');
        fecharModal('modal-habitos');
        init(); 
    }
};

window.carregarAbaHabitos = async function() {
    await init();
}

async function init() {
    const res = await apiCall('carregarPainelHabitos');
    if (res.status && res.dados) {
        state.habits = res.dados;
        state.page = state.habits.length > 0 ? 'list' : 'setup';
    } else {
        state.page = 'setup';
    }
    renderFull();
}

document.addEventListener("DOMContentLoaded", init);
