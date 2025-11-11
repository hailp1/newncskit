$(document).ready(function() {
    // --- MODAL HANDLING ---
    const modal = document.getElementById("detailsModal");
    const closeButton = document.querySelector(".close-button");

    if (modal && closeButton) {
        closeButton.onclick = () => modal.style.display = "none";
        window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };
        window.onkeydown = (event) => { if (event.key === "Escape") modal.style.display = "none"; };
    }

    $('#copyCitationBtn').on('click', function() {
        const citationText = $('#modal-citation').text();
        navigator.clipboard.writeText(citationText).then(() => {
            $(this).text('Đã sao chép!');
            setTimeout(() => $(this).text('Sao chép'), 2000);
        });
    });

    // --- DATA TABLE INITIALIZATION ---
    // Biến API_GET_THEORIES_URL được lấy từ thẻ <script> trong file HTML/PHP của bạn
    const table = $('#theoriesTable').DataTable({
        "ajax": {
            "url": API_GET_THEORIES_URL, 
            "dataSrc": "theories" 
        },
        "responsive": true,
        "pageLength": 15,
        "language": { "search": "Tìm kiếm nhanh:", "lengthMenu": "Hiển thị _MENU_ mục", "info": "Hiển thị từ _START_ đến _END_ của _TOTAL_ mục", "infoEmpty": "Không có dữ liệu", "infoFiltered": "(lọc từ _MAX_ mục)", "paginate": { "next": "Tiếp", "previous": "Trước" }, "processing": "Đang tải...", "zeroRecords": "Không tìm thấy kết quả phù hợp" },
        "columns": [
            { "data": "theory", "className": "all" },
            { "data": null, "className": "all", "orderable": false },
            { "data": "note_vi", "className": "desktop" },
            { "data": "group", "className": "min-tablet" },
            { "data": "domain", "className": "min-tablet" },
            { "data": "dependent_variable", "className": "desktop" },
            { "data": "reference", "className": "desktop" },
            { "data": "application_vi", "className": "none" }
        ],
        "columnDefs": [
            { "targets": 1, "render": (data, type, row) => `<div class="variable-cell">${row.constructs_full ? row.constructs_full.split(';').join('; ') : ''}<hr><b>${row.constructs_code || ''}</b></div>` },
            { "targets": 6, "render": (data, type, row) => createScholarLink(row.reference) }
        ],
        "initComplete": function(settings, json) {
            if(json) {
                populateFilters(json);
            }
        }
    });

    // --- FILTERING LOGIC ---
    function populateFilters(apiResponse) {
        const groupSelect = $('#groupFilter');
        const domainSelect = $('#domainFilter');

        groupSelect.find('option:not(:first)').remove();
        domainSelect.find('option:not(:first)').remove();

        if (apiResponse.all_domains && apiResponse.all_domains.length > 0) {
            apiResponse.all_domains.forEach(d => {
                if (d) domainSelect.append(`<option value="${d}">${d}</option>`);
            });
        }
        
        if (apiResponse.all_groups && apiResponse.all_groups.length > 0) {
            apiResponse.all_groups.forEach(g => {
                if (g) groupSelect.append(`<option value="${g}">${g}</option>`);
            });
        }
    }

    $('#groupFilter').on('change', function() { table.column(3).search(this.value ? `^${$.fn.dataTable.util.escapeRegex(this.value)}$` : '', true, false).draw(); });
    $('#domainFilter').on('change', function() { table.column(4).search(this.value ? `^${$.fn.dataTable.util.escapeRegex(this.value)}$` : '', true, false).draw(); });
    $('#resetFilters').on('click', function() { $('#groupFilter, #domainFilter').val(''); table.search('').columns().search('').draw(); });

    // --- MODAL POPULATION ---
    $('#theoriesTable tbody').on('click', 'tr', function() {
        if ($(this).hasClass('odd') || $(this).hasClass('even')) {
            const data = table.row(this).data();
            if (data && modal) {
                populateModal(data);
                modal.style.display = "block";
            }
        }
    });

    function populateModal(data) {
        $('#copyCitationBtn').text('Sao chép');
        $('#modal-title').text(data.theory || "Chưa có tiêu đề");
        $('#modal-definition').html(data.definition_long || "<em>Chưa có thông tin chi tiết.</em>");
        const constructsList = $('#modal-constructs');
        constructsList.empty();
        if (data.constructs_detailed && Array.isArray(data.constructs_detailed) && data.constructs_detailed.length > 0) {
            data.constructs_detailed.forEach(item => { constructsList.append(`<li><strong>${item.name || ''}:</strong> ${item.desc || ''}</li>`); });
        } else {
            constructsList.append("<li><em>Chưa có thông tin chi tiết về các biến.</em></li>");
        }
        const scalesList = $('#modal-scales');
        scalesList.empty();
        if (data.sample_scales && Array.isArray(data.sample_scales) && data.sample_scales.length > 0) {
            data.sample_scales.forEach(item => { scalesList.append(`<li>"${item}"</li>`); });
        } else {
            scalesList.append("<li><em>Chưa có thang đo mẫu.</em></li>");
        }
        $('#modal-related').text((data.related_theories && data.related_theories.join(', ')) || "Chưa có thông tin.");
        $('#modal-limitations').text(data.limitations || "Chưa có thông tin.");
        $('#modal-citation').text(generateAPACitation(data));
        
        // ======================================================================
        // PHẦN NÂNG CẤP: THÊM NÚT "SỬ DỤNG MÔ HÌNH"
        // ======================================================================
        // Xóa nút cũ đi để tránh tạo ra nhiều nút khi mở modal nhiều lần
        $('#useModelBtn').remove(); 
    
        // Tạo URL động, trỏ đến trang builder và truyền ID của lý thuyết qua URL
        // Lưu ý: BASE_URL nên được định nghĩa trong file HTML/PHP của bạn
        // ví dụ: <script>const BASE_URL = "<?php echo BASE_URL; ?>";</script>
        const builderUrl = `${BASE_URL}index.php/instrument/builder?base_model_id=${data.id}`;
        
        const useModelButton = `
            <a href="${builderUrl}" id="useModelBtn" class="btn-admin" style="margin-top: 20px; background-color: #28a745;">
                <span class="material-symbols-outlined">construction</span>
                Sử dụng mô hình này để tạo bảng hỏi
            </a>`;
    
        // Thêm nút vào cuối phần body của modal
        $('.modal-body').append(useModelButton);
        // ======================================================================
    }

    // --- HELPER FUNCTIONS ---
    function createScholarLink(refText) { if (!refText) return 'Chưa có thông tin'; const match = refText.match(/(.+?)\s*\((\d{4})\)/); let query, fullQuery; if (match) { query = match[1].trim(); const year = match[2]; fullQuery = encodeURIComponent(`${query} ${year}`); } else { fullQuery = encodeURIComponent(refText.trim()); } return `<a href="https://scholar.google.com/scholar?q=${fullQuery}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${refText}</a>`; }
    function generateAPACitation(data) { if (!data || !data.reference) return "Không thể tạo trích dẫn."; const refParts = data.reference.match(/(.+?)\s*\((\d{4})\)/); if (!refParts) return "Định dạng tham khảo không hợp lệ."; const authors = refParts[1].replace(/\s*et al\./, '').trim(); const year = refParts[2]; const title = data.theory; return `${authors}. (${year}). ${title}. Trong *Công cụ tra cứu Lý thuyết Marketing & Quản trị*. NCSKIT. Truy xuất từ https://ncskit.org`; }
});