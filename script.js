let allData = {};
let currentQuizzes = [];

// Tải dữ liệu JSON từ thư mục data
fetch('data/quiz_data.json')
    .then(res => res.json())
    .then(data => {
        allData = data;
        const select = document.getElementById('dateSelect');
        select.innerHTML = '<option value="">-- Chọn ngày học --</option>';
        
        // Lấy danh sách các ngày và sắp xếp mới nhất lên đầu
        Object.keys(data).reverse().forEach(date => {
            const opt = document.createElement('option');
            opt.value = date;
            opt.textContent = "Ngày " + date;
            select.appendChild(opt);
        });
    });

document.getElementById('dateSelect').onchange = function() {
    const date = this.value;
    if(!date) return;
    renderQuiz(allData[date]);
};

function renderQuiz(data) {
    currentQuizzes = data;
    let html = "";
    data.forEach((item, idx) => {
        html += `
            <div class="card">
                <div class="hanzi-title">${item.hanzi}</div>
                <div class="quiz-block">
                    <p><b>Câu 1: ${item.q1.question}</b></p>
                    ${item.q1.options.map(o => `<label class="opt"><input type="radio" name="q1_${idx}" value="${o.substring(0,1)}"> ${o}</label>`).join('')}
                    <div id="fb1_${idx}" class="feedback"></div>
                </div>
                <div class="quiz-block">
                    <p><b>Câu 2: ${item.q2.question}</b></p>
                    ${item.q2.options.map(o => `<label class="opt"><input type="radio" name="q2_${idx}" value="${o.substring(0,1)}"> ${o}</label>`).join('')}
                    <div id="fb2_${idx}" class="feedback"></div>
                </div>
            </div>`;
    });
    document.getElementById('mainContent').innerHTML = html;
    document.getElementById('actionArea').style.display = "block";
}

function checkAnswers() {
    currentQuizzes.forEach((item, idx) => {
        ['q1', 'q2'].forEach(qKey => {
            const selected = document.querySelector(`input[name="${qKey}_${idx}"]:checked`);
            const fb = document.getElementById(`fb${qKey.slice(1)}_${idx}`);
            const isCorrect = selected && selected.value === item[qKey].answer;
            
            fb.innerHTML = (isCorrect ? "✅ " : "❌ ") + item[qKey].explanation;
            fb.className = "feedback " + (isCorrect ? "correct" : "wrong");
            fb.style.display = "block";
        });
    });
}