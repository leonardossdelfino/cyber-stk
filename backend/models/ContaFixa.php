<?php
/**
 * Model: ContaFixa
 * Gerencia as Contas Fixas do sistema
 */
class ContaFixa {

    private $conn;
    private $table = 'contas_fixas';

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Lista todas as contas fixas ordenadas por status e nome
     */
    public function listar() {
        $query = "SELECT * FROM {$this->table} 
                  ORDER BY 
                    FIELD(status, 'Ativa', 'Inativa', 'Cancelada'),
                    nome ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Busca uma conta fixa pelo ID
     */
    public function buscarPorId($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Cria uma nova conta fixa
     */
    public function criar($dados) {
        $query = "INSERT INTO {$this->table} 
                    (nome, fornecedor, valor, dia_vencimento, dia_fechamento,
                     forma_pagamento, categoria, status, observacoes)
                  VALUES
                    (:nome, :fornecedor, :valor, :dia_vencimento, :dia_fechamento,
                     :forma_pagamento, :categoria, :status, :observacoes)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':nome',            $dados['nome']);
        $stmt->bindValue(':fornecedor',      $dados['fornecedor']);
        $stmt->bindValue(':valor',           $dados['valor']);
        $stmt->bindValue(':dia_vencimento',  (int)$dados['dia_vencimento'], PDO::PARAM_INT);
        $stmt->bindValue(':dia_fechamento',  !empty($dados['dia_fechamento']) ? (int)$dados['dia_fechamento'] : null, PDO::PARAM_INT);
        $stmt->bindValue(':forma_pagamento', $dados['forma_pagamento']);
        $stmt->bindValue(':categoria',       $dados['categoria']);
        $stmt->bindValue(':status',          $dados['status'] ?? 'Ativa');
        $stmt->bindValue(':observacoes',     $dados['observacoes'] ?? null);
        $stmt->execute();

        return $this->buscarPorId($this->conn->lastInsertId());
    }

    /**
     * Atualiza uma conta fixa existente
     */
    public function atualizar($id, $dados) {
        $query = "UPDATE {$this->table} SET
                    nome            = :nome,
                    fornecedor      = :fornecedor,
                    valor           = :valor,
                    dia_vencimento  = :dia_vencimento,
                    dia_fechamento  = :dia_fechamento,
                    forma_pagamento = :forma_pagamento,
                    categoria       = :categoria,
                    status          = :status,
                    observacoes     = :observacoes
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id',              (int)$id, PDO::PARAM_INT);
        $stmt->bindValue(':nome',            $dados['nome']);
        $stmt->bindValue(':fornecedor',      $dados['fornecedor']);
        $stmt->bindValue(':valor',           $dados['valor']);
        $stmt->bindValue(':dia_vencimento',  (int)$dados['dia_vencimento'], PDO::PARAM_INT);
        $stmt->bindValue(':dia_fechamento',  !empty($dados['dia_fechamento']) ? (int)$dados['dia_fechamento'] : null, PDO::PARAM_INT);
        $stmt->bindValue(':forma_pagamento', $dados['forma_pagamento']);
        $stmt->bindValue(':categoria',       $dados['categoria']);
        $stmt->bindValue(':status',          $dados['status']);
        $stmt->bindValue(':observacoes',     $dados['observacoes'] ?? null);
        $stmt->execute();

        return $this->buscarPorId($id);
    }

    /**
     * Remove uma conta fixa
     */
    public function deletar($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}