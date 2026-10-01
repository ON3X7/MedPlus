// Verifica credenciais e faz login no banco
function logar() {
	const email = document.getElementById('email-login');
	const senha = document.getElementById('senha-login');
	const form = document.getElementById('form-login');
	const btn = document.getElementById('button-login');
	
	if (email.value == '' || senha.value == '') {
		showNotification('error', 'Por favor, preencha os dados de login.');
		
		if (email.value == '') {
			email.focus();
		} else {
			senha.focus();
		}
		return false;
	}
	
	const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	
	if (!regexEmail.test(email.value)) {
		showNotification('error', 'Por favor, insira um e-mail válido.');
		return false;
	}
	
	//cooldown do bottao
	btn.disabled = true;
	
	setTimeout(() => {
		btn.disabled = false;
	}, 3000);
	
	
	let ajaxAssincrono = new CustomAjax(true); // Alterado para assíncrono
	ajaxAssincrono.add("acao", "checarCredenciaisLogin");
	ajaxAssincrono.add("email", email.value);
	ajaxAssincrono.add("senha", senha.value);
	ajaxAssincrono.send("medplus.php").then(response => {
       try {
			let json = JSON.parse(response);
			
			if (!json.status) {
				showNotification('error', 'E-mail e/ou Senha inválidos');
			} else {
				form.submit();
			}
		} catch (e) {
			showNotification('error', 'Ops, parece que o servidor apresentou um erro - 101');
		
			console.log(response);
		}
    }).catch(erro => console.error("Erro interno:", erro));
}

// Verifica credenciais e faz cadastro no banco
function registrar() {
	const nome = document.getElementById('nome-cadastro');
	const email = document.getElementById('email-cadastro');
	const senha = document.getElementById('senha-cadastro');
	const confirma = document.getElementById('confirma-cadastro');
	const form = document.getElementById('form-cadastro');
	const btn = document.getElementById('button-cadastro');
	
	if (nome.value == '' || email.value == '' || senha.value == '' || confirma.value == '') {
		showNotification('error', 'Por favor, preencha os dados de cadastro.');
		
		if (nome.value == '') {
			nome.focus();
		} else if (email.value == '') {
			email.focus();
		} else if (senha.value == '') {
			senha.focus();
		} else {
			confirma.focus();
		}
		return false;
	}
	
	const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	
	if (!regexEmail.test(email.value)) {
		showNotification('error', 'Por favor, insira um e-mail válido.');
		return false;
	}
	
	if (senha.value !== confirma.value) {
		showNotification('error', 'As senhas não coincidem');
		confirma.focus();
		return false;
	}
	
	//cooldown do bottao
	btn.disabled = true;
	
	setTimeout(() => {
		btn.disabled = false;
	}, 3000);
	
	let ajaxAssincrono = new CustomAjax(true); // Alterado para assíncrono
	ajaxAssincrono.add("acao", "checarCredenciaisCadastro");
	ajaxAssincrono.add("nome", nome.value);
	ajaxAssincrono.add("email", email.value);
	ajaxAssincrono.add("senha", senha.value);
	ajaxAssincrono.send("medplus.php").then(response => {
       try {
			let json = JSON.parse(response);
			
			if (!json.status) {
				showNotification('error', 'O e-mail informado já está sendo utilizado. Por favor, tente outro e-mail ou fazer o login.');
			} else {
				form.submit();
			}
		} catch (e) {
			showNotification('error', 'Erro no servidor - 101');
		}
    }).catch(erro => console.error("Erro interno:", erro));
}

//funcao simples apenas para mostrar ao usuario que as senhas nao sao iguais
function compararSenhas() {
	const senha1 = document.getElementById('senha-cadastro');
	const senha2 = document.getElementById('confirma-cadastro');
	
	if (senha1.value !== senha2.value) {
		senha2.classList.add('w3-border-red');
	} else {
		senha2.classList.remove('w3-border-red');
	}
}

// --- INTEGRAÇÃO GOOGLE AUTH ---

window.addEventListener('load', function () {
    // Inicializa a API do Google
    google.accounts.id.initialize({
        client_id: "323794095144-m0qfnhgb0gpm9bbbsch1odh5l05kva2k.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });
    
    // Renderiza o botão no formulário de Login
    const containerLogin = document.getElementById("btn-google-login");
    if (containerLogin) {
        google.accounts.id.renderButton(containerLogin, { 
            theme: "outline", 
            size: "large", 
            width: "350", // Ajuste a largura de acordo com o seu CSS
            text: "signin_with" 
        });
    }

    // Renderiza o botão no formulário de Cadastro
    const containerCadastro = document.getElementById("btn-google-cadastro");
    if (containerCadastro) {
        google.accounts.id.renderButton(containerCadastro, { 
            theme: "outline", 
            size: "large", 
            width: "350",
            text: "signup_with" 
        });
    }
});

function handleGoogleLogin(response) {
    let ajaxAssincrono = new CustomAjax(true);
    
    // Passamos a ação 'loginGoogle' e o token recebido
    ajaxAssincrono.add("acao", "loginGoogle");
    ajaxAssincrono.add("credential", response.credential);
    
    ajaxAssincrono.send("medplus.php").then(res => {
        try {
            let json = JSON.parse(res);
            
            if (!json.status) {
                showNotification('error', json.mensagem || 'Falha ao autenticar com o Google.');
            } else {
                // Se o backend confirmar o cadastro/login, recarrega ou redireciona
                window.location.href = "/medplus.php"; 
            }
        } catch (e) {
            showNotification('error', 'Erro interno no servidor ao validar Google - 102');
            console.log(res);
        }
    }).catch(erro => console.error("Erro no AJAX Google:", erro));
}