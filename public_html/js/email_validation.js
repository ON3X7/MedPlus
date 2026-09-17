const emailInput = document.getElementById('login-email');
const emailValidationAlert = document.getElementById('emailValidationAlert');

// Valida o campo assim que o usuário tira o foco (clica fora do input)
emailInput.addEventListener('blur', function() {
	validarEmail(this);
});

// Remove a mensagem de erro em tempo real assim que o usuário digita um formato válido
emailInput.addEventListener('input', function() {
	// Só revalida durante a digitação se o campo já estiver com estado de erro
	if (this.validationMessage !== '') {
		validarEmail(this);
	}
});

function validarEmail(campo) {
	// Regex simples para garantir que o texto tenha algo@algo.algo
	const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	
	if (campo.value.trim() === '') {
		// Mensagem idêntica à da sua imagem para campo vazio
		//campo.setCustomValidity('Por favor, preencha este campo.'); 
		//emailValidationAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Por favor, preencha este campo.';
		emailValidationAlert.classList.add('w3-hide');
	} 
	else if (!regexEmail.test(campo.value)) {
		// Mensagem para formato incorreto
		//campo.setCustomValidity('Insira um endereço de e-mail válido (ex: nome@dominio.com).');
		emailValidationAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Insira um endereço de e-mail válido.';
		emailValidationAlert.classList.remove('w3-hide');
	} 
	else {
		// Se estiver tudo certo, limpar a mensagem valida o campo
		// campo.setCustomValidity(''); 
		emailValidationAlert.classList.add('w3-hide');
	}
	
	// Força o navegador a exibir o balão de alerta nativo na tela
	//campo.reportValidity();
}