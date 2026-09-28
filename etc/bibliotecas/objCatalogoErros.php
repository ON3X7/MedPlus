<?php
class CatalogoErros {
    private static $erros = [
        101 => [
            'tipo' => 'error',
            'titulo' => 'Erro no PHP interferindo no front-end',
            'msg_usuario' => 'Parece que houve um erro no servidor. Contate o desenvolvedor.',
            'msg_log' => 'PHP está cuspindo erros e interferindo no json retornado para o JS.'
        ],
        201 => [
            'tipo' => 'loading',
            'titulo' => 'Manutenção Rápida',
            'msg_usuario' => 'Nossos servidores estão sobrecarregados. Tente novamente em alguns segundos.',
            'msg_log' => 'Falha de conexão com pg_connect() na classe ConexaoDB.'
        ]
    ];

    public static function get($codigo) {
        // Retorna o erro ou um fallback genérico caso o código não exista
        return self::$erros[$codigo] ?? [
            'tipo' => 'error',
            'titulo' => 'Erro ' . $codigo,
            'msg_usuario' => 'Ocorreu um comportamento inesperado.',
            'msg_log' => 'Tentativa de acionar código de erro não catalogado.'
        ];
    }
}
?>