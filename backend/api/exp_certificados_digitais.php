<?php
// =============================================================================
// Exportação CSV: Certificados Digitais
// =============================================================================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="certificados_digitais_' . date('Y-m-d_His') . '.csv"');

require_once '../config/database.php';

try {
    $database = new Database();
    $conn     = $database->getConnection();

    $sql  = "SELECT * FROM certificados_digitais ORDER BY data_vencimento ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $certs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $output = fopen('php://output', 'w');
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    fputcsv($output, [
        'Nome/Razão Social',
        'Tipo',
        'Responsável',
        'Área',
        'Descrição',
        'Data Emissão',
        'Data Vencimento',
        'Valor Pago',
        'Status',
        'Criado em',
    ], ';');

    foreach ($certs as $c) {
        fputcsv($output, [
            $c['nome']            ?? '',
            $c['tipo']            ?? '',
            $c['responsavel']     ?? '',
            $c['area']            ?? '',
            $c['descricao']       ?? '',
            $c['data_emissao']    ?? '',
            $c['data_vencimento'] ?? '',
            $c['valor_pago']      ?? '',
            $c['status']          ?? '',
            $c['criado_em']       ?? '',
        ], ';');
    }

    fclose($output);

} catch (Exception $e) {
    http_response_code(500);
    echo "Erro ao exportar: " . $e->getMessage();
}