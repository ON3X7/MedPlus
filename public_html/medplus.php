<?php
	header('Cross-Origin-Opener-Policy: same-origin-allow-popups');
	// Copyright (c) 2026 Walleson Oliveira. Todos os direitos reservados.
	
	include "../config/config.php"; //caminhos
	include $GLOBALS['caminho']['bibliotecas'].'lib1.php'; // biblioteca principal v1
	include $GLOBALS['caminho']['dao'].'usuarioDao.php'; // dao dos usuarios
	include $GLOBALS['caminho']['dao'].'agendaDao.php'; // dao da agenda
	include $GLOBALS['caminho']['dao'].'imcDao.php'; // dao do imc
	
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
			
			// 1. Dados Básicos da Sessão
			$nome = $_SESSION['user']['nome'] ?? 'Convidado';
			$email = $_SESSION['user']['email'] ?? 'Usuário convidado';
			$imagem = $_SESSION['user']['imagem'] ?? '';
			
			// Dados Adicionais para as telas de Ajuste (Tabela Usuario e IMC)
			if ($_SESSION['user']['data_nascimento'] != '') {
				$oNascimento = new DateTime($_SESSION['user']['data_nascimento']);
				$data_nascimento = $oNascimento->format('Y-m-d');
			} else {
				$data_nascimento = '';
			}
			
			$sexo = $_SESSION['user']['sexo'] ?? '';
			$via_google = $_SESSION['user']['via_google'] ?? false;
			$peso = $_SESSION['user']['peso'] ?? '';     // Virá da tabela imc via JOIN no login
			$altura = $_SESSION['user']['altura'] ?? ''; // Virá da tabela imc via JOIN no login
			
			// 2. Processamento da Foto de Perfil
			if (!empty($imagem)) {
				$fotoHtml = '<img src="' . $imagem . '" alt="Foto de perfil" referrerpolicy="no-referrer">';
				// Foto maior para o menu de configurações da conta
				$fotoHtmlGrande = '<img src="' . str_replace('=s96-c', '=s150-c', $imagem) . '" alt="Foto de perfil" style="width:100px; height:100px; border-radius:50%; object-fit:cover;" referrerpolicy="no-referrer">';
			} else {
				$arrayNome = explode(" ", $nome);
				$primeiroNome = $arrayNome[0];
				$ultimoNome = $arrayNome[count($arrayNome) - 1];
				$iniciais = strtoupper(substr($primeiroNome, 0, 1) . substr($ultimoNome, 0, 1));
				$fotoHtml = '<b>' . $iniciais . '</b>';
				$fotoHtmlGrande = '<b style="width:100px; height:100px; font-size:40px; border-radius:50%; display:grid; place-items:center; background:#0da99a; color:white;">' . $iniciais . '</b>';
			}
			
			// Ocultar campo de senha se logado via Google
			$displaySenha = $via_google ? 'style="display:none;"' : '';
			$mensagemGoogle = $via_google ? '<small class="w3-text-green"><i class="fa-brands fa-google"></i> Conta vinculada ao Google. A senha é gerida externamente.</small>' : '';
			
			// 3. Substituições Globais e de Perfil
			$html = $oCorpo->conteudo;
			$html = str_replace('{{FOTO_PERFIL}}', $fotoHtml, $html);
			$html = str_replace('{{FOTO_PERFIL_GRANDE}}', $fotoHtmlGrande, $html);
			$html = str_replace('{{NOME_USUARIO}}', $nome, $html);
			$html = str_replace('{{EMAIL_USUARIO}}', $email, $html);
			
			// Substituições do Formulário de Conta
			$html = str_replace('{{DATA_NASCIMENTO}}', $data_nascimento, $html);
			$html = str_replace('{{CHECK_SEXO_M}}', ($sexo == 'Masculino') ? 'selected' : '', $html);
			$html = str_replace('{{CHECK_SEXO_F}}', ($sexo == 'Feminino') ? 'selected' : '', $html);
			$html = str_replace('{{DISPLAY_SENHA}}', $displaySenha, $html);
			$html = str_replace('{{MSG_GOOGLE}}', $mensagemGoogle, $html);
			
			// Substituições do Formulário de Saúde (IMC)
			$html = str_replace('{{PESO_ATUAL}}', $peso, $html);
			$html = str_replace('{{ALTURA_ATUAL}}', $altura, $html);
			
			// 4. Substituições do Rodapé (Versão e Autores)
			$versao = $GLOBALS['version'] ?? '0.0.5 alpha';
			$autores = $GLOBALS['authors'] ?? 'Equipe Med+';
			$html = str_replace('{{VERSAO_APP}}', $versao, $html);
			$html = str_replace('{{AUTORES_APP}}', $autores, $html);
			
			$oCorpo->conteudo = $html;
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
			$token = $this->campos['credential'] ?? '';
			
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
				$this->campos['imagem'] = $payload['picture'];
				$this->campos['lembrar'] = 'sim'; // Para já criar o cookie de 30 dias no login via Google
				
				$oUsua = new usuarioDAO();
				
				// Verifica se a conta já existe através da função checarEmail()
				$contaExiste = $oUsua->checarEmail($this->campos);
				
				if (count($contaExiste) === 0) {
					// Conta nova: Cria o usuário marcando via_google = true
					$oUsua->novoUsuarioGoogle($this->campos);
				} else {
					// Conta existente: Atualiza a flag via_google para true, permitindo o login sem senha neste e em futuros acessos via Google
					$oUsua->ativarViaGoogle($this->campos);
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
		
		// AREA DE MODULO AJUSTES (CONTA E SAÚDE)
		function atualizarConta() {
			if (!isset($_SESSION['user']['id'])) return;

			$oUsua = new usuarioDAO();
			$sucesso = $oUsua->atualizarConta($_SESSION['user']['id'], $this->campos);

			if ($sucesso) {
				// Atualiza a sessão para o HTML refletir imediatamente as mudanças
				$_SESSION['user']['nome'] = $this->campos['nome'];
				$_SESSION['user']['data_nascimento'] = $this->campos['data_nascimento'];
				$_SESSION['user']['sexo'] = $this->campos['sexo'];
				
				echo json_encode(['status' => true]);
			} else {
				echo json_encode(['status' => false, 'mensagem' => 'Erro ao atualizar dados no banco de dados.']);
			}
		}

		function atualizarSaude() {
			if (!isset($_SESSION['user']['id'])) return;

			$oImc = new imcDAO();
			$sucesso = $oImc->salvarIMC($_SESSION['user']['id'], $this->campos['altura'], $this->campos['peso']);

			if ($sucesso) {
				$_SESSION['user']['altura'] = $this->campos['altura'];
				$_SESSION['user']['peso'] = $this->campos['peso'];
				echo json_encode(['status' => true]);
			} else {
				echo json_encode(['status' => false, 'mensagem' => 'Erro ao registar o Índice de Massa Corporal.']);
			}
		}

		// Recebe e processa o upload de ficheiros binários da Foto de Perfil
		function uploadFotoPerfil() {
			if (!isset($_SESSION['user']['id'])) return;

			if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
				$id_usuario = $_SESSION['user']['id'];
				$nomeCompleto = $_SESSION['user']['nome'];
				
				// Formata o nome para remover espaços e caracteres especiais (ex: "Dr. João Silva" -> "dr_joao_silva")
				$nomeFormatado = preg_replace('/[^a-zA-Z0-9]+/', '_', strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', $nomeCompleto)));
				
				// Define os caminhos absolutos e relativos
				$pastaDestinoAbsoluta = __DIR__ . "/img/users/" . $nomeFormatado;
				$nomeArquivo = "user_profile_" . $id_usuario . ".png";
				$caminhoCompleto = $pastaDestinoAbsoluta . "/" . $nomeArquivo;
				$caminhoRelativo = "/img/users/" . $nomeFormatado . "/" . $nomeArquivo;
				
				// Cria a pasta do utilizador caso ela ainda não exista
				if (!is_dir($pastaDestinoAbsoluta)) {
					mkdir($pastaDestinoAbsoluta, 0755, true);
				}

				// Move a foto da pasta temporária do PHP para a pasta final do utilizador
				if (move_uploaded_file($_FILES['foto']['tmp_name'], $caminhoCompleto)) {
					
					$oUsua = new usuarioDAO();
					$oUsua->atualizarFoto($id_usuario, $caminhoRelativo);
					
					// Atualiza a sessão com a nova URL
					$_SESSION['user']['imagem'] = $caminhoRelativo;

					// Devolve o caminho relativo para o JavaScript poder trocar o src da <img> imediatamente
					echo json_encode(['status' => true, 'nova_url' => $caminhoRelativo]);
				} else {
					echo json_encode(['status' => false, 'mensagem' => 'Erro ao mover a imagem para a pasta do servidor.']);
				}
			} else {
				echo json_encode(['status' => false, 'mensagem' => 'Nenhuma imagem foi recebida ou houve erro no upload.']);
			}
		}
	}
	
	$oTela = new Tela();
	$oTela->parametros();
?>