<?php
// File: /model/admin_theories.php (PHIÊN BẢN HOÀN CHỈNH TUYỆT ĐỐI)
// Tích hợp chức năng quản lý lý thuyết chi tiết và gán biến vào một file duy nhất.
global $pdo, $current_user;

$message = '';
$edit_theory = null;
$form_action = 'add';
$user_id = $current_user['id'] ?? null;

// --- HÀM TIỆN ÍCH ---
function getOrCreateDomainId($name, $pdo) {
    if (empty(trim($name))) return null;
    $stmt = $pdo->prepare("SELECT id FROM `domains` WHERE name = ?");
    $stmt->execute([$name]);
    if ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
        return $result['id'];
    }
    $stmt = $pdo->prepare("INSERT INTO `domains` (name) VALUES (?)");
    $stmt->execute([$name]);
    return $pdo->lastInsertId();
}
function getOrCreateGroupId($name, $domain_id, $pdo) {
    if (empty(trim($name)) || empty($domain_id)) return null;
    $stmt = $pdo->prepare("SELECT id FROM `groups` WHERE name = ? AND domain_id = ?");
    $stmt->execute([$name, $domain_id]);
    if ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
        return $result['id'];
    }
    $stmt = $pdo->prepare("INSERT INTO `groups` (name, domain_id) VALUES (?, ?)");
    $stmt->execute([$name, $domain_id]);
    return $pdo->lastInsertId();
}

// --- XỬ LÝ LOGIC POST REQUEST ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_theory'])) {
    // --- Lấy và xử lý dữ liệu từ form ---
    $id = $_POST['id'] ?? null;
    $domain_id = $_POST['domain_id'];
    if ($domain_id === 'add_new' && !empty($_POST['new_domain_name'])) { $domain_id = getOrCreateDomainId(trim($_POST['new_domain_name']), $pdo); }
    $group_id = $_POST['group_id'];
    if ($group_id === 'add_new' && !empty($_POST['new_group_name']) && !empty($domain_id)) { $group_id = getOrCreateGroupId(trim($_POST['new_group_name']), $domain_id, $pdo); }
    
    // --- Xử lý các trường JSON ---
    $constructs_detailed_json = '[]';
    if (isset($_POST['construct_name']) && is_array($_POST['construct_name'])) {
        $constructs_array = [];
        foreach ($_POST['construct_name'] as $index => $name) {
            if (!empty(trim($name))) { $constructs_array[] = ['name' => trim($name), 'desc' => trim($_POST['construct_desc'][$index] ?? '')]; }
        }
        $constructs_detailed_json = json_encode($constructs_array, JSON_UNESCAPED_UNICODE);
    }
    $sample_scales_json = '[]';
    if (isset($_POST['sample_scales_text'])) {
        $scales_text = trim($_POST['sample_scales_text']);
        $scales_array = array_map('trim', array_filter(preg_split('/\r\n|\r|\n/', $scales_text)));
        if (!empty($scales_array)) { $sample_scales_json = json_encode(array_values($scales_array), JSON_UNESCAPED_UNICODE); }
    }
    
    // --- Cập nhật/Thêm mới thông tin chính của Lý thuyết ---
    try {
        if ($id) {
            $sql = "UPDATE theories SET theory = :theory, note_vi = :note_vi, group_id = :group_id, domain_id = :domain_id, reference = :reference, constructs_full = :constructs_full, constructs_code = :constructs_code, definition_long = :definition_long, constructs_detailed = :constructs_detailed, sample_scales = :sample_scales, updated_by = :updated_by WHERE id = :id";
        } else {
            $sql = "INSERT INTO theories (theory, note_vi, group_id, domain_id, reference, constructs_full, constructs_code, definition_long, constructs_detailed, sample_scales, created_by, updated_by) VALUES (:theory, :note_vi, :group_id, :domain_id, :reference, :constructs_full, :constructs_code, :definition_long, :constructs_detailed, :sample_scales, :created_by, :updated_by)";
        }
        $stmt = $pdo->prepare($sql);
        $params = [
            ':theory' => trim($_POST['theory']), ':note_vi' => trim($_POST['note_vi']), ':group_id' => $group_id, ':domain_id' => $domain_id, 
            ':reference' => trim($_POST['reference']), ':constructs_full' => trim($_POST['constructs_full']), ':constructs_code' => trim($_POST['constructs_code']), 
            ':definition_long' => trim($_POST['definition_long']), ':constructs_detailed' => $constructs_detailed_json, 
            ':sample_scales' => $sample_scales_json, ':updated_by' => $user_id
        ];
        if ($id) { $params[':id'] = $id; } else { $params[':created_by'] = $user_id; }
        $stmt->execute($params);
        
        $current_theory_id = $id ?: $pdo->lastInsertId();

        // PHẦN NÂNG CẤP: CẬP NHẬT LIÊN KẾT BIẾN (Bảng theory_variables)
        if ($current_theory_id) {
            $selected_variables = $_POST['linked_variables'] ?? [];

            // 1. Xóa tất cả liên kết cũ của lý thuyết này
            $stmt_delete_links = $pdo->prepare("DELETE FROM theory_variables WHERE theory_id = ?");
            $stmt_delete_links->execute([$current_theory_id]);

            // 2. Thêm lại các liên kết mới dựa trên checkbox
            if (!empty($selected_variables)) {
                $stmt_insert_link = $pdo->prepare("INSERT INTO theory_variables (theory_id, variable_id) VALUES (?, ?)");
                foreach ($selected_variables as $variable_id) {
                    $stmt_insert_link->execute([$current_theory_id, $variable_id]);
                }
            }
        }
        
        $message = $id ? '<div class="alert alert-success">Cập nhật thành công!</div>' : '<div class="alert alert-success">Thêm mới thành công!</div>';
    } catch (PDOException $e) { $message = '<div class="alert alert-danger">Lỗi CSDL: ' . $e->getMessage() . '</div>'; }
}

// --- XỬ LÝ XÓA ---
if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
    try { $stmt = $pdo->prepare("DELETE FROM theories WHERE id = ?"); $stmt->execute([$_GET['id']]); $message = '<div class="alert alert-success">Đã xóa thành công!</div>'; } catch (PDOException $e) { $message = '<div class="alert alert-danger">Lỗi CSDL: ' . $e->getMessage() . '</div>'; }
}

// --- LẤY DỮ LIỆU ĐỂ HIỂN THỊ TRÊN TRANG ---
$all_domains = $pdo->query("SELECT * FROM `domains` ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);
$all_groups_query = $pdo->query("SELECT id, name, domain_id FROM `groups` ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);
$groups_by_domain = [];
foreach ($all_groups_query as $group) { $groups_by_domain[$group['domain_id']][] = $group; }
$all_theories = $pdo->query("SELECT t.id, t.theory, g.name as group_name, d.name as domain_name FROM theories t LEFT JOIN `groups` g ON t.group_id = g.id LEFT JOIN `domains` d ON t.domain_id = d.id ORDER BY t.theory ASC")->fetchAll(PDO::FETCH_ASSOC);

// Nâng cấp: Lấy thêm dữ liệu cho form Sửa
$all_variables = [];
$linked_variable_ids = [];
if (isset($_GET['action']) && $_GET['action'] == 'edit' && isset($_GET['id'])) {
    $form_action = 'edit';
    $stmt = $pdo->prepare("SELECT * FROM theories WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $edit_theory = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Lấy tất cả biến để hiển thị checkbox
    $all_variables = $pdo->query("SELECT variable_id, variable_name, variable_acronym FROM variables ORDER BY variable_name ASC")->fetchAll(PDO::FETCH_ASSOC);
    // Lấy các biến đang được gán cho lý thuyết này
    $stmt_linked = $pdo->prepare("SELECT variable_id FROM theory_variables WHERE theory_id = ?");
    $stmt_linked->execute([$_GET['id']]);
    $linked_variable_ids = $stmt_linked->fetchAll(PDO::FETCH_COLUMN, 0);
}
?>
<!-- === GIAO DIỆN HTML & CSS & JS === -->
<style>
    .admin-container { max-width: 1200px; margin: auto; }
    .admin-section { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 30px; }
    fieldset { border: 1px solid #dee2e6; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
    legend { font-weight: 600; font-size: 1.1em; color: var(--primary-color); padding: 0 10px; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 6px; }
    .form-group .form-control { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    .form-group small { color: #6c757d; font-size: 0.85em; }
    .btn-group { display: flex; gap: 10px; margin-top: 1.5rem; }
    .btn { padding: 10px 18px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; font-size: 1rem; }
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
    .input-new-category { display: none; margin-top: 10px; }
    .theories-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9em; }
    .theories-table th, .theories-table td { padding: 12px; border: 1px solid #dee2e6; text-align: left; vertical-align: middle; }
    .theories-table thead { background-color: #f8f9fa; }
    .actions a { margin-right: 10px; text-decoration: none; }
    .repeater-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
    .repeater-row .form-group { flex-grow: 1; margin-bottom: 0; }
    .btn-remove-row { height: 44px; width: 44px; flex-shrink: 0; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    .btn-add-row { background-color: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: 500; }
    .alert { padding: 1rem; margin-bottom: 1rem; border-radius: 4px; border: 1px solid transparent; }
    .alert-success { background-color: #d4edda; color: #155724; border-color: #c3e6cb; }
    .alert-danger { background-color: #f8d7da; color: #721c24; border-color: #f5c6cb; }
    .variable-selection-container { max-height: 400px; overflow-y: auto; border: 1px solid #dee2e6; padding: 15px; border-radius: 4px; }
    .variable-selection-container label { display: block; margin-bottom: 8px; font-weight: normal; cursor: pointer; }
    .variable-selection-container input[type="checkbox"] { margin-right: 10px; }
</style>

<div class="admin-container">
    <h1>Quản lý Cơ sở Lý thuyết</h1>
    <?php echo $message; ?>

    <div class="admin-section">
        <h2><?php echo $form_action == 'edit' ? 'Chỉnh sửa Lý thuyết' : 'Thêm Lý thuyết mới'; ?></h2>
        <form method="POST" action="">
            <input type="hidden" name="id" value="<?php echo $edit_theory['id'] ?? ''; ?>">
            
            <fieldset>
                <legend>Thông tin Cơ bản & Phân loại</legend>
                <div class="form-group"><label for="theory">Tên Lý thuyết (*)</label><input type="text" id="theory" name="theory" class="form-control" value="<?php echo htmlspecialchars($edit_theory['theory'] ?? ''); ?>" placeholder="Ví dụ: Thuyết Chấp Nhận và Sử Dụng Công Nghệ (UTAUT)" required></div>
                <div class="form-group">
                    <label for="domain_id">Lĩnh vực</label>
                    <select id="domain_id" name="domain_id" class="form-control">
                        <option value="">-- Chọn một lĩnh vực --</option>
                        <?php foreach ($all_domains as $domain): ?>
                            <option value="<?php echo $domain['id']; ?>" <?php if (isset($edit_theory) && $edit_theory['domain_id'] == $domain['id']) echo 'selected'; ?>>
                                <?php echo htmlspecialchars($domain['name']); ?>
                            </option>
                        <?php endforeach; ?>
                        <option value="add_new">-- Thêm lĩnh vực mới --</option>
                    </select>
                    <input type="text" name="new_domain_name" class="form-control input-new-category" placeholder="Nhập tên lĩnh vực mới">
                </div>
                <div class="form-group">
                    <label for="group_id">Nhóm</label>
                    <select id="group_id" name="group_id" class="form-control" disabled>
                        <option value="">-- Vui lòng chọn Lĩnh vực trước --</option>
                        <option value="add_new">-- Thêm nhóm mới cho lĩnh vực này --</option>
                    </select>
                     <input type="text" name="new_group_name" class="form-control input-new-category" placeholder="Nhập tên nhóm mới">
                </div>
                <div class="form-group"><label for="reference">Nguồn trích dẫn</label><input type="text" id="reference" name="reference" class="form-control" value="<?php echo htmlspecialchars($edit_theory['reference'] ?? ''); ?>" placeholder="Ví dụ: Venkatesh, V., Morris, M. G., et al. (2003)"></div>
            </fieldset>
            
            <fieldset><legend>Nội dung chi tiết (Dùng để hiển thị)</legend>
                <div class="form-group"><label for="note_vi">Ghi chú ngắn</label><textarea id="note_vi" name="note_vi" class="form-control" rows="2" placeholder="Mô tả ngắn gọn, súc tích về bản chất của lý thuyết..."><?php echo htmlspecialchars($edit_theory['note_vi'] ?? ''); ?></textarea></div>
                <div class="form-group"><label for="definition_long">Định nghĩa / Mô tả chi tiết (HTML)</label><textarea id="definition_long" name="definition_long" class="form-control" rows="4" placeholder="Sử dụng các thẻ HTML như <b>, <i>, <p>, <ul><li> để định dạng nội dung..."><?php echo htmlspecialchars($edit_theory['definition_long'] ?? ''); ?></textarea></div>
                <div class="form-group"><label for="constructs_full">Các biến (dạng ngắn)</label><input type="text" id="constructs_full" name="constructs_full" class="form-control" value="<?php echo htmlspecialchars($edit_theory['constructs_full'] ?? ''); ?>" placeholder="Performance Expectancy; Effort Expectancy; Social Influence"></div>
                <div class="form-group"><label for="constructs_code">Mã hóa biến</label><input type="text" id="constructs_code" name="constructs_code" class="form-control" value="<?php echo htmlspecialchars($edit_theory['constructs_code'] ?? ''); ?>" placeholder="PE; EE; SI"></div>
                <div class="form-group"><label>Các biến (chi tiết)</label><div id="constructs-repeater-container"><?php $constructs = isset($edit_theory['constructs_detailed']) ? json_decode($edit_theory['constructs_detailed'], true) : []; if (!empty($constructs) && is_array($constructs)): foreach ($constructs as $construct): ?><div class="repeater-row"><div class="form-group"><input type="text" name="construct_name[]" class="form-control" placeholder="Tên biến" value="<?php echo htmlspecialchars($construct['name'] ?? ''); ?>"></div><div class="form-group"><textarea name="construct_desc[]" class="form-control" rows="1" placeholder="Mô tả biến"><?php echo htmlspecialchars($construct['desc'] ?? ''); ?></textarea></div><button type="button" class="btn-remove-row">X</button></div><?php endforeach; else: ?><div class="repeater-row"><div class="form-group"><input type="text" name="construct_name[]" class="form-control" placeholder="Tên biến"></div><div class="form-group"><textarea name="construct_desc[]" class="form-control" rows="1" placeholder="Mô tả biến"></textarea></div><button type="button" class="btn-remove-row">X</button></div><?php endif; ?></div><button type="button" id="btn-add-construct" class="btn-add-row" style="margin-top:10px;">[+] Thêm biến</button></div>
                <div class="form-group"><label for="sample_scales_text">Thang đo mẫu</label><textarea id="sample_scales_text" name="sample_scales_text" class="form-control" rows="6" placeholder="Nhập mỗi phát biểu thang đo trên một dòng."><?php if (isset($edit_theory['sample_scales'])) { $scales = json_decode($edit_theory['sample_scales'], true); if (is_array($scales)) { echo htmlspecialchars(implode("\n", $scales)); } } ?></textarea></div>
            </fieldset>
            
            <?php if ($form_action == 'edit'): ?>
            <fieldset>
                <legend>Liên kết Biến cho Bảng hỏi (QUAN TRỌNG)</legend>
                <div class="form-group">
                    <label>Chọn các biến chính thức thuộc về lý thuyết này</label>
                    <small>Các biến được chọn ở đây sẽ được tự động tải khi người dùng chọn lý thuyết này trong công cụ xây dựng bảng hỏi.</small>
                    <div class="variable-selection-container">
                        <?php if (!empty($all_variables)): ?>
                            <?php foreach ($all_variables as $variable): ?>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="linked_variables[]" 
                                        value="<?php echo $variable['variable_id']; ?>"
                                        <?php if (in_array($variable['variable_id'], $linked_variable_ids)) echo 'checked'; ?>
                                    >
                                    <?php echo htmlspecialchars($variable['variable_name']); ?> 
                                    (<?php echo htmlspecialchars($variable['variable_acronym']); ?>)
                                </label>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <p>Chưa có biến nào trong CSDL. Vui lòng thêm biến ở trang quản lý biến trước.</p>
                        <?php endif; ?>
                    </div>
                </div>
            </fieldset>
            <?php endif; ?>
            
            <div class="btn-group">
                <button type="submit" name="submit_theory" class="btn btn-primary">Lưu Thay Đổi</button>
                <?php if ($form_action == 'edit'): ?>
                    <a href="<?php echo BASE_URL; ?>index.php/admin_theories" class="btn btn-secondary">Hủy bỏ</a>
                <?php endif; ?>
            </div>
        </form>
    </div>

    <div class="admin-section">
        <h2>Danh sách Lý thuyết Hiện có</h2>
        <table class="theories-table">
            <thead><tr><th>Tên Lý thuyết</th><th>Nhóm</th><th>Lĩnh vực</th><th>Hành động</th></tr></thead>
            <tbody>
                <?php foreach ($all_theories as $theory_item): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($theory_item['theory']); ?></td>
                        <td><?php echo htmlspecialchars($theory_item['group_name'] ?? 'N/A'); ?></td>
                        <td><?php echo htmlspecialchars($theory_item['domain_name'] ?? 'N/A'); ?></td>
                        <td class="actions">
                            <a href="?action=edit&id=<?php echo $theory_item['id']; ?>">Sửa & Gán biến</a>
                            <a href="?action=delete&id=<?php echo $theory_item['id']; ?>" class="delete-link">Xóa</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // --- LOGIC CHO DROPDOWN PHỤ THUỘC ---
    const groupsByDomain = <?php echo json_encode($groups_by_domain, JSON_NUMERIC_CHECK); ?>;
    const currentEditData = <?php echo json_encode($edit_theory, JSON_NUMERIC_CHECK); ?> || {};

    const domainSelect = document.getElementById('domain_id');
    const groupSelect = document.getElementById('group_id');
    const newDomainInput = document.querySelector('input[name="new_domain_name"]');
    const newGroupInput = document.querySelector('input[name="new_group_name"]');

    function updateGroupOptions() {
        const selectedDomainId = domainSelect.value;
        
        groupSelect.innerHTML = '<option value="">-- Chọn một nhóm --</option>';
        newGroupInput.style.display = 'none';
        groupSelect.value = '';

        if (selectedDomainId && selectedDomainId !== 'add_new') {
            const groups = groupsByDomain[selectedDomainId] || [];
            groups.forEach(group => {
                const option = new Option(group.name, group.id);
                groupSelect.add(option);
            });
            groupSelect.disabled = false;
        } else {
            groupSelect.innerHTML = '<option value="">-- Vui lòng chọn Lĩnh vực trước --</option>';
            groupSelect.disabled = true;
        }
        groupSelect.add(new Option('-- Thêm nhóm mới cho lĩnh vực này --', 'add_new'));
    }

    domainSelect.addEventListener('change', function() {
        newDomainInput.style.display = (this.value === 'add_new') ? 'block' : 'none';
        if (this.value === 'add_new') newDomainInput.focus();
        updateGroupOptions();
    });

    groupSelect.addEventListener('change', function() {
        newGroupInput.style.display = (this.value === 'add_new') ? 'block' : 'none';
        if (this.value === 'add_new') newGroupInput.focus();
    });

    // Khởi tạo giá trị cho dropdown khi ở chế độ sửa
    if (currentEditData.domain_id) {
        domainSelect.value = currentEditData.domain_id;
        updateGroupOptions();
        if (currentEditData.group_id) {
            groupSelect.value = currentEditData.group_id;
        }
    }

    // --- LOGIC CHO REPEATER FIELD ---
    const repeaterContainer = document.getElementById('constructs-repeater-container');
    if (repeaterContainer) {
        document.getElementById('btn-add-construct').addEventListener('click', function() {
            const newRow = document.createElement('div');
            newRow.className = 'repeater-row';
            newRow.innerHTML = `<div class="form-group"><input type="text" name="construct_name[]" class="form-control" placeholder="Tên biến"></div><div class="form-group"><textarea name="construct_desc[]" class="form-control" rows="1" placeholder="Mô tả biến"></textarea></div><button type="button" class="btn-remove-row">X</button>`;
            repeaterContainer.appendChild(newRow);
        });

        repeaterContainer.addEventListener('click', function(event) {
            if (event.target && event.target.classList.contains('btn-remove-row')) {
                if (repeaterContainer.querySelectorAll('.repeater-row').length > 1) {
                    event.target.closest('.repeater-row').remove();
                } else {
                    alert('Phải có ít nhất một biến.');
                }
            }
        });
    }

    // --- LOGIC XÁC NHẬN XÓA ---
    const deleteLinks = document.querySelectorAll('.delete-link');
    deleteLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            if (confirm('Bạn có chắc chắn muốn xóa lý thuyết này không? Hành động này không thể hoàn tác.')) {
                window.location.href = this.href;
            }
        });
    });
});
</script>