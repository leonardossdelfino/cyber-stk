<?php
// =============================================================================
// Model: ServicoContratado.php
// Responsabilidade: CRUD da tabela servicos_contratados
// =============================================================================

class ServicoContratado {

    private PDO $conn;
    private string $table = 'servicos_contratados';

    public function __construct(PDO $conn) {
        $this->conn = $conn;
    }

    // -------------------------------------------------------------------------
    // READ — Lista todos os serviços ordenados por data de término
    // -------------------------------------------------------------------------
    public function listar(): array {
        $sql = "SELECT * FROM {$this->table} ORDER BY data_termino ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // -------------------------------------------------------------------------
    // READ — Busca um serviço pelo ID
    // -------------------------------------------------------------------------
    public function buscarPorId(int $id): array|false {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // -------------------------------------------------------------------------
    // CREATE — Insere um novo serviço
    // -------------------------------------------------------------------------
    public function criar(array $dados): int|false {
        $sql = "INSERT INTO {$this->table}
                    (nome, fornecedor, categoria, forma_pagamento, descricao,
                     valor_total, data_inicio, data_termino, status, arquivo_contrato)
                VALUES
                    (:nome, :fornecedor, :categoria, :forma_pagamento, :descricao,
                     :valor_total, :data_inicio, :data_termino, :status, :arquivo_contrato)";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindValue(':nome',              $dados['nome'],              PDO::PARAM_STR);
        $stmt->bindValue(':fornecedor',        $dados['fornecedor'],        PDO::PARAM_STR);
        $stmt->bindValue(':categoria',         $dados['categoria'],         PDO::PARAM_STR);
        $stmt->bindValue(':forma_pagamento',   $dados['forma_pagamento'],   PDO::PARAM_STR);
        $stmt->bindValue(':descricao',         $dados['descricao'] ?? null, PDO::PARAM_STR);
        $stmt->bindValue(':valor_total',       $dados['valor_total'],       PDO::PARAM_STR);
        $stmt->bindValue(':data_inicio',       $dados['data_inicio'],       PDO::PARAM_STR);
        $stmt->bindValue(':data_termino',      $dados['data_termino'],      PDO::PARAM_STR);
        $stmt->bindValue(':status',            $dados['status'],            PDO::PARAM_STR);
        $stmt->bindValue(':arquivo_contrato',  $dados['arquivo_contrato'] ?? null, PDO::PARAM_STR);

        if ($stmt->execute()) {
            return (int) $this->conn->lastInsertId();
        }

        return false;
    }

    // -------------------------------------------------------------------------
    // UPDATE — Atualiza um serviço existente
    // -------------------------------------------------------------------------
    public function atualizar(int $id, array $dados): bool {
        $sql = "UPDATE {$this->table} SET
                    nome            = :nome,
                    fornecedor      = :fornecedor,
                    categoria       = :categoria,
                    forma_pagamento = :forma_pagamento,
                    descricao       = :descricao,
                    valor_total     = :valor_total,
                    data_inicio     = :data_inicio,
                    data_termino    = :data_termino,
                    status          = :status,
                    arquivo_contrato = :arquivo_contrato
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindValue(':id',               $id,                         PDO::PARAM_INT);
        $stmt->bindValue(':nome',             $dados['nome'],              PDO::PARAM_STR);
        $stmt->bindValue(':fornecedor',       $dados['fornecedor'],        PDO::PARAM_STR);
        $stmt->bindValue(':categoria',        $dados['categoria'],         PDO::PARAM_STR);
        $stmt->bindValue(':forma_pagamento',  $dados['forma_pagamento'],   PDO::PARAM_STR);
        $stmt->bindValue(':descricao',        $dados['descricao'] ?? null, PDO::PARAM_STR);
        $stmt->bindValue(':valor_total',      $dados['valor_total'],       PDO::PARAM_STR);
        $stmt->bindValue(':data_inicio',      $dados['data_inicio'],       PDO::PARAM_STR);
        $stmt->bindValue(':data_termino',     $dados['data_termino'],      PDO::PARAM_STR);
        $stmt->bindValue(':status',           $dados['status'],            PDO::PARAM_STR);
        $stmt->bindValue(':arquivo_contrato', $dados['arquivo_contrato'] ?? null, PDO::PARAM_STR);

        return $stmt->execute();
    }

    // -------------------------------------------------------------------------
    // DELETE — Remove um serviço pelo ID
    // -------------------------------------------------------------------------
    public function deletar(int $id): bool {
        $sql = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}