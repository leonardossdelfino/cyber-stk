<?php
// =============================================================
// ARQUIVO: /backend/api/oc.php
// FUNÇÃO: Endpoint da API para Ordens de Compra
// Métodos suportados:
//   GET    → Lista todas as OCs ou busca uma por ID
//   POST   → Cria uma nova OC
//   PUT    → Atualiza uma OC existente
//   DELETE → Remove uma OC
// =============================================================

// --- Headers obrigatórios para API REST ---
// Permite que o React (rodando em outro domínio/porta) acesse essa API
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Responde imediatamente requisições OPTIONS (preflight do navegador)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Importa a conexão e o model
require_once "../config/database.php";
require_once "../models/OC.php";

// Inicializa a conexão e o model
$database = new Database();
$db       = $database->getConnection();
$oc       = new OC($db);

// Identifica o método HTTP da requisição
$method = $_SERVER["REQUEST_METHOD"];

// Captura o ID da URL caso seja passado (ex: /api/oc.php?id=5)
$id = isset($_GET["id"]) ? intval($_GET["id"]) : null;

// =============================================================
// ROTEAMENTO: direciona para o método correto
// =============================================================
switch ($method) {

    // ---------------------------------------------------------
    // GET → Lista todas as OCs ou busca uma por ID
    // ---------------------------------------------------------
    case "GET":
        if ($id) {
            // Busca uma OC específica pelo ID
            $oc->id   = $id;
            $stmt     = $oc->buscarPorId();
            $row      = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                echo json_encode(["success" => true, "data" => $row]);
            } else {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "OC não encontrada."]);
            }
        } else {
            // Lista todas as OCs
            $stmt = $oc->listarTodas();
            $ocs  = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $ocs, "total" => count($ocs)]);
        }
        break;

    // ---------------------------------------------------------
    // POST → Cria uma nova OC
    // ---------------------------------------------------------
    case "POST":
        // Lê o JSON enviado pelo React no corpo da requisição
        $data = json_decode(file_get_contents("php://input"), true);

        // Valida se os campos obrigatórios foram enviados
        if (
            empty($data["oc_numero"])          ||
            empty($data["oc_descricao"])        ||
            empty($data["oc_nome_fornecedor"])  ||
            empty($data["oc_valor"])            ||
            empty($data["oc_data_referencia"])  ||
            empty($data["oc_centro_de_custo"])  ||
            empty($data["oc_solicitante"])
        ) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Campos obrigatórios não preenchidos."]);
            break;
        }

        // Preenche o model com os dados recebidos
        $oc->oc_numero          = $data["oc_numero"];
        $oc->oc_descricao       = $data["oc_descricao"];
        $oc->oc_nome_fornecedor = $data["oc_nome_fornecedor"];
        $oc->oc_valor           = $data["oc_valor"];
        $oc->oc_status          = $data["oc_status"]          ?? "OC Aberta";
        $oc->oc_forma_pagamento = $data["oc_forma_pagamento"]  ?? "Boleto";
        $oc->oc_aprovacao       = $data["oc_aprovacao"]        ?? "Aguardando aprovação";
        $oc->oc_data_referencia = $data["oc_data_referencia"];
        $oc->oc_centro_de_custo = $data["oc_centro_de_custo"];
        $oc->oc_solicitante     = $data["oc_solicitante"];

        if ($oc->criar()) {
            http_response_code(201); // 201 = Created
            echo json_encode(["success" => true, "message" => "OC criada com sucesso."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Erro ao criar a OC."]);
        }
        break;

    // ---------------------------------------------------------
    // PUT → Atualiza uma OC existente
    // ---------------------------------------------------------
    case "PUT":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID não informado."]);
            break;
        }

        // Preenche o model com os dados para atualização
        $oc->id                 = $id;
        $oc->oc_numero          = $data["oc_numero"];
        $oc->oc_descricao       = $data["oc_descricao"];
        $oc->oc_nome_fornecedor = $data["oc_nome_fornecedor"];
        $oc->oc_valor           = $data["oc_valor"];
        $oc->oc_status          = $data["oc_status"];
        $oc->oc_forma_pagamento = $data["oc_forma_pagamento"];
        $oc->oc_aprovacao       = $data["oc_aprovacao"];
        $oc->oc_data_referencia = $data["oc_data_referencia"];
        $oc->oc_centro_de_custo = $data["oc_centro_de_custo"];
        $oc->oc_solicitante     = $data["oc_solicitante"];

        if ($oc->atualizar()) {
            echo json_encode(["success" => true, "message" => "OC atualizada com sucesso."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Erro ao atualizar a OC."]);
        }
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
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Erro ao deletar a OC."]);
        }
        break;

    // ---------------------------------------------------------
    // Método não suportado
    // ---------------------------------------------------------
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método não permitido."]);
        break;
}