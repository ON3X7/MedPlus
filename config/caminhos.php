<?php
	// Selecione que onde o sistema esta instalado
	$local = 'local';
	// $local = 'nuvem';
	
	// Selecione o tipo de caminho
	$tipo = 'relativo';
	// $tipo = 'absoluto';
	
	
	if ($tipo === 'relativo') {
		$GLOBALS['caminho']['dao'] = '../etc/dao/';
		$GLOBALS['caminho']['templates'] = '../etc/templates/';
		$GLOBALS['caminho']['bibliotecas'] = '../etc/bibliotecas/';
		$GLOBALS['caminho']['services'] = '../etc/services/';
		$GLOBALS['caminho']['logs'] = '../logs/';
	} else if ($local === 'local' && $tipo === 'absoluto') {
		$GLOBALS['caminho']['dao'] = 'C:\xampp\htdocs\MedLife\ ';
		$GLOBALS['caminho']['templates'] = 'C:\xampp\htdocs\MedLife\templates\ ';
		$GLOBALS['caminho']['bibliotecas'] = 'C:\xampp\htdocs\MedLife\bibliotecas\ ';
		$GLOBALS['caminho']['services'] = 'C:\xampp\htdocs\MedLife\services\ ';
		$GLOBALS['caminho']['logs'] = 'C:\xampp\htdocs\MedLife\logs\ ';
	} else {
		$GLOBALS['caminho']['dao'] = 'C:/xampp/htdocs/MedLife/ ';
		$GLOBALS['caminho']['templates'] = 'C:/xampp/htdocs/MedLife/templates/ ';
		$GLOBALS['caminho']['bibliotecas'] = 'C:/xampp/htdocs/MedLife/bibliotecas/ ';
		$GLOBALS['caminho']['services'] = 'C:/xampp/htdocs/MedLife/services/ ';
		$GLOBALS['caminho']['logs'] = 'C:/xampp/htdocs/MedLife/logs/ ';
	}
?>