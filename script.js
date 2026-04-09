let currentStream = null;

// Online Models Path (CDN) - GitHub-la error varathu
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const moodThemes = {
    happy: { emoji: '😊', label: 'EUPHORIC', color: '#FFD700' },
    sad: { emoji: '😢', label: 'MELANCHOLIC', color: '#00f2ff' },
    angry: { emoji: '🔥', label: 'VOLATILE', color: '#ff4444' },
    surprised: { emoji: '😲', label: 'ASTONISHED', color: '#ff00ff' },
    neutral: { emoji: '😐', label: 'STABILIZED', color: '#ffffff' }
};

// Initialize Models
async function loadNeuralEngine() {
    const status = document.getElementById('status-indicator');
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        status.style.background = '#00ff88';
        status.style.boxShadow = '0 0 10px #00ff88';
        document.getElementById('cam-status').innerText = "Neural Models Online";
    } catch (e) {
        console.error(e);
        document.getElementById('cam-status').innerText = "Model Load Failed!";
    }
}
loadNeuralEngine();

function navigate(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    if (screenId === 'camera-screen') startCamera();
}

async function startCamera() {
    const video = document.getElementById('video');
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        video.srcObject = currentStream;
    } catch (err) {
        alert("Camera access denied!");
    }
}

async function captureAndAnalyze() {
    const video = document.getElementById('video');
    const btn = document.getElementById('snap-btn');
    btn.innerText = "EXTRACTING...";
    
    // AI Capture
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
    
    if (detections) {
        const emotions = detections.expressions;
        const topMood = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
        displayReport(topMood, emotions);
    } else {
        alert("Face not detected! Alignment check pannunga.");
        btn.innerText = "ANALYZE AURA";
    }
}

function displayReport(mood, stats) {
    stopVideo();
    navigate('result-screen');
    const theme = moodThemes[mood] || moodThemes['neutral'];
    
    document.getElementById('main-emoji').innerText = theme.emoji;
    document.getElementById('mood-label').innerText = theme.label;
    document.getElementById('mood-label').style.color = theme.color;
    document.getElementById('aura-ring').style.borderColor = theme.color;
    document.getElementById('aura-ring').style.boxShadow = `0 0 30px ${theme.color}`;

    // Stats Breakdown
    const panel = document.getElementById('emotion-stats');
    panel.innerHTML = '';
    Object.entries(stats).sort((a,b) => b[1]-a[1]).slice(0, 4).forEach(([emo, val]) => {
        panel.innerHTML += `<div style="font-size:0.7rem; margin-bottom:5px; opacity:0.7;">
            ${emo.toUpperCase()}: ${Math.round(val*100)}%
        </div>`;
    });
}

function stopVideo() {
    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
}

function analyzeText() {
    const text = document.getElementById('mood-text').value.toLowerCase();
    let mood = "neutral";
    if (text.includes("happy") || text.includes("nalla")) mood = "happy";
    if (text.includes("sad") || text.includes("sogam")) mood = "sad";
    displayReport(mood, { [mood]: 1 });
}
