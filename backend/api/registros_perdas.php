<?php
// =============================================================================
// API: registros_perdas.php
// Endpoints: GET, POST, PUT, DELETE
// =============================================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/RegistroPerda.php';

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
    $model    = new RegistroPerda($conn);
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
            $registro = $model->buscarPorId($id);
            if ($registro) {
                echo json_encode($registro);
            } else {
                http_response_code(404);
                echo json_encode(['erro' => 'Registro não encontrado.']);
            }
        } else {
            echo json_encode($model->listar());
        }
        break;

    // -----------------------------------------------------------------------
    // POST — Cria novo registro
    // -----------------------------------------------------------------------
    case 'POST':
        $dados = json_decode(file_get_contents('php://input'), true);

        if (!is_array($dados)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Dados inválidos.']);
            exit;
        }

        if (empty($dados['tipo']) || empty($dados['nome_pessoa']) ||
            empty($dados['area']) || empty($dados['acao_tomada']) ||
            empty($dados['data_incidente'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Campos obrigatórios: tipo, nome_pessoa, area, acao_tomada, data_incidente.']);
            exit;
        }

        $novoId = $model->criar($dados);
        if ($novoId) {
            http_response_code(201);
            echo json_encode(['mensagem' => 'Registro criado com sucesso.', 'id' => $novoId]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar registro.']);
        }
        break;

    // -----------------------------------------------------------------------
    // PUT — Atualiza registro existente
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

        if (empty($dados['tipo']) || empty($dados['nome_pessoa']) ||
            empty($dados['area']) || empty($dados['acao_tomada']) ||
            empty($dados['data_incidente'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Campos obrigatórios: tipo, nome_pessoa, area, acao_tomada, data_incidente.']);
            exit;
        }

        if ($model->atualizar($id, $dados)) {
            echo json_encode(['mensagem' => 'Registro atualizado com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar registro.']);
        }
        break;

    // -----------------------------------------------------------------------
    // DELETE — Remove registro
    // -----------------------------------------------------------------------
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID obrigatório para exclusão.']);
            exit;
        }

        if ($model->deletar($id)) {
            echo json_encode(['mensagem' => 'Registro removido com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover registro.']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido.']);
        break;
}