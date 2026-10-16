<?php
	header('Cross-Origin-Opener-Policy: same-origin-allow-popups');
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	
	include "../config/config.php"; //caminhos
	include $GLOBALS['caminho']['bibliotecas'].'lib1.php'; // biblioteca principal v1
	include $GLOBALS['caminho']['dao'].'usuarioDao.php'; // dao dos usuarios
	include $GLOBALS['caminho']['dao'].'agendaDao.php'; // dao da agenda
	
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
					$this->TelaMenu();
				 
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
				$this->TelaMenu();
				
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
			$this->TelaMenu();
		}
		
		// menu principal da aplicacao, basicamente apenas controi ele e salva ultimo acesso
		function TelaMenu() {
			$oCorpo = new ObjetoHtml($this->caminho, 'menu.html');
			$oCorpo->imprimir();
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
		
		// AREA DE REQUISICAO GOOGLE
		function loginGoogle() {
			$token = $_POST['credential'] ?? '';
			
			if (empty($token)) {
				echo json_encode(array('status' => false, 'mensagem' => 'Token ausente.'));
				return;
			}

			// Validação manual do token diretamente no servidor do Google (Sem Composer)
			$url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $token;
			
			// Suprime warnings caso o token seja inválido e retorne 400
			$response = @file_get_contents($url); 
			
			if ($response === false) {
				echo json_encode(array('status' => false, 'mensagem' => 'Token inválido ou expirado.'));
				return;
			}

			$payload = json_decode($response, true);

			// Se o Google validar o token, ele retorna os dados do usuário
			if (isset($payload['email'])) {
				$this->campos['email'] = $payload['email'];
				$this->campos['nome'] = $payload['name'];
				$this->campos['lembrar'] = 'sim'; // Para já criar o cookie de 30 dias no login via Google
				
				$oUsua = new usuarioDAO();
				
				// Verifica se a conta já existe através da função checarEmail()
				$contaExiste = $oUsua->checarEmail($this->campos);
				
				if (count($contaExiste) === 0) {
					// Conta nova: Cria o usuário marcando via_google = true
					$oUsua->novoUsuarioGoogle($this->campos);
				} else {
					// Conta existente: Atualiza a flag via_google para true, permitindo o login sem senha neste e em futuros acessos via Google
					$oUsua->ativarViaGoogle($this->campos['email']);
				}
				
				// Constrói a sessão passando o segundo parâmetro como true (bypass de senha)
				Session::contruirSessao($this->campos, true);
				
				echo json_encode(array('status' => true));
			} else {
				echo json_encode(array('status' => false, 'mensagem' => 'Falha ao decodificar dados do Google.'));
			}
		}
		
		// AREA DE MODULO AGENDA
		function recuperarEventos() {
			// Garante que o usuário está logado
			if (!isset($_SESSION['user']['id'])) {
				echo json_encode(array('status' => false, 'mensagem' => 'Acesso negado.'));
				return;
			}
			
			$id_usuario = $_SESSION['user']['id'];
			$data_inicio = $this->campos['data_inicio'] ?? date('Y-m-01');
			$data_fim = $this->campos['data_fim'] ?? date('Y-m-t');
			
			$oAgda = new agendaDAO();
			$resultados = $oAgda->listarEventosPeriodo($id_usuario, $data_inicio, $data_fim);
			
			echo json_encode(array('status' => true, 'dados' => $resultados));
		}
		
		function cadastrarCompromisso() {
			if (!isset($_SESSION['user']['id'])) {
				echo json_encode(array('status' => false, 'mensagem' => 'Acesso negado.'));
				return;
			}

			$oAgda = new agendaDAO();
			$sucesso = false;

			// Como o ObjetoConstrutor já converteu $_POST em $this->campos, usamos diretamente
			if ($this->campos['tipo_cadastro'] === 'plantao') {
				$sucesso = $oAgda->inserirPlantao($this->campos, $_SESSION['user']['id']);
			} else {
				$sucesso = $oAgda->inserirEvento($this->campos, $_SESSION['user']['id']);
			}

			if ($sucesso) {
				echo json_encode(array('status' => true));
			} else {
				echo json_encode(array('status' => false, 'mensagem' => 'Ocorreu um erro no banco de dados.'));
			}
		}
		
		function editarCompromisso() {
			if (!isset($_SESSION['user']['id'])) return;
			$oAgda = new agendaDAO();
			
			if ($this->campos['tipo_cadastro'] === 'plantao') {
				$sucesso = $oAgda->atualizarPlantao($this->campos, $_SESSION['user']['id']);
			} else {
				$sucesso = $oAgda->atualizarEvento($this->campos, $_SESSION['user']['id']);
			}
			
			echo json_encode(array('status' => $sucesso !== false));
		}

		function marcarRecebido() {
			if (!isset($_SESSION['user']['id']) || empty($this->campos['id_pagamento'])) return;
			
			$oAgda = new agendaDAO();
			$sucesso = $oAgda->alterarStatusRecebimento($this->campos['id_pagamento'], $_SESSION['user']['id']);
			
			echo json_encode(array('status' => $sucesso !== false));
		}
		
		function excluirCompromisso() {
			if (!isset($_SESSION['user']['id']) || empty($this->campos['id'])) return;
			$oAgda = new agendaDAO();
			
			$excluir_todos = isset($this->campos['excluir_todos']) && $this->campos['excluir_todos'] === 'sim';
			
			if ($this->campos['tipo_cadastro'] === 'plantao') {
				$id_pagamento = $this->campos['id_pagamento'] ?? null;
				$sucesso = $oAgda->excluirPlantao($this->campos['id'], $id_pagamento, $_SESSION['user']['id'], $excluir_todos);
			} else {
				$sucesso = $oAgda->excluirEvento($this->campos['id'], $_SESSION['user']['id'], $excluir_todos); // Adapte o excluirEvento se quiser repetir Eventos normais
			}
			
			echo json_encode(array('status' => $sucesso !== false));
		}
	}
	
	$oTela = new Tela();
	$oTela->parametros();
?>