<?php
// =============================================
// ARQUIVO: backend/api/configuracoes.php
// FUNÇÃO: API REST para tabelas de configuração
//
// Uso:
//   GET    /configuracoes.php?tabela=categorias
//   POST   /configuracoes.php?tabela=categorias
//   PUT    /configuracoes.php?tabela=categorias&id=1
//   DELETE /configuracoes.php?tabela=categorias&id=1
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
require_once '../models/ConfiguracaoSimples.php';

// ── Valida tabela ─────────────────────────────
$tabela = $_GET['tabela'] ?? '';

if (!ConfiguracaoSimples::tabelaPermitida($tabela)) {
    http_response_code(400);
    echo json_encode(['erro' => 'Tabela invalida ou nao permitida.']);
    exit();
}

// ── Conexão ───────────────────────────────────
$database = new Database();
$db       = $database->getConnection();
$model    = new ConfiguracaoSimples($db, $tabela);

// ── Método e parâmetros ───────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? null;

switch ($method) {

    case 'GET':
        if ($id) {
            $item = $model->buscarPorId($id);
            if ($item) {
                echo json_encode($item);
            } else {
                http_response_code(404);
                echo json_encode(['erro' => 'Registro nao encontrado.']);
            }
        } else {
            $lista = $model->listar();
            // Garante que sempre retorna array mesmo vazio
            echo json_encode($lista ?: []);
        }
        break;

    case 'POST':
        $dados = json_decode(file_get_contents("php://input"), true);

        if (!is_array($dados)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Dados invalidos.']);
            exit();
        }

        if ($model->criar($dados)) {
            http_response_code(201);
            echo json_encode(['mensagem' => 'Criado com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar registro.']);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID e obrigatorio para atualizacao.']);
            exit();
        }

        $dados = json_decode(file_get_contents("php://input"), true);

        if (!is_array($dados)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Dados invalidos.']);
            exit();
        }

        if ($model->atualizar($id, $dados)) {
            echo json_encode(['mensagem' => 'Atualizado com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar registro.']);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID e obrigatorio para exclusao.']);
            exit();
        }

        if ($model->deletar($id)) {
            echo json_encode(['mensagem' => 'Removido com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover registro.']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['erro' => 'Metodo nao permitido.']);
        break;
}