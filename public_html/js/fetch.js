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

        this.iniciarLoading();

        // Verifica se algum dos valores guardados é um ficheiro (File ou Blob)
        const contemFicheiro = Object.values(this.fields).some(val => val instanceof File || val instanceof Blob);
        
        let fetchOptions = { method: 'POST' };

        if (contemFicheiro) {
            // MODO ARQUIVO: Usa FormData. Não definimos o Content-Type para que 
            // o próprio navegador crie a fronteira "multipart/form-data" correta.
            const formData = new FormData();
            for (const key in this.fields) {
                formData.append(key, this.fields[key]);
            }
            fetchOptions.body = formData;
        } else {
            // MODO TEXTO: Comportamento original rápido (x-www-form-urlencoded)
            fetchOptions.headers = { "Content-Type": "application/x-www-form-urlencoded" };
            fetchOptions.body = new URLSearchParams(this.fields).toString();
        }

        try {
            const resposta = await fetch(url, fetchOptions);
            this.pararLoading();

            if (resposta.ok) {
                this.response = await resposta.text();
                return this.response; 
            } else {
                console.error("Error:", resposta.statusText);
                throw resposta.statusText; 
            }
            
        } catch (erro) {
            this.pararLoading(); 
            console.error("Fetch Error:", erro);
            throw erro; 
        }
    }

    getResponse() {
        return this.response;
    }
}