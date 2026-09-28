const emailInput1 = document.getElementById('email-login');
const emailInput2 = document.getElementById('email-cadastro');
const emailAlert1 = document.getElementById('emailAlert1');
const emailAlert2 = document.getElementById('emailAlert2');

// Valida o campo assim que o usuário tira o foco (clica fora do input)
//Login
emailInput1.addEventListener('blur', function() {
	validarEmail(this, emailAlert1);
});

// Remove a mensagem de erro em tempo real assim que o usuário digita um formato válido
emailInput1.addEventListener('input', function() {
	// Só revalida durante a digitação se o campo já estiver com estado de erro
	if (this.validationMessage !== '') {
		validarEmail(this, emailAlert1);
	}
});

//Cadastro
// Valida o campo assim que o usuário tira o foco (clica fora do input)
emailInput2.addEventListener('blur', function() {
	validarEmail(this, emailAlert2);
});

// Remove a mensagem de erro em tempo real assim que o usuário digita um formato válido
emailInput2.addEventListener('input', function() {
	// Só revalida durante a digitação se o campo já estiver com estado de erro
	if (this.validationMessage !== '') {
		validarEmail(this, emailAlert2);
	}
});

function validarEmail(campo, alert) {
	// Regex simples para garantir que o texto tenha algo@algo.algo
	const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	
	if (campo.value.trim() === '') {
		// Mensagem idêntica à da sua imagem para campo vazio
		//campo.setCustomValidity('Por favor, preencha este campo.'); 
		//emailValidationAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Por favor, preencha este campo.';
		alert.classList.add('w3-hide');
	} 
	else if (!regexEmail.test(campo.value)) {
		// Mensagem para formato incorreto
		//campo.setCustomValidity('Insira um endereço de e-mail válido (ex: nome@dominio.com).');
		alert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Insira um endereço de e-mail válido.';
		alert.classList.remove('w3-hide');
	} 
	else {
		// Se estiver tudo certo, limpar a mensagem valida o campo
		// campo.setCustomValidity(''); 
		alert.classList.add('w3-hide');
	}
	
	// Força o navegador a exibir o balão de alerta nativo na tela
	//campo.reportValidity();
}