<?php
	// Selecione que onde o banco esta
	$local = 'local';
	// $local = 'nuvem';
	
	// Selecione o tipo de banco
	$tipo = 'desenvolvimento';
	// $tipo = 'producao';
	
	
	if ($local === 'local' && $tipo === 'desenvolvimento') {
		define('DB_HOST', '127.0.0.1'); // endereco host
		define('DB_PORT', '5432');		// porta
		define('DB_NAME', 'postgres');  // nome do banco
		define('DB_USER', 'postgres');  // nome do usuario
		define('DB_PASS', 'walle7');    // senha
		define('DB_SCHEMA', 'public'); // esquema padrao
	} else if ($local === 'nuvem' && $tipo === 'desenvolvimento') {
		define('DB_HOST', '127.0.0.1'); 
		define('DB_PORT', '5432');		
		define('DB_NAME', 'postgres');  
		define('DB_USER', 'postgres');  
		define('DB_PASS', 'walle7');    
		define('DB_SCHEMA', 'public'); 
	} else if ($local === 'local' && $tipo === 'producao') {
		define('DB_HOST', '127.0.0.1'); 
		define('DB_PORT', '5432');		
		define('DB_NAME', 'postgres');  
		define('DB_USER', 'postgres');  
		define('DB_PASS', 'walle7');    
		define('DB_SCHEMA', 'public'); 
	} else {
		define('DB_HOST', '127.0.0.1'); 
		define('DB_PORT', '5432');		
		define('DB_NAME', 'postgres');  
		define('DB_USER', 'postgres');  
		define('DB_PASS', 'walle7');    
		define('DB_SCHEMA', 'public'); 
	}
	
	// variavel global de conexao
	$GLOBALS['conexao'] = "host=" . DB_HOST . " port=" . DB_PORT . " dbname=" . DB_NAME . " user=" . DB_USER . " password=" . DB_PASS ." options='-c search_path=" . DB_SCHEMA ."'";
?>