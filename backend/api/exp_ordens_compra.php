<?php
// =============================================================================
// Exportação CSV: Ordens de Compra
// =============================================================================

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Se for OPTIONS (preflight), retorna 200
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="ordens_compra_' . date('Y-m-d_His') . '.csv"');

require_once '../config/database.php';

try {
    $database = new Database();
    $conn     = $database->getConnection();

    $sql  = "SELECT * FROM ordens_de_compra ORDER BY oc_data_referencia DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $ocs  = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $output = fopen('php://output', 'w');
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    fputcsv($output, [
        'OC Número',
        'Descrição',
        'Fornecedor',
        'Categoria',
        'Valor',
        'Forma Pagamento',
        'Data Referência',
        'Status',
        'Aprovação',
        'Observações',
        'Criado em',
    ], ';');

    foreach ($ocs as $oc) {
        fputcsv($output, [
            $oc['oc_numero']          ?? '',
            $oc['oc_descricao']       ?? '',
            $oc['oc_nome_fornecedor'] ?? '',
            $oc['oc_categoria']       ?? '',
            $oc['oc_valor']           ?? '',
            $oc['oc_forma_pagamento'] ?? '',
            $oc['oc_data_referencia'] ?? '',
            $oc['oc_status']          ?? '',
            $oc['oc_aprovacao']       ?? '',
            $oc['oc_obs']             ?? '',
            $oc['criado_em']          ?? '',
        ], ';');
    }

    fclose($output);

} catch (Exception $e) {
    http_response_code(500);
    echo "Erro ao exportar: " . $e->getMessage();
}