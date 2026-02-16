<?php
// =============================================
// ARQUIVO: backend/models/Fornecedor.php
// FUNÇÃO: Model para a tabela fornecedores
// Campos: razao_social, cnpj, contato,
//         email, descricao
// =============================================

class Fornecedor {
    private $conn;
    private $tabela = 'fornecedores';

    public function __construct($db) {
        $this->conn = $db;
    }

    // Listar todos os fornecedores
    // Ordenado por razao_social para facilitar autocomplete
    public function listar() {
        $query = "SELECT * FROM {$this->tabela} ORDER BY razao_social ASC";
        $stmt  = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Buscar por ID
    public function buscarPorId($id) {
        $query = "SELECT * FROM {$this->tabela} WHERE id = :id LIMIT 1";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Buscar por nome (para autocomplete no campo fornecedor da OC)
    public function buscarPorNome($termo) {
        $query = "SELECT id, razao_social, cnpj, contato, email
                  FROM {$this->tabela}
                  WHERE razao_social LIKE :termo
                  ORDER BY razao_social ASC
                  LIMIT 10";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':termo', "%{$termo}%");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Criar novo fornecedor
    public function criar($dados) {
        $query = "INSERT INTO {$this->tabela}
                    (razao_social, cnpj, contato, email, descricao)
                  VALUES
                    (:razao_social, :cnpj, :contato, :email, :descricao)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':razao_social', $dados['razao_social']);
        $stmt->bindValue(':cnpj',         $dados['cnpj']      ?? null);
        $stmt->bindValue(':contato',      $dados['contato']   ?? null);
        $stmt->bindValue(':email',        $dados['email']     ?? null);
        $stmt->bindValue(':descricao',    $dados['descricao'] ?? null);

        return $stmt->execute();
    }

    // Atualizar fornecedor
    public function atualizar($id, $dados) {
        $query = "UPDATE {$this->tabela} SET
                    razao_social = :razao_social,
                    cnpj         = :cnpj,
                    contato      = :contato,
                    email        = :email,
                    descricao    = :descricao
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':id',           $id,                        PDO::PARAM_INT);
        $stmt->bindValue(':razao_social', $dados['razao_social']);
        $stmt->bindValue(':cnpj',         $dados['cnpj']      ?? null);
        $stmt->bindValue(':contato',      $dados['contato']   ?? null);
        $stmt->bindValue(':email',        $dados['email']     ?? null);
        $stmt->bindValue(':descricao',    $dados['descricao'] ?? null);

        return $stmt->execute();
    }

    // Deletar fornecedor
    public function deletar($id) {
        $query = "DELETE FROM {$this->tabela} WHERE id = :id";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}