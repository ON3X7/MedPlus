<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	include_once "../etc/bibliotecas/objConexao.php"; // conexao ao banco de dados
	include_once "../etc/bibliotecas/objConstrutor.php"; // construcao de telas com funcoes padrao - utiliza objHtml
	include_once "../etc/bibliotecas/objHtml.php"; // controi o html e imprimi sem funcoes extras
	include_once "../etc/bibliotecas/objQuery.php"; // estabelece comunicacao com o DB - utiliza o objConexao
	include_once "../etc/bibliotecas/objSessao.php"; // estabelece uma sessao de usuario - utiliza o objQuery
	include_once "../etc/bibliotecas/objLog.php"; // grava os movimentos do usuario - utiliza o objQuery
?>