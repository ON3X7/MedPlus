<?php
	$envPath = __DIR__ . '/../.env'; 

	// Lê o arquivo e extrai as variáveis de forma segura
	if (file_exists($envPath)) {
		$env = parse_ini_file($envPath);
		
		// Define as constantes do sistema puxando do .env
		define('DB_HOST',   $env['DB_HOST']); 
		define('DB_PORT',   $env['DB_PORT']);		
		define('DB_NAME',   $env['DB_NAME']);  
		define('DB_USER',   $env['DB_USER']);  
		define('DB_PASS',   $env['DB_PASS']);    
		define('DB_SCHEMA', $env['DB_SCHEMA']); 
		
	} else {
		die("Erro de segurança: Arquivo .env ausente. O sistema foi interrompido.");
	}
	
	// Variável global de conexão intocada e funcionando dinamicamente
	$GLOBALS['conexao'] = "host=" . DB_HOST . " port=" . DB_PORT . " dbname=" . DB_NAME . " user=" . DB_USER . " password=" . DB_PASS ." options='-c search_path=" . DB_SCHEMA ."'";
?>