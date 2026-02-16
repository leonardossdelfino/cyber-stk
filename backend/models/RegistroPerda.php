<?php
// =============================================================================
// Model: RegistroPerda.php
// Responsabilidade: CRUD da tabela registros_perdas
// =============================================================================

class RegistroPerda {

    private PDO $conn;
    private string $table = 'registros_perdas';

    public function __construct(PDO $conn) {
        $this->conn = $conn;
    }

    // -------------------------------------------------------------------------
    // READ — Lista todos ordenados por data do incidente (mais recente primeiro)
    // -------------------------------------------------------------------------
    public function listar(): array {
        $sql  = "SELECT * FROM {$this->table} ORDER BY data_incidente DESC, criado_em DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // -------------------------------------------------------------------------
    // READ — Busca um registro pelo ID
    // -------------------------------------------------------------------------
    public function buscarPorId(int $id): array|false {
        $sql  = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // -------------------------------------------------------------------------
    // CREATE — Insere novo registro
    // -------------------------------------------------------------------------
    public function criar(array $dados): int|false {
        $sql = "INSERT INTO {$this->table}
                    (tipo, nome_pessoa, area, periferico,
                     descricao, acao_tomada, data_incidente)
                VALUES
                    (:tipo, :nome_pessoa, :area, :periferico,
                     :descricao, :acao_tomada, :data_incidente)";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':tipo',           $dados['tipo'],                    PDO::PARAM_STR);
        $stmt->bindValue(':nome_pessoa',    $dados['nome_pessoa'],             PDO::PARAM_STR);
        $stmt->bindValue(':area',           $dados['area'],                    PDO::PARAM_STR);
        $stmt->bindValue(':periferico',     $dados['periferico']  ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':descricao',      $dados['descricao']   ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':acao_tomada',    $dados['acao_tomada'],             PDO::PARAM_STR);
        $stmt->bindValue(':data_incidente', $dados['data_incidente'],          PDO::PARAM_STR);

        if ($stmt->execute()) {
            return (int) $this->conn->lastInsertId();
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // UPDATE — Atualiza registro existente
    // -------------------------------------------------------------------------
    public function atualizar(int $id, array $dados): bool {
        $sql = "UPDATE {$this->table} SET
                    tipo           = :tipo,
                    nome_pessoa    = :nome_pessoa,
                    area           = :area,
                    periferico     = :periferico,
                    descricao      = :descricao,
                    acao_tomada    = :acao_tomada,
                    data_incidente = :data_incidente
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id',             $id,                               PDO::PARAM_INT);
        $stmt->bindValue(':tipo',           $dados['tipo'],                    PDO::PARAM_STR);
        $stmt->bindValue(':nome_pessoa',    $dados['nome_pessoa'],             PDO::PARAM_STR);
        $stmt->bindValue(':area',           $dados['area'],                    PDO::PARAM_STR);
        $stmt->bindValue(':periferico',     $dados['periferico']  ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':descricao',      $dados['descricao']   ?? null,     PDO::PARAM_STR);
        $stmt->bindValue(':acao_tomada',    $dados['acao_tomada'],             PDO::PARAM_STR);
        $stmt->bindValue(':data_incidente', $dados['data_incidente'],          PDO::PARAM_STR);

        return $stmt->execute();
    }

    // -------------------------------------------------------------------------
    // DELETE — Remove registro pelo ID
    // -------------------------------------------------------------------------
    public function deletar(int $id): bool {
        $sql  = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}