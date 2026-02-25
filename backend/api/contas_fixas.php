<?php
/**
 * API: Contas Fixas
 * Endpoints:
 *   GET    /contas_fixas.php         → lista todas
 *   GET    /contas_fixas.php?id=1    → busca por ID
 *   POST   /contas_fixas.php         → cria nova
 *   PUT    /contas_fixas.php?id=1    → atualiza
 *   DELETE /contas_fixas.php?id=1    → remove
 */

// CORS consistente com os demais endpoints da aplicação
$origem_permitida = getenv("CORS_ORIGIN") ?: "*";
header("Access-Control-Allow-Origin: $origem_permitida");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// try/catch captura exceção PDO lançada pelo Database
try {
    require_once '../config/database.php';
    require_once '../models/ContaFixa.php';
    $database = new Database();
    $db       = $database->getConnection();
    $model    = new ContaFixa($db);
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(['success' => false, 'message' => 'Serviço indisponível. Tente novamente.']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// ─────────────────────────────────────────
// GET — Lista todas ou busca por ID
// ─────────────────────────────────────────
if ($method === 'GET') {

    if (!empty($_GET['id'])) {
        $conta = $model->buscarPorId((int)$_GET['id']);
        if (!$conta) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Conta não encontrada.']);
            exit();
        }
        echo json_encode(['success' => true, 'data' => $conta]);
        exit();
    }

    $lista = $model->listar();
    echo json_encode(['success' => true, 'data' => $lista, 'total' => count($lista)]);
    exit();
}

// ─────────────────────────────────────────
// POST — Cria nova conta fixa
// ─────────────────────────────────────────
if ($method === 'POST') {

    $dados = json_decode(file_get_contents('php://input'), true);

    if (!is_array($dados)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dados inválidos ou body vazio.']);
        exit();
    }

    $obrigatorios = ['nome', 'fornecedor', 'valor', 'dia_vencimento', 'forma_pagamento', 'categoria'];
    foreach ($obrigatorios as $campo) {
        if (empty($dados[$campo])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Campo obrigatório ausente: {$campo}"]);
            exit();
        }
    }

    $diaVenc = (int)$dados['dia_vencimento'];
    if ($diaVenc < 1 || $diaVenc > 31) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dia de vencimento deve ser entre 1 e 31.']);
        exit();
    }

    if (!empty($dados['dia_fechamento'])) {
        $diaFech = (int)$dados['dia_fechamento'];
        if ($diaFech < 1 || $diaFech > 31) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dia de fechamento deve ser entre 1 e 31.']);
            exit();
        }
    }

    $conta = $model->criar($dados);
    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Conta criada com sucesso.', 'data' => $conta]);
    exit();
}

// ─────────────────────────────────────────
// PUT — Atualiza conta fixa
// ─────────────────────────────────────────
if ($method === 'PUT') {

    if (empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parâmetro id é obrigatório.']);
        exit();
    }

    // Verifica existência antes de atualizar
    $existe = $model->buscarPorId((int)$_GET['id']);
    if (!$existe) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Conta não encontrada.']);
        exit();
    }

    $dados = json_decode(file_get_contents('php://input'), true);

    if (!is_array($dados)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dados inválidos ou body vazio.']);
        exit();
    }

    $obrigatorios = ['nome', 'fornecedor', 'valor', 'dia_vencimento', 'forma_pagamento', 'categoria'];
    foreach ($obrigatorios as $campo) {
        if (empty($dados[$campo])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Campo obrigatório ausente: {$campo}"]);
            exit();
        }
    }

    $conta = $model->atualizar((int)$_GET['id'], $dados);
    echo json_encode(['success' => true, 'message' => 'Conta atualizada com sucesso.', 'data' => $conta]);
    exit();
}

// ─────────────────────────────────────────
// DELETE — Remove conta fixa
// ─────────────────────────────────────────
if ($method === 'DELETE') {

    if (empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parâmetro id é obrigatório.']);
        exit();
    }

    $existe = $model->buscarPorId((int)$_GET['id']);
    if (!$existe) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Conta não encontrada.']);
        exit();
    }

    $model->deletar((int)$_GET['id']);
    echo json_encode(['success' => true, 'message' => 'Conta removida com sucesso.']);
    exit();
}

// Método não permitido
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Método não permitido.']);