<?php
// File: /model/api/export_theories_csv.php (PHIÊN BẢN CUỐI CÙNG - ĐỊNH DẠNG DỄ HIỂU)
global $pdo;

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=theories_template_' . date('Y-m-d') . '.csv');

// Thêm BOM để Excel đọc đúng font Tiếng Việt
echo "\xEF\xBB\xBF";

$output = fopen('php://output', 'w');

// Dòng tiêu đề, có bổ sung gợi ý về định dạng mới
$headers = [
    'theory', 'note_vi', 'group', 'domain', 'reference', 
    'constructs_full', 'constructs_code', 'definition_long',
    'constructs_detailed (Ten1::MoTa1||Ten2::MoTa2)', // Gợi ý định dạng
    'sample_scales (ThangDo1||ThangDo2)' // Gợi ý định dạng
];
fputcsv($output, $headers);

// Lấy một dòng từ CSDL để làm mẫu
$stmt = $pdo->prepare("SELECT * FROM theories ORDER BY id ASC LIMIT 1");
$stmt->execute();
$db_row = $stmt->fetch(PDO::FETCH_ASSOC);

$example_row_data = [];

if ($db_row) {
    // --- Chuyển đổi dữ liệu từ CSDL sang định dạng đơn giản ---
    $example_row_data = $db_row;

    // 1. Chuyển đổi constructs_detailed
    $constructs_json = json_decode($db_row['constructs_detailed'] ?? '[]', true);
    $constructs_parts = [];
    if (is_array($constructs_json)) {
        foreach ($constructs_json as $item) {
            $constructs_parts[] = ($item['name'] ?? '') . '::' . ($item['desc'] ?? '');
        }
    }
    $example_row_data['constructs_detailed'] = implode('||', $constructs_parts);

    // 2. Chuyển đổi sample_scales
    $scales_json = json_decode($db_row['sample_scales'] ?? '[]', true);
    if (is_array($scales_json)) {
        $example_row_data['sample_scales'] = implode('||', $scales_json);
    } else {
        $example_row_data['sample_scales'] = '';
    }

} else {
    // Nếu CSDL trống, tạo một dòng mẫu cứng với định dạng đơn giản
    $example_row_data = [
        'theory' => 'Thuyết Chấp Nhận Công Nghệ (TAM)', 'note_vi' => 'Mô hình giải thích cách người dùng chấp nhận và sử dụng một công nghệ mới.',
        'group' => 'Chấp nhận công nghệ', 'domain' => 'Hệ thống thông tin', 'reference' => 'Davis, F. D. (1989)',
        'constructs_full' => 'Perceived Usefulness; Perceived Ease of Use', 'constructs_code' => 'PU; PEOU',
        'definition_long' => 'Mô tả chi tiết về lý thuyết TAM...',
        'constructs_detailed' => 'Perceived Usefulness (PU)::Mức độ một người tin rằng việc sử dụng một hệ thống cụ thể sẽ nâng cao hiệu suất công việc của họ.||Perceived Ease of Use (PEOU)::Mức độ một người tin rằng việc sử dụng một hệ thống cụ thể sẽ không đòi hỏi nhiều nỗ lực.',
        'sample_scales' => 'Tôi thấy hệ thống này hữu ích trong công việc của mình.||Sử dụng hệ thống này giúp tôi hoàn thành công việc nhanh hơn.'
    ];
}

// Ghi dòng mẫu đã được định dạng lại vào CSV
fputcsv($output, [
    $example_row_data['theory'] ?? '', $example_row_data['note_vi'] ?? '', $example_row_data['group'] ?? '',
    $example_row_data['domain'] ?? '', $example_row_data['reference'] ?? '', $example_row_data['constructs_full'] ?? '',
    $example_row_data['constructs_code'] ?? '', $example_row_data['definition_long'] ?? '',
    $example_row_data['constructs_detailed'] ?? '', $example_row_data['sample_scales'] ?? ''
]);

fclose($output);
exit();