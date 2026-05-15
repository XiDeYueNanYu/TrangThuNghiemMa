let allData = {};
let currentQuizzes = [];

// 1. Tải dữ liệu JSON từ GitHub Pages
async function loadInitialData() {
    try {
        const response = await fetch('data/quiz_data.json');
        if (!response.ok) throw new Error("Không thể tải file JSON");
        
        allData = await response.json();
        const select = document.getElementById('dateSelect');
        
        // Xóa thông báo đang tải
        select.innerHTML = '<option value="">-- Chọn ngày học --</option>';
        
        // Lấy danh sách ngày và sắp xếp (mới nhất lên đầu)
        const dates = Object.keys(allData).sort((a, b) => {
            // Chuyển dd/mm/yyyy thành yyyymmdd để so sánh
            const d1 = a.split('/').reverse().join('');
            const d2 = b.split('/').reverse().join('');
            return d2.localeCompare(d1);
        });

        dates.forEach(date => {
            const opt = document.createElement('option');
            opt.value = date;
            opt.textContent = "Ngày " + date;
            select.appendChild(opt);
        });

        // Lắng nghe sự kiện thay đổi ngày
        select.addEventListener('change', function() {
            const selectedDate = this.value;
            if (selectedDate && allData[selectedDate]) {
                renderQuiz(allData[selectedDate]);
            } else {
                document.getElementById('mainContent').innerHTML = '<div class="welcome-msg">Chọn một ngày để bắt đầu thử thách!</div>';
                document.getElementById('actionArea').style.display = "none";
            }
        });

    } catch (error) {
        console.error("Lỗi:", error);
        document.getElementById('dateSelect').innerHTML = '<option value="">Lỗi tải dữ liệu!</option>';
    }
}

// 2. Hàm hiển thị câu hỏi
function renderQuiz(data) {
    currentQuizzes = data;
    let html = "";

    data.forEach((item, idx) => {
        // Parse lại quiz nếu nó đang ở dạng chuỗi (đề phòng robot lưu chưa chuẩn)
        const q1 = typeof item.q1 === 'string' ? JSON.parse(item.q1) : item.q1;
        const q2 = typeof item.q2 === 'string' ? JSON.parse(item.q2) : item.q2;

        html += `
            <div class="card">
                <div class="hanzi-title">${item.hanzi}</div>
                
                <div class="quiz-block">
                    <p><b>Câu 1: ${q1.question}</b></p>
                    <div class="options-container">
                        ${q1.options.map(o => `
                            <label class="opt">
                                <input type="radio" name="q1_${idx}" value="${o.substring(0,1)}"> 
                                <span>${o}</span>
                            </label>`).join('')}
                    </div>
                    <div id="fb1_${idx}" class="feedback"></div>
                </div>

                <div class="quiz-block">
                    <p><b>Câu 2: ${q2.question}</b></p>
                    <div class="options-container">
                        ${q2.options.map(o => `
                            <label class="opt">
                                <input type="radio" name="q2_${idx}" value="${o.substring(0,1)}"> 
                                <span>${o}</span>
                            </label>`).join('')}
                    </div>
                    <div id="fb2_${idx}" class="feedback"></div>
                </div>
            </div>`;
    });

    document.getElementById('mainContent').innerHTML = html;
    document.getElementById('actionArea').style.display = "block";
    
    // Cuộn nhẹ xuống phần câu hỏi
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

// 3. Hàm kiểm tra đáp án
function checkAnswers() {
    currentQuizzes.forEach((item, idx) => {
        const qData = [
            { key: 'q1', fbId: `fb1_${idx}`, name: `q1_${idx}` },
            { key: 'q2', fbId: `fb2_${idx}`, name: `q2_${idx}` }
        ];

        qData.forEach(q => {
            const selected = document.querySelector(`input[name="${q.name}"]:checked`);
            const fb = document.getElementById(q.fbId);
            const quizItem = typeof item[q.key] === 'string' ? JSON.parse(item[q.key]) : item[q.key];

            if (selected && selected.value === quizItem.answer) {
                fb.innerHTML = `✅ <b>Đúng!</b> ${quizItem.explanation}`;
                fb.className = "feedback correct";
            } else {
                const userVal = selected ? selected.value : "Chưa chọn";
                fb.innerHTML = `❌ <b>Sai!</b> (Bạn chọn ${userVal}). Đáp án đúng là ${quizItem.answer}.<br>${quizItem.explanation}`;
                fb.className = "feedback wrong";
            }
            fb.style.display = "block";
        });
    });
}

// Chạy khởi tạo
loadInitialData();