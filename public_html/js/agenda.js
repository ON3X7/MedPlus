let mockEvents = {}; 

// --- ESTADO DO CALENDÁRIO ---
let displayedDate = new Date(); 
let selectedDate = new Date();  
let currentView = 'mês';        

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const weekdaysNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const calendar = document.querySelector("#calendar");

// --- FUNÇÕES AUXILIARES DE DATA E DURAÇÃO ---
function formatarDataSTR(dateObj) {
	const y = dateObj.getFullYear();
	const m = String(dateObj.getMonth() + 1).padStart(2, '0');
	const d = String(dateObj.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

// NOVA FUNÇÃO: Calcula a duração exata e formata os textos de forma amigável
function calcularDuracaoEFormatacao(inicioStr, fimStr) {
    const tInicio = inicioStr.replace(' ', 'T');
    const tFim = fimStr.replace(' ', 'T');
    
    const dIni = new Date(tInicio);
    const dFim = new Date(tFim);
    
    const formataHora = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    const formataData = (d) => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
    
    const horaIni = formataHora(dIni);
    const horaFim = formataHora(dFim);
    
    const mesmoDia = dIni.toDateString() === dFim.toDateString();
    
    // Cálculo matemático da diferença
    const diffMs = Math.max(0, dFim - dIni);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMins / 60);
    const dias = Math.floor(diffHoras / 24);
    const horasRestantes = diffHoras % 24;
    const minsRestantes = diffMins % 60;
    
    // Texto curto para o painel lateral (ex: 2h30m, 1 dia(s))
    let textoDuracaoPanel = "";
    if (dias > 0) textoDuracaoPanel = `${dias} dia(s)`;
    else if (diffHoras > 0) textoDuracaoPanel = `${diffHoras}h${minsRestantes > 0 ? minsRestantes+'m' : ''}`;
    else textoDuracaoPanel = `${diffMins}m`;

    // Texto longo e rico para a modal
    let textoDuracaoModal = "Duração: ";
    if (dias > 0) textoDuracaoModal += `${dias} dia(s) `;
    if (horasRestantes > 0) textoDuracaoModal += `${horasRestantes} hora(s) `;
    if (minsRestantes > 0) textoDuracaoModal += `${minsRestantes} min`;
    if (dias === 0 && horasRestantes === 0 && minsRestantes === 0) textoDuracaoModal += "Imediato";

    let textoModalCompleto = mesmoDia 
        ? `${formataData(dIni)} das ${horaIni} às ${horaFim}`
        : `De ${formataData(dIni)} às ${horaIni}<br>Até ${formataData(dFim)} às ${horaFim}`;
        
    return { horaIni, horaFim, mesmoDia, textoDuracaoPanel, textoDuracaoModal, textoModalCompleto };
}

// --- ATUALIZAÇÃO DOS CARDS (RESUMOS) ---
function atualizarContadoresCards() {
	let totalMes = 0;
	let totalConsultasMes = 0;
	let totalProximos7Dias = 0;

	const currentYear = displayedDate.getFullYear();
	const currentMonth = displayedDate.getMonth();

	const dataHoje = new Date();
	const proximos7Dias = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(dataHoje.getFullYear(), dataHoje.getMonth(), dataHoje.getDate() + i);
		proximos7Dias.push(formatarDataSTR(d));
	}

    // Usamos um Set para evitar contar o mesmo evento várias vezes se ele durar vários dias
    let idsContadosMes = new Set();
    let idsContadosProx = new Set();
    let idsConsultasMes = new Set();

	for (const [dateStr, events] of Object.entries(mockEvents)) {
		const [y, m, d] = dateStr.split('-');
		const eventYear = parseInt(y, 10);
		const eventMonth = parseInt(m, 10) - 1;

		if (eventYear === currentYear && eventMonth === currentMonth) {
            events.forEach(e => {
                idsContadosMes.add(e.tipo_tabela + e.id);
                if (e.type.includes('Consulta') || e.type.includes('Presencial') || e.type.includes('Teleconsulta')) {
                    idsConsultasMes.add(e.tipo_tabela + e.id);
                }
            });
		}

		if (proximos7Dias.includes(dateStr)) {
			events.forEach(e => idsContadosProx.add(e.tipo_tabela + e.id));
		}
	}

	const contadores = document.querySelectorAll('.summaries article strong');
	if (contadores.length >= 3) {
		contadores[0].textContent = String(idsContadosMes.size).padStart(2, '0');
		contadores[1].textContent = String(idsConsultasMes.size).padStart(2, '0');
		contadores[2].textContent = String(idsContadosProx.size).padStart(2, '0');
	}
}

// --- RENDERIZAÇÃO DO CALENDÁRIO ---
function renderCalendar() {
	const year = displayedDate.getFullYear();
	const month = displayedDate.getMonth();

	calendar.innerHTML = "";
	let daysHTML = "";
	let dataInicioBusca, dataFimBusca; 

	if (currentView === 'mês') {
	  document.querySelector(".calendar .month h2").innerHTML = `${monthNames[month]} <span>${year}</span>`;
	  calendar.style.gridTemplateColumns = "repeat(7, 1fr)";
	  weekdaysNames.forEach(day => calendar.insertAdjacentHTML("beforeend", `<b class="weekday">${day}</b>`));

	  const firstDayIndex = new Date(year, month, 1).getDay();
	  const lastDayDate = new Date(year, month + 1, 0).getDate();
	  const prevLastDayDate = new Date(year, month, 0).getDate();

	  for (let x = firstDayIndex; x > 0; x--) {
		daysHTML += createDayHTML(year, month - 1, prevLastDayDate - x + 1, true);
	  }
	  for (let i = 1; i <= lastDayDate; i++) {
		const isSelected = (i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear());
		daysHTML += createDayHTML(year, month, i, false, isSelected);
	  }
	  const totalCells = firstDayIndex + lastDayDate;
	  const nextDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
	  for (let j = 1; j <= nextDays; j++) {
		daysHTML += createDayHTML(year, month + 1, j, true);
	  }
	  dataInicioBusca = new Date(year, month, 1);
	  dataFimBusca = new Date(year, month + 1, 0);

	} else if (currentView === 'semana') {
	  const startOfWeek = new Date(year, month, displayedDate.getDate() - displayedDate.getDay());
	  const endOfWeek = new Date(year, month, displayedDate.getDate() - displayedDate.getDay() + 6);
	  document.querySelector(".calendar .month h2").innerHTML = `${startOfWeek.getDate()} a ${endOfWeek.getDate()} de ${monthNames[endOfWeek.getMonth()]} <span>${endOfWeek.getFullYear()}</span>`;
	  calendar.style.gridTemplateColumns = "repeat(7, 1fr)";
	  weekdaysNames.forEach(day => calendar.insertAdjacentHTML("beforeend", `<b class="weekday">${day}</b>`));

	  for (let i = 0; i < 7; i++) {
		  const currentDay = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
		  const isSelected = (formatarDataSTR(currentDay) === formatarDataSTR(selectedDate));
		  const isMuted = currentDay.getMonth() !== month;
		  daysHTML += createDayHTML(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), isMuted, isSelected);
	  }
	  dataInicioBusca = startOfWeek;
	  dataFimBusca = endOfWeek;

	} else if (currentView === 'dia') {
	  document.querySelector(".calendar .month h2").innerHTML = `${displayedDate.getDate()} de ${monthNames[month]} <span>${year}</span>`;
	  calendar.style.gridTemplateColumns = "1fr"; 
	  calendar.insertAdjacentHTML("beforeend", `<b class="weekday">${weekdaysNames[displayedDate.getDay()]}</b>`);
	  const isSelected = (formatarDataSTR(displayedDate) === formatarDataSTR(selectedDate));
	  daysHTML += createDayHTML(year, month, displayedDate.getDate(), false, isSelected);
	  dataInicioBusca = displayedDate;
	  dataFimBusca = displayedDate;
	}

	calendar.insertAdjacentHTML("beforeend", daysHTML);
	atualizarContadoresCards();
	buscarEventosNoServidor(currentView, formatarDataSTR(dataInicioBusca), formatarDataSTR(dataFimBusca));
}

function createDayHTML(year, month, day, isMuted, isSelected = false) {
	const dateObj = new Date(year, month, day); 
	const dateStr = formatarDataSTR(dateObj);
	const items = mockEvents[dateStr] || [];

	return `
	<button class="date ${isMuted ? "muted" : ""} ${isSelected ? "selected" : ""}" data-date="${dateStr}">
	  <span>${day}</span>
	  <div></div>
	</button>`;
}

// --- RENDERIZAÇÃO DO PAINEL LATERAL (DIA SELECIONADO) ---
function renderDay(dateString) {
	const dateObj = new Date(dateString + 'T00:00:00');
	document.querySelector(".day-panel header h2").innerHTML = `<span id="selected-day">${String(dateObj.getDate()).padStart(2, '0')}</span> de ${monthNames[dateObj.getMonth()].toLowerCase()}`;

	const dayEvents = mockEvents[dateString] || [];
	document.querySelector("#event-count").textContent = dayEvents.length;
	const appointments = document.querySelector("#appointments");

	if (!dayEvents.length) {
		appointments.innerHTML = `<div class="empty"><i class="fa-regular fa-calendar"></i><b>Dia livre</b><p>Nenhum compromisso marcado para esta data.</p></div>`;
	    return;
    }

    appointments.innerHTML = dayEvents.map(event => {
        const duracao = calcularDuracaoEFormatacao(event.data_inicio, event.data_fim);
        
        // Lógica visual para eventos de múltiplos dias
        let displayTime = duracao.horaIni;
        if (!duracao.mesmoDia) {
            const dataRender = new Date(dateString + 'T00:00:00').getTime();
            const dataIni = new Date(event.data_inicio.substring(0,10) + 'T00:00:00').getTime();
            const dataFim = new Date(event.data_fim.substring(0,10) + 'T00:00:00').getTime();
            
            if (dataRender === dataIni) {
                displayTime = `${duracao.horaIni} <i class="fa-solid fa-arrow-right" style="font-size:9px; opacity:0.6"></i>`;
            } else if (dataRender === dataFim) {
                displayTime = `<i class="fa-solid fa-arrow-right" style="font-size:9px; opacity:0.6"></i> ${duracao.horaFim}`;
            } else {
                displayTime = "Dia Todo";
            }
        }

        return `
        <article data-id="${event.id}" data-tabela="${event.tipo_tabela}">
          <div class="time"><b>${displayTime}</b><small>${duracao.textoDuracaoPanel}</small></div>
          <i class="m-indicator" style="background-color: ${event.tone};"></i>
          <div><small style="color: ${event.tone};">${event.type}</small><h3>${event.title}</h3><p><i class="fa-solid fa-location-dot"></i> ${event.hospital || 'Unidade Centro'}</p></div>
          <button><i class="fa-solid fa-chevron-right"></i></button>
        </article>`;
    }).join("");
}

// --- EVENTOS E NAVEGAÇÃO ---
calendar.addEventListener("click", event => {
	const dateBtn = event.target.closest(".date[data-date]");
	if (!dateBtn) return;

	const dateStr = dateBtn.dataset.date;
	selectedDate = new Date(dateStr + 'T00:00:00');

    // Se estiver na visão 'dia' ou clicar em um dia de outro mês ('muted'), precisa reconstruir
	if (currentView === 'dia' || (dateBtn.classList.contains('muted') && currentView === 'mês')) {
	  displayedDate = new Date(selectedDate);
      renderCalendar();
	} else {
      // APENAS ATUALIZAÇÃO VISUAL: Remove a seleção anterior e marca o novo dia clicado
      const diaAnterior = calendar.querySelector('.date.selected');
      if (diaAnterior) diaAnterior.classList.remove('selected');
      
      dateBtn.classList.add('selected');
    }

    // Atualiza o painel lateral com os eventos do dia clicado (usando a memória cache do JS)
	renderDay(dateStr);
});

function navegarCalendario(direcao) {
	if (currentView === 'mês') displayedDate.setMonth(displayedDate.getMonth() + direcao);
	else if (currentView === 'semana') displayedDate.setDate(displayedDate.getDate() + (direcao * 7));
	else if (currentView === 'dia') displayedDate.setDate(displayedDate.getDate() + direcao);
	renderCalendar();
}

document.querySelector(".month button:first-child").addEventListener("click", () => navegarCalendario(-1));
document.querySelector(".month button:last-child").addEventListener("click", () => navegarCalendario(1));

document.querySelectorAll(".views button").forEach(button => button.addEventListener("click", () => {
	document.querySelector(".views .active")?.classList.remove("active");
	button.classList.add("active");
	currentView = button.textContent.toLowerCase().trim(); 
	displayedDate = new Date(selectedDate);
	renderCalendar();
}));

// --- REQUISIÇÃO AJAX (PHP) ---
function buscarEventosNoServidor(tipoVisao, dataInicio, dataFim) {
	let ajax = new CustomAjax(true);
	ajax.add("acao", "recuperarEventos");
	ajax.add("visao", tipoVisao); 
	ajax.add("data_inicio", dataInicio); 
	ajax.add("data_fim", dataFim);       

	ajax.send("medplus.php").then(response => {
		try {
			let json = JSON.parse(response);
			if (json.status) {
				mockEvents = {}; 
				
				json.dados.forEach(item => {
                    const objE = {
						id: item.id,
						id_valor_receber: item.id_valor_receber,
						tipo_tabela: item.tipo_tabela,
						title: item.title,
						type: item.type || "Geral",
						id_tipeve: item.id_tipeve,
						tone: item.tone || "#12b8a7",
						icone: item.icone || "fa-solid fa-stethoscope",
						hospital: item.hospital,
						pagamento: item.pagamento,
						data_prevista: item.data_prevista, 
						recebido: item.recebido !== null && item.recebido !== "",
						observacao: item.observacao,
						data_inicio: item.data_inicio,
						data_fim: item.data_fim
					};

					// NOVIDADE: Espelha o evento em TODOS os dias que ele dura
                    let dCur = new Date(item.data_inicio.replace(' ', 'T'));
                    let dEnd = new Date(item.data_fim.replace(' ', 'T'));
                    dCur.setHours(0,0,0,0);
                    dEnd.setHours(0,0,0,0);

                    while (dCur <= dEnd) {
                        let dataStr = formatarDataSTR(dCur);
                        if (!mockEvents[dataStr]) mockEvents[dataStr] = [];
                        mockEvents[dataStr].push(objE);
                        dCur.setDate(dCur.getDate() + 1); // Avança 1 dia
                    }
				});

				preencherEventosNoGrid();
				renderDay(formatarDataSTR(selectedDate));
				atualizarContadoresCards();
			}
		} catch (e) { console.error(response); }
	});
}

function preencherEventosNoGrid() {
	const diasGrid = document.querySelectorAll('#calendar .date');
	
	diasGrid.forEach(btnDia => {
		const dataStr = btnDia.dataset.date;
		const items = mockEvents[dataStr] || [];
		
		const containerIcones = btnDia.querySelector('div');
		if (containerIcones) {
			containerIcones.innerHTML = items.map(event => {
                const corHex = event.tone || "#0da99a"; 
                const corFundo = hexToRgba(corHex, 0.15);
				return `<small style="color: ${corHex}; background-color: ${corFundo};" title="${event.title}"><i class="${event.icone}"></i></small>`;
            }).join("");
		}
		
		let indicadorMobile = btnDia.querySelector('i');
		if (items.length > 0) {
			if (!indicadorMobile) btnDia.insertAdjacentHTML('beforeend', '<i></i>');
		} else {
			if (indicadorMobile) indicadorMobile.remove();
		}
	});
}

// ==========================================
//   LÓGICA DOS MODAIS (CARDS DE AGENDA)
// ==========================================
function alternarTipoCadastro(tipo) {
	const tabEvento = document.getElementById('tab-evento');
	const tabPlantao = document.getElementById('tab-plantao');
	const fieldsEvento = document.getElementById('fields-evento');
	const fieldsPlantao = document.getElementById('fields-plantao');

	if (tipo === 'evento') {
		tabEvento.classList.add('active');
		tabPlantao.classList.remove('active');
		fieldsEvento.style.display = 'block';
		fieldsPlantao.style.display = 'none';
	} else {
		tabPlantao.classList.add('active');
		tabEvento.classList.remove('active');
		fieldsPlantao.style.display = 'block';
		fieldsEvento.style.display = 'none';
	}
}

function toggleRepeticao(checkbox) {
	document.getElementById('opcoes-repeticao').style.display = checkbox.checked ? 'block' : 'none';
}

// Desabilita a digitação numérica se for indefinido
function toggleIndefinido(checkbox) {
    const inputQtd = document.getElementById('cad-quantidade');
    inputQtd.disabled = checkbox.checked;
    if (checkbox.checked) inputQtd.value = "";
}

function abrirEdicao() {
    if(!eventoVisivelAtual) return;
    
    document.getElementById('cad-id').value = eventoVisivelAtual.id;
    document.getElementById('cad-id-pagamento').value = eventoVisivelAtual.id_valor_receber || "";
    document.getElementById('cad-nome').value = eventoVisivelAtual.title;
    
    document.getElementById('cad-inicio').value = eventoVisivelAtual.data_inicio.replace(' ', 'T').substring(0,16);
    document.getElementById('cad-fim').value = eventoVisivelAtual.data_fim.replace(' ', 'T').substring(0,16);
    
    document.getElementById('cad-cor').value = eventoVisivelAtual.tone;
    document.getElementById('cad-tipo-evento').value = eventoVisivelAtual.id_tipeve || "1";
    document.getElementById('cad-icone').value = eventoVisivelAtual.icone;
    document.getElementById('cad-observacao').value = eventoVisivelAtual.observacao || "";
    
    if (eventoVisivelAtual.tipo_tabela === 'plantao') {
        alternarTipoCadastro('plantao');
        document.getElementById('cad-hospital').value = eventoVisivelAtual.hospital || "";
        
        // RECUPERA E FORMATA O VALOR DE DINHEIRO
        let valPgto = "";
        if (eventoVisivelAtual.pagamento && parseFloat(eventoVisivelAtual.pagamento) > 0) {
            valPgto = parseFloat(eventoVisivelAtual.pagamento).toFixed(2);
            valPgto = valPgto.replace(".", ",");
            valPgto = valPgto.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        }
        document.getElementById('cad-pagamento').value = valPgto;
        
        // RECUPERA E FORMATA A DATA DE PAGAMENTO
        let prev = eventoVisivelAtual.data_prevista;
        if(prev) {
            // Se o DB devolver apenas YYYY-MM-DD, adiciona as horas falsas para o input funcionar
            if (prev.length === 10) prev += "T00:00"; 
            document.getElementById('cad-prevista').value = prev.replace(' ', 'T').substring(0,16);
        } else {
            document.getElementById('cad-prevista').value = "";
        }

        document.querySelector('.repeticao-box').style.display = 'none';
    } else {
        alternarTipoCadastro('evento');
        document.getElementById('cad-pagamento').value = "";
        document.getElementById('cad-prevista').value = "";
    }
    
    fecharModal('modal-view');
    abrirModal('modal-cadastro');
}

function salvarCompromisso() {
	const titulo = document.getElementById('cad-nome').value;
    const isPlantao = document.getElementById('tab-plantao').classList.contains('active');
    const idAtual = document.getElementById('cad-id').value;

	if (!titulo) { showNotification('error', 'O título é obrigatório.'); return; }

    let ajax = new CustomAjax(true);
    ajax.add("acao", idAtual ? "editarCompromisso" : "cadastrarCompromisso");
    if (idAtual) {
        ajax.add("id", idAtual);
        ajax.add("id_pagamento", document.getElementById('cad-id-pagamento').value);
    }
    
    ajax.add("tipo_cadastro", isPlantao ? "plantao" : "evento");
    ajax.add("nome", titulo);
    ajax.add("data_inicio", document.getElementById('cad-inicio').value);
    ajax.add("data_fim", document.getElementById('cad-fim').value);
    ajax.add("cor", document.getElementById('cad-cor').value);
    ajax.add("icone", document.getElementById('cad-icone').value);
    ajax.add("observacao", document.getElementById('cad-observacao').value);

    if (isPlantao) {
        ajax.add("hospital", document.getElementById('cad-hospital').value);
        let pagamentoSujo = document.getElementById('cad-pagamento').value;
        let pagamentoLimpo = pagamentoSujo ? pagamentoSujo.replace(/\./g, '').replace(',', '.') : "0";
        ajax.add("pagamento", pagamentoLimpo);
        ajax.add("data_prevista", document.getElementById('cad-prevista').value);
        
        if (!idAtual && document.getElementById('cad-repetir').checked) {
            ajax.add("repetir", 'sim');
            ajax.add("periodo", document.getElementById('cad-periodo').value);
            ajax.add("quantidade", document.getElementById('cad-quantidade').value);
        }
    } else {
        ajax.add("id_tipeve", document.getElementById('cad-tipo-evento').value);
    }

    ajax.send("medplus.php").then(response => {
        try {
            let json = JSON.parse(response);
            if (json.status) {
                showNotification('success', idAtual ? 'Compromisso atualizado!' : 'Agendado com sucesso!');
                fecharModal('modal-cadastro');
                const dataInicialStr = formatarDataSTR(new Date(displayedDate.getFullYear(), displayedDate.getMonth(), 1));
                const dataFinalStr = formatarDataSTR(new Date(displayedDate.getFullYear(), displayedDate.getMonth() + 1, 0));
                buscarEventosNoServidor(currentView, dataInicialStr, dataFinalStr);
            } else { showNotification('error', json.mensagem || 'Erro ao processar.'); }
        } catch(e) { }
    });
}

function marcarRecebido() {
    if(!eventoVisivelAtual || !eventoVisivelAtual.id_valor_receber) return;
    let ajax = new CustomAjax(true);
    ajax.add("acao", "marcarRecebido");
    ajax.add("id_pagamento", eventoVisivelAtual.id_valor_receber);
    ajax.send("medplus.php").then(response => {
        try {
            let json = JSON.parse(response);
            if(json.status) {
                showNotification('success', 'Status financeiro atualizado!');
                fecharModal('modal-view');
                const dataInicialStr = formatarDataSTR(new Date(displayedDate.getFullYear(), displayedDate.getMonth(), 1));
                const dataFinalStr = formatarDataSTR(new Date(displayedDate.getFullYear(), displayedDate.getMonth() + 1, 0));
                buscarEventosNoServidor(currentView, dataInicialStr, dataFinalStr);
            }
        } catch(e) {}
    });
}

function excluirCompromisso() {
    if(!eventoVisivelAtual) return;

    const tipoTexto = eventoVisivelAtual.tipo_tabela === 'plantao' ? 'o plantão' : 'o evento';
    if(!confirm(`Tem certeza que deseja excluir ${tipoTexto}:\n"${eventoVisivelAtual.title}"?`)) return;

    let excluirTodosStr = 'nao';
    // Se o evento possuir um id_grupo atrelado, pergunta se quer excluir toda a série
    if (eventoVisivelAtual.id_grupo) {
        if(confirm("Este compromisso faz parte de uma série que se repete.\n\nDeseja excluir TAMBÉM todas as outras repetições (passadas e futuras)?\n\n[OK] para Excluir Tudo\n[Cancelar] para Excluir Apenas Este")) {
            excluirTodosStr = 'sim';
        }
    }

    let ajax = new CustomAjax(true);
    ajax.add("acao", "excluirCompromisso");
    ajax.add("id", eventoVisivelAtual.id);
    ajax.add("tipo_cadastro", eventoVisivelAtual.tipo_tabela);
    ajax.add("excluir_todos", excluirTodosStr);
    
    if (eventoVisivelAtual.id_valor_receber) {
        ajax.add("id_pagamento", eventoVisivelAtual.id_valor_receber);
    }

    ajax.send("medplus.php").then(response => {
        try {
            let json = JSON.parse(response);
            if(json.status) {
                showNotification('success', 'Excluído com sucesso!');
                fecharModal('modal-view');
                const dataInicialStr = formatarDataSTR(new Date(displayedDate.getFullYear(), displayedDate.getMonth(), 1));
                const dataFinalStr = formatarDataSTR(new Date(displayedDate.getFullYear(), displayedDate.getMonth() + 1, 0));
                buscarEventosNoServidor(currentView, dataInicialStr, dataFinalStr);
            } else { showNotification('error', json.mensagem || 'Não foi possível excluir.'); }
        } catch(e) {}
    });
}

let eventoVisivelAtual = null;

document.querySelector("#new-event").addEventListener("click", () => {
	document.getElementById('form-compromisso').reset();
    document.getElementById('cad-id').value = ""; 
    document.getElementById('cad-id-pagamento').value = "";
	document.getElementById('opcoes-repeticao').style.display = 'none';
    document.querySelector('.repeticao-box').style.display = 'block';
	alternarTipoCadastro('evento');
	abrirModal('modal-cadastro');
});

document.querySelector("#appointments").addEventListener("click", (e) => {
	const article = e.target.closest("article");
	if (!article) return;

	const id = article.dataset.id;
    const tipoTabela = article.dataset.tabela;
    const dataStr = formatarDataSTR(selectedDate);
    eventoVisivelAtual = mockEvents[dataStr].find(ev => ev.id == id && ev.tipo_tabela == tipoTabela);
    if(!eventoVisivelAtual) return;

    const duracao = calcularDuracaoEFormatacao(eventoVisivelAtual.data_inicio, eventoVisivelAtual.data_fim);

	document.getElementById('view-nome').textContent = eventoVisivelAtual.title;
	document.getElementById('view-tipo').textContent = eventoVisivelAtual.type;
	
    // NOVIDADE: Visual da Duração muito mais rico no Modal
	document.getElementById('view-horario').innerHTML = `
        <span style="font-size:13px; color:#26384a;">${duracao.textoModalCompleto}</span><br>
        <span style="display:inline-block; margin-top:4px; padding:3px 8px; background-color:#e5f8f5; color:#0da99a; font-size:10px; font-weight:700; border-radius:4px;">
            <i class="fa-regular fa-clock" style="margin-right:2px; font-size:10px;"></i> ${duracao.textoDuracaoModal}
        </span>
    `;
	
    // NOVIDADE: Verifica observações ou coloca um fallback agradável
    const obsText = eventoVisivelAtual.observacao ? eventoVisivelAtual.observacao.trim() : "";
    document.getElementById('view-observacao').innerHTML = obsText !== "" 
        ? obsText.replace(/\n/g, '<br>') 
        : "<i style='color:#b0bec5;'>Nenhum detalhe adicional registrado para este compromisso.</i>";
    
    document.getElementById('view-icon-box').style.backgroundColor = hexToRgba(eventoVisivelAtual.tone, 0.15);
    document.getElementById('view-icon-box').style.color = eventoVisivelAtual.tone;
    document.getElementById('view-icon').className = eventoVisivelAtual.icone;

	const infoHospital = document.getElementById('view-plantao-info');
	const infoPagamento = document.getElementById('view-pagamento-info');
    const btnReceber = document.getElementById('btn-receber');

	if (eventoVisivelAtual.tipo_tabela === 'plantao') {
		infoHospital.style.display = 'flex';
		infoPagamento.style.display = 'flex';
		document.getElementById('view-hospital').textContent = eventoVisivelAtual.hospital || "Não informado";
        
        let txtPagamento = "R\$ 0,00";
        if (eventoVisivelAtual.pagamento) {
            txtPagamento = `R$ ${parseFloat(eventoVisivelAtual.pagamento).toFixed(2).replace('.', ',')}`;
            if (eventoVisivelAtual.recebido) txtPagamento += " (Recebido ✅)";
            else txtPagamento += " (Pendente ⏳)";
        }
		document.getElementById('view-pagamento').textContent = txtPagamento;
        
        if (eventoVisivelAtual.id_valor_receber) {
            btnReceber.style.display = 'block';
            btnReceber.querySelector('span').textContent = eventoVisivelAtual.recebido ? "Estornar" : "Recebido";
        } else {
            btnReceber.style.display = 'none';
        }

	} else {
		infoHospital.style.display = 'none';
		infoPagamento.style.display = 'none';
        btnReceber.style.display = 'none';
	}

	abrirModal('modal-view');
});

// --- INICIALIZAÇÃO ---
renderCalendar();
renderDay(formatarDataSTR(selectedDate));

// Máscara de Moeda para o campo de pagamento
document.getElementById('cad-pagamento').addEventListener('input', function(e) {
    let valor = e.target.value;
    
    // Remove tudo o que não for número
    valor = valor.replace(/\D/g, "");
    
    if (valor === "") {
        e.target.value = "";
        return;
    }
    
    // Converte para formato de centavos (divide por 100)
    valor = (parseInt(valor, 10) / 100).toFixed(2);
    
    // Substitui ponto por vírgula e aplica os pontos de milhar
    valor = valor.replace(".", ",");
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    
    e.target.value = valor;
});