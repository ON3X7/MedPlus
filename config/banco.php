<?php
	$envPath = __DIR__ . '/../.env'; 

	if (file_exists($envPath)) {
		$env = [];
		// Lê o ficheiro como um array de linhas, ignorando linhas em branco
		$linhas = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
		
		foreach ($linhas as $linha) {
			$linha = trim($linha);
			
			// Ignora comentários (linhas que começam por #) e linhas vazias
			if (empty($linha) || strpos($linha, '#') === 0) {
				continue;
			}
			
			// Divide a linha no primeiro sinal de igual (=)
			if (strpos($linha, '=') !== false) {
				list($chave, $valor) = explode('=', $linha, 2);
				$env[trim($chave)] = trim($valor);
			}
		}
		
		// Define as constantes do sistema (usa o operador ?? para evitar erros caso uma variável falte no .env)
		define('DB_HOST',   $env['DB_HOST'] ?? '127.0.0.1'); 
		define('DB_PORT',   $env['DB_PORT'] ?? '5432');		
		define('DB_NAME',   $env['DB_NAME'] ?? 'postgres');  
		define('DB_USER',   $env['DB_USER'] ?? 'postgres');  
		define('DB_PASS',   $env['DB_PASS'] ?? '');    
		define('DB_SCHEMA', $env['DB_SCHEMA'] ?? 'public'); 
		
	} else {
		die("Erro de segurança: Arquivo .env ausente. O sistema foi interrompido.");
	}
	
	// Variável global de conexão
	$GLOBALS['conexao'] = "host=" . DB_HOST . " port=" . DB_PORT . " dbname=" . DB_NAME . " user=" . DB_USER . " password=" . DB_PASS ." options='-c search_path=" . DB_SCHEMA ."'";
?>