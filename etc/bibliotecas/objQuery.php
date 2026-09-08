<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	class Query {
		private $conexao;
		private $queryString = "";
		private $resultado = null;

		public function __construct() {
			// Recupera a instância da conexão persistente gerada pela classe ConexaoDB
			$this->conexao = ConexaoDB::getInstancia();
		}

		/**
		 * Define o schema (search_path) para a execução das consultas
		 * 
		 * @param string $schema Nome do schema
		 * @return $this
		 */
		public function setSchema($schema) {
			// pg_escape_identifier protege contra injeção no nome do schema
			$schemaSeguro = pg_escape_identifier($this->conexao, $schema);
			$query = "SET search_path TO " . $schemaSeguro;
			
			$result = pg_query($this->conexao, $query);
			if (!$result) {
				throw new Exception("Erro ao setar o schema: " . pg_last_error($this->conexao));
			}
			
			return $this;
		}

		/**
		 * Adiciona ou concatena instruções SQL à query atual
		 * 
		 * @param string $sql Instrução SQL
		 * @return $this
		 */
		public function adicionar($sql) {
			// Adiciona um espaço antes para evitar colagem de palavras ao concatenar
			$this->queryString .= " " . trim($sql);
			return $this;
		}

		/**
		 * Limpa a query string atual e libera a memória do último resultado
		 * 
		 * @return $this
		 */
		public function limpar() {
			$this->queryString = "";
			
			if ($this->resultado !== null) {
				pg_free_result($this->resultado);
				$this->resultado = null;
			}
			
			return $this;
		}

		/**
		 * Executa a query montada de forma segura
		 * 
		 * @param array $parametros Valores para substituir os placeholders ($1, $2, etc)
		 * @return $this
		 */
		public function realizarQuery($parametros = []) {
			if (empty($this->queryString)) {
				throw new Exception("A query está vazia. Utilize o método adicionar() antes.");
			}

			if (empty($parametros)) {
				// Execução simples sem parâmetros
				$this->resultado = pg_query($this->conexao, $this->queryString);
			} else {
				// Execução segura passando os parâmetros separadamente para o PostgreSQL
				$this->resultado = pg_query_params($this->conexao, $this->queryString, $parametros);
			}

			if (!$this->resultado) {
				throw new Exception("Erro na query: " . pg_last_error($this->conexao));
			}

			return $this;
		}

		/**
		 * Recupera apenas a primeira linha do resultado como um array associativo
		 * 
		 * @return array|null
		 */
		public function recuperar() {
			if ($this->resultado) {
				$linha = pg_fetch_assoc($this->resultado);
				return $linha !== false ? $linha : null;
			}
			return null;
		}

		/**
		 * Recupera todas as linhas do resultado como um array de arrays associativos
		 * 
		 * @return array
		 */
		public function listar() {
			if ($this->resultado) {
				$dados = pg_fetch_all($this->resultado);
				// pg_fetch_all retorna false se não houver registros, garantimos um array vazio nesse caso
				return $dados !== false ? $dados : [];
			}
			return [];
		}
	}
?>