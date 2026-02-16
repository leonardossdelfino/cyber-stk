<?php
// =============================================================
// ARQUIVO: backend/models/OC.php
// FUNÇÃO: Model das Ordens de Compra
// Prepared statements em todas as queries (proteção SQL Injection)
//
// NOTA: strip_tags() foi removido dos campos que vêm de tabelas
// de configuração (status, aprovação, pagamento) pois pode
// remover conteúdo válido. Os prepared statements já protegem
// contra SQL Injection. trim() é suficiente para limpeza.
// =============================================================

class OC {

    private $table = "ordens_de_compra";
    private $conn;

    public $id;
    public $oc_numero;
    public $oc_descricao;
    public $oc_nome_fornecedor;
    public $oc_valor;
    public $oc_status;
    public $oc_forma_pagamento;
    public $oc_aprovacao;
    public $oc_data_referencia;
    public $oc_centro_de_custo;
    public $oc_solicitante;
    public $criado_em;
    public $atualizado_em;

    public function __construct($db) {
        $this->conn = $db;
    }

    // ---------------------------------------------------------
    // Retorna todas as OCs ordenadas por data de criação
    // ---------------------------------------------------------
    public function listar() {
        $query = "SELECT
                    id, oc_numero, oc_descricao, oc_nome_fornecedor,
                    oc_valor, oc_status, oc_forma_pagamento, oc_aprovacao,
                    oc_data_referencia, oc_centro_de_custo, oc_solicitante,
                    criado_em, atualizado_em
                  FROM {$this->table}
                  ORDER BY criado_em DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // ---------------------------------------------------------
    // Retorna uma OC específica pelo ID
    // ---------------------------------------------------------
    public function buscarPorId() {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt  = $this->conn->prepare($query);
        $this->id = intval($this->id);
        $stmt->bindValue(":id", $this->id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    // ---------------------------------------------------------
    // Insere uma nova OC no banco
    // ---------------------------------------------------------
    public function criar() {
        $query = "INSERT INTO {$this->table} (
                    oc_numero, oc_descricao, oc_nome_fornecedor,
                    oc_valor, oc_status, oc_forma_pagamento, oc_aprovacao,
                    oc_data_referencia, oc_centro_de_custo, oc_solicitante
                  ) VALUES (
                    :oc_numero, :oc_descricao, :oc_nome_fornecedor,
                    :oc_valor, :oc_status, :oc_forma_pagamento, :oc_aprovacao,
                    :oc_data_referencia, :oc_centro_de_custo, :oc_solicitante
                  )";

        $stmt = $this->conn->prepare($query);

        // trim() limpa espaços extras — prepared statements já protegem SQL Injection
        $stmt->bindValue(":oc_numero",          trim($this->oc_numero          ?? ""));
        $stmt->bindValue(":oc_descricao",       trim($this->oc_descricao       ?? ""));
        $stmt->bindValue(":oc_nome_fornecedor", trim($this->oc_nome_fornecedor ?? ""));
        $stmt->bindValue(":oc_valor",           floatval($this->oc_valor), PDO::PARAM_STR);
        $stmt->bindValue(":oc_status",          trim($this->oc_status          ?? ""));
        $stmt->bindValue(":oc_forma_pagamento", trim($this->oc_forma_pagamento ?? ""));
        $stmt->bindValue(":oc_aprovacao",       trim($this->oc_aprovacao       ?? ""));
        $stmt->bindValue(":oc_data_referencia", trim($this->oc_data_referencia ?? ""));
        $stmt->bindValue(":oc_centro_de_custo", trim($this->oc_centro_de_custo ?? ""));
        $stmt->bindValue(":oc_solicitante",     trim($this->oc_solicitante     ?? ""));

        return $stmt->execute();
    }

    // ---------------------------------------------------------
    // Atualiza os dados de uma OC existente pelo ID
    // rowCount() = 0 não é erro — pode ser sem alterações.
    // A verificação de existência é feita no endpoint (oc.php).
    // ---------------------------------------------------------
    public function atualizar() {
        $query = "UPDATE {$this->table} SET
                    oc_numero           = :oc_numero,
                    oc_descricao        = :oc_descricao,
                    oc_nome_fornecedor  = :oc_nome_fornecedor,
                    oc_valor            = :oc_valor,
                    oc_status           = :oc_status,
                    oc_forma_pagamento  = :oc_forma_pagamento,
                    oc_aprovacao        = :oc_aprovacao,
                    oc_data_referencia  = :oc_data_referencia,
                    oc_centro_de_custo  = :oc_centro_de_custo,
                    oc_solicitante      = :oc_solicitante
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(":oc_numero",          trim($this->oc_numero          ?? ""));
        $stmt->bindValue(":oc_descricao",       trim($this->oc_descricao       ?? ""));
        $stmt->bindValue(":oc_nome_fornecedor", trim($this->oc_nome_fornecedor ?? ""));
        $stmt->bindValue(":oc_valor",           floatval($this->oc_valor), PDO::PARAM_STR);
        $stmt->bindValue(":oc_status",          trim($this->oc_status          ?? ""));
        $stmt->bindValue(":oc_forma_pagamento", trim($this->oc_forma_pagamento ?? ""));
        $stmt->bindValue(":oc_aprovacao",       trim($this->oc_aprovacao       ?? ""));
        $stmt->bindValue(":oc_data_referencia", trim($this->oc_data_referencia ?? ""));
        $stmt->bindValue(":oc_centro_de_custo", trim($this->oc_centro_de_custo ?? ""));
        $stmt->bindValue(":oc_solicitante",     trim($this->oc_solicitante     ?? ""));
        $stmt->bindValue(":id",                 intval($this->id), PDO::PARAM_INT);

        return $stmt->execute();
    }

    // ---------------------------------------------------------
    // Remove uma OC do banco pelo ID
    // ---------------------------------------------------------
    public function deletar() {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(":id", intval($this->id), PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }
}