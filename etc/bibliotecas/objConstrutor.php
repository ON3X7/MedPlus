<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	class ObjetoConstrutor {
		//esse arquivo é um objeto para imprimir um html
		var $caminho = '/'; // ../site/teste/
		var $nome = ''; // example.html
		var $campos = array();
		var $acao = '';
		var $usarReplace = true;
		
		//funcao principal que executa a tela
		function executar($acao) {
			if ($acao == '') {
				call_user_func([$this, 'imprimirHtml']);
			} else {
				call_user_func([$this, $acao]);
			}
		}
		
		//preenche campos
		function substituirCampos($array, &$conteudo) {
			if (!$array){
				$array = $this->campos;
			}
			
			foreach ($array as $chave => $valor) {
				$conteudo = str_replace('@'.$chave.'@', $valor ?? '', $conteudo); //usa-se ?? para evitar valores null				
			}
		}
		
		//obter campos (apenas POST)
		function obterCampos() {
			foreach ($_POST as $chave => $valor){
				$this->campos[$chave] = $valor;	
			}
		}
		
		function imprimirHtml() {
			$oHtml = new objetoHtml($this->caminho, $this->nome);
			if ($this->usarReplace) {
				$this->substituirCampos($this->campos, $oHtml->conteudo);
			}
			echo $oHtml->conteudo;
		}
	}
?>