<?php
// =============================================================================
// API: servicos_contratados.php
// Endpoints: GET, POST, PUT, DELETE + upload de contrato
// =============================================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ServicoContratado.php';

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
    $model    = new ServicoContratado($conn);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Falha na conexão com o banco de dados.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

// Suporte a _method para contornar limitação do PHP com multipart PUT
if ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $method = 'PUT';
}

// -------------------------------------------------------------------------
// Roteamento
// -------------------------------------------------------------------------
switch ($method) {

    // -----------------------------------------------------------------------
    // GET — Lista todos ou busca um por ID
    // -----------------------------------------------------------------------
    case 'GET':
        if ($id) {
            $servico = $model->buscarPorId($id);
            if ($servico) {
                echo json_encode($servico);
            } else {
                http_response_code(404);
                echo json_encode(['erro' => 'Serviço não encontrado.']);
            }
        } else {
            echo json_encode($model->listar());
        }
        break;

    // -----------------------------------------------------------------------
    // POST — Cria novo serviço (com ou sem arquivo)
    // -----------------------------------------------------------------------
    case 'POST':
        $dados = [
            'nome'             => $_POST['nome']            ?? '',
            'fornecedor'       => $_POST['fornecedor']      ?? '',
            'categoria'        => $_POST['categoria']       ?? '',
            'forma_pagamento'  => $_POST['forma_pagamento'] ?? '',
            'descricao'        => $_POST['descricao']       ?? null,
            'valor_total'      => $_POST['valor_total']     ?? 0,
            'data_inicio'      => $_POST['data_inicio']     ?? '',
            'data_termino'     => $_POST['data_termino']    ?? '',
            'status'           => $_POST['status']          ?? 'Ativa',
            'arquivo_contrato' => null,
        ];

        if (empty($dados['nome']) || empty($dados['fornecedor']) ||
            empty($dados['data_inicio']) || empty($dados['data_termino'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Campos obrigatórios: nome, fornecedor, data_inicio, data_termino.']);
            exit;
        }

        if (!empty($_FILES['arquivo_contrato']['name'])) {
            $resultado = uploadContrato($_FILES['arquivo_contrato']);
            if ($resultado['sucesso']) {
                $dados['arquivo_contrato'] = $resultado['nome_arquivo'];
            } else {
                http_response_code(400);
                echo json_encode(['erro' => $resultado['mensagem']]);
                exit;
            }
        }

        $novoId = $model->criar($dados);
        if ($novoId) {
            http_response_code(201);
            echo json_encode(['mensagem' => 'Serviço criado com sucesso.', 'id' => $novoId]);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar serviço.']);
        }
        break;

    // -----------------------------------------------------------------------
    // PUT — Atualiza serviço existente (via POST + _method=PUT)
    // -----------------------------------------------------------------------
    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID obrigatório para atualização.']);
            exit;
        }

        $dados = [
            'nome'             => $_POST['nome']            ?? '',
            'fornecedor'       => $_POST['fornecedor']      ?? '',
            'categoria'        => $_POST['categoria']       ?? '',
            'forma_pagamento'  => $_POST['forma_pagamento'] ?? '',
            'descricao'        => $_POST['descricao']       ?? null,
            'valor_total'      => $_POST['valor_total']     ?? 0,
            'data_inicio'      => $_POST['data_inicio']     ?? '',
            'data_termino'     => $_POST['data_termino']    ?? '',
            'status'           => $_POST['status']          ?? 'Ativa',
            'arquivo_contrato' => null,
        ];

        // Processa upload de novo contrato se enviado
        if (!empty($_FILES['arquivo_contrato']['name'])) {
            // Remove arquivo antigo
            $servicoAtual = $model->buscarPorId($id);
            if ($servicoAtual && $servicoAtual['arquivo_contrato']) {
                $caminhoAntigo = __DIR__ . '/../uploads/contratos/' . $servicoAtual['arquivo_contrato'];
                if (file_exists($caminhoAntigo)) {
                    unlink($caminhoAntigo);
                }
            }

            $resultado = uploadContrato($_FILES['arquivo_contrato']);
            if ($resultado['sucesso']) {
                $dados['arquivo_contrato'] = $resultado['nome_arquivo'];
            } else {
                http_response_code(400);
                echo json_encode(['erro' => $resultado['mensagem']]);
                exit;
            }
        } else {
            // Mantém arquivo atual
            $servicoAtual = $model->buscarPorId($id);
            $dados['arquivo_contrato'] = $servicoAtual['arquivo_contrato'] ?? null;
        }

        if ($model->atualizar($id, $dados)) {
            echo json_encode(['mensagem' => 'Serviço atualizado com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar serviço.']);
        }
        break;

    // -----------------------------------------------------------------------
    // DELETE — Remove serviço e seu arquivo
    // -----------------------------------------------------------------------
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['erro' => 'ID obrigatório para exclusão.']);
            exit;
        }

        $servico = $model->buscarPorId($id);
        if ($servico && $servico['arquivo_contrato']) {
            $caminho = __DIR__ . '/../uploads/contratos/' . $servico['arquivo_contrato'];
            if (file_exists($caminho)) {
                unlink($caminho);
            }
        }

        if ($model->deletar($id)) {
            echo json_encode(['mensagem' => 'Serviço removido com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover serviço.']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['erro' => 'Método não permitido.']);
        break;
}

// =============================================================================
// Função auxiliar — Upload do arquivo de contrato
// =============================================================================
function uploadContrato(array $arquivo): array {
    $pastaDestino        = __DIR__ . '/../uploads/contratos/';
    $extensoesPermitidas = ['pdf', 'doc', 'docx'];
    $tamanhoMaximo       = 10 * 1024 * 1024; // 10MB

    if ($arquivo['size'] > $tamanhoMaximo) {
        return ['sucesso' => false, 'mensagem' => 'Arquivo muito grande. Máximo: 10MB.'];
    }

    $extensao = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
    if (!in_array($extensao, $extensoesPermitidas)) {
        return ['sucesso' => false, 'mensagem' => 'Formato inválido. Use PDF, DOC ou DOCX.'];
    }

    $nomeOriginal   = pathinfo($arquivo['name'], PATHINFO_FILENAME);
    $nomeSanitizado = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $nomeOriginal);
    $nomeFinal      = $nomeSanitizado . '.' . $extensao;

    // Evita sobrescrever arquivo com mesmo nome
    $contador = 1;
    while (file_exists($pastaDestino . $nomeFinal)) {
        $nomeFinal = $nomeSanitizado . '_' . $contador . '.' . $extensao;
        $contador++;
    }

    if (move_uploaded_file($arquivo['tmp_name'], $pastaDestino . $nomeFinal)) {
        return ['sucesso' => true, 'nome_arquivo' => $nomeFinal];
    }

    return ['sucesso' => false, 'mensagem' => 'Falha ao salvar o arquivo no servidor.'];
}