<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	class usuarioDAO {
		private $db;
		
		function __construct() {
			$this->db = new Query();
		}
		
		function novoUsuario($campos) {
			try {
				// Função para formatar nomes
				function formatarNomes($string) {
					$encoding = 'UTF-8';
					
					// 1. Separa a string em um array de palavras, usando o espaço como divisor
					$palavras = explode(' ', $string);
					$palavrasFormatadas = [];

					// 2. Percorre cada palavra da string
					foreach ($palavras as $palavra) {
						
						// Transforma a palavra inteira em minúscula
						$palavra_lower = mb_strtolower($palavra, $encoding);

						// 3. Verifica se a palavra tem mais de 2 caracteres
						if (mb_strlen($palavra_lower, $encoding) > 2) {
							
							// Separa a 1ª letra e o resto da palavra
							$primeiraLetra = mb_substr($palavra_lower, 0, 1, $encoding);
							$resto = mb_substr($palavra_lower, 1, null, $encoding);
							
							// Transforma a 1ª letra em maiúscula e junta com o resto
							$palavraFinal = mb_strtoupper($primeiraLetra, $encoding) . $resto;
							
							$palavrasFormatadas[] = $palavraFinal;
							
						} else {
							// Se tiver 2 letras ou menos, mantém toda em minúscula
							$palavrasFormatadas[] = $palavra_lower;
						}
					}

					// 4. Junta as palavras novamente em uma única string, separadas por espaço
					return implode(' ', $palavrasFormatadas);
				}
				
				// manipulacao de params
				$params = array (
					formatarNomes($campos['nome']),
					strtolower($campos['email']),
					hash('sha256', $campos['senha'])
				);
				
				$this->db->limpar()
						 ->adicionar("INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3);")
						 ->realizarQuery($params);
				return true;
			} catch (Exception $e) {
				return false;
			}
		}
		
		// Insere um novo usuário vindo exclusivamente do Google
		function novoUsuarioGoogle($campos) {
			try {
				$params = array (
					$campos['nome'], // O Google já costuma enviar o nome formatado corretamente
					strtolower($campos['email']),
					'true' // Seta a coluna via_google como verdadeira
				);
				
				// A senha é deixada em branco/nula, pois a autenticação é delegada ao Google
				$this->db->limpar()
						 ->adicionar("INSERT INTO usuario (nome, email, via_google) VALUES ($1, $2, $3);")
						 ->realizarQuery($params);
				return true;
			} catch (Exception $e) {
				return false;
			}
		}

		// Atualiza um usuário existente que acessou via Google, permitindo que a sessão ignore a senha
		function ativarViaGoogle($email) {
			try {
				$this->db->limpar()
						 ->adicionar("UPDATE usuario SET via_google = true WHERE email = $1;")
						 ->realizarQuery([strtolower($email)]);
				return true;
			} catch (Exception $e) {
				return false;
			}
		}
		
		function remover($id) {
			try {
				// Inicia a transação diretamente pela classe Query[cite: 21, 22]
				$this->db->limpar()->adicionar("BEGIN")->realizarQuery();

				// 1. Primeiro apaga os itens que dependem da categoria
				$this->db->limpar()
						 ->adicionar("DELETE FROM item WHERE id_categoria = $1")
						 ->realizarQuery([$id]);

				// 2. Depois apaga a categoria "mãe"
				$this->db->limpar()
						 ->adicionar("DELETE FROM categoria WHERE id = $1")
						 ->realizarQuery([$id]);

				// Confirma as alterações na base de dados[cite: 21]
				$this->db->limpar()->adicionar("COMMIT")->realizarQuery();
				return true;

			} catch (Exception $e) {
				// Interceta qualquer exceção lançada pelo método realizarQuery() e desfaz a operação[cite: 21, 22]
				$this->db->limpar()->adicionar("ROLLBACK")->realizarQuery();
				return false;
			}
		}
		
		function checarConta($campos) {
			try {
				// manipulacao de params
				$params = array (
					strtolower($campos['email']),
					hash('sha256', $campos['senha'])
				);
				
				// O método listar() da classe Query devolve automaticamente um array com os resultados
				return $this->db->limpar()
								->adicionar("SELECT 1 FROM usuario WHERE email = $1 AND senha = $2;")
								->realizarQuery($params)
								->recuperar();
			} catch (Exception $e) {
				return [];
			}
		}
		
		function checarEmail($campos) {
			try {
				// manipulacao de params
				$params = array (
					strtolower($campos['email'])
				);
				
				// O método listar() da classe Query devolve automaticamente um array com os resultados
				return $this->db->limpar()
								->adicionar("SELECT 1 FROM usuario WHERE email = $1;")
								->realizarQuery($params)
								->recuperar();
			} catch (Exception $e) {
				return [];
			}
		}
	}
?>