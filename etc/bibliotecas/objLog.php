<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	class LogQuery
	{
		private $db;

		function __construct()
		{
			// Instancia a nova classe Query. 
			// A conexão persistente já é resolvida internamente por ela.
			$this->db = new Query();
		}

		public function makeQuery($sql)
		{
			if (!isset($_REQUEST['acao'])) {
				return;
			}

			// Garante que a sessão está ativa
			if (session_status() === PHP_SESSION_NONE) {
				session_start();
			}

			$dataHora = date("Ymd");
			$file = "../logs/{$dataHora}.json";

			// Cria sequence simples
			if (!isset($_SESSION['sequence'])) {
				$_SESSION['sequence'] = 0;
			}
			$_SESSION['sequence']++;

			// Monta array de log
			$data = [
				"sequence"   => $_SESSION['sequence'],
				"clienteip"  => $this->obterIpRealUsuario() ?? "0.0.0.0",
				"datahora"   => date("Y-m-d H:i:s"),
				"campos"     => print_r($_REQUEST, true),
				"acao"       => $_REQUEST['acao'] ?? "",
				"vendid"     => method_exists('Session', 'getVenda') ? Session::getVenda() : null,
				"sql"        => $sql
			];

			// Grava JSON
			$json = json_encode($data, JSON_PRETTY_PRINT) . PHP_EOL;
			file_put_contents($file, $json, FILE_APPEND | LOCK_EX);

			// Prepara os parâmetros para execução segura
			$params = [
				$data['sequence'],
				$data['clienteip'],
				$data['campos'],
				$data['acao'],
				$data['vendid'],
				$data['sql']
			];

			try {
				// Utiliza a nova estrutura encadeada para montar e executar a query
				$resultado = $this->db->limpar()
									  ->adicionar("INSERT INTO logs (sequence, clienteip, datahora, campos, acao, vendid, sql)")
									  ->adicionar("VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6)")
									  ->adicionar("RETURNING id;")
									  ->realizarQuery($params)
									  ->recuperar();

				// Como a função recuperar() devolve o array associativo, 
				// você pode facilmente retornar o ID inserido se precisar:
				// return $resultado['id'] ?? null;

			} catch (Exception $e) {
				// Tratamento unificado de erros fornecido pela classe Query
				// error_log("Erro ao inserir log: " . $e->getMessage());
				// return false;
			}
		}
		
		private function obterIpRealUsuario() {
			// Verifica se há um IP encaminhado por Proxy/Ngrok
			if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
				// O X-Forwarded-For pode retornar uma lista de IPs (ex: "client, proxy1, proxy2")
				// O primeiro da lista é o IP original do usuário
				$ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
				return trim($ips[0]);
			}
			
			// Verifica outro cabeçalho comum de clientes
			if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
				return $_SERVER['HTTP_CLIENT_IP'];
			}
			
			// Se não tiver proxy, retorna o IP direto da conexão
			return $_SERVER['REMOTE_ADDR'];
		}
	}
?>