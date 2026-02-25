<?php
// =============================================================================
// API: registros_perdas.php
// Endpoints: GET, POST, PUT, DELETE
// =============================================================================

// CORS consistente com os demais endpoints da aplicação
$origem_permitida = getenv("CORS_ORIGIN") ?: "*";
header("Access-Control-Allow-Origin: $origem_permitida");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/RegistroPerda.php';
    $database = new Database();
    $conn     = $database->getConnection();
    $model    = new RegistroPerda($conn);
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(['success' => false, 'message' => 'Serviço indisponível. Tente novamente.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

switch ($method) {

    case 'GET':
        if ($id) {
            $registro = $model->buscarPorId($id);
            if (!$registro) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Registro não encontrado.']);
                exit;
            }
            echo json_encode(['success' => true, 'data' => $registro]);
        } else {
            $lista = $model->listar();
            echo json_encode(['success' => true, 'data' => $lista, 'total' => count($lista)]);
        }
        break;

    case 'POST':
        $dados = json_decode(file_get_contents('php://input'), true);

        if (!is_array($dados)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dados inválidos ou body vazio.']);
            exit;
        }

        if (empty($dados['tipo']) || empty($dados['nome_pessoa']) ||
            empty($dados['area']) || empty($dados['acao_tomada']) ||
            empty($dados['data_incidente'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios: tipo, nome_pessoa, area, acao_tomada, data_incidente.']);
            exit;
        }

        $novoId = $model->criar($dados);
        if ($novoId) {
            http_response_code(201);
            echo json_encode(['success' => true, 'message' => 'Registro criado com sucesso.', 'id' => $novoId]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao criar registro.']);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID obrigatório para atualização.']);
            exit;
        }

        $existe = $model->buscarPorId($id);
        if (!$existe) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Registro não encontrado.']);
            exit;
        }

        $dados = json_decode(file_get_contents('php://input'), true);

        if (!is_array($dados)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dados inválidos ou body vazio.']);
            exit;
        }

        if (empty($dados['tipo']) || empty($dados['nome_pessoa']) ||
            empty($dados['area']) || empty($dados['acao_tomada']) ||
            empty($dados['data_incidente'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios: tipo, nome_pessoa, area, acao_tomada, data_incidente.']);
            exit;
        }

        if ($model->atualizar($id, $dados)) {
            echo json_encode(['success' => true, 'message' => 'Registro atualizado com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar registro.']);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID obrigatório para exclusão.']);
            exit;
        }

        $existe = $model->buscarPorId($id);
        if (!$existe) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Registro não encontrado.']);
            exit;
        }

        if ($model->deletar($id)) {
            echo json_encode(['success' => true, 'message' => 'Registro removido com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao remover registro.']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
        break;
}