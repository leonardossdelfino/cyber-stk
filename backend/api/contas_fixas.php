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

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/ContaFixa.php';

$database = new Database();
$db       = $database->getConnection();

if (!$db) {
    http_response_code(503);
    echo json_encode(['erro' => 'Falha na conexão com o banco de dados.']);
    exit();
}

$model  = new ContaFixa($db);
$method = $_SERVER['REQUEST_METHOD'];

// ─────────────────────────────────────────
// GET — Lista todas ou busca por ID
// ─────────────────────────────────────────
if ($method === 'GET') {

    if (!empty($_GET['id'])) {
        $conta = $model->buscarPorId((int)$_GET['id']);
        if (!$conta) {
            http_response_code(404);
            echo json_encode(['erro' => 'Conta não encontrada.']);
            exit();
        }
        echo json_encode($conta);
        exit();
    }

    echo json_encode($model->listar());
    exit();
}

// ─────────────────────────────────────────
// POST — Cria nova conta fixa
// ─────────────────────────────────────────
if ($method === 'POST') {

    $dados = json_decode(file_get_contents('php://input'), true);

    // Validação dos campos obrigatórios
    $obrigatorios = ['nome', 'fornecedor', 'valor', 'dia_vencimento', 'forma_pagamento', 'categoria'];
    foreach ($obrigatorios as $campo) {
        if (empty($dados[$campo])) {
            http_response_code(400);
            echo json_encode(['erro' => "Campo obrigatório ausente: {$campo}"]);
            exit();
        }
    }

    // Validação do dia de vencimento (1-31)
    $diaVenc = (int)$dados['dia_vencimento'];
    if ($diaVenc < 1 || $diaVenc > 31) {
        http_response_code(400);
        echo json_encode(['erro' => 'Dia de vencimento deve ser entre 1 e 31.']);
        exit();
    }

    // Validação do dia de fechamento se informado
    if (!empty($dados['dia_fechamento'])) {
        $diaFech = (int)$dados['dia_fechamento'];
        if ($diaFech < 1 || $diaFech > 31) {
            http_response_code(400);
            echo json_encode(['erro' => 'Dia de fechamento deve ser entre 1 e 31.']);
            exit();
        }
    }

    $conta = $model->criar($dados);
    http_response_code(201);
    echo json_encode($conta);
    exit();
}

// ─────────────────────────────────────────
// PUT — Atualiza conta fixa
// ─────────────────────────────────────────
if ($method === 'PUT') {

    if (empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Parâmetro id é obrigatório.']);
        exit();
    }

    $dados = json_decode(file_get_contents('php://input'), true);

    $obrigatorios = ['nome', 'fornecedor', 'valor', 'dia_vencimento', 'forma_pagamento', 'categoria'];
    foreach ($obrigatorios as $campo) {
        if (empty($dados[$campo])) {
            http_response_code(400);
            echo json_encode(['erro' => "Campo obrigatório ausente: {$campo}"]);
            exit();
        }
    }

    $conta = $model->atualizar((int)$_GET['id'], $dados);
    echo json_encode($conta);
    exit();
}

// ─────────────────────────────────────────
// DELETE — Remove conta fixa
// ─────────────────────────────────────────
if ($method === 'DELETE') {

    if (empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Parâmetro id é obrigatório.']);
        exit();
    }

    $model->deletar((int)$_GET['id']);
    echo json_encode(['mensagem' => 'Conta removida com sucesso.']);
    exit();
}

// Método não permitido
http_response_code(405);
echo json_encode(['erro' => 'Método não permitido.']);