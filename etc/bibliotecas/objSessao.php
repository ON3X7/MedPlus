<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	class Session
	{
		// starta session
		public static function start()
		{
			session_start();
		}
		
		// checa se usuario possui alguma sessao setada
		public static function checar()
		{
			return isset($_SESSION['user']) || isset($_COOKIE['medplus_lembre_me']);
		}
		
		// constroi sessao, nesse cenario, o usuario passa pela tela de login
		public static function contruirSessao($campos)
		{
			self::novaSessao($campos); // cria sessao de navegador
			
			if ($campos['lembrar'] === "sim") {
				self::novoToken(); // cria um token de acesso de 30 dias
			}
		}
		
		// valida sessao permanente ou temporaria, nesse cenario, o usuario bypassa a tela de login
		public static function validar()
		{
			// Verifica se o cookie existe antes de acessá-lo para evitar erros
			if (isset($_COOKIE['medplus_lembre_me']) && !isset($_SESSION['user'])) {
				//recupera token e gera hash
				$token_recuperado = $_COOKIE['medplus_lembre_me'];
				$token_hash = hash('sha256', $token_recuperado);
				
				//recupera token do db
				$db = new Query();

				$resultado = $db->adicionar("SELECT id_usuari FROM token_acesso WHERE token = $1 AND data_expiracao > CURRENT_TIMESTAMP")
								->realizarQuery([$token_hash])
								->recuperar();
				
				if ($resultado['id_usuari'] == '') { // token expirado
					self::limpar();
					return false;
					
				} else { // recria user
					$_SESSION['user'] =  $db->limpar()
											->adicionar("SELECT id, nome, email, data_nascimento, sexo, imagem, via_google, ultimo_acesso")
											->adicionar("FROM usuario WHERE id = $1")
											->realizarQuery([$resultado['id_usuari']])
											->recuperar();
					return true;
				} 
			}
			
			// mesma verificacao, mas para sessao do navegador
			// por enquanto, sem nada demais para verificar
			if (!isset($_COOKIE['medplus_lembre_me']) && isset($_SESSION['user'])) {
				return true;
			}
		}
		
		// cria token de acesso para o usuario com validade de 30 dias
		public static function novoToken()
		{
			// 1. Gera um token criptograficamente seguro
			$token = bin2hex(random_bytes(32));
			$token_hash = hash('sha256', $token);
			
			// 2. Calcula a validade para 30 dias em segundos
			$validade_timestamp = time() + (30 * 24 * 60 * 60); 

			$db = new Query();

			//parametros
			$params = array (
				(int) $_SESSION['user']['id'],
				$token_hash,
				date('Y-m-d H:i:s', $validade_timestamp)
			);
			
			// 3. Grava no banco de dados
			$db->adicionar("INSERT INTO token_acesso (id_usuari, token, data_registro, data_expiracao)")
			   ->adicionar("VALUES ($1, $2, CURRENT_TIMESTAMP, $3)")
			   ->realizarQuery($params);

			
			// 4. Envia o cookie para o navegador com as travas de segurança ativadas
			// Parâmetros: nome, valor, validade, caminho, dominio, secure, httponly
			setcookie('medplus_lembre_me', $token, $validade_timestamp, '/', 'dash.medplus.app.br', true, true);
		}
		
		public static function novaSessao($campos) {
			$db = new Query();

			//parametros
			$params = array (
				$campos['email'],
				hash('sha256', $campos['senha'])
			);
			
			$_SESSION['user'] = $db->adicionar("SELECT id, nome, email, data_nascimento, sexo, imagem, via_google, ultimo_acesso")
								   ->adicionar("FROM usuario WHERE email = $1 AND senha = $2")
								   ->realizarQuery($params)
								   ->recuperar();
		}
		
		public static function registrarAcessoAtivo() {
			self::iniciar();

			// Se o usuário não estiver logado, não faz nada
			if (!isset($_SESSION['user']) || !isset($_COOKIE['medplus_lembre_me'])) {
				return;
			}

			$_SESSION['user']['id'];
			$agora = time();
			$intervalo_atualizacao = 15 * 60; // 15 minutos em segundos

			// Se a sessão acabou de ser criada ou já se passaram 15 minutos desde o último UPDATE
			if (!isset($_SESSION['ultimo_update_bd']) || ($agora - $_SESSION['ultimo_update_bd']) > $intervalo_atualizacao) {
				
				try {
					// Instancia a sua classe Query para fazer o UPDATE no PostgreSQL
					$db = new Query();
					$db->limpar()
					   ->adicionar("UPDATE usuario SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = $1")
					   ->realizarQuery([$_SESSION['user']['id']]);

					// Salva o momento exato em que o banco foi tocado
					$_SESSION['ultimo_update_bd'] = $agora;

				} catch (Exception $e) {
					// Falhas silenciosas para não travar a navegação do usuário caso o log falhe
					error_log("Erro ao atualizar último acesso: " . $e->getMessage());
				}
			}
		}
		
		// limpa a sessao e depois destroi
		public static function limpar()
		{
			$_SESSION = array(); // esvazia session

			// Força o navegador a excluir o cookie de sessão (geralmente o PHPSESSID)
			if (ini_get("session.use_cookies")) {
				$params = session_get_cookie_params();
				
				// Sobrescreve o cookie enviando um valor vazio e data de expiração no passado
				setcookie(session_name(), '', time() - 42000,
					$params["path"], $params["domain"],
					$params["secure"], $params["httponly"]
				);
			}
			
			self::destroy(); // destroi sessao fisicamente
		}
		
		// destroi sessao fisicamente
		public static function destroy()
		{
			session_destroy();
		}
	}

?>