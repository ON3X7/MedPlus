<?php
class ObjetoAlerta extends ObjetoHtml {
    
    /**
     * O construtor direciona automaticamente para a pasta etc/html/
     * herdando o método getHtml() da classe ObjetoHtml
     */
    public function __construct($caminho = '../etc/templates/', $nome = 'alerta.html') {
        parent::__construct($caminho, $nome);
    }

    /**
     * Processa a substituição das chaves no template de erro
     * 
     * @param string $tipo 'success', 'error' ou 'loading'
     * @param string $titulo Título principal em negrito
     * @param string $mensagem Texto descritivo do erro/aviso
     * @param string|null $linkBotao URL de redirecionamento (ex: 'javascript:history.back()')
     * @param string $textoBotao Texto do botão
     */
    public function configurarAlerta($tipo, $titulo, $mensagem, $linkBotao = null, $textoBotao = 'CLOSE') {
        $icone = '';
        $classeCor = '';

        // Definição visual baseada no tipo de chamada
        if ($tipo === 'success') {
            $icone = 'fas fa-check-circle';
            $classeCor = 'theme-success';
        } else if ($tipo === 'error') {
            $icone = 'fas fa-exclamation-triangle';
            $classeCor = 'theme-error';
        } else if ($tipo === 'loading') {
            $icone = 'fas fa-circle-notch w3-spin';
            $classeCor = 'theme-loading';
        }

        // Renderiza o botão apenas se o link for especificado
        $htmlBotao = '';
        if (!empty($linkBotao)) {
            $htmlBotao = "<a href='{$linkBotao}' class='btn-alerta'>{$textoBotao}</a>";
        }

        // Substituição das variáveis na string HTML herdada ($this->conteudo)
        $this->conteudo = str_replace('{CLASSE_COR}', $classeCor, $this->conteudo);
        $this->conteudo = str_replace('{ICONE}', $icone, $this->conteudo);
        $this->conteudo = str_replace('{TITULO}', $titulo, $this->conteudo);
        $this->conteudo = str_replace('{MENSAGEM}', $mensagem, $this->conteudo);
        $this->conteudo = str_replace('{BOTAO}', $htmlBotao, $this->conteudo);
    }
}
?>