<?php
	// Copyright (c) 2026 Walleson Oliveira. Todos os direitos reservados.
	class imcDAO {
		private $db;
		
		function __construct() {
			$this->db = new Query();
		}
		
		function salvarIMC($id_usuario, $altura, $peso) {
			try {
				// Verifica se já existe um registo para este utilizador
				$existe = $this->db->limpar()
								   ->adicionar("SELECT id FROM imc WHERE id_usuario = $1;")
								   ->realizarQuery([$id_usuario])
								   ->recuperar();
				
				if (count($existe) > 0) {
					// Atualiza o registo existente
					$this->db->limpar()
							 ->adicionar("UPDATE imc SET altura = $1, peso = $2 WHERE id_usuario = $3;")
							 ->realizarQuery([$altura, $peso, $id_usuario]);
				} else {
					// Cria um novo registo
					$this->db->limpar()
							 ->adicionar("INSERT INTO imc (id_usuario, altura, peso) VALUES ($1, $2, $3);")
							 ->realizarQuery([$id_usuario, $altura, $peso]);
				}
				return true;
			} catch (Exception $e) {
				return false;
			}
		}
	}
?>