<?php
// =============================================================================
// Exportação CSV: Contas Fixas
// =============================================================================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="contas_fixas_' . date('Y-m-d_His') . '.csv"');

require_once '../config/database.php';

try {
    $database = new Database();
    $conn     = $database->getConnection();

    $sql  = "SELECT * FROM contas_fixas ORDER BY dia_vencimento ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $contas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $output = fopen('php://output', 'w');
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    fputcsv($output, [
        'Descrição',
        'Fornecedor',
        'Valor',
        'Dia Vencimento',
        'Forma Pagamento',
        'Categoria',
        'Status',
        'Observações',
        'Criado em',
    ], ';');

    foreach ($contas as $c) {
        fputcsv($output, [
            $c['descricao']       ?? '',
            $c['fornecedor']      ?? '',
            $c['valor']           ?? '',
            $c['dia_vencimento']  ?? '',
            $c['forma_pagamento'] ?? '',
            $c['categoria']       ?? '',
            $c['status']          ?? '',
            $c['observacoes']     ?? '',
            $c['criado_em']       ?? '',
        ], ';');
    }

    fclose($output);

} catch (Exception $e) {
    http_response_code(500);
    echo "Erro ao exportar: " . $e->getMessage();
}