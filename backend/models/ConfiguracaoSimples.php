<?php
// =============================================
// ARQUIVO: backend/models/ConfiguracaoSimples.php
// FUNÇÃO: Model genérico para tabelas de configuração
//
// Tabelas e seus campos principais:
//   categorias       → nome
//   formas_pagamento → nome
//   status_aprovacao → nome + cor
//   status_oc        → nome + cor
//   perifericos      → descricao + marca + valor_medio + obs
//   incidentes       → descricao
// =============================================

class ConfiguracaoSimples {
    private $conn;
    private $tabela;

    private static $config = [
        'categorias'       => ['campo_principal' => 'nome',      'extras' => []],
        'formas_pagamento' => ['campo_principal' => 'nome',      'extras' => []],
        'status_aprovacao' => ['campo_principal' => 'nome',      'extras' => ['cor']], // ← cor adicionada
        'status_oc'        => ['campo_principal' => 'nome',      'extras' => ['cor']],
        'perifericos'      => ['campo_principal' => 'descricao', 'extras' => ['marca', 'valor_medio', 'obs']],
        'incidentes'       => ['campo_principal' => 'descricao', 'extras' => []],
    ];

    public function __construct($db, $tabela) {
        $this->conn   = $db;
        $this->tabela = $tabela;
    }

    public static function tabelaPermitida($tabela) {
        return array_key_exists($tabela, self::$config);
    }

    private function campoPrincipal() {
        return self::$config[$this->tabela]['campo_principal'];
    }

    private function camposExtras() {
        return self::$config[$this->tabela]['extras'];
    }

    public function listar() {
        $campo = $this->campoPrincipal();
        $query = "SELECT * FROM {$this->tabela} ORDER BY {$campo} ASC";
        $stmt  = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function buscarPorId($id) {
        $query = "SELECT * FROM {$this->tabela} WHERE id = :id LIMIT 1";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function criar($dados) {
        $campo  = $this->campoPrincipal();
        $extras = $this->camposExtras();

        $colunas      = [$campo];
        $placeholders = [':campo_principal'];

        foreach ($extras as $col) {
            $colunas[]      = $col;
            $placeholders[] = ":{$col}";
        }

        $query = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $this->tabela,
            implode(', ', $colunas),
            implode(', ', $placeholders)
        );

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':campo_principal', $dados[$campo] ?? null);

        foreach ($extras as $col) {
            $stmt->bindValue(":{$col}", $dados[$col] ?? null);
        }

        return $stmt->execute();
    }

    public function atualizar($id, $dados) {
        $campo  = $this->campoPrincipal();
        $extras = $this->camposExtras();

        $sets = ["{$campo} = :campo_principal"];
        foreach ($extras as $col) {
            $sets[] = "{$col} = :{$col}";
        }

        $query = sprintf(
            "UPDATE %s SET %s WHERE id = :id",
            $this->tabela,
            implode(', ', $sets)
        );

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id',              $id, PDO::PARAM_INT);
        $stmt->bindValue(':campo_principal', $dados[$campo] ?? null);

        foreach ($extras as $col) {
            $stmt->bindValue(":{$col}", $dados[$col] ?? null);
        }

        return $stmt->execute();
    }

    public function deletar($id) {
        $query = "DELETE FROM {$this->tabela} WHERE id = :id";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}