<?php
// =============================================================================
// API: servicos_contratados.php
// Endpoints: GET, POST, PUT (via POST+_method), DELETE + upload de contrato
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

// try/catch captura exceção PDO lançada pelo Database
try {
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/ServicoContratado.php';
    $database = new Database();
    $conn     = $database->getConnection();
    $model    = new ServicoContratado($conn);
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(['success' => false, 'message' => 'Serviço indisponível. Tente novamente.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

// PHP não lê multipart/form-data em PUT nativo
// Solução: POST com _method=PUT no FormData
if ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $method = 'PUT';
}

switch ($method) {

    // -----------------------------------------------------------------------
    // GET — Lista todos ou busca por ID
    // -----------------------------------------------------------------------
    case 'GET':
        if ($id) {
            $servico = $model->buscarPorId($id);
            if (!$servico) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Serviço não encontrado.']);
                exit;
            }
            echo json_encode(['success' => true, 'data' => $servico]);
        } else {
            $lista = $model->listar();
            echo json_encode(['success' => true, 'data' => $lista, 'total' => count($lista)]);
        }
        break;

    // -----------------------------------------------------------------------
    // POST — Cria novo serviço
    // -----------------------------------------------------------------------
    case 'POST':
        $dados = [
            'nome'             => trim($_POST['nome']            ?? ''),
            'fornecedor'       => trim($_POST['fornecedor']      ?? ''),
            'categoria'        => trim($_POST['categoria']       ?? ''),
            'forma_pagamento'  => trim($_POST['forma_pagamento'] ?? ''),
            'descricao'        => trim($_POST['descricao']       ?? '') ?: null,
            'valor_total'      => $_POST['valor_total']          ?? 0,
            'data_inicio'      => trim($_POST['data_inicio']     ?? ''),
            'data_termino'     => trim($_POST['data_termino']    ?? ''),
            'status'           => trim($_POST['status']          ?? 'Ativa'),
            'arquivo_contrato' => null,
        ];

        if (empty($dados['nome']) || empty($dados['fornecedor']) ||
            empty($dados['data_inicio']) || empty($dados['data_termino'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios: nome, fornecedor, data_inicio, data_termino.']);
            exit;
        }

        if (!empty($_FILES['arquivo_contrato']['name'])) {
            $resultado = uploadContrato($_FILES['arquivo_contrato']);
            if (!$resultado['sucesso']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => $resultado['mensagem']]);
                exit;
            }
            $dados['arquivo_contrato'] = $resultado['nome_arquivo'];
        }

        $novoId = $model->criar($dados);
        if ($novoId) {
            http_response_code(201);
            echo json_encode(['success' => true, 'message' => 'Serviço criado com sucesso.', 'id' => $novoId]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao criar serviço.']);
        }
        break;

    // -----------------------------------------------------------------------
    // PUT — Atualiza serviço existente (via POST + _method=PUT)
    // -----------------------------------------------------------------------
    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID obrigatório para atualização.']);
            exit;
        }

        // Verifica existência antes de atualizar
        $servicoAtual = $model->buscarPorId($id);
        if (!$servicoAtual) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Serviço não encontrado.']);
            exit;
        }

        $dados = [
            'nome'             => trim($_POST['nome']            ?? ''),
            'fornecedor'       => trim($_POST['fornecedor']      ?? ''),
            'categoria'        => trim($_POST['categoria']       ?? ''),
            'forma_pagamento'  => trim($_POST['forma_pagamento'] ?? ''),
            'descricao'        => trim($_POST['descricao']       ?? '') ?: null,
            'valor_total'      => $_POST['valor_total']          ?? 0,
            'data_inicio'      => trim($_POST['data_inicio']     ?? ''),
            'data_termino'     => trim($_POST['data_termino']    ?? ''),
            'status'           => trim($_POST['status']          ?? 'Ativa'),
            'arquivo_contrato' => $servicoAtual['arquivo_contrato'], // mantém atual por padrão
        ];

        if (!empty($_FILES['arquivo_contrato']['name'])) {
            // Remove arquivo antigo antes de salvar o novo
            if ($servicoAtual['arquivo_contrato']) {
                $caminhoAntigo = __DIR__ . '/../uploads/contratos/' . $servicoAtual['arquivo_contrato'];
                if (file_exists($caminhoAntigo)) unlink($caminhoAntigo);
            }
            $resultado = uploadContrato($_FILES['arquivo_contrato']);
            if (!$resultado['sucesso']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => $resultado['mensagem']]);
                exit;
            }
            $dados['arquivo_contrato'] = $resultado['nome_arquivo'];
        }

        if ($model->atualizar($id, $dados)) {
            echo json_encode(['success' => true, 'message' => 'Serviço atualizado com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar serviço.']);
        }
        break;

    // -----------------------------------------------------------------------
    // DELETE — Remove serviço e seu arquivo físico
    // -----------------------------------------------------------------------
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID obrigatório para exclusão.']);
            exit;
        }

        $servico = $model->buscarPorId($id);
        if (!$servico) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Serviço não encontrado.']);
            exit;
        }

        // Remove arquivo físico se existir
        if ($servico['arquivo_contrato']) {
            $caminho = __DIR__ . '/../uploads/contratos/' . $servico['arquivo_contrato'];
            if (file_exists($caminho)) unlink($caminho);
        }

        if ($model->deletar($id)) {
            echo json_encode(['success' => true, 'message' => 'Serviço removido com sucesso.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao remover serviço.']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
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