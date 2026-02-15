<?php
/**
 * Model: NotaFiscal
 * Gerencia os documentos anexados às Ordens de Compra
 */
class NotaFiscal {

    private $conn;
    private $table = 'oc_documentos';

    // Diretório físico onde os PDFs são armazenados
    // __DIR__ = pasta models, então sobe um nível para backend/
    const UPLOAD_DIR = __DIR__ . '/../uploads/notas_fiscais/';

    // URL pública para acessar os arquivos no navegador
    const UPLOAD_URL = '/cyber-finance/backend/uploads/notas_fiscais/';

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Lista todos os documentos de uma OC
     */
    public function listarPorOC($oc_id) {
        $query = "SELECT id, nome_arquivo, criado_em 
                  FROM {$this->table} 
                  WHERE oc_id = :oc_id 
                  ORDER BY criado_em DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':oc_id', (int)$oc_id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Faz o upload do arquivo e registra no banco
     * Retorna array com sucesso/erro e dados do arquivo
     */
    public function upload($oc_id, $arquivo) {

        // Validação: somente PDF
        $tipo = mime_content_type($arquivo['tmp_name']);
        if ($tipo !== 'application/pdf') {
            return ['sucesso' => false, 'erro' => 'Apenas arquivos PDF são permitidos.'];
        }

        // Validação: máximo 5MB
        $maxSize = 5 * 1024 * 1024;
        if ($arquivo['size'] > $maxSize) {
            return ['sucesso' => false, 'erro' => 'O arquivo deve ter no máximo 5MB.'];
        }

        // Gera nome seguro: NF_{oc_id}_{timestamp}.pdf
        $nomeArquivo = 'NF_' . $oc_id . '_' . time() . '.pdf';
        $destino = self::UPLOAD_DIR . $nomeArquivo;

        // Move o arquivo para o destino
        if (!move_uploaded_file($arquivo['tmp_name'], $destino)) {
            return ['sucesso' => false, 'erro' => 'Falha ao salvar o arquivo no servidor.'];
        }

        // Registra no banco
        $query = "INSERT INTO {$this->table} (oc_id, nome_arquivo) 
                  VALUES (:oc_id, :nome_arquivo)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':oc_id', (int)$oc_id, PDO::PARAM_INT);
        $stmt->bindValue(':nome_arquivo', $nomeArquivo);
        $stmt->execute();

        return [
            'sucesso'      => true,
            'id'           => $this->conn->lastInsertId(),
            'nome_arquivo' => $nomeArquivo,
            'url'          => self::UPLOAD_URL . $nomeArquivo
        ];
    }

    /**
     * Remove um documento do banco e do servidor
     */
    public function deletar($id) {

        // Busca o nome do arquivo antes de deletar
        $query = "SELECT nome_arquivo FROM {$this->table} WHERE id = :id";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        $stmt->execute();
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$doc) {
            return ['sucesso' => false, 'erro' => 'Documento não encontrado.'];
        }

        // Remove o arquivo físico do servidor
        $caminhoFisico = self::UPLOAD_DIR . $doc['nome_arquivo'];
        if (file_exists($caminhoFisico)) {
            unlink($caminhoFisico);
        }

        // Remove o registro do banco
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        $stmt->execute();

        return ['sucesso' => true];
    }

    /**
     * Retorna a contagem de documentos por OC
     * Usado para exibir o badge na listagem
     */
    public function contarPorOC($oc_id) {
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE oc_id = :oc_id";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':oc_id', (int)$oc_id, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$result['total'];
    }
}