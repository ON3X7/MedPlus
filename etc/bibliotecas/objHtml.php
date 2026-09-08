<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	class ObjetoHtml {
		//esse arquivo é um objeto para imprimir um html
		var $caminho = '/';
		var $nome = '';
		var $conteudo = '';
		
		//construtor
		function __construct($caminho, $nome) {
			$this->caminho = $caminho;
			$this->nome = $nome;
			$this->getHtml();
		}
		
		//limpa o obj
		function limpar(){
			$this->nome = '';
			$this->caminho = '';
		}
		
		//obtem conteudo do html
		function getHtml(){
			$fileTemp = fopen($this->caminho.$this->nome, "r");
			$this->conteudo = fread($fileTemp, filesize($this->caminho.$this->nome));
			fclose($fileTemp);
		}
		
		function imprimir(){
			echo $this->conteudo;
		}
	}
?>