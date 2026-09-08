# Med+
> **⚠️ Aviso de Licença e Direitos Autorais**
> Este repositório está visível publicamente apenas para fins de demonstração de portfólio e arquitetura. **Este projeto não é open-source.** O uso, reprodução, comercialização ou distribuição de qualquer parte deste código sem autorização prévia é estritamente proibido. Consulte o arquivo `LICENSE` para mais detalhes.

## Sobre o Projeto
O Med+ é o sistema operacional da vida médica. A plataforma foi desenhada para ajudar médicos a organizarem e cuidarem melhor da própria vida, centralizando carreira, patrimônio, hábitos e bem-estar em um único ambiente. 

Focado inicialmente em médicos plantonistas com múltiplos vínculos e alta carga horária, o sistema ataca a fragmentação da rotina e a falta de previsibilidade financeira, visando sempre a prevenção da sobrecarga. O grande diferencial do produto é não incentivar o profissional a trabalhar mais, mas sim oferecer clareza, equilíbrio e liberdade.

## Funcionalidades e Módulos (MVP)
A arquitetura do Med+ oferece uma experiência premium, simples e minimalista, focada em entregar controle e confiança:

* **Dashboard Central:** Painel unificado exibindo receita prevista e recebida, o próximo plantão, metas financeiras, hábitos do dia, Life Score e insights gerados por IA.
* **Agenda Inteligente:** Cadastro de plantões e consultas com visão semanal/mensal, valores associados, previsão de pagamento e status (previsto, recebido, atrasado).
* **Gestão Financeira:** Controle rigoroso de receitas, despesas e fluxo de caixa projetado, permitindo o acompanhamento de ganhos por hospital ou fonte pagadora.
* **Burnout Risk™:** Um indicador de bem-estar e prevenção (não clínico) que avalia tendências de carga de trabalho, sono, humor e descanso.
* **Inteligência Artificial (Copiloto):** IA contextual que cruza dados do usuário de forma inteligente; por exemplo, sugerindo um período de descanso ao identificar alta carga de plantões somada a um declínio na qualidade do sono.
* **Hábitos e Sonhos:** Acompanhamento de rotinas diárias (exercício, alimentação, hidratação) e estruturação de objetivos de vida atrelados a prazos e planejamentos financeiros.

## Stack Tecnológica (Hipótese de Arquitetura)
* **Web:** HTML / CSS / JavaScript
* **Biblioteca:** Font Awesome
* **Framework:** W3.css
* **Mobile:** PWA (Broweser)
* **Backend & Banco de Dados:** PHP + PostgreSQL
* **Inteligência Artificial:** Integração via API de modelos de linguagem

## Segurança e LGPD
Como o sistema lida com informações sensíveis, a privacidade é garantida desde a base da arquitetura. Os dados financeiros e de saúde possuem proteção reforçada, exigindo consentimento explícito, minimização de dados e rígido controle de acesso.

## Roadmap de Evolução
1. **Fases 1 e 2:** Validação do MVP com módulos de agenda, financeiro, hábitos, sonhos e monitoramento do Burnout Risk.
2. **Fase 3:** Evolução da Inteligência Artificial avançada como copiloto preditivo.
3. **Fase 4:** Integração com Open Finance para atualização automática de saldos e transações, reduzindo a necessidade de alimentação manual de dados.
4. **Fase 5:** Expansão do modelo B2B, atendendo clínicas, grupos médicos e integrações com o ecossistema de investimentos e marketplace.

---
Desenvolvido por Walleson Douglas de Souza Oliveira.
