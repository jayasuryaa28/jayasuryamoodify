let currentStream = null;
let chartInstance = null;

const moodData = {
    happy: { emoji: '👑', quote: 'Radiating Pure Joy & Royalty.' },
    sad: { emoji: '💎', quote: 'A calm heart is a diamond in the rough.' },
    angry: { emoji: '🔥', quote: 'Harness the fire within, but stay cool.' },
    neutral: { emoji: '⚜️', quote: 'Balanced. Poised. Perfect.' }
};

function navigate(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    if (screenId === 'camera-screen') startVideo();
    else stopVideo();
}

// Load AI Neural Models
async function loadModels() {
    try {
        const path = './models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(path);
        await faceapi.nets.faceExpressionNet.loadFromUri(path);
        document.getElementById('cam-status').innerText = 'Neural Engine Ready';
    } catch (e) {
        document.getElementById('cam-status').innerText = 'System Offline';
    }
}
loadModels();

async function startVideo() {
    const video = document.getElementById('video');
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        video.srcObject = currentStream;
        
        let attempts = 0;
        const detector = setInterval(async () => {
            attempts++;
            const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
            
            if (detections || attempts > 8) { // Fast 4-5 sec scan
                let mood = "neutral";
                if (detections) {
                    mood = Object.keys(detections.expressions).reduce((a, b) => detections.expressions[a] > detections.expressions[b] ? a : b);
                }
                clearInterval(detector);
                showPremiumResult(mood);
            }
        }, 500);
    } catch (err) {
        alert("Camera Access Restricted");
    }
}

function stopVideo() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

function showPremiumResult(mood) {
    stopVideo();
    const result = moodData[mood] || moodData['neutral'];
    document.getElementById('detected-mood').innerText = result.emoji;
    document.getElementById('quote').innerText = result.quote;

    // Local Storage for History
    let history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    history.push({ mood, time: new Date().toLocaleTimeString() });
    localStorage.setItem('moodHistory', JSON.stringify(history));

    navigate('result-screen');
}

function analyzeText() {
    const text = document.getElementById('mood-text').value.toLowerCase();
    let mood = "neutral";
    if (text.length > 3) {
        if (text.includes("happy") || text.includes("great")) mood = "happy";
        else if (text.includes("sad") || text.includes("bad")) mood = "sad";
        showPremiumResult(mood);
    } else {
        alert("Speak more to the AI...");
    }
}

function loadHistory() {
    navigate('history-screen');
    const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    const ctx = document.getElementById('moodChart').getContext('2d');
    
    if (chartInstance) chartInstance.destroy();
    
    // Simple bar chart logic
    const counts = { happy: 0, sad: 0, angry: 0, neutral: 0 };
    history.forEach(h => counts[h.mood]++);

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Happy', 'Sad', 'Angry', 'Neutral'],
            datasets: [{
                data: [counts.happy, counts.sad, counts.angry, counts.neutral],
                backgroundColor: ['#FFD700', '#2575fc', '#ff4b2b', '#ffffff'],
                borderRadius: 10
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { grid: { display: false }, ticks: { color: '#fff' } }, x: { ticks: { color: '#fff' } } }
        }
    });
}
