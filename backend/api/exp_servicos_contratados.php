<?php
// =============================================================================
// Exportação CSV: Serviços Contratados
// =============================================================================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="servicos_contratados_' . date('Y-m-d_His') . '.csv"');

require_once '../config/database.php';

try {
    $database = new Database();
    $conn     = $database->getConnection();

    $sql  = "SELECT * FROM servicos_contratados ORDER BY data_termino ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $servicos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $output = fopen('php://output', 'w');
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    fputcsv($output, [
        'Nome',
        'Fornecedor',
        'Categoria',
        'Forma Pagamento',
        'Descrição',
        'Valor Total',
        'Data Início',
        'Data Término',
        'Status',
        'Arquivo Contrato',
        'Criado em',
    ], ';');

    foreach ($servicos as $s) {
        fputcsv($output, [
            $s['nome']             ?? '',
            $s['fornecedor']       ?? '',
            $s['categoria']        ?? '',
            $s['forma_pagamento']  ?? '',
            $s['descricao']        ?? '',
            $s['valor_total']      ?? '',
            $s['data_inicio']      ?? '',
            $s['data_termino']     ?? '',
            $s['status']           ?? '',
            $s['arquivo_contrato'] ?? '',
            $s['criado_em']        ?? '',
        ], ';');
    }

    fclose($output);

} catch (Exception $e) {
    http_response_code(500);
    echo "Erro ao exportar: " . $e->getMessage();
}