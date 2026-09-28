<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	
	include "../config/config.php"; //caminhos
	include $GLOBALS['caminho']['bibliotecas'].'lib1.php'; // biblioteca principal v1
	include $GLOBALS['caminho']['dao'].'usuarioDao.php'; // dao dos usuarios
	
	Session::start();

	class Tela extends ObjetoConstrutor {
		function parametros() {			
			$this->campos = array(	'acao' => ''
			,						'lembrar' => 'não'
			);
			
			$this->nome = "login.html";
			$this->caminho = $GLOBALS['caminho']['templates'];
			$this->obterCampos();
			$this->acao = $this->campos['acao'];
			
			if ($this->acao === '') {
				$this->acao = 'estabelecerConexao';
			}
			
			$this->executar($this->acao);
		}
		
		// o objetivo principal dessa funcao e saber o que fazer com o usuario ao acessar o sistema
		// ha diversos casos, como primeiro login, login persistente, login invalido etc
		function estabelecerConexao() {
			
			if (Session::checar()) { // sessao persistente ou temporaria setada
			
				if (Session::validar()) { // validar sessao(oes)
					$this->menu();
				 
				} else { // sessao expirada, exibir aviso e pedir para relogar
					$alerta = new ObjetoAlerta();
					$alerta->configurarAlerta(
						'error', 
						'Sessão Expirada', 
						'Sua acesso está expirado. Por favor, efetue o login novamente para continuar.', 
						'/medplus.php', 
						'Tudo bem'
					);
					$alerta->imprimir();
					exit;
				}
				
			} else { // nenhuma sessao setada, fazer login
				$this->TelaLogin();
				
			}
		}
		
		// apenas imprime tela
		function TelaLogin() {
			$oCorpo = new ObjetoHtml($this->caminho, 'login.html');
			$oCorpo->imprimir();
		}
		
		// checa credenciais para um login seguro
		function validarLogin() {
			$oUsua = new usuarioDAO();
			$retorno = $oUsua->checarConta($this->campos);
			
			if (count($retorno) !== 0) {
				Session::contruirSessao($this->campos);
				$this->menu();
				
			} else {
				$alerta = new ObjetoAlerta();
				$alerta->configurarAlerta(
					'error', 
					'Conta não encontrada', 
					'Não foi possível encontrar uma conta com essas credenciais. Por favor, tente novamente.', 
					'/medplus.php', 
					'Tudo bem'
				);
				$alerta->imprimir();
				exit;
			}
		}
		
		// registrar usuario
		function criarConta() {
			$oUsua = new usuarioDAO();
			$retorno = $oUsua->checarEmail($this->campos);
			
			if (count($retorno) === 0) {
				$oUsua->novoUsuario($this->campos);
				
			} else {
				$alerta = new ObjetoAlerta();
				$alerta->configurarAlerta(
					'error', 
					'Conta já criada', 
					'Encontramos uma conta já criada com o e-mail utilizado. Por favor, tente efetuar o login.', 
					'/medplus.php', 
					'Tudo bem'
				);
				$alerta->imprimir();
				exit;
			}
			
			$this->campos['lembrar'] = false; // desativa o lembre-me para o primeiro acesso
			Session::contruirSessao($this->campos);
			$this->menu();
		}
		
		// menu principal da aplicacao, basicamente apenas controi ele e salva ultimo acesso
		function menu() {
			echo "Parabéns, você logou.";
		}
		
		// sai da aplicacao limpando a sessao
		function sair() {
			Session::limpar();
			$this->TelaLogin();
		}
		
		// AREA DE REQUISICOES VIA AJAX ASSINCRONO
		
		function checarCredenciaisLogin() {
			$oUsua = new usuarioDAO();
			$retorno = $oUsua->checarConta($this->campos);
			
			if (count($retorno) !== 0) {
				echo json_encode(array('status' => true));
			} else {
				echo json_encode(array('status' => false, 'mensagem' => 'A conta requisitada nao existe'));
			}
		}
		
		// registrar usuario
		function checarCredenciaisCadastro() {
			$oUsua = new usuarioDAO();
			$retorno = $oUsua->checarConta($this->campos);
			
			if (count($retorno) === 0) {
				echo json_encode(array('status' => true));
				
			} else {
				echo json_encode(array('status' => false, 'mensagem' => 'O e-mail utilizado já está sendo usado. Por favor, efetue o login.'));
			}
		}
	}
	
	$oTela = new Tela();
	$oTela->parametros();
?>