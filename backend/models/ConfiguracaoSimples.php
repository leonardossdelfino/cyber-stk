<?php
// =============================================
// ARQUIVO: backend/models/ConfiguracaoSimples.php
// FUNÇÃO: Model genérico para tabelas de configuração
//
// Tabelas e seus campos principais:
//   categorias       → nome
//   formas_pagamento → nome
//   status_aprovacao → nome
//   status_oc        → nome + cor
//   perifericos      → descricao + marca + valor_medio + obs
//   incidentes       → descricao
// =============================================

class ConfiguracaoSimples {
    private $conn;
    private $tabela;

    // Mapeamento completo de cada tabela:
    // 'campo_principal' → campo obrigatório principal
    // 'extras'          → campos opcionais adicionais
    private static $config = [
        'categorias'       => ['campo_principal' => 'nome',      'extras' => []],
        'formas_pagamento' => ['campo_principal' => 'nome',      'extras' => []],
        'status_aprovacao' => ['campo_principal' => 'nome',      'extras' => []],
        'status_oc'        => ['campo_principal' => 'nome',      'extras' => ['cor']],
        'perifericos'      => ['campo_principal' => 'descricao', 'extras' => ['marca', 'valor_medio', 'obs']],
        'incidentes'       => ['campo_principal' => 'descricao', 'extras' => []],
    ];

    public function __construct($db, $tabela) {
        $this->conn   = $db;
        $this->tabela = $tabela;
    }

    // Retorna as tabelas permitidas
    public static function tabelaPermitida($tabela) {
        return array_key_exists($tabela, self::$config);
    }

    // Retorna o campo principal da tabela atual
    private function campoPrincipal() {
        return self::$config[$this->tabela]['campo_principal'];
    }

    // Retorna os campos extras da tabela atual
    private function camposExtras() {
        return self::$config[$this->tabela]['extras'];
    }

    // ── Listar todos ─────────────────────────────
    public function listar() {
        $campo = $this->campoPrincipal();
        $query = "SELECT * FROM {$this->tabela} ORDER BY {$campo} ASC";
        $stmt  = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── Buscar por ID ─────────────────────────────
    public function buscarPorId($id) {
        $query = "SELECT * FROM {$this->tabela} WHERE id = :id LIMIT 1";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ── Criar novo registro ───────────────────────
    public function criar($dados) {
        $campo  = $this->campoPrincipal();
        $extras = $this->camposExtras();

        // Monta listas de colunas e placeholders
        $colunas = [$campo];
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

        // bindValue não tem problema de referência como bindParam
        $stmt->bindValue(':campo_principal', $dados[$campo] ?? null);

        foreach ($extras as $col) {
            $stmt->bindValue(":{$col}", $dados[$col] ?? null);
        }

        return $stmt->execute();
    }

    // ── Atualizar registro ────────────────────────
    public function atualizar($id, $dados) {
        $campo  = $this->campoPrincipal();
        $extras = $this->camposExtras();

        // Monta o SET da query
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

        $stmt->bindValue(':id',               $id, PDO::PARAM_INT);
        $stmt->bindValue(':campo_principal',  $dados[$campo] ?? null);

        foreach ($extras as $col) {
            $stmt->bindValue(":{$col}", $dados[$col] ?? null);
        }

        return $stmt->execute();
    }

    // ── Deletar registro ──────────────────────────
    public function deletar($id) {
        $query = "DELETE FROM {$this->tabela} WHERE id = :id";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}