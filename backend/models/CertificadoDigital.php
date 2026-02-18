<?php
// =============================================================================
// Model: CertificadoDigital.php
// Responsabilidade: CRUD da tabela certificados_digitais
// =============================================================================

class CertificadoDigital {

    private PDO $conn;
    private string $table = 'certificados_digitais';

    public function __construct(PDO $conn) {
        $this->conn = $conn;
    }

    // -------------------------------------------------------------------------
    // READ — Lista todos ordenados por vencimento (mais próximo primeiro)
    // -------------------------------------------------------------------------
    public function listar(): array {
        $sql  = "SELECT * FROM {$this->table} ORDER BY data_vencimento ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // -------------------------------------------------------------------------
    // READ — Busca um certificado pelo ID
    // -------------------------------------------------------------------------
    public function buscarPorId(int $id): array|false {
        $sql  = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // -------------------------------------------------------------------------
    // CREATE — Insere novo certificado
    // -------------------------------------------------------------------------
    public function criar(array $dados): int|false {
        $sql = "INSERT INTO {$this->table}
                    (nome, tipo, responsavel, area, descricao,
                     data_emissao, data_vencimento, valor_pago, status)
                VALUES
                    (:nome, :tipo, :responsavel, :area, :descricao,
                     :data_emissao, :data_vencimento, :valor_pago, :status)";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':nome',            $dados['nome'],                        PDO::PARAM_STR);
        $stmt->bindValue(':tipo',            $dados['tipo'],                        PDO::PARAM_STR);
        $stmt->bindValue(':responsavel',     $dados['responsavel']     ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':area',            $dados['area']            ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':descricao',       $dados['descricao']       ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':data_emissao',    $dados['data_emissao']    ?: null,     PDO::PARAM_STR);
        $stmt->bindValue(':data_vencimento', $dados['data_vencimento'],             PDO::PARAM_STR);
        $stmt->bindValue(':valor_pago',      $dados['valor_pago']      ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':status',          $dados['status']          ?? 'Ativo',  PDO::PARAM_STR);

        if ($stmt->execute()) {
            return (int) $this->conn->lastInsertId();
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // UPDATE — Atualiza certificado existente
    // -------------------------------------------------------------------------
    public function atualizar(int $id, array $dados): bool {
        $sql = "UPDATE {$this->table} SET
                    nome            = :nome,
                    tipo            = :tipo,
                    responsavel     = :responsavel,
                    area            = :area,
                    descricao       = :descricao,
                    data_emissao    = :data_emissao,
                    data_vencimento = :data_vencimento,
                    valor_pago      = :valor_pago,
                    status          = :status
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id',              $id,                                   PDO::PARAM_INT);
        $stmt->bindValue(':nome',            $dados['nome'],                        PDO::PARAM_STR);
        $stmt->bindValue(':tipo',            $dados['tipo'],                        PDO::PARAM_STR);
        $stmt->bindValue(':responsavel',     $dados['responsavel']     ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':area',            $dados['area']            ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':descricao',       $dados['descricao']       ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':data_emissao',    $dados['data_emissao']    ?: null,     PDO::PARAM_STR);
        $stmt->bindValue(':data_vencimento', $dados['data_vencimento'],             PDO::PARAM_STR);
        $stmt->bindValue(':valor_pago',      $dados['valor_pago']      ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':status',          $dados['status']          ?? 'Ativo',  PDO::PARAM_STR);

        return $stmt->execute();
    }

    // -------------------------------------------------------------------------
    // DELETE — Remove certificado pelo ID
    // -------------------------------------------------------------------------
    public function deletar(int $id): bool {
        $sql  = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}