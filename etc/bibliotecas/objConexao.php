<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	class ConexaoDB {
		private static $instancia = null;

		// Bloqueia a criação de múltiplas instâncias (Singleton)
		private function __construct() {}
		private function __clone() {}

		/**
		 * Retorna a instância da conexão persistente
		 */
		public static function getInstancia() {
			if (self::$instancia === null) {
				// Captura a global definida no seu arquivo de configuração
				global $conexao;
				
				// pg_pconnect estabelece uma conexão persistente
				self::$instancia = pg_pconnect($conexao);

				if (!self::$instancia) {
					throw new Exception("Erro: Não foi possível conectar ao PostgreSQL.");
				}
			}

			return self::$instancia;
		}
	}
?>