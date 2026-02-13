<?php
// =============================================================
// ARQUIVO: /backend/models/OC.php
// FUNÇÃO: Model das Ordens de Compra
// Prepared statements em todas as queries (proteção SQL Injection)
//
// NOTA: htmlspecialchars() NÃO é usado antes de salvar no banco
// pois causaria double encoding ("Dell & Co" → "Dell &amp; Co" no banco)
// Os prepared statements já protegem contra SQL Injection.
// Sanitização HTML deve ser feita apenas na camada de exibição.
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
    // Retorna todas as OCs, colunas explícitas (sem SELECT *)
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
        $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);
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

        $stmt->bindValue(":oc_numero",           strip_tags($this->oc_numero));
        $stmt->bindValue(":oc_descricao",        strip_tags($this->oc_descricao));
        $stmt->bindValue(":oc_nome_fornecedor",  strip_tags($this->oc_nome_fornecedor));
        $stmt->bindValue(":oc_valor",            floatval($this->oc_valor),  PDO::PARAM_STR);
        $stmt->bindValue(":oc_status",           strip_tags($this->oc_status));
        $stmt->bindValue(":oc_forma_pagamento",  strip_tags($this->oc_forma_pagamento));
        $stmt->bindValue(":oc_aprovacao",        strip_tags($this->oc_aprovacao));
        $stmt->bindValue(":oc_data_referencia",  strip_tags($this->oc_data_referencia));
        $stmt->bindValue(":oc_centro_de_custo",  strip_tags($this->oc_centro_de_custo));
        $stmt->bindValue(":oc_solicitante",      strip_tags($this->oc_solicitante));

        return $stmt->execute();
    }

    // ---------------------------------------------------------
    // Atualiza os dados de uma OC existente pelo ID
    // Retorna false se a OC não existir (rowCount = 0)
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

        $stmt->bindValue(":oc_numero",           strip_tags($this->oc_numero));
        $stmt->bindValue(":oc_descricao",        strip_tags($this->oc_descricao));
        $stmt->bindValue(":oc_nome_fornecedor",  strip_tags($this->oc_nome_fornecedor));
        $stmt->bindValue(":oc_valor",            floatval($this->oc_valor), PDO::PARAM_STR);
        $stmt->bindValue(":oc_status",           strip_tags($this->oc_status));
        $stmt->bindValue(":oc_forma_pagamento",  strip_tags($this->oc_forma_pagamento));
        $stmt->bindValue(":oc_aprovacao",        strip_tags($this->oc_aprovacao));
        $stmt->bindValue(":oc_data_referencia",  strip_tags($this->oc_data_referencia));
        $stmt->bindValue(":oc_centro_de_custo",  strip_tags($this->oc_centro_de_custo));
        $stmt->bindValue(":oc_solicitante",      strip_tags($this->oc_solicitante));
        $stmt->bindValue(":id",                  intval($this->id), PDO::PARAM_INT);

        $stmt->execute();
        // Retorna true se pelo menos 1 linha foi afetada
        return $stmt->rowCount() > 0;
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
