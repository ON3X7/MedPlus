class CustomFetch {
    constructor(async = true) {
        this.fields = {}; // Armazena os campos (key-value)
        this.async = async; // Mantido por compatibilidade, mas o Fetch é sempre assíncrono
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

    iniciarLoading() {
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

    pararLoading() {
        const topLoader = document.getElementById('global-loader');
        if (topLoader) topLoader.style.display = 'none';
    }

    // --- LÓGICA REFATORADA PARA FETCH API ---
    async send(url) {
        if (!url) {
            console.error("A valid URL must be provided!");
            return Promise.reject("Invalid URL");
        }

        // 1. CHAMA O LOADING ANTES DA REQUISIÇÃO SAIR
        this.iniciarLoading();

        const formData = new URLSearchParams(this.fields).toString();

        try {
            // Faz o pedido com Fetch, usando POST e os mesmos cabeçalhos do XHR
            const resposta = await fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });

            // 2. DESLIGA O LOADING QUANDO TERMINAR
            this.pararLoading();

            // Verifica se o status HTTP foi 200 a 299 (sucesso)
            if (resposta.ok) {
                // Lemos a resposta como texto bruto para imitar o xhr.responseText
                this.response = await resposta.text();
                return this.response; // Isso resolve a Promise automaticamente
            } else {
                console.error("Error:", resposta.statusText);
                throw resposta.statusText; // Dispara um erro que cairá no catch abaixo
            }
            
        } catch (erro) {
            // Garante que o loading seja desligado até se a internet cair no meio do processo
            this.pararLoading(); 
            console.error("Fetch Error:", erro);
            throw erro; // Rejeita a Promise, para que o .catch() lá no seu functions.js capture
        }
    }

    getResponse() {
        return this.response;
    }
}