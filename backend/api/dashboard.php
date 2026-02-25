<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once '../config/database.php';

$dataInicio = isset($_GET['data_inicio']) && $_GET['data_inicio'] !== '' ? $_GET['data_inicio'] : null;
$dataFim    = isset($_GET['data_fim'])    && $_GET['data_fim']    !== '' ? $_GET['data_fim']    : null;

try {
    $db   = new Database();
    $conn = $db->getConnection();

    $buildFiltroData = function(string $campo) use ($dataInicio, $dataFim): array {
        $where = []; $params = [];
        if ($dataInicio) { $where[] = "$campo >= :data_inicio"; $params[':data_inicio'] = $dataInicio; }
        if ($dataFim)    { $where[] = "$campo <= :data_fim";    $params[':data_fim']    = $dataFim;    }
        return ['sql' => $where ? ('AND ' . implode(' AND ', $where)) : '', 'params' => $params];
    };

    // 1. OCs — cards
    $filtroOC = $buildFiltroData('oc_data_referencia');
    $stmtOC = $conn->prepare("
        SELECT COUNT(*) AS total_ocs, COALESCE(SUM(oc_valor), 0) AS valor_total_ocs,
            SUM(CASE WHEN oc_status NOT IN ('Finalizado','Cancelado') THEN 1 ELSE 0 END) AS ocs_abertas,
            COALESCE(SUM(CASE WHEN oc_status NOT IN ('Finalizado','Cancelado') THEN oc_valor ELSE 0 END), 0) AS valor_ocs_abertas
        FROM ordens_de_compra WHERE 1=1 {$filtroOC['sql']}
    ");
    foreach ($filtroOC['params'] as $k => $v) $stmtOC->bindValue($k, $v);
    $stmtOC->execute();
    $dadosOC = $stmtOC->fetch(PDO::FETCH_ASSOC);

    // 2. Contas Fixas
    $stmtCF = $conn->prepare("SELECT COUNT(*) AS total_contas_fixas, COALESCE(SUM(valor), 0) AS valor_total_contas_fixas FROM contas_fixas");
    $stmtCF->execute();
    $dadosCF = $stmtCF->fetch(PDO::FETCH_ASSOC);

    // 3. Serviços Contratados
    $stmtSC = $conn->prepare("
        SELECT COUNT(*) AS total_servicos,
            COALESCE(SUM(CASE WHEN status = 'Ativa' THEN valor_total ELSE 0 END), 0) AS valor_servicos_ativos,
            SUM(CASE WHEN status = 'Ativa' THEN 1 ELSE 0 END) AS qtd_servicos_ativos
        FROM servicos_contratados
    ");
    $stmtSC->execute();
    $dadosSC = $stmtSC->fetch(PDO::FETCH_ASSOC);

    // 4. Perdas — cards
    $filtroPerdas = $buildFiltroData('data_incidente');
    $stmtPerdas = $conn->prepare("
        SELECT COUNT(*) AS total_incidentes, COALESCE(SUM(custo), 0) AS gasto_total_perdas
        FROM registros_perdas WHERE 1=1 {$filtroPerdas['sql']}
    ");
    foreach ($filtroPerdas['params'] as $k => $v) $stmtPerdas->bindValue($k, $v);
    $stmtPerdas->execute();
    $dadosPerdas = $stmtPerdas->fetch(PDO::FETCH_ASSOC);

    // 5. Alertas — contadores
    $stmtAlertasSC = $conn->prepare("SELECT COUNT(*) AS servicos_vencendo FROM servicos_contratados WHERE status = 'Ativa' AND data_termino BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)");
    $stmtAlertasSC->execute();
    $alertasSC = $stmtAlertasSC->fetch(PDO::FETCH_ASSOC);

    $stmtAlertasCert = $conn->prepare("SELECT COUNT(*) AS certificados_vencendo FROM certificados_digitais WHERE status = 'Ativo' AND data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)");
    $stmtAlertasCert->execute();
    $alertasCert = $stmtAlertasCert->fetch(PDO::FETCH_ASSOC);

    // Mapa de meses PT reutilizado nos gráficos de linha
    $mesesPt = ['01'=>'Jan','02'=>'Fev','03'=>'Mar','04'=>'Abr','05'=>'Mai','06'=>'Jun',
                '07'=>'Jul','08'=>'Ago','09'=>'Set','10'=>'Out','11'=>'Nov','12'=>'Dez'];

    // 6. Gráfico 1 — Gastos mensais em OCs
    $stmtMensal = $conn->prepare("
        SELECT DATE_FORMAT(oc_data_referencia, '%Y-%m') AS mes, COALESCE(SUM(oc_valor), 0) AS total
        FROM ordens_de_compra WHERE 1=1 {$filtroOC['sql']}
        GROUP BY DATE_FORMAT(oc_data_referencia, '%Y-%m') ORDER BY mes ASC
    ");
    foreach ($filtroOC['params'] as $k => $v) $stmtMensal->bindValue($k, $v);
    $stmtMensal->execute();
    $graficoMensalOcs = array_map(function($row) use ($mesesPt) {
        [$ano, $mes] = explode('-', $row['mes']);
        return ['mes' => ($mesesPt[$mes] ?? $mes) . '/' . substr($ano, 2), 'total' => (float)$row['total']];
    }, $stmtMensal->fetchAll(PDO::FETCH_ASSOC));

    // 7. Gráfico 2 — OCs por Status (donut)
    $stmtStatus = $conn->prepare("
        SELECT oc.oc_status AS status, COUNT(*) AS quantidade, COALESCE(s.cor, '#888888') AS cor
        FROM ordens_de_compra oc
        LEFT JOIN status_oc s ON s.nome COLLATE utf8mb4_unicode_ci = oc.oc_status COLLATE utf8mb4_unicode_ci
        WHERE 1=1 {$filtroOC['sql']}
        GROUP BY oc.oc_status, s.cor ORDER BY quantidade DESC
    ");
    foreach ($filtroOC['params'] as $k => $v) $stmtStatus->bindValue($k, $v);
    $stmtStatus->execute();
    $graficoStatus = array_map(function($row) {
        return ['name' => $row['status'] ?? 'Sem status', 'value' => (int)$row['quantidade'], 'cor' => $row['cor']];
    }, $stmtStatus->fetchAll(PDO::FETCH_ASSOC));

    // 8. Gráfico 3 — Top Fornecedores por Gasto
    $stmtForn = $conn->prepare("
        SELECT oc_nome_fornecedor AS fornecedor, COALESCE(SUM(oc_valor), 0) AS total, COUNT(*) AS qtd_ocs
        FROM ordens_de_compra WHERE 1=1 {$filtroOC['sql']}
        GROUP BY oc_nome_fornecedor ORDER BY total DESC LIMIT 8
    ");
    foreach ($filtroOC['params'] as $k => $v) $stmtForn->bindValue($k, $v);
    $stmtForn->execute();
    $graficoFornecedores = array_map(function($row) {
        return ['fornecedor' => $row['fornecedor'], 'total' => (float)$row['total'], 'qtd_ocs' => (int)$row['qtd_ocs']];
    }, $stmtForn->fetchAll(PDO::FETCH_ASSOC));

    // 9. Gráfico 4 — Perdas por Tipo de Incidente (barras)
    $stmtIncidentes = $conn->prepare("
        SELECT COALESCE(tipo, 'Sem tipo') AS tipo, COUNT(*) AS quantidade, COALESCE(SUM(custo), 0) AS custo_total
        FROM registros_perdas WHERE 1=1 {$filtroPerdas['sql']}
        GROUP BY tipo ORDER BY custo_total DESC
    ");
    foreach ($filtroPerdas['params'] as $k => $v) $stmtIncidentes->bindValue($k, $v);
    $stmtIncidentes->execute();
    $graficoPerdasTipo = array_map(function($row) {
        return ['tipo' => $row['tipo'], 'quantidade' => (int)$row['quantidade'], 'custo_total' => (float)$row['custo_total']];
    }, $stmtIncidentes->fetchAll(PDO::FETCH_ASSOC));

    // 10. Gráfico 5 — Evolução de Perdas por mês (linha)
    $stmtEvolucaoPerdas = $conn->prepare("
        SELECT DATE_FORMAT(data_incidente, '%Y-%m') AS mes, COALESCE(SUM(custo), 0) AS total, COUNT(*) AS qtd
        FROM registros_perdas WHERE 1=1 {$filtroPerdas['sql']}
        GROUP BY DATE_FORMAT(data_incidente, '%Y-%m') ORDER BY mes ASC
    ");
    foreach ($filtroPerdas['params'] as $k => $v) $stmtEvolucaoPerdas->bindValue($k, $v);
    $stmtEvolucaoPerdas->execute();
    $graficoEvolucaoPerdas = array_map(function($row) use ($mesesPt) {
        [$ano, $mes] = explode('-', $row['mes']);
        return ['mes' => ($mesesPt[$mes] ?? $mes) . '/' . substr($ano, 2), 'total' => (float)$row['total'], 'qtd' => (int)$row['qtd']];
    }, $stmtEvolucaoPerdas->fetchAll(PDO::FETCH_ASSOC));

    // 11. Alertas — Serviços contratados vencendo nos próximos 30 dias (detalhes)
    $stmtServDetalhes = $conn->prepare("
        SELECT
            nome,
            fornecedor,
            categoria,
            valor_total,
            data_termino,
            DATEDIFF(data_termino, CURDATE()) AS dias_restantes
        FROM servicos_contratados
        WHERE status = 'Ativa'
          AND data_termino BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        ORDER BY data_termino ASC
    ");
    $stmtServDetalhes->execute();
    $servVencendo = array_map(function($row) {
        return [
            'nome'           => $row['nome'],
            'fornecedor'     => $row['fornecedor'],
            'categoria'      => $row['categoria'],
            'valor_total'    => (float) $row['valor_total'],
            'data_termino'   => $row['data_termino'],
            'dias_restantes' => (int) $row['dias_restantes'],
        ];
    }, $stmtServDetalhes->fetchAll(PDO::FETCH_ASSOC));

    // 12. Alertas — Certificados vencendo nos próximos 60 dias (detalhes)
    //     Calcula dias restantes direto no MySQL para evitar divergência de timezone
    $stmtCertDetalhes = $conn->prepare("
        SELECT
            nome,
            tipo,
            responsavel,
            data_vencimento,
            DATEDIFF(data_vencimento, CURDATE()) AS dias_restantes
        FROM certificados_digitais
        WHERE status = 'Ativo'
          AND data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)
        ORDER BY data_vencimento ASC
    ");
    $stmtCertDetalhes->execute();
    $certVencendo = array_map(function($row) {
        return [
            'nome'            => $row['nome'],
            'tipo'            => $row['tipo'],
            'responsavel'     => $row['responsavel'],
            'data_vencimento' => $row['data_vencimento'],
            'dias_restantes'  => (int) $row['dias_restantes'],
        ];
    }, $stmtCertDetalhes->fetchAll(PDO::FETCH_ASSOC));

    echo json_encode([
        'success' => true,
        'filtro'  => ['data_inicio' => $dataInicio, 'data_fim' => $dataFim],
        'data' => [
            'ocs_abertas'               => (int)   $dadosOC['ocs_abertas'],
            'valor_ocs_abertas'         => (float) $dadosOC['valor_ocs_abertas'],
            'total_ocs'                 => (int)   $dadosOC['total_ocs'],
            'valor_total_ocs'           => (float) $dadosOC['valor_total_ocs'],
            'total_contas_fixas'        => (int)   $dadosCF['total_contas_fixas'],
            'valor_total_contas_fixas'  => (float) $dadosCF['valor_total_contas_fixas'],
            'qtd_servicos_ativos'       => (int)   $dadosSC['qtd_servicos_ativos'],
            'valor_servicos_ativos'     => (float) $dadosSC['valor_servicos_ativos'],
            'total_incidentes'          => (int)   $dadosPerdas['total_incidentes'],
            'gasto_total_perdas'        => (float) $dadosPerdas['gasto_total_perdas'],
            'servicos_vencendo'         => (int)   $alertasSC['servicos_vencendo'],
            'certificados_vencendo'     => (int)   $alertasCert['certificados_vencendo'],
            'grafico_mensal_ocs'        => $graficoMensalOcs,
            'grafico_status_ocs'        => $graficoStatus,
            'grafico_top_fornecedores'  => $graficoFornecedores,
            'grafico_perdas_por_tipo'   => $graficoPerdasTipo,
            'grafico_evolucao_perdas'   => $graficoEvolucaoPerdas,
            'serv_vencendo'             => $servVencendo,
            'cert_vencendo'             => $certVencendo,
        ],
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao carregar dados do dashboard.', 'debug' => $e->getMessage()]);
}