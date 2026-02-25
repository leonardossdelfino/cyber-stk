<?php
/**
 * API: Nota Fiscal / Documentos de OC
 * Endpoints:
 *   GET    ?oc_id=1        → lista documentos da OC
 *   POST   (multipart)     → upload de novo documento
 *   DELETE ?id=1           → remove documento
 */

// CORS consistente com os demais endpoints da aplicação
$origem_permitida = getenv("CORS_ORIGIN") ?: "*";
header("Access-Control-Allow-Origin: $origem_permitida");
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Dependências — try/catch captura exceção PDO lançada pelo Database
try {
    require_once '../config/database.php';
    require_once '../models/NotaFiscal.php';
    $database   = new Database();
    $db         = $database->getConnection();
    $notaFiscal = new NotaFiscal($db);
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(['success' => false, 'message' => 'Serviço indisponível. Tente novamente.']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// ─────────────────────────────────────────
// GET — Lista documentos de uma OC
// ─────────────────────────────────────────
if ($method === 'GET') {

    if (empty($_GET['oc_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parâmetro oc_id é obrigatório.']);
        exit();
    }

    $documentos = $notaFiscal->listarPorOC((int)$_GET['oc_id']);

    $baseUrl = $notaFiscal->getBaseUrl();
    foreach ($documentos as &$doc) {
        $doc['url'] = $baseUrl . $doc['nome_arquivo'];
    }

    echo json_encode(['success' => true, 'data' => $documentos]);
    exit();
}

// ─────────────────────────────────────────
// POST — Upload de novo documento
// ─────────────────────────────────────────
if ($method === 'POST') {

    if (empty($_POST['oc_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parâmetro oc_id é obrigatório.']);
        exit();
    }

    if (empty($_FILES['arquivo'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nenhum arquivo enviado.']);
        exit();
    }

    if ($_FILES['arquivo']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Erro no upload do arquivo. Código: ' . $_FILES['arquivo']['error']]);
        exit();
    }

    $resultado = $notaFiscal->upload((int)$_POST['oc_id'], $_FILES['arquivo']);

    if (!$resultado['sucesso']) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => $resultado['erro']]);
        exit();
    }

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Documento anexado com sucesso.', 'data' => $resultado]);
    exit();
}

// ─────────────────────────────────────────
// DELETE — Remove um documento
// ─────────────────────────────────────────
if ($method === 'DELETE') {

    parse_str(file_get_contents('php://input'), $params);
    $id = $params['id'] ?? $_GET['id'] ?? null;

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parâmetro id é obrigatório.']);
        exit();
    }

    $resultado = $notaFiscal->deletar((int)$id);

    if (!$resultado['sucesso']) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => $resultado['erro']]);
        exit();
    }

    echo json_encode(['success' => true, 'message' => 'Documento removido com sucesso.']);
    exit();
}

// Método não permitido
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Método não permitido.']);