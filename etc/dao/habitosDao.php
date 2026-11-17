<?php
	// Copyright (c) 2026 Walleson Oliveira. Todos os direitos reservados.
	class habitosDAO {
		private $db;
		
		function __construct() {
			$this->db = new Query();
		}
		
		// 1. Vai buscar todos os hábitos
		function listarHabitosAtivos($id_usuari) {
			try {
				$hoje = date('Y-m-d');
				$sql = "SELECT h.id, h.nome, h.icone, h.cor, h.streak, h.melhor_streak,
							   (SELECT COUNT(*) FROM historico_habitos hh WHERE hh.id_habusu = h.id AND hh.data_registro = '$hoje') as concluido_hoje,
							   (SELECT COUNT(*) FROM historico_habitos hh WHERE hh.id_habusu = h.id) as total_concluido
						FROM habitos_usuario h
						WHERE h.id_usuari = $1 ORDER BY h.id ASC";
						
				$habitos = $this->db->limpar()->adicionar($sql)->realizarQuery([$id_usuari])->listar();
				
				if (!empty($habitos)) {
					foreach ($habitos as &$habito) {
						$habito['concluido_hoje'] = ((int)$habito['concluido_hoje'] > 0);
					}
				}
				return $habitos;
			} catch (Exception $e) {
				return [];
			}
		}

		// 2. Insere VÁRIOS hábitos (Iniciais)
		function inserirRotinaInicial($id_usuari, $listaHabitos) {
			try {
				$this->db->limpar()->adicionar("BEGIN")->realizarQuery();
				foreach ($listaHabitos as $habito) {
					$params = [ $id_usuari, $habito['nome'], $habito['icone'], $habito['cor'] ];
					$this->db->limpar()
							 ->adicionar("INSERT INTO habitos_usuario (id_usuari, nome, icone, cor, streak, melhor_streak) VALUES ($1, $2, $3, $4, 0, 0);")
							 ->realizarQuery($params);
				}
				$this->db->limpar()->adicionar("COMMIT")->realizarQuery();
				return true;
			} catch (Exception $e) {
				$this->db->limpar()->adicionar("ROLLBACK")->realizarQuery();
				return false;
			}
		}

		// 3. Insere Hábito Único (Criação)
		function inserirHabitoUnico($campos, $id_usuari) {
			try {
				$params = [ $id_usuari, $campos['nome'], $campos['icone'], $campos['cor'] ];
				$this->db->limpar()
						 ->adicionar("INSERT INTO habitos_usuario (id_usuari, nome, icone, cor, streak, melhor_streak) VALUES ($1, $2, $3, $4, 0, 0);")
						 ->realizarQuery($params);
				return true;
			} catch (Exception $e) {
				return false;
			}
		}
		
		// 4. Edita Hábito Único
		function atualizarHabito($campos, $id_usuari) {
			try {
				$params = [ $campos['nome'], $campos['icone'], $campos['cor'], $campos['id_habito'], $id_usuari ];
				$this->db->limpar()
						 ->adicionar("UPDATE habitos_usuario SET nome = $1, icone = $2, cor = $3 WHERE id = $4 AND id_usuari = $5;")
						 ->realizarQuery($params);
				return true;
			} catch (Exception $e) {
				return false;
			}
		}

		// 5. Apaga Hábito Completo
		function apagarHabitoCompleto($id_habito, $id_usuari) {
			try {
				$this->db->limpar()->adicionar("BEGIN")->realizarQuery();
				$this->db->limpar()->adicionar("DELETE FROM historico_habitos WHERE id_habusu = $1;")->realizarQuery([$id_habito]);
				$this->db->limpar()->adicionar("DELETE FROM habitos_usuario WHERE id = $1 AND id_usuari = $2;")->realizarQuery([$id_habito, $id_usuari]);
				$this->db->limpar()->adicionar("COMMIT")->realizarQuery();
				return true;
			} catch (Exception $e) {
				$this->db->limpar()->adicionar("ROLLBACK")->realizarQuery();
				return false;
			}
		}

		// 6. LÓGICA DE STREAK (Adiciona ou Remove conclusão e atualiza as colunas streak e melhor_streak)
		function alternarHistorico($id_habito, $id_usuari, $data) {
			try {
				$this->db->limpar()->adicionar("BEGIN")->realizarQuery();

				// A. Verifica se o dia de hoje (ou da $data enviada) já estava concluído
				$existe = $this->db->limpar()
								   ->adicionar("SELECT id FROM historico_habitos WHERE id_habusu = $1 AND data_registro = $2;")
								   ->realizarQuery([$id_habito, $data])->recuperar();

				// B. Verifica se o dia de ONTEM foi concluído usando a capacidade nativa do Postgres (interval '1 day')
				$ontemExiste = $this->db->limpar()
										->adicionar("SELECT id FROM historico_habitos WHERE id_habusu = $1 AND data_registro = ($2::date - interval '1 day')::date;")
										->realizarQuery([$id_habito, $data])->recuperar();
				$fezOntem = !empty($ontemExiste);

				$acao = '';
				
				if (!empty($existe)) {
					// --- O UTILIZADOR ESTÁ A REMOVER A CONCLUSÃO ---
					$this->db->limpar()->adicionar("DELETE FROM historico_habitos WHERE id_habusu = $1 AND data_registro = $2")->realizarQuery([$id_habito, $data]);
					
					// Se ele fez ontem, o streak volta ao que era (streak - 1). Se não fez ontem, o streak que ele começou hoje zera (0).
					$sqlStreak = $fezOntem ? "GREATEST(streak - 1, 0)" : "0";
					
					$this->db->limpar()
							 ->adicionar("UPDATE habitos_usuario SET streak = $sqlStreak WHERE id = $1 AND id_usuari = $2 RETURNING streak, melhor_streak")
							 ->realizarQuery([$id_habito, $id_usuari]);
					$dadosHabito = $this->db->recuperar();
					
					$acao = 'removido';
				} else {
					// --- O UTILIZADOR ESTÁ A ADICIONAR UMA CONCLUSÃO ---
					$this->db->limpar()->adicionar("INSERT INTO historico_habitos (id_habusu, data_registro) VALUES ($1, $2)")->realizarQuery([$id_habito, $data]);
					
					// Se ele fez ontem, o streak cresce (+1). Se não fez ontem, ele começa hoje um novo streak (1).
					$sqlStreak = $fezOntem ? "streak + 1" : "1";
					
					$this->db->limpar()
							 ->adicionar("UPDATE habitos_usuario SET streak = $sqlStreak WHERE id = $1 AND id_usuari = $2 RETURNING streak")
							 ->realizarQuery([$id_habito, $id_usuari]);
					$dadosHabito = $this->db->recuperar();
					$novoStreak = $dadosHabito['streak'];
					
					// O melhor_streak recebe o valor do streak atual caso seja maior usando a função matemática GREATEST do Postgres
					$this->db->limpar()
							 ->adicionar("UPDATE habitos_usuario SET melhor_streak = GREATEST(melhor_streak, $1) WHERE id = $2 AND id_usuari = $3 RETURNING melhor_streak")
							 ->realizarQuery([$novoStreak, $id_habito, $id_usuari]);
					$dadosMelhor = $this->db->recuperar();
					
					$dadosHabito['melhor_streak'] = $dadosMelhor['melhor_streak'];
					$acao = 'adicionado';
				}

				$this->db->limpar()->adicionar("COMMIT")->realizarQuery();
				return [
					'status' => true, 
					'acao' => $acao,
					'streak' => $dadosHabito['streak'],
					'melhor_streak' => $dadosHabito['melhor_streak']
				];
			} catch (Exception $e) {
				$this->db->limpar()->adicionar("ROLLBACK")->realizarQuery();
				return ['status' => false, 'mensagem' => $e->getMessage()];
			}
		}

		// 7. Calendário: Obtém histórico
		function obterHistorico($id_habito, $ano, $mes) {
			try {
				$sql = "SELECT data_registro FROM historico_habitos 
						WHERE id_habusu = $1 AND EXTRACT(YEAR FROM data_registro) = $2 AND EXTRACT(MONTH FROM data_registro) = $3";
				return $this->db->limpar()->adicionar($sql)->realizarQuery([$id_habito, $ano, $mes])->listar();
			} catch (Exception $e) {
				return [];
			}
		}
	}
?>
