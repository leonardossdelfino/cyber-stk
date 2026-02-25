<?php
/**
 * Model: NotaFiscal
 * Gerencia os documentos anexados às Ordens de Compra
 */
class NotaFiscal {

    private $conn;
    private $table = 'oc_documentos';

    // Diretório físico onde os PDFs são armazenados
    const UPLOAD_DIR = __DIR__ . '/../uploads/notas_fiscais/';

    // URL gerada dinamicamente — funciona em qualquer ambiente sem alterar código
    // XAMPP local:  http://localhost/cyber-stk/backend/uploads/notas_fiscais/
    // Hostinger:    https://seudominio.com.br/backend/uploads/notas_fiscais/
    private static function getUploadUrl(): string {
        $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host      = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $docRoot   = rtrim(str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
        $pastaDir  = str_replace('\\', '/', __DIR__);
        $relativo  = str_replace($docRoot, '', $pastaDir);
        // Sobe de /models para /backend e adiciona o caminho de uploads
        $base      = preg_replace('#/models$#', '', $relativo);
        return $protocolo . '://' . $host . $base . '/uploads/notas_fiscais/';
    }

    public function __construct($db) {
        $this->conn = $db;
    }

    // Método público para a API acessar a URL base dos uploads
    public function getBaseUrl(): string {
        return self::getUploadUrl();
    }

    /**
     * Lista todos os documentos de uma OC
     * Retorna nome_original para exibição e nome_arquivo para URL
     */
    public function listarPorOC($oc_id) {
        $query = "SELECT id, nome_arquivo, nome_original, criado_em 
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
     * Salva nome gerado (seguro) no servidor e nome original para exibição
     */
    public function upload($oc_id, $arquivo) {

        // Validação: somente PDF via MIME real (não extensão)
        $tipo = mime_content_type($arquivo['tmp_name']);
        if ($tipo !== 'application/pdf') {
            return ['sucesso' => false, 'erro' => 'Apenas arquivos PDF são permitidos.'];
        }

        // Validação: máximo 5MB
        if ($arquivo['size'] > 5 * 1024 * 1024) {
            return ['sucesso' => false, 'erro' => 'O arquivo deve ter no máximo 5MB.'];
        }

        // Nome original limpo para exibição (remove caminho, mantém extensão)
        $nomeOriginal = basename($arquivo['name']);

        // Nome seguro no servidor: NF_{oc_id}_{timestamp}.pdf
        // Evita colisão e caracteres problemáticos no sistema de arquivos
        $nomeArquivo = 'NF_' . $oc_id . '_' . time() . '.pdf';
        $destino     = self::UPLOAD_DIR . $nomeArquivo;

        if (!move_uploaded_file($arquivo['tmp_name'], $destino)) {
            return ['sucesso' => false, 'erro' => 'Falha ao salvar o arquivo no servidor.'];
        }

        // Registra no banco com os dois nomes
        $query = "INSERT INTO {$this->table} (oc_id, nome_arquivo, nome_original) 
                  VALUES (:oc_id, :nome_arquivo, :nome_original)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':oc_id',        (int)$oc_id, PDO::PARAM_INT);
        $stmt->bindValue(':nome_arquivo', $nomeArquivo);
        $stmt->bindValue(':nome_original', $nomeOriginal);
        $stmt->execute();

        return [
            'sucesso'       => true,
            'id'            => $this->conn->lastInsertId(),
            'nome_arquivo'  => $nomeArquivo,
            'nome_original' => $nomeOriginal,
            'url'           => self::getUploadUrl() . $nomeArquivo,
        ];
    }

    /**
     * Remove um documento do banco e do servidor
     */
    public function deletar($id) {

        $query = "SELECT nome_arquivo FROM {$this->table} WHERE id = :id";
        $stmt  = $this->conn->prepare($query);
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        $stmt->execute();
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$doc) {
            return ['sucesso' => false, 'erro' => 'Documento não encontrado.'];
        }

        // Remove arquivo físico se existir
        $caminhoFisico = self::UPLOAD_DIR . $doc['nome_arquivo'];
        if (file_exists($caminhoFisico)) {
            unlink($caminhoFisico);
        }

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