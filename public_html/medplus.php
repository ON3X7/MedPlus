<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	
	include "../config/caminhos.php"; //caminhos
	include $GLOBALS['caminho']['bibliotecas'].'lib1.php'; //biblioteca principal v1
	
	//Session::start();

	class Tela extends ObjetoConstrutor {
		function parametros() {			
			$this->campos = array(	'acao' => ''
			
			);
			
			
			$this->nome = "login.html";
			$this->caminho = $GLOBALS['caminho']['templates'];
			$this->obterCampos();
			$this->acao = $this->campos['acao'];
			$this->executar($this->acao);
		}
		
		
	}
	
	$oTela = new Tela();
	$oTela->parametros();
?>