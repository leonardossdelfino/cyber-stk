<?php
// =============================================================================
// Exportação CSV: Registros de Perdas e Mau Uso
// =============================================================================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="registros_perdas_' . date('Y-m-d_His') . '.csv"');

require_once '../config/database.php';

try {
    $database = new Database();
    $conn     = $database->getConnection();

    $sql  = "SELECT * FROM registros_perdas ORDER BY data_incidente DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $output = fopen('php://output', 'w');
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    fputcsv($output, [
        'Tipo',
        'Nome Pessoa',
        'Área',
        'Chamado/OS',
        'Periférico',
        'Descrição',
        'Custo',
        'Ação Tomada',
        'Data Incidente',
        'Criado em',
    ], ';');

    foreach ($registros as $r) {
        fputcsv($output, [
            $r['tipo']           ?? '',
            $r['nome_pessoa']    ?? '',
            $r['area']           ?? '',
            $r['chamado_os']     ?? '',
            $r['periferico']     ?? '',
            $r['descricao']      ?? '',
            $r['custo']          ?? '',
            $r['acao_tomada']    ?? '',
            $r['data_incidente'] ?? '',
            $r['criado_em']      ?? '',
        ], ';');
    }

    fclose($output);

} catch (Exception $e) {
    http_response_code(500);
    echo "Erro ao exportar: " . $e->getMessage();
}