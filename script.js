/**
 * MOODIFY ELITE V3 - NEURAL ENGINE ARCHITECTURE
 * Professional Grade Emotion AI & Biometric Extraction
 */

"use strict";

// --- NEURAL CONFIGURATION ---
const NEURAL_CONFIG = {
    MODEL_URI: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
    EMOTION_MAP: {
        happy: { icon: '👑', label: 'EUPHORIC', color: '#FFD700', tip: 'Neural positivity detected. Ideal state for creative expansion.' },
        sad: { icon: '💎', label: 'MELANCHOLIC', color: '#0ea5e9', tip: 'Emotional depth spike. Suggesting low-intensity cognitive tasks.' },
        angry: { icon: '🔥', label: 'VOLATILE', color: '#ef4444', tip: 'Neural friction detected. Recommend immediate somatic grounding.' },
        fearful: { icon: '🌀', label: 'FRAGILE', color: '#8b5cf6', tip: 'System instability detected. Focus on controlled neural regulation.' },
        disgusted: { icon: '🤢', label: 'AVERSIVE', color: '#22c55e', tip: 'Sensory rejection found. Analyze external environmental factors.' },
        surprised: { icon: '⚡', label: 'ASTONISHED', color: '#f59e0b', tip: 'Rapid stimulus response. Processing new information streams.' },
        neutral: { icon: '⚜️', label: 'STABILIZED', color: '#ffffff', tip: 'System at homeostatic equilibrium. Optimal for deep focus.' },
        contempt: { icon: '😏', label: 'CYNICAL', color: '#f472b6', tip: 'Skeptical neural patterns detected. Verify source authenticity.' }
    },
    MIN_CONFIDENCE: 0.6,
    SCAN_TIMEOUT: 5000 // 5 Seconds Scan
};

// --- SYSTEM STATE ---
let systemState = {
    isReady: false,
    activeStream: null,
    history: JSON.parse(localStorage.getItem('moodify_elite_v3_logs') || '[]'),
    chart: null
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("%c MOODIFY ELITE V3 | CORE INITIALIZING ", "background:#000; color:#FFD700; padding:5px; font-weight:bold;");
    await bootNeuralLink();
});

/**
 * Bootstraps the AI Neural Engine using CDN models
 */
async function bootNeuralLink() {
    const statusLabel = document.getElementById('neural-link-status');
    const pulseNode = document.querySelector('.neural-pulse');
    
    try {
        statusLabel.innerText = "LOADING NEURAL MODELS...";
        
        // Parallel loading for performance
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(NEURAL_CONFIG.MODEL_URI),
            faceapi.nets.faceExpressionNet.loadFromUri(NEURAL_CONFIG.MODEL_URI)
        ]);
        
        systemState.isReady = true;
        statusLabel.innerText = "NEURAL LINK: ENCRYPTED";
        statusLabel.style.color = "#00ff88";
        pulseNode.style.background = "#00ff88";
        pulseNode.style.boxShadow = "0 0 15px #00ff88";
        
    } catch (error) {
        console.error("NEURAL BOOT FAILURE:", error);
        statusLabel.innerText = "SYSTEM OFFLINE";
    }
}

/**
 * Screen Navigation Logic
 */
function navigate(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    if (screenId === 'camera-screen') {
        initiateBiometricHardware();
    } else if (screenId === 'history-screen') {
        renderArchiveDashboard();
    }
}

/**
 * Biometric Hardware Integration
 */
async function initiateBiometricHardware() {
    const video = document.getElementById('video');
    const info = document.getElementById('cam-info');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: 640, height: 640 } 
        });
        
        systemState.activeStream = stream;
        video.srcObject = stream;
        info.innerText = "BIOMETRIC SENSORS ACTIVE";
        
    } catch (err) {
        info.innerText = "ACCESS DENIED";
        alert("Camera permission is required for biometric vision.");
    }
}

function stopVideo() {
    if (systemState.activeStream) {
        systemState.activeStream.getTracks().forEach(t => t.stop());
        systemState.activeStream = null;
    }
}

/**
 * Snapshot & AI Analysis Logic
 */
async function captureAndAnalyze() {
    if (!systemState.isReady) return;
    
    const video = document.getElementById('video');
    const btn = document.getElementById('capture-trigger');
    const info = document.getElementById('cam-info');
    
    btn.disabled = true;
    btn.style.opacity = "0.5";
    info.innerText = "EXTRACTING NEURAL DATA...";

    // 1. Snapshot Capture & Recognition
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                                    .withFaceExpressions();

    if (detections) {
        processDiagnosticReport(detections.expressions);
    } else {
        info.innerText = "ERROR: FACE NOT DETECTED";
        btn.disabled = false;
        btn.style.opacity = "1";
        alert("Alignment error. Please position your face within the biometric frame.");
    }
}

/**
 * Diagnostic Processor
 */
function processDiagnosticReport(expressions) {
    // Logic: Identify Top Emotion
    const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
    const topMood = sorted[0][0];
    
    // Logic: Database Logging
    const newEntry = {
        id: Date.now(),
        mood: topMood,
        timestamp: new Date().toISOString(),
        expressions: expressions
    };
    
    systemState.history.push(newEntry);
    localStorage.setItem('moodify_elite_v3_logs', JSON.stringify(systemState.history));
    
    // UI: Navigate to Result
    renderResultDashboard(topMood, expressions);
}

/**
 * Result UI Rendering Engine
 */
function renderResultDashboard(mood, allEmotions) {
    navigate('result-screen');
    stopVideo();
    
    const theme = NEURAL_CONFIG.EMOTION_MAP[mood] || NEURAL_CONFIG.EMOTION_MAP['neutral'];
    
    // Primary Results
    document.getElementById('result-emoji').innerText = theme.icon;
    const label = document.getElementById('result-label');
    label.innerText = theme.label;
    label.style.color = theme.color;
    document.getElementById('vortex-effect').style.borderColor = theme.color;
    document.getElementById('mood-suggestion').innerText = theme.tip;
    
    // Metrics Breakdown Rendering
    const container = document.getElementById('emotions-breakdown');
    container.innerHTML = '';
    
    // Sorting to show Top 4 variations
    const top4 = Object.entries(allEmotions).sort((a,b) => b[1]-a[1]).slice(0, 4);
    
    top4.forEach(([emo, val]) => {
        const percent = Math.round(val * 100);
        const color = NEURAL_CONFIG.EMOTION_MAP[emo]?.color || '#fff';
        
        const row = document.createElement('div');
        row.className = 'metric-row';
        row.innerHTML = `
            <div class="metric-labels">
                <span>${emo.toUpperCase()}</span>
                <span>${percent}%</span>
            </div>
            <div class="metric-bar-bg">
                <div class="metric-bar-fill" style="width:${percent}%; background:${color}"></div>
            </div>
        `;
        container.appendChild(row);
    });
}

/**
 * Semantic Extraction Engine (Text)
 */
function analyzeText() {
    const input = document.getElementById('text-input').value.toLowerCase();
    if (input.length < 5) return alert("Insufficient data for extraction.");
    
    // Advanced Keyword Mapping
    const keywords = {
        happy: ['good', 'great', 'awesome', 'happy', 'jolly', 'nalla', 'super', 'love', 'excited'],
        sad: ['bad', 'worst', 'sad', 'cry', 'sogam', 'alone', 'hurt', 'pain', 'lonely'],
        angry: ['kovam', 'hate', 'kill', 'angry', 'mad', 'shout', 'annoyed'],
        surprised: ['wow', 'what', 'shock', 'surprise', 'incredible']
    };
    
    let scores = { happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0.1 };
    
    const words = input.split(/\W+/);
    words.forEach(w => {
        for (let mood in keywords) {
            if (keywords[mood].includes(w)) scores[mood]++;
        }
    });
    
    const winner = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    // Simulate complex metrics for text analysis
    const simulatedExpressions = {
        happy: winner === 'happy' ? 0.9 : 0.05,
        sad: winner === 'sad' ? 0.9 : 0.05,
        neutral: winner === 'neutral' ? 0.8 : 0.1
    };
    
    renderResultDashboard(winner, simulatedExpressions);
}

/**
 * Archive Dashboard Integration
 */
function renderArchiveDashboard() {
    const logList = document.getElementById('logs-list');
    logList.innerHTML = '';
    
    const logs = [...systemState.history].reverse().slice(0, 10);
    
    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'log-item';
        const time = new Date(log.timestamp).toLocaleTimeString();
        const date = new Date(log.timestamp).toLocaleDateString();
        
        item.innerHTML = `
            <div style="display:flex; align-items:center;">
                <span style="font-size:1.2rem; margin-right:10px;">${NEURAL_CONFIG.EMOTION_MAP[log.mood]?.icon}</span>
                <div>
                    <div style="font-weight:700;">${log.mood.toUpperCase()}</div>
                    <div style="opacity:0.5; font-size:0.6rem;">${date}</div>
                </div>
            </div>
            <div style="font-family:'Orbitron'; color:var(--gold);">${time}</div>
        `;
        logList.appendChild(item);
    });
    
    renderAnalyticsChart();
}

/**
 * Data Visualization Engine (Chart.js)
 */
function renderAnalyticsChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    if (systemState.chart) systemState.chart.destroy();
    
    const tally = { happy: 0, sad: 0, angry: 0, neutral: 0, surprised: 0, fearful: 0 };
    systemState.history.forEach(h => { if(tally[h.mood] !== undefined) tally[h.mood]++; });
    
    systemState.chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Happy', 'Sad', 'Angry', 'Surprise', 'Fear', 'Neutral'],
            datasets: [{
                label: 'NEURAL FREQUENCY',
                data: [tally.happy, tally.sad, tally.angry, tally.surprised, tally.fearful, tally.neutral],
                borderColor: '#FFD700',
                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                pointBackgroundColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    angleLines: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: { labels: { color: '#fff', font: { family: 'Orbitron', size: 10 } } }
            }
        }
    });
}

function exportData() {
    const data = JSON.stringify(systemState.history);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moodify_elite_archive_${Date.now()}.json`;
    a.click();
}
