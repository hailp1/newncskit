document.addEventListener('DOMContentLoaded', () => {
    let database = {};
    let currentModelVariables = new Set();
    let baseModelVariables = [];

    // --- DOM ELEMENTS ---
    const modelSelector = document.getElementById('model-selector');
    const contextContainer = document.getElementById('context-container');
    const contextFieldsContainer = document.getElementById('context-fields');
    const modelBuilderContainer = document.getElementById('model-builder-container');
    const canvasList = document.getElementById('model-canvas-list');
    const questionsContainer = document.getElementById('questions-container');
    const questionsTableBody = document.getElementById('questions-table-body');

    // --- INITIALIZATION ---
    // Biến API_INSTRUMENT_URL được lấy từ thẻ <script> trong file HTML/PHP của bạn
    fetch(API_INSTRUMENT_URL)
        .then(response => response.json())
        .then(data => {
            database = data;
            initializeUI();
            
            // ======================================================================
            // PHẦN NÂNG CẤP: TỰ ĐỘNG CHỌN MÔ HÌNH TỪ URL
            // ======================================================================
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const baseModelId = urlParams.get('base_model_id');
    
                if (baseModelId && modelSelector) {
                    // Đặt giá trị cho dropdown
                    modelSelector.value = baseModelId;
                    
                    // Quan trọng: Kích hoạt sự kiện "change" một cách nhân tạo
                    // để hệ thống tải dữ liệu như thể người dùng vừa tự tay chọn.
                    modelSelector.dispatchEvent(new Event('change'));
                }
            } catch(e) {
                console.error("Lỗi khi tự động chọn mô hình:", e);
            }
            // ======================================================================

        })
        .catch(error => console.error('Error loading database:', error));

    function initializeUI() {
        if (database.models && Array.isArray(database.models)) {
            database.models.forEach(model => modelSelector.add(new Option(model.name, model.id)));
        }
        modelSelector.addEventListener('change', initializeModelBuilder);
        document.getElementById('add-variable-btn').onclick = showVariableLibrary;
        document.getElementById('export-excel-btn').onclick = exportToExcel;
    }
    
    // --- CORE LOGIC ---
    function initializeModelBuilder() {
        const modelId = parseInt(this.value);
        if (!modelId) {
            [contextContainer, modelBuilderContainer, questionsContainer].forEach(c => c.style.display = 'none');
            return;
        }
        const selectedModel = database.models.find(m => m.id === modelId);
        if (!selectedModel) return;

        baseModelVariables = [...selectedModel.variables];
        currentModelVariables = new Set(baseModelVariables);
        
        modelBuilderContainer.style.display = 'block';
        updateModelCanvas();
    }

    function updateModelCanvas() {
        canvasList.innerHTML = '';
        const allPossibleVars = [...new Set([...baseModelVariables, ...currentModelVariables])];

        allPossibleVars.forEach(varId => {
            const variable = database.variables.find(v => v.id === varId);
            if (!variable) return;

            const sourceModel = database.models.find(m => m.variables.includes(varId));
            const li = document.createElement('li');
            li.className = 'canvas-item';
            
            li.innerHTML = `
                <input type="checkbox" id="canvas-var-${varId}" value="${varId}" ${currentModelVariables.has(varId) ? 'checked' : ''}>
                <label for="canvas-var-${varId}">${variable.name} (${variable.acronym})</label>
                <span class="source">Từ: ${sourceModel ? sourceModel.acronym : 'N/A'}</span>`;
            
            li.querySelector('input').addEventListener('change', (e) => {
                const id = parseInt(e.target.value);
                e.target.checked ? currentModelVariables.add(id) : currentModelVariables.delete(id);
                renderContextFields();
                updateQuestionsDisplay();
            });
            canvasList.appendChild(li);
        });
        renderContextFields();
        updateQuestionsDisplay();
    }
    
    function renderContextFields() {
        const existingValues = new Map();
        contextFieldsContainer.querySelectorAll('input').forEach(input => {
            if (input.value.trim() !== '') {
                existingValues.set(input.dataset.placeholder, input.value);
            }
        });

        const placeholders = new Set();
        currentModelVariables.forEach(varId => {
            const itemsForVar = database.items.filter(item => item.variable_id === varId);
            itemsForVar.forEach(item => {
                const matches = item.text_vi.match(/\[(\w+)\]/g) || [];
                matches.forEach(match => placeholders.add(match.slice(1, -1)));
            });
        });

        contextFieldsContainer.innerHTML = '';
        if (placeholders.size > 0) {
            contextContainer.style.display = 'block';
            placeholders.forEach(ph => {
                const group = document.createElement('div');
                group.className = 'context-group';
                group.innerHTML = `
                    <label for="context-${ph}">Ngữ cảnh cho [${ph}]:</label>
                    <input type="text" id="context-${ph}" data-placeholder="${ph}" placeholder="Ví dụ: ${ph.toLowerCase() === 'product' ? 'sản phẩm A' : (ph.toLowerCase() === 'provider' ? 'công ty B' : '...')}" />`;
                
                const inputField = group.querySelector('input');

                if (existingValues.has(ph)) {
                    inputField.value = existingValues.get(ph);
                }
                
                inputField.addEventListener('input', updateQuestionsDisplay);
                contextFieldsContainer.appendChild(group);
            });
        } else {
            contextContainer.style.display = 'none';
        }
    }
    
    function updateQuestionsDisplay() {
        questionsTableBody.innerHTML = '';
        if (currentModelVariables.size === 0) {
            questionsContainer.style.display = 'none';
            return;
        }

        const replacements = new Map();
        contextFieldsContainer.querySelectorAll('input').forEach(input => {
            replacements.set(input.dataset.placeholder, input.value.trim());
        });

        currentModelVariables.forEach(varId => {
            const variable = database.variables.find(v => v.id === varId);
            if (!variable) return;
            
            const headerRow = questionsTableBody.insertRow();
            headerRow.className = 'variable-header';
            headerRow.innerHTML = `<td colspan="7">BIẾN: ${variable.name} (${variable.acronym})</td>`;

            const itemsForVar = database.items.filter(item => item.variable_id === varId);
            itemsForVar.forEach(item => {
                let finalQuestionText = item.text_vi;
                replacements.forEach((value, key) => {
                    const placeholder = `[${key}]`;
                    const replacementValue = value || placeholder;
                    finalQuestionText = finalQuestionText.replaceAll(placeholder, replacementValue);
                });

                const row = questionsTableBody.insertRow();
                row.innerHTML = `
                    <td>${item.code}</td><td>${finalQuestionText}</td>
                    ${[1,2,3,4,5].map(i => `<td class="likert-cell"><input type="radio" name="${item.code}" value="${i}"></td>`).join('')}`;
            });
        });
        questionsContainer.style.display = 'block';
    }

    function exportToExcel() {
        if (currentModelVariables.size === 0) {
            alert("Vui lòng chọn ít nhất một biến để xuất file.");
            return;
        }
        
        const replacements = new Map();
        contextFieldsContainer.querySelectorAll('input').forEach(input => {
            replacements.set(input.dataset.placeholder, input.value.trim() || `[${input.dataset.placeholder}]`);
        });

        const data = [["Variable", "Item_Code", "Question_Text", "Source_Citation"]];
        currentModelVariables.forEach(varId => {
            const variable = database.variables.find(v => v.id === varId);
            if (!variable) return;

            const itemsForVar = database.items.filter(item => item.variable_id === varId);
            itemsForVar.forEach(item => {
                let finalQuestionText = item.text_vi;
                replacements.forEach((value, key) => {
                    finalQuestionText = finalQuestionText.replaceAll(`[${key}]`, value);
                });
                data.push([ `${variable.name} (${variable.acronym})`, item.code, finalQuestionText, item.citation ]);
            });
        });
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [ { wch: 30 }, { wch: 15 }, { wch: 80 }, { wch: 30 } ];
        XLSX.utils.book_append_sheet(wb, ws, "Questionnaire");
        XLSX.writeFile(wb, "BangCauHoiNghienCuu.xlsx");
    }

    function showVariableLibrary() {
        let modal = document.getElementById('variable-library-modal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'variable-library-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Thêm biến từ các lý thuyết khác</h2><span class="close-btn">&times;</span>
                </div>
                <div class="modal-body">
                    <p><strong>Bước 1:</strong> Chọn mô hình/lý thuyết bạn muốn tham khảo.</p>
                    <select id="source-model-selector">
                        <option value="">-- Chọn một mô hình --</option>
                        ${database.models.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                    </select>
                    <p><strong>Bước 2:</strong> Chọn các biến cần thêm.</p>
                    <div id="source-variable-list" style="max-height: 250px; overflow-y: auto; border: 1px solid #eee; padding: 10px;"></div>
                </div>
                <button id="confirm-add-btn" class="btn">Cập nhật mô hình</button>
            </div>`;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        const sourceModelSelector = modal.querySelector('#source-model-selector');
        sourceModelSelector.addEventListener('change', (e) => {
            const sourceVariableList = modal.querySelector('#source-variable-list');
            sourceVariableList.innerHTML = '';
            const modelId = parseInt(e.target.value);
            if (!modelId) return;

            const model = database.models.find(m => m.id === modelId);
            if (!model) return;

            model.variables.forEach(varId => {
                const variable = database.variables.find(v => v.id === varId);
                if (!variable) return;
                
                sourceVariableList.innerHTML += `
                    <div><input type="checkbox" id="lib-var-${varId}" value="${varId}" ${currentModelVariables.has(varId) ? 'checked' : ''}>
                    <label for="lib-var-${varId}">${variable.name} (${variable.acronym})</label></div>`;
            });
        });

        modal.querySelector('.close-btn').onclick = () => modal.remove();
        modal.querySelector('#confirm-add-btn').onclick = () => {
            modal.querySelectorAll('#source-variable-list input:checked').forEach(cb => {
                currentModelVariables.add(parseInt(cb.value));
            });
            updateModelCanvas();
            modal.remove();
        };
    }
});