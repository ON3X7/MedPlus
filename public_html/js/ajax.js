class CustomAjax {
    constructor(async = true) {
        this.fields = {}; // Armazena os campos (key-value)
        this.async = async; // Define se será assíncrono ou síncrono
        this.response = null; // Armazena a resposta do servidor
    }

    add(key, value) {
        if (!key || value === undefined || value === null) {
            console.error("Key and value must be provided!");
            return;
        }
        this.fields[key] = value;
    }

    clearFields() {
        this.fields = {};
    }

    // --- NOVA LÓGICA: Inicia a animação correta baseada na "action" ---
    iniciarLoading() {
        if (this.fields.action === 'listarItens') {
            const tbody = document.querySelector('#tabela tbody');
            if (tbody) {
                tbody.innerHTML = ''; 
                for (let i = 0; i < 4; i++) {
                    tbody.innerHTML += `
                        <tr>
                            <td style="width:15%; vertical-align: middle;"><div class="skeleton-box skeleton-img"></div></td>
                            <td style="width:50%; vertical-align: middle;">
                                <div class="skeleton-box skeleton-text"></div>
                                <div class="skeleton-box skeleton-text short"></div>
                            </td>
                            <td style="display:none;"></td>
                            <td style="width:20%; vertical-align: middle; text-align: center;"><div class="stepper-horiz"><div class="skeleton-box skeleton-stepper"></div><div class="skeleton-box skeleton-stepper"></div><div class="skeleton-box skeleton-stepper"></div></div></td>
                            <td style="width:15%; vertical-align: middle;"><div class="skeleton-box skeleton-icon"></div></td>
                        </tr>
                    `;
                }
            }
        } 
        // --- ADICIONADO: Skeleton para as Categorias ---
        else if (this.fields.action === 'listarCategorias') {
            const optionsDiv = document.getElementById('options');
            if (optionsDiv) {
                optionsDiv.innerHTML = ''; 
                // Cria 3 opções falsas piscando
                for (let i = 0; i < 3; i++) {
                    optionsDiv.innerHTML += `
                        <div class="option-item" style="pointer-events: none;">
                            <div class="skeleton-box skeleton-text" style="width: 60%; margin: 0; height: 18px;"></div>
                            <div class="skeleton-box" style="width: 18px; height: 18px; border-radius: 50%;"></div>
                        </div>
                    `;
                }
            }
        } 
        // ----------------------------------------------
        else {
            // Para atualizar quantidade ou remover, mostra apenas uma barra verde rápida no topo
            let topLoader = document.getElementById('global-loader');
            if (!topLoader) {
                topLoader = document.createElement('div');
                topLoader.id = 'global-loader';
                topLoader.className = 'global-ajax-loader';
                document.body.prepend(topLoader);
            }
            topLoader.style.display = 'block';
        }
    }

    // --- NOVA LÓGICA: Para o loading da barra superior ---
    pararLoading() {
        const topLoader = document.getElementById('global-loader');
        if (topLoader) topLoader.style.display = 'none';
    }

    send(url) {
        if (!url) {
            console.error("A valid URL must be provided!");
            return;
        }

        // 1. CHAMA O LOADING AQUI, ANTES DA REQUISIÇÃO SAIR
        this.iniciarLoading();

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", url, this.async);
            
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            const formData = new URLSearchParams(this.fields).toString();

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    
                    // 2. DESLIGA O LOADING QUANDO TERMINAR
                    this.pararLoading();

                    if (xhr.status === 200) {
                        this.response = xhr.responseText;
                        resolve(this.response);
                    } else {
                        console.error("Error:", xhr.statusText);
                        reject(xhr.statusText);
                    }
                }
            };

            xhr.send(formData);
        });
    }

    getResponse() {
        return this.response;
    }
}