<?php
// =============================================================
// ARQUIVO: /backend/models/OC.php
// FUNÇÃO: Model das Ordens de Compra
// Contém todos os métodos de acesso e manipulação dos dados
// Utiliza prepared statements em todas as queries (proteção contra SQL Injection)
// =============================================================

class OC {

    // Nome da tabela no banco
    private $table = "ordens_de_compra";

    // Conexão com o banco (recebida via construtor)
    private $conn;

    // --- Propriedades que espelham as colunas da tabela ---
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

    // ---------------------------------------------------------
    // CONSTRUTOR: recebe a conexão do banco como dependência
    // Isso se chama "injeção de dependência" — boa prática
    // ---------------------------------------------------------
    public function __construct($db) {
        $this->conn = $db;
    }

    // ---------------------------------------------------------
    // MÉTODO: listarTodas()
    // Retorna todas as OCs ordenadas da mais recente para a mais antiga
    // ---------------------------------------------------------
    public function listarTodas() {
        $query = "SELECT * FROM {$this->table} ORDER BY criado_em DESC";
        $stmt  = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // ---------------------------------------------------------
    // MÉTODO: buscarPorId()
    // Retorna uma OC específica pelo ID
    // ---------------------------------------------------------
    public function buscarPorId() {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt  = $this->conn->prepare($query);

        // Sanitiza o ID antes de usar na query
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        return $stmt;
    }

    // ---------------------------------------------------------
    // MÉTODO: criar()
    // Insere uma nova OC no banco
    // Retorna true em caso de sucesso, false em caso de falha
    // ---------------------------------------------------------
    public function criar() {
        $query = "INSERT INTO {$this->table} (
                    oc_numero,
                    oc_descricao,
                    oc_nome_fornecedor,
                    oc_valor,
                    oc_status,
                    oc_forma_pagamento,
                    oc_aprovacao,
                    oc_data_referencia,
                    oc_centro_de_custo,
                    oc_solicitante
                  ) VALUES (
                    :oc_numero,
                    :oc_descricao,
                    :oc_nome_fornecedor,
                    :oc_valor,
                    :oc_status,
                    :oc_forma_pagamento,
                    :oc_aprovacao,
                    :oc_data_referencia,
                    :oc_centro_de_custo,
                    :oc_solicitante
                  )";

        $stmt = $this->conn->prepare($query);

        // Sanitiza todos os campos antes de inserir
        $this->sanitizar();

        // Vincula cada valor ao seu placeholder na query
        $stmt->bindParam(":oc_numero",           $this->oc_numero);
        $stmt->bindParam(":oc_descricao",         $this->oc_descricao);
        $stmt->bindParam(":oc_nome_fornecedor",   $this->oc_nome_fornecedor);
        $stmt->bindParam(":oc_valor",             $this->oc_valor);
        $stmt->bindParam(":oc_status",            $this->oc_status);
        $stmt->bindParam(":oc_forma_pagamento",   $this->oc_forma_pagamento);
        $stmt->bindParam(":oc_aprovacao",         $this->oc_aprovacao);
        $stmt->bindParam(":oc_data_referencia",   $this->oc_data_referencia);
        $stmt->bindParam(":oc_centro_de_custo",   $this->oc_centro_de_custo);
        $stmt->bindParam(":oc_solicitante",       $this->oc_solicitante);

        return $stmt->execute();
    }

    // ---------------------------------------------------------
    // MÉTODO: atualizar()
    // Atualiza os dados de uma OC existente pelo ID
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

        // Sanitiza todos os campos
        $this->sanitizar();
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Vincula os valores
        $stmt->bindParam(":oc_numero",           $this->oc_numero);
        $stmt->bindParam(":oc_descricao",         $this->oc_descricao);
        $stmt->bindParam(":oc_nome_fornecedor",   $this->oc_nome_fornecedor);
        $stmt->bindParam(":oc_valor",             $this->oc_valor);
        $stmt->bindParam(":oc_status",            $this->oc_status);
        $stmt->bindParam(":oc_forma_pagamento",   $this->oc_forma_pagamento);
        $stmt->bindParam(":oc_aprovacao",         $this->oc_aprovacao);
        $stmt->bindParam(":oc_data_referencia",   $this->oc_data_referencia);
        $stmt->bindParam(":oc_centro_de_custo",   $this->oc_centro_de_custo);
        $stmt->bindParam(":oc_solicitante",       $this->oc_solicitante);
        $stmt->bindParam(":id",                   $this->id);

        return $stmt->execute();
    }

    // ---------------------------------------------------------
    // MÉTODO: deletar()
    // Remove uma OC do banco pelo ID
    // ---------------------------------------------------------
    public function deletar() {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt  = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // ---------------------------------------------------------
    // MÉTODO PRIVADO: sanitizar()
    // Limpa todos os campos de texto antes de usar no banco
    // htmlspecialchars converte caracteres especiais em entidades HTML
    // strip_tags remove qualquer tag HTML/PHP que alguém tente injetar
    // ---------------------------------------------------------
    private function sanitizar() {
        $this->oc_numero          = htmlspecialchars(strip_tags($this->oc_numero));
        $this->oc_descricao       = htmlspecialchars(strip_tags($this->oc_descricao));
        $this->oc_nome_fornecedor = htmlspecialchars(strip_tags($this->oc_nome_fornecedor));
        $this->oc_valor           = htmlspecialchars(strip_tags($this->oc_valor));
        $this->oc_status          = htmlspecialchars(strip_tags($this->oc_status));
        $this->oc_forma_pagamento = htmlspecialchars(strip_tags($this->oc_forma_pagamento));
        $this->oc_aprovacao       = htmlspecialchars(strip_tags($this->oc_aprovacao));
        $this->oc_data_referencia = htmlspecialchars(strip_tags($this->oc_data_referencia));
        $this->oc_centro_de_custo = htmlspecialchars(strip_tags($this->oc_centro_de_custo));
        $this->oc_solicitante     = htmlspecialchars(strip_tags($this->oc_solicitante));
    }
}