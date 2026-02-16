<?php
// =============================================================
// ARQUIVO: backend/api/oc.php
// FUNÇÃO: Endpoint da API para Ordens de Compra
// GET / POST / PUT / DELETE
// =============================================================

$origem_permitida = getenv("CORS_ORIGIN") ?: "*";
header("Access-Control-Allow-Origin: $origem_permitida");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

try {
    require_once "../config/database.php";
    require_once "../models/OC.php";
    $database = new Database();
    $db       = $database->getConnection();
    $oc       = new OC($db);
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(["success" => false, "message" => "Serviço indisponível. Tente novamente."]);
    exit();
}

$method = $_SERVER["REQUEST_METHOD"];
$id     = isset($_GET["id"]) ? intval($_GET["id"]) : null;

function lerBody(): ?array {
    $raw  = file_get_contents("php://input");
    $raw  = ltrim($raw, "\xEF\xBB\xBF");
    $body = json_decode($raw, true);
    return (is_array($body)) ? $body : null;
}

switch ($method) {

    // ---------------------------------------------------------
    // GET → Lista todas as OCs ou busca uma por ID
    // ---------------------------------------------------------
    case "GET":
        if ($id) {
            $oc->id = $id;
            $row    = $oc->buscarPorId()->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                echo json_encode(["success" => true, "data" => $row]);
            } else {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "OC não encontrada."]);
            }
        } else {
            $stmt  = $oc->listar();
            $lista = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $lista, "total" => count($lista)]);
        }
        break;

    // ---------------------------------------------------------
    // POST → Cria uma nova OC
    // ---------------------------------------------------------
    case "POST":
        $body = lerBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Dados inválidos ou body vazio."]);
            break;
        }

        $obrigatorios = ["oc_numero", "oc_descricao", "oc_nome_fornecedor",
                         "oc_valor",  "oc_forma_pagamento", "oc_data_referencia"];
        foreach ($obrigatorios as $campo) {
            if (!isset($body[$campo]) || $body[$campo] === "" || $body[$campo] === null) {
                http_response_code(422);
                echo json_encode(["success" => false, "message" => "Campo obrigatório ausente: $campo"]);
                exit();
            }
        }

        $oc->oc_numero          = $body["oc_numero"];
        $oc->oc_descricao       = $body["oc_descricao"];
        $oc->oc_nome_fornecedor = $body["oc_nome_fornecedor"];
        $oc->oc_valor           = floatval($body["oc_valor"]);
        $oc->oc_forma_pagamento = $body["oc_forma_pagamento"];
        $oc->oc_data_referencia = $body["oc_data_referencia"];
        $oc->oc_status          = $body["oc_status"]          ?? "OC Aberta";
        $oc->oc_aprovacao       = $body["oc_aprovacao"]       ?? "Aguardando aprovação";
        $oc->oc_centro_de_custo = $body["oc_centro_de_custo"] ?? "";
        $oc->oc_solicitante     = $body["oc_solicitante"]     ?? "";

        if ($oc->criar()) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "OC criada com sucesso."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Erro ao criar a OC."]);
        }
        break;

    // ---------------------------------------------------------
    // PUT → Atualiza uma OC existente
    // Verifica existência ANTES de atualizar para distinguir
    // "não encontrado" de "sem alterações" (ambos rowCount = 0)
    // ---------------------------------------------------------
    case "PUT":
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID não informado."]);
            break;
        }

        // Verifica se a OC existe antes de tentar atualizar
        $oc->id = $id;
        $existe = $oc->buscarPorId()->fetch(PDO::FETCH_ASSOC);

        if (!$existe) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "OC não encontrada."]);
            break;
        }

        $body = lerBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Dados inválidos ou body vazio."]);
            break;
        }

        $oc->oc_numero          = $body["oc_numero"]          ?? "";
        $oc->oc_descricao       = $body["oc_descricao"]       ?? "";
        $oc->oc_nome_fornecedor = $body["oc_nome_fornecedor"] ?? "";
        $oc->oc_valor           = floatval($body["oc_valor"]  ?? 0);
        $oc->oc_forma_pagamento = $body["oc_forma_pagamento"] ?? "";
        $oc->oc_data_referencia = $body["oc_data_referencia"] ?? "";
        $oc->oc_status          = $body["oc_status"]          ?? "";
        $oc->oc_aprovacao       = $body["oc_aprovacao"]       ?? "";
        $oc->oc_centro_de_custo = $body["oc_centro_de_custo"] ?? "";
        $oc->oc_solicitante     = $body["oc_solicitante"]     ?? "";

        // rowCount = 0 significa sem alterações — ainda é sucesso
        $oc->atualizar();
        echo json_encode(["success" => true, "message" => "OC atualizada com sucesso."]);
        break;

    // ---------------------------------------------------------
    // DELETE → Remove uma OC
    // ---------------------------------------------------------
    case "DELETE":
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID não informado."]);
            break;
        }

        $oc->id = $id;

        if ($oc->deletar()) {
            echo json_encode(["success" => true, "message" => "OC deletada com sucesso."]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "OC não encontrada."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método não permitido."]);
        break;
}