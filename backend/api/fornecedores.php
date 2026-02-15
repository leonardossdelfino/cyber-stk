<?php
// =============================================
// ARQUIVO: backend/api/fornecedores.php
// FUNÇÃO: API REST para fornecedores
//
// Uso:
//   GET    /fornecedores.php              → lista todos
//   GET    /fornecedores.php?id=1         → busca por ID
//   GET    /fornecedores.php?busca=termo  → autocomplete
//   POST   /fornecedores.php              → cria novo
//   PUT    /fornecedores.php?id=1         → atualiza
//   DELETE /fornecedores.php?id=1         → remove
// =============================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/Fornecedor.php';

$database  = new Database();
$db        = $database->getConnection();
$fornecedor = new Fornecedor($db);

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'];
};
$id     = $_GET['id']    ?? null;
$busca  = $_GET['busca'] ?? null;

switch ($method) {

    case 'GET':
        // Autocomplete — ?busca=termo
        if ($busca !== null) {
            echo json_encode($fornecedor->buscarPorNome($busca));
            break;
        }
        // Buscar por ID
        if ($id) {
            $item = $fornecedor->buscarPorId($id);
            if ($item) {
                echo json_encode($item);
            } else {
                http_response_code(404);
                echo json_encode(['erro' => 'Fornecedor não encontrado.']);
            }
            break;
        }
        // Listar todos
        echo json_encode($fornecedor->listar());
        break;

    case 'POST':
        $dados = json_decode(file_get_contents("php://input"), true);

        if (empty($dados['razao_social'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Razão social é obrigatória.']);
            exit();
        }

        if ($fornecedor->criar($dados)) {
            http_response_code(201);
            echo json_encode(['mensagem' => 'Fornecedor criado com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar fornecedor.']);
        }
        break;

    case 'PUT':
    if (!$id) {
        http_response_code(400);
        echo json_encode(['erro' => 'ID é obrigatório para atualização.']);
        exit();
    }

    $dados = json_decode(file_get_contents("php://input"), true);

    if (empty($dados['razao_social'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Razão social é obrigatória.']);
        exit();
    }

    if ($fornecedor->atualizar($id, $dados)) {
        echo json_encode(['mensagem' => 'Fornecedor atualizado com sucesso.']);
    } else {
        http_response_code(500);
        echo json_encode(['erro' => 'Erro ao atualizar fornecedor.']);
    }
    break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID é obrigatório para exclusão.']);
            exit();
        }

        if ($fornecedor->deletar($id)) {
            echo json_encode(['mensagem' => 'Fornecedor removido com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover fornecedor.']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido.']);
        break;
}