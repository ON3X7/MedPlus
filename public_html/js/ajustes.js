/* Update nas informções de usuaio */
function salvarConta() {
	let nome = document.getElementById('ajuste-nome');
	let nasc = document.getElementById('ajuste-nasc');
	let sexo = document.getElementById('ajuste-sexo');
	let senha = document.getElementById('ajuste-senha');
	let conf_senha = document.getElementById('ajuste-conf-senha');
	
	if (nome.value === '') {
		showNotification('error', 'O nome do usuário não pode estar em branco.');
		nome.focus();
		return false;
	}
	
	if (senha.value !== conf_senha.value) {
		showNotification('error', 'As senhas não coincidem. Tente novamente.');
		return false;
	}
	
	let api = new CustomFetch();
	api.add("acao", "atualizarConta");
	api.add("nome", nome.value); 
	api.add("data_nascimento", nasc.value); 
	api.add("sexo", sexo.value);  
	if (senha.value !== '') {
		api.add("senha", senha.value);  
	}

	api.send("medplus.php").then(response => {
		try {
			let json = JSON.parse(response);
			if (json.status) {
				showNotification('success', 'Perfil atualizado com sucesso');
			} else {
				showNotification('error', json.mensagem);
			}
		} catch (e) { 
			console.error(response); 
		}
	});
}

function salvarSaude() {
	let peso = document.getElementById('ajuste-peso');
	let altura = document.getElementById('ajuste-altura');
	
	if (peso.value === '') {
		showNotification('error', 'O peso do usuário não pode estar em branco.');
		nome.focus();
		return false;
	}
	
	if (altura.value === '') {
		showNotification('error', 'A altura do usuário não pode estar em branco.');
		return false;
	}
	
	let api = new CustomFetch();
	api.add("acao", "atualizarSaude");
	api.add("peso", peso.value); 
	api.add("altura", altura.value);

	api.send("medplus.php").then(response => {
		try {
			let json = JSON.parse(response);
			if (json.status) {
				showNotification('success', 'IMC atualizado com sucesso');
			} else {
				showNotification('error', json.mensagem);
			}
		} catch (e) { 
			console.error(response); 
		}
	});
}

function calcularPreviaIMC() {
	let peso = document.getElementById('ajuste-peso');
	let altura = document.getElementById('ajuste-altura');
	let display = document.getElementById('display-imc');
	
	if (peso.value === '' || altura.value === '' || altura.value === 0) {
		return false;
	}
	
	const result = peso.value / altura.value**2;
	
	if (result >= 18.6 && result < 25) {
		display.innerHTML = '<div class="w3-animate-zoom"><span>Parabéns! Seu IMC está <em>normal</em> </span><i class="w3-text-green fa-regular fa-circle-check"></i></div>';
	} else if (result >= 25 && result < 30) {
		display.innerHTML = '<div class="w3-animate-zoom"><span>Ops! Parece que seu IMC indicou <em>sobrepeso</em> </span><i class="w3-text-orange fa-solid fa-circle-exclamation"></i></div>';
	} else if (result >= 30 && result < 35) {
		display.innerHTML = '<div class="w3-animate-zoom"><span>Hmm. Seu IMC indicou <em>Obesidade Grau I</em>. Recomendamos consultar um médico </span><i class="w3-text-pale-red fa-solid fa-heart-circle-exclamation"></i></div>';
	} else if (result >= 35 && result <= 40) {
		display.innerHTML = '<div class="w3-animate-zoom"><span>Hmm. Seu IMC indicou <em>Obesidade Grau II</em>. Recomendamos consultar um médico <i class="w3-text-red fa-solid fa-house-medical-circle-exclamation"></i></div>';
	} else {
		display.innerHTML = '<div class="w3-animate-zoom"><span>Algo deu errado, métricas fora dos parâmetros<i class="fa-solid fa-bug"></i></div>';
	}
}

//funcao simples apenas para mostrar ao usuario que as senhas nao sao iguais
function compararSenhas() {
	const senha1 = document.getElementById('ajuste-senha');
	const senha2 = document.getElementById('ajuste-conf-senha');
	
	if (senha1.value !== senha2.value) {
		senha2.classList.add('w3-border-red');
	} else {
		senha2.classList.remove('w3-border-red');
	}
}

// Alterna a visibilidade da senha
function toggleVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    
    if (input.type === 'password') {
        // Mostra a senha
        input.type = 'text';
        // Troca o ícone de olho aberto para olho cortado (escondido)
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    } else {
        // Esconde a senha
        input.type = 'password';
        // Troca de volta para o olho aberto
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    }
}

// ==========================================
//   UPLOAD E ATUALIZAÇÃO DA FOTO DE PERFIL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Vincula o clique do botão de trocar foto a um input de arquivo oculto
    const btnTrocarFoto = document.querySelector('.btn-trocar-foto');
    
    if (btnTrocarFoto) {
        btnTrocarFoto.addEventListener('click', () => {
            const inputFicheiro = document.createElement('input');
            inputFicheiro.type = 'file';
            inputFicheiro.accept = 'image/png, image/jpeg, image/jpg, image/webp';
            inputFicheiro.style.display = 'none';

            inputFicheiro.onchange = (e) => {
                const ficheiro = e.target.files[0];
                if (ficheiro) {
                    // Validação simples de tamanho (Máx: 5MB)
                    if (ficheiro.size > 5 * 1024 * 1024) {
                        showNotification('error', 'A imagem é demasiado grande (Máximo 5MB).');
                        return;
                    }
                    processarUploadFoto(ficheiro);
                }
            };

            // Injeta no DOM, aciona o clique do utilizador e remove a seguir
            document.body.appendChild(inputFicheiro);
            inputFicheiro.click();
            document.body.removeChild(inputFicheiro);
        });
    }
});

function processarUploadFoto(ficheiro) {
    let api = new CustomFetch();
    api.add('acao', 'uploadFotoPerfil');
    api.add('foto', ficheiro);

    // O CustomFetch já liga e desliga o loader automaticamente, mas se quiser 
    // manter a notificação de texto que já usava, pode deixá-la aqui:
    showNotification('success', 'A enviar imagem, aguarde...');

    api.send('medplus.php')
        .then(respostaServidor => {
            let json = JSON.parse(respostaServidor);
            
            if (json.status) {
                showNotification('success', 'Foto de perfil atualizada com sucesso!');
                
                // O truque do '?t=' (Cache-Busting)
                const urlAtualizada = json.nova_url + "?t=" + new Date().getTime(); 
                const imagensPerfil = document.querySelectorAll('img[alt="Foto de perfil"]');
                
                if (imagensPerfil.length > 0) {
                    imagensPerfil.forEach(img => {
                        img.src = urlAtualizada;
                    });
                } else {
                    // Recarrega a página para o PHP gerar as tags <img> corretas
                    setTimeout(() => window.location.reload(), 1000);
                }
            } else {
                showNotification('error', json.mensagem || 'Erro ao guardar a foto no servidor.');
            }
        })
        .catch(err => {
            showNotification('error', 'Ocorreu um erro interno de conexão.');
            console.error(err);
        });
}

// precarrega o calculo de imc
document.addEventListener("DOMContentLoaded", function() {
    calcularPreviaIMC();
});