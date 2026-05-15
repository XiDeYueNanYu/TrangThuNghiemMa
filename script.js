/**
 * DỰ ÁN HÁN TỰ QUIZ PRO - FRONTEND LOGIC
 * Chức năng: Tải dữ liệu từ GitHub, hiển thị trắc nghiệm và kiểm tra đáp án.
 */

let allData = {};
let currentQuizzes = [];

// 1. Khởi tạo và tải dữ liệu từ file JSON
async function loadInitialData() {
    const select = document.getElementById('dateSelect');
    const mainContent = document.getElementById('mainContent');

    try {
        console.log("🚀 Đang kết nối tới dữ liệu...");
        // Thêm tham số thời gian để tránh trình duyệt lấy file cũ (cache)
        const response = await fetch(`./data/quiz_data.json?v=${new Date().getTime()}`);
        
        if (!response.ok) {
            throw new Error(`Không thể tải file JSON (Mã lỗi: ${response.status})`);
        }
        
        allData = await response.json();
        console.log("✅ Dữ liệu đã nạp:", allData);

        const dates = Object.keys(allData);

        if (dates.length === 0) {
            select.innerHTML = '<option value="">Dữ liệu đang trống...</option>';
            mainContent.innerHTML = '<div class="welcome-msg">Hệ thống chưa có dữ liệu. Vui lòng kiểm tra Google Sheets.</div>';
            return;
        }

        // Sắp xếp ngày mới nhất lên đầu (Giả định định dạng dd/mm/yyyy)
        dates.sort((a, b) => {
            const partA = a.split('/');
            const partB = b.split('/');
            const dateA = new Date(partA[2], partA[1] - 1, partA[0]);
            const dateB = new Date(partB[2], partB[1] - 1, partB[0]);
            return dateB - dateA;
        });

        // Đổ danh sách ngày vào Dropdown
        select.innerHTML = '<option value="">-- Chọn ngày học --</option>';
        dates.forEach(date => {
            const opt = document.createElement('option');
            opt.value = date;
            opt.textContent = `Ngày ${date}`;
            select.appendChild(opt);
        });

        // Lắng nghe sự kiện người dùng chọn ngày
        select.addEventListener('change', function() {
            const selectedDate = this.value;
            if (selectedDate && allData[selectedDate]) {
                renderQuiz(allData[selectedDate]);
            } else {
                mainContent.innerHTML = '<div class="welcome-msg">Vui lòng chọn một ngày để bắt đầu ôn tập.</div>';
                document.getElementById('actionArea').style.display = "none";
            }
        });

    } catch (error) {
        console.error("❌ Lỗi hệ thống:", error);
        select.innerHTML = '<option value="">Lỗi tải dữ liệu!</option>';
        mainContent.innerHTML = `<div class="welcome-msg" style="color:red">Lỗi: ${error.message}</div>`;
    }
}

// 2. Hàm hỗ trợ xử lý dữ liệu JSON an toàn
function safeParse(input) {
    if (typeof input === 'object' && input !== null) return input;
    try {
        return JSON.parse(input);
    } catch (e) {
        console.warn("⚠️ Dữ liệu Quiz không đúng định dạng JSON:", input);
        return { question: "Lỗi định dạng câu hỏi", options: [], answer: "", explanation: "" };
    }
}

// 3. Hàm hiển thị danh sách câu hỏi ra màn hình
function renderQuiz(data) {
    currentQuizzes = data;
    const mainContent = document.getElementById('mainContent');
    let html = "";

    console.log("📝 Đang hiển thị bài học...");

    data.forEach((item, idx) => {
        const q1 = safeParse(item.q1);
        const q2 = safeParse(item.q2);

        html += `
            <div class="card animate-in">
                <div class="hanzi-title">${item.hanzi || '无'}</div>
                
                <!-- Câu hỏi 1 -->
                <div class="quiz-block">
                    <p><b>Câu 1: ${q1.question}</b></p>
                    <div class="options-container">
                        ${(q1.options || []).map(o => `
                            <label class="opt">
                                <input type="radio" name="q1_${idx}" value="${o.substring(0,1).toUpperCase()}"> 
                                <span>${o}</span>
                            </label>`).join('')}
                    </div>
                    <div id="fb1_${idx}" class="feedback"></div>
                </div>

                <!-- Câu hỏi 2 -->
                <div class="quiz-block">
                    <p><b>Câu 2: ${q2.question}</b></p>
                    <div class="options-container">
                        ${(q2.options || []).map(o => `
                            <label class="opt">
                                <input type="radio" name="q2_${idx}" value="${o.substring(0,1).toUpperCase()}"> 
                                <span>${o}</span>
                            </label>`).join('')}
                    </div>
                    <div id="fb2_${idx}" class="feedback"></div>
                </div>
            </div>`;
    });

    mainContent.innerHTML = html;
    document.getElementById('actionArea').style.display = "block";
    
    // Hiệu ứng cuộn mượt xuống bài học
    window.scrollTo({ top: document.querySelector('.header-area').offsetHeight, behavior: 'smooth' });
}

// 4. Hàm kiểm tra đáp án và hiện giải thích
function checkAnswers() {
    currentQuizzes.forEach((item, idx) => {
        const quizData = [
            { key: 'q1', fbId: `fb1_${idx}`, name: `q1_${idx}` },
            { key: 'q2', fbId: `fb2_${idx}`, name: `q2_${idx}` }
        ];

        quizData.forEach(q => {
            const selected = document.querySelector(`input[name="${q.name}"]:checked`);
            const fb = document.getElementById(q.fbId);
            const quizInfo = safeParse(item[q.key]);

            if (!selected) {
                fb.innerHTML = `⚠️ Vui lòng chọn đáp án!`;
                fb.className = "feedback wrong";
                fb.style.display = "block";
                return;
            }

            const isCorrect = selected.value === quizInfo.answer.toUpperCase();
            
            if (isCorrect) {
                fb.innerHTML = `✅ <b>Đúng rồi!</b><br>${quizInfo.explanation}`;
                fb.className = "feedback correct";
            } else {
                fb.innerHTML = `❌ <b>Chưa chính xác.</b> Đáp án đúng là <b>${quizInfo.answer}</b>.<br>${quizInfo.explanation}`;
                fb.className = "feedback wrong";
            }
            fb.style.display = "block";
        });
    });
    
    // Cuộn nhẹ để người dùng thấy kết quả nếu cần
    console.log("✅ Đã kiểm tra xong bài làm.");
}

// BẮT ĐẦU CHẠY
loadInitialData();