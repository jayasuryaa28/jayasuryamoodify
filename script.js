/**
 * MOODIFY ELITE - NEURAL EMOTION AI CORE
 * Advanced Facial Expression Analysis & Semantic Sentiment Tracking
 */

// Global Configuration
const CONFIG = {
    MODEL_PATH: './models',
    DETECTION_INTERVAL: 1000,
    ANIMATION_SPEED: 600,
    EMOTION_THEMES: {
        happy: { emoji: '👑', label: 'EUPHORIC', color: '#D4AF37', advice: 'Your neural output is at peak positivity. Harness this energy.' },
        sad: { emoji: '💎', label: 'MELANCHOLIC', color: '#2575fc', advice: 'Emotional depth detected. Allow time for neural recalibration.' },
        angry: { emoji: '🔥', label: 'VOLATILE', color: '#ff4b2b', advice: 'High intensity detected. Implement rhythmic breathing protocols.' },
        fearful: { emoji: '🌀', label: 'FRAGILE', color: '#8e44ad', advice: 'System alert: Anxiety spikes detected. Focus on present reality.' },
        disgusted: { emoji: '🤢', label: 'AVERSIVE', color: '#27ae60', advice: 'Sensory rejection detected. Neutralize environment factors.' },
        surprised: { emoji: '⚡', label: 'ASTONISHED', color: '#f1c40f', advice: 'Rapid neural stimulus recorded. Processing new data streams.' },
        neutral: { emoji: '⚜️', label: 'STABILIZED', color: '#ffffff', advice: 'System balanced. Ideal state for focused cognition.' },
        contempt: { emoji: '😏', label: 'CYNICAL', color: '#e67e22', advice: 'Skeptical neural patterns found. Verify external inputs.' }
    }
};

let neuralEngine = {
    stream: null,
    chart: null,
    history: JSON.parse(localStorage.getItem('elite_logs') || '[]'),
    isModelsLoaded: false
};

/**
 * INITIALIZATION: Neural Link
 */
window.addEventListener('DOMContentLoaded', () => {
    initializeNeuralEngine();
});

async function initializeNeuralEngine() {
    console.log("%c MOODIFY ELITE INITIALIZING... ", "background: #000; color: #00f2ff; font-weight: bold;");
    
    try {
        // Load Neural Models from local directory
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(CONFIG.MODEL_PATH),
            faceapi.nets.faceExpressionNet.loadFromUri(CONFIG.MODEL_PATH)
        ]);
        
        neuralEngine.isModelsLoaded = true;
        updateStatus("NEURAL LINK ESTABLISHED");
        console.log("Models status: %c READY ", "color: green;");
    } catch (error) {
        updateStatus("NEURAL LINK FAILURE");
        console.error("Critical Model Load Error:", error);
    }
}

/**
 * NAVIGATION SYSTEM
 */
function navigate(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    
    const target = document.getElementById(screenId);
    target.classList.add('active');
    
    if (screenId === 'camera-screen') {
        startBiometricCapture();
    } else if (screenId !== 'camera-screen' && neuralEngine.stream) {
        stopBiometricCapture();
    }
}

/**
 * BIOMETRIC SYSTEM (Vision Scan)
 */
async function startBiometricCapture() {
    const video = document.getElementById('video');
    const statusText = document.getElementById('cam-status');
    
    statusText.innerText = "ACCESSING VISION HARDWARE...";
    
    try {
        const constraints = {
            video: {
                facingMode: 'user',
                width: { ideal: 720 },
                height: { ideal: 720 }
            }
        };
        
        neuralEngine.stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = neuralEngine.stream;
        statusText.innerText = "READY FOR CAPTURE";
        
    } catch (err) {
        statusText.innerText = "VISION ACCESS DENIED";
        console.error("Camera Hardware Error:", err);
    }
}

function stopBiometricCapture() {
    if (neuralEngine.stream) {
        neuralEngine.stream.getTracks().forEach(track => track.stop());
        neuralEngine.stream = null;
    }
}

/**
 * DIAGNOSTIC LOGIC (The Snapshot Process)
 */
async function captureAndAnalyze() {
    if (!neuralEngine.isModelsLoaded) return alert("System still loading...");
    
    const video = document.getElementById('video');
    const snapBtn = document.getElementById('snap-btn');
    const statusText = document.getElementById('cam-status');
    
    // UI Feedback
    snapBtn.disabled = true;
    snapBtn.style.opacity = "0.5";
    statusText.innerText = "EXTRACTING NEURAL DATA...";

    // 1. Perform Neural Analysis
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                                    .withFaceExpressions();

    if (detections) {
        processDiagnosticResult(detections.expressions);
    } else {
        alert("BIOMETRIC ERROR: Face not detected. Ensure proper lighting and alignment.");
        snapBtn.disabled = false;
        snapBtn.style.opacity = "1";
        statusText.innerText = "RETRY SCAN";
    }
}

/**
 * CORE ANALYSIS: Processing Emotions
 */
function processDiagnosticResult(expressions) {
    // Determine primary emotion
    const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
    const primaryMood = sorted[0][0];
    
    // Log to memory
    const entry = {
        mood: primaryMood,
        confidence: (sorted[0][1] * 100).toFixed(1),
        timestamp: new Date().toISOString(),
        details: expressions
    };
    
    neuralEngine.history.push(entry);
    localStorage.setItem('elite_logs', JSON.stringify(neuralEngine.history));
    
    // Update Result UI
    renderResultDashboard(primaryMood, expressions);
}

function renderResultDashboard(mood, allEmotions) {
    navigate('result-screen');
    
    const theme = CONFIG.EMOTION_THEMES[mood] || CONFIG.EMOTION_THEMES['neutral'];
    
    // Update Main Display
    document.getElementById('main-emoji').innerText = theme.emoji;
    const moodLabel = document.getElementById('mood-label');
    moodLabel.innerText = theme.label;
    moodLabel.style.color = theme.color;
    document.getElementById('aura-effect').style.borderColor = theme.color;
    document.getElementById('mood-advice').innerText = theme.advice;
    
    // Render Detailed Stats Breakdown
    const statsContainer = document.getElementById('stats-container');
    statsContainer.innerHTML = '';
    
    // Show Top 5 Emotions
    const sortedEmotions = Object.entries(allEmotions).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    sortedEmotions.forEach(([emo, val]) => {
        const percentage = Math.round(val * 100);
        const row = document.createElement('div');
        row.className = 'stat-row';
        row.innerHTML = `
            <div class="stat-info">
                <span>${emo.toUpperCase()}</span>
                <span>${percentage}%</span>
            </div>
            <div class="stat-bar-outer">
                <div class="stat-bar-inner" style="width: ${percentage}%; background: ${CONFIG.EMOTION_THEMES[emo]?.color || '#fff'}"></div>
            </div>
        `;
        statsContainer.appendChild(row);
    });
}

/**
 * SEMANTIC ENGINE (Text)
 */
function analyzeText() {
    const input = document.getElementById('mood-text').value.toLowerCase();
    if (input.length < 5) return alert("Insufficient data for semantic extraction.");
    
    const keywords = {
        happy: ['good', 'great', 'awesome', 'happy', 'jolly', 'nalla', 'super', 'love'],
        sad: ['bad', 'worst', 'sad', 'cry', 'sogam', 'alone', 'hurt'],
        angry: ['kovam', 'hate', 'kill', 'angry', 'mad', 'shout'],
        fearful: ['scared', 'afraid', 'fear', 'bayama'],
        surprised: ['wow', 'what', 'shock', 'surprise']
    };
    
    let scores = { happy: 0, sad: 0, angry: 0, fearful: 0, surprised: 0, neutral: 0.1 };
    
    const words = input.split(/\W+/);
    words.forEach(w => {
        for (let mood in keywords) {
            if (keywords[mood].includes(w)) scores[mood]++;
        }
    });
    
    const primary = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    // Fake distribution for visual report
    const fakeDist = { ...scores };
    const sum = Object.values(fakeDist).reduce((a,b)=>a+b);
    for(let k in fakeDist) fakeDist[k] = (fakeDist[k] / sum).toFixed(2);
    
    processDiagnosticResult(fakeDist);
}

/**
 * ANALYTICS SYSTEM (History)
 */
function loadHistory() {
    navigate('history-screen');
    const logs = neuralEngine.history.slice(-10).reverse(); // Last 10
    
    const logList = document.getElementById('history-logs');
    logList.innerHTML = '';
    
    // Populate Chart
    renderAnalyticsChart();
    
    // Populate List
    logs.forEach(item => {
        const logItem = document.createElement('div');
        logItem.style.cssText = "padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; font-size: 0.7rem;";
        logItem.innerHTML = `
            <span>${item.mood.toUpperCase()} (${item.confidence}%)</span>
            <span style="opacity: 0.5;">${new Date(item.timestamp).toLocaleTimeString()}</span>
        `;
        logList.appendChild(logItem);
    });
}

function renderAnalyticsChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    if (neuralEngine.chart) neuralEngine.chart.destroy();
    
    const counts = { happy: 0, sad: 0, angry: 0, neutral: 0, surprised: 0, fearful: 0, contempt: 0, disgusted: 0 };
    neuralEngine.history.forEach(h => counts[h.mood]++);
    
    neuralEngine.chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Happy', 'Sad', 'Angry', 'Surprised', 'Fear', 'Neutral'],
            datasets: [{
                label: 'NEURAL FREQUENCY',
                data: [counts.happy, counts.sad, counts.angry, counts.surprised, counts.fearful, counts.neutral],
                borderColor: '#00f2ff',
                backgroundColor: 'rgba(0, 242, 255, 0.2)',
                pointBackgroundColor: '#fff'
            }]
        },
        options: {
            scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, angleLines: { color: 'rgba(255,255,255,0.1)' }, ticks: { display: false } } },
            plugins: { legend: { labels: { color: '#fff', font: { size: 10 } } } }
        }
    });
}

/**
 * UTILS
 */
function updateStatus(msg) {
    document.getElementById('ping-status').innerText = msg;
}
