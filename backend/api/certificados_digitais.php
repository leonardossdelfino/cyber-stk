<?php
// =============================================================================
// API: certificados_digitais.php
// Endpoints: GET, POST, PUT, DELETE
// =============================================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/CertificadoDigital.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// -------------------------------------------------------------------------
// Conexão e instância do model
// -------------------------------------------------------------------------
try {
    $database = new Database();
    $conn     = $database->getConnection();
    $model    = new CertificadoDigital($conn);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Falha na conexão com o banco de dados.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

// -------------------------------------------------------------------------
// Roteamento
// -------------------------------------------------------------------------
switch ($method) {

    // -----------------------------------------------------------------------
    // GET — Lista todos ou busca um por ID
    // -----------------------------------------------------------------------
    case 'GET':
        if ($id) {
            $cert = $model->buscarPorId($id);
            if ($cert) {
                echo json_encode($cert);
            } else {
                http_response_code(404);
                echo json_encode(['erro' => 'Certificado não encontrado.']);
            }
        } else {
            echo json_encode($model->listar());
        }
        break;

    // -----------------------------------------------------------------------
    // POST — Cria novo certificado
    // -----------------------------------------------------------------------
    case 'POST':
        $dados = json_decode(file_get_contents('php://input'), true);

        if (!is_array($dados)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Dados inválidos.']);
            exit;
        }

        if (empty($dados['nome']) || empty($dados['tipo']) || empty($dados['data_vencimento'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Campos obrigatórios: nome, tipo, data_vencimento.']);
            exit;
        }

        $novoId = $model->criar($dados);
        if ($novoId) {
            http_response_code(201);
            echo json_encode(['mensagem' => 'Certificado criado com sucesso.', 'id' => $novoId]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar certificado.']);
        }
        break;

    // -----------------------------------------------------------------------
    // PUT — Atualiza certificado existente
    // -----------------------------------------------------------------------
    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID obrigatório para atualização.']);
            exit;
        }

        $dados = json_decode(file_get_contents('php://input'), true);

        if (!is_array($dados)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Dados inválidos.']);
            exit;
        }

        if (empty($dados['nome']) || empty($dados['tipo']) || empty($dados['data_vencimento'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Campos obrigatórios: nome, tipo, data_vencimento.']);
            exit;
        }

        if ($model->atualizar($id, $dados)) {
            echo json_encode(['mensagem' => 'Certificado atualizado com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar certificado.']);
        }
        break;

    // -----------------------------------------------------------------------
    // DELETE — Remove certificado
    // -----------------------------------------------------------------------
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID obrigatório para exclusão.']);
            exit;
        }

        if ($model->deletar($id)) {
            echo json_encode(['mensagem' => 'Certificado removido com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover certificado.']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido.']);
        break;
}