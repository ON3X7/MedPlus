<?php
	// Copyright (c) 2026 Walleson Douglas. Todos os direitos reservados.
	class agendaDAO {
		private $db;
		
		function __construct() {
			$this->db = new Query();
		}
		
		public function listarEventosPeriodo($id_usuario, $data_inicio, $data_fim) {
			$data_fim_completa = $data_fim . ' 23:59:59';
			
			$sql = "
				SELECT 
					'evento' AS tipo_tabela, a.id, a.nome AS title, a.cor AS tone, a.icone, 
					a.data_inicio, a.data_fim, a.observacao, te.nome AS type, a.id_tipeve AS id_tipeve, a.id_grupo,
					NULL AS hospital, NULL::numeric AS pagamento, NULL::date AS data_prevista, 
					NULL::integer AS recebido, NULL::integer AS id_valor_receber
				FROM agenda a
				LEFT JOIN tipo_evento te ON a.id_tipeve = te.id
				WHERE a.id_usuari = $1 AND a.data_inicio >= $2 AND a.data_inicio <= $3
				
				UNION ALL
				
				SELECT 
					'plantao' AS tipo_tabela, p.id, p.nome AS title, p.cor AS tone, p.icone, 
					p.data_inicio, p.data_fim, p.observacao, 'Plantão' AS type, NULL::integer AS id_tipeve, p.id_grupo,
					p.hospital, v.valor AS pagamento, v.data_prevista, v.recebido, p.pagamento AS id_valor_receber
				FROM plantoes p
				LEFT JOIN valores_a_receber v ON p.pagamento = v.id
				WHERE p.id_usuari = $1 AND p.data_inicio >= $2 AND p.data_inicio <= $3
				
				ORDER BY data_inicio ASC
			";
			
			$params = array((int) $id_usuario, $data_inicio, $data_fim_completa);
			return $this->db->limpar()->adicionar($sql)->realizarQuery($params)->listar();
		}

		// Atualiza um Evento Normal
		public function atualizarEvento($campos, $id_usuari) {
			$sql = "UPDATE agenda SET nome=$1, cor=$2, id_tipeve=$3, data_inicio=$4, data_fim=$5, observacao=$6, icone=$7 WHERE id=$8 AND id_usuari=$9";
			$params = array($campos['nome'], $campos['cor'], $campos['id_tipeve'], $campos['data_inicio'], $campos['data_fim'], $campos['observacao'], $campos['icone'], $campos['id'], $id_usuari);
			return $this->db->limpar()->adicionar($sql)->realizarQuery($params);
		}

		// Atualiza um Plantão e gere o financeiro atrelado
		public function atualizarPlantao($campos, $id_usuari) {
			$this->db->limpar()->adicionar("BEGIN")->realizarQuery();
			try {
				// 1. Resolve a parte financeira de forma segura
				$id_pagamento = !empty($campos['id_pagamento']) ? $campos['id_pagamento'] : null;
				$data_prev = !empty($campos['data_prevista']) ? $campos['data_prevista'] : null; // Evita string vazia ""
				$valor = !empty($campos['pagamento']) ? (float)$campos['pagamento'] : 0;

				if ($id_pagamento) {
					// Já possuía previsão financeira. Atualiza ou apaga se o valor foi zerado.
					if ($valor > 0) {
						$sql_fin = "UPDATE valores_a_receber SET valor=$1, data_prevista=$2 WHERE id=$3";
						$this->db->limpar()->adicionar($sql_fin)->realizarQuery([$valor, $data_prev, $id_pagamento]);
					} else {
						$this->db->limpar()->adicionar("DELETE FROM valores_a_receber WHERE id=$1")->realizarQuery([$id_pagamento]);
						$id_pagamento = null;
					}
				} else if ($valor > 0) {
					// Não possuía previsão, mas o utilizador adicionou um valor agora
					$sql_fin = "INSERT INTO valores_a_receber (valor, data_prevista, recebido) VALUES ($1, $2, NULL) RETURNING id";
					$res_fin = $this->db->limpar()->adicionar($sql_fin)->realizarQuery([$valor, $data_prev])->recuperar();
					$id_pagamento = $res_fin['id'];
				}

				// 2. Atualiza o Plantão e vincula a Foreign Key do pagamento
				$sql = "UPDATE plantoes SET nome=$1, cor=$2, hospital=$3, data_inicio=$4, data_fim=$5, observacao=$6, icone=$7, pagamento=$8 WHERE id=$9 AND id_usuari=$10";
				$params = [
					$campos['nome'], $campos['cor'], $campos['hospital'], 
					$campos['data_inicio'], $campos['data_fim'], $campos['observacao'], 
					$campos['icone'], $id_pagamento, $campos['id'], $id_usuari
				];
				
				$this->db->limpar()->adicionar($sql)->realizarQuery($params);

				$this->db->limpar()->adicionar("COMMIT")->realizarQuery();
				return true;
			} catch (Exception $e) {
				$this->db->limpar()->adicionar("ROLLBACK")->realizarQuery();
				return false;
			}
		}
		
		// Confirma ou cancela o recebimento gerando a movimentação financeira
		public function alterarStatusRecebimento($id_pagamento, $id_usuari) {
			$this->db->limpar()->adicionar("BEGIN")->realizarQuery();
			try {
				// Descobre o status atual e o valor
				$sql_busca = "SELECT valor, recebido FROM valores_a_receber WHERE id=$1";
				$reg = $this->db->limpar()->adicionar($sql_busca)->realizarQuery([$id_pagamento])->recuperar();

				if (empty($reg['recebido'])) {
					// 1. ESTÁ PENDENTE -> MARCAR COMO RECEBIDO
					// ATENÇÃO: Ajuste o 'id_timofi' (Tipo de Movimento) para o ID correspondente a 'Entrada' ou 'Plantão' no seu DB
					$id_timofi = 1; 
					$sql_mov = "INSERT INTO movimento_financeiro (id_usuari, id_timofi, valor, data_registro) 
								VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id";
					
					$mov = $this->db->limpar()->adicionar($sql_mov)->realizarQuery([$id_usuari, $id_timofi, $reg['valor']])->recuperar();
					$id_movimento = $mov['id'];

					// Atualiza a tabela valores_a_receber vinculando a movimentação
					$sql_up = "UPDATE valores_a_receber SET recebido=$1 WHERE id=$2";
					$this->db->limpar()->adicionar($sql_up)->realizarQuery([$id_movimento, $id_pagamento]);
				} else {
					// 2. JÁ RECEBIDO -> ESTORNAR (Anular)
					$id_movimento = $reg['recebido'];

					// Remove o vínculo (Volta a NULL)
					$sql_up = "UPDATE valores_a_receber SET recebido=NULL WHERE id=$1";
					$this->db->limpar()->adicionar($sql_up)->realizarQuery([$id_pagamento]);

					// Exclui a movimentação financeira para não corromper o saldo
					$sql_del = "DELETE FROM movimento_financeiro WHERE id=$1 AND id_usuari=$2";
					$this->db->limpar()->adicionar($sql_del)->realizarQuery([$id_movimento, $id_usuari]);
				}

				$this->db->limpar()->adicionar("COMMIT")->realizarQuery();
				return true;
			} catch (Exception $e) {
				$this->db->limpar()->adicionar("ROLLBACK")->realizarQuery();
				return false;
			}
		}
		
		// Insere um evento de rotina na agenda
		public function inserirEvento($campos, $id_usuari) {
			try {
				$sql = "INSERT INTO agenda (id_usuari, nome, cor, id_tipeve, data_inicio, data_fim, observacao, icone) 
						VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
				
				$params = array(
					$id_usuari, $campos['nome'], $campos['cor'], $campos['id_tipeve'], 
					$campos['data_inicio'], $campos['data_fim'], $campos['observacao'], $campos['icone']
				);
				
				$this->db->limpar()->adicionar($sql)->realizarQuery($params);
				return true;
			} catch (Exception $e) {
				return false;
			}
		}

		// Insere um Plantão com cálculo de repetições automáticas
		public function inserirPlantao($campos, $id_usuari) {
			$this->db->limpar()->adicionar("BEGIN")->realizarQuery();
			try {
				$repetir = isset($campos['repetir']) && $campos['repetir'] === 'sim';
				$indefinido = isset($campos['indefinido']) && $campos['indefinido'] === 'sim';
				
				// Define quantas vezes o loop vai rodar
				$quantidade = 1;
				if ($repetir) {
					$quantidade = $indefinido ? 52 : (int)$campos['quantidade'];
				}
				$periodo = $campos['periodo'] ?? 'semanal';

				$data_inicio_base = new DateTime($campos['data_inicio']);
				$data_fim_base = new DateTime($campos['data_fim']);
				$data_prev_base = !empty($campos['data_prevista']) ? new DateTime($campos['data_prevista']) : null;

				$id_grupo = null;

				for ($i = 0; $i < $quantidade; $i++) {
					$di = clone $data_inicio_base;
					$df = clone $data_fim_base;
					$dp = $data_prev_base ? clone $data_prev_base : null;

					// Calcula o salto de tempo para as repetições
					if ($i > 0) {
						$intervalo = '';
						if ($periodo === 'semanal') $intervalo = "+$i week";
						else if ($periodo === 'quinzenal') { $w = $i * 2; $intervalo = "+$w week"; }
						else if ($periodo === 'mensal') $intervalo = "+$i month";

						$di->modify($intervalo);
						$df->modify($intervalo);
						if ($dp) $dp->modify($intervalo);
					}

					// 1. Inserir valor a receber
					$id_valor_receber = null;
					if ($dp && (float)$campos['pagamento'] > 0) {
						$sql_fin = "INSERT INTO valores_a_receber (valor, data_prevista, recebido) VALUES ($1, $2, NULL) RETURNING id";
						$res_fin = $this->db->limpar()->adicionar($sql_fin)->realizarQuery([(float)$campos['pagamento'], $dp->format('Y-m-d H:i:s')])->recuperar();
						$id_valor_receber = $res_fin['id'];
					}

					// 2. Inserir plantão
					$sql = "INSERT INTO plantoes (id_usuari, nome, cor, hospital, pagamento, data_inicio, data_fim, observacao, icone, id_grupo) 
							VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id";
					$params = [
						$id_usuari, $campos['nome'], $campos['cor'], $campos['hospital'], $id_valor_receber, 
						$di->format('Y-m-d H:i:s'), $df->format('Y-m-d H:i:s'), $campos['observacao'], $campos['icone'], $id_grupo
					];
					
					$res_plan = $this->db->limpar()->adicionar($sql)->realizarQuery($params)->recuperar();

					// No primeiro loop, o ID gerado se torna o 'id_grupo' para os próximos
					if ($i === 0 && $repetir) {
						$id_grupo = $res_plan['id'];
						$this->db->limpar()->adicionar("UPDATE plantoes SET id_grupo=$1 WHERE id=$1")->realizarQuery([$id_grupo]);
					}
				}

				$this->db->limpar()->adicionar("COMMIT")->realizarQuery();
				return true;
			} catch (Exception $e) {
				$this->db->limpar()->adicionar("ROLLBACK")->realizarQuery();
				return false;
			}
		}
		
		// Exclui um Evento Normal
		public function excluirEvento($id, $id_usuari) {
			$sql = "DELETE FROM agenda WHERE id=$1 AND id_usuari=$2";
			return $this->db->limpar()->adicionar($sql)->realizarQuery([$id, $id_usuari]);
		}

		// Exclui um Plantão (com opção de excluir o grupo inteiro)
		public function excluirPlantao($id, $id_pagamento, $id_usuari, $excluir_todos = false) {
			$this->db->limpar()->adicionar("BEGIN")->realizarQuery();
			try {
				if ($excluir_todos) {
					// Pega o ID do grupo deste plantão
					$res = $this->db->limpar()->adicionar("SELECT id_grupo FROM plantoes WHERE id=$1")->realizarQuery([$id])->recuperar();
					$grupo = $res['id_grupo'] ?? $id;

					// Busca todos os pagamentos vinculados a este grupo para limpar o financeiro
					$pagamentos = $this->db->limpar()->adicionar("SELECT pagamento FROM plantoes WHERE (id_grupo=$1 OR id=$1) AND id_usuari=$2 AND pagamento IS NOT NULL")->realizarQuery([$grupo, $id_usuari])->listar();

					// Exclui todos os plantões do grupo
					$this->db->limpar()->adicionar("DELETE FROM plantoes WHERE (id_grupo=$1 OR id=$1) AND id_usuari=$2")->realizarQuery([$grupo, $id_usuari]);

					// Exclui todos os registros financeiros órfãos
					foreach($pagamentos as $p) {
						$this->db->limpar()->adicionar("DELETE FROM valores_a_receber WHERE id=$1")->realizarQuery([$p['pagamento']]);
					}
				} else {
					// Exclui apenas 1 plantão específico
					$this->db->limpar()->adicionar("DELETE FROM plantoes WHERE id=$1 AND id_usuari=$2")->realizarQuery([$id, $id_usuari]);
					if (!empty($id_pagamento)) {
						$this->db->limpar()->adicionar("DELETE FROM valores_a_receber WHERE id=$1")->realizarQuery([$id_pagamento]);
					}
				}
				
				$this->db->limpar()->adicionar("COMMIT")->realizarQuery();
				return true;
			} catch (Exception $e) {
				$this->db->limpar()->adicionar("ROLLBACK")->realizarQuery();
				return false;
			}
		}
	}
?>