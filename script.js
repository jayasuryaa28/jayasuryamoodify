let currentStream = null;
let chartInstance = null;

// Suggestions Dictionary
const moodData = {
    happy: { emoji: '😊', quote: 'Semma! Ithe mathiri always happy ah irunga!', song: '🎵 Pharrell Williams - Happy' },
    sad: { emoji: '😢', quote: 'Kavala padathinga, ellam seri aagidum.', song: '🎵 Anirudh - Life of Pazham' },
    angry: { emoji: '😠', quote: 'Konjam relax pannunga, thanni kudinga.', song: '🎵 Yuvan Shankar Raja - Relaxing BGM' },
    neutral: { emoji: '😐', quote: 'Amaidhiya irukarthum nallathu than.', song: '🎵 Lofi Chill Beats' }
};

// Navigation
function navigate(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    if (screenId === 'camera-screen') startVideo();
}

// Theme Toggle (3D style)
document.getElementById('theme-toggle').addEventListener('click', () => {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'light') {
        body.removeAttribute('data-theme');
        document.getElementById('theme-toggle').innerText = '🌙';
    } else {
        body.setAttribute('data-theme', 'light');
        document.getElementById('theme-toggle').innerText = '☀️';
    }
});

// Load Face API Models
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(() => console.log('FaceAPI Models Loaded')).catch(err => console.log("Models load aagala. Folder crct ah iruka check pannunga"));

async function startVideo() {
    const video = document.getElementById('video');
    document.getElementById('cam-status').innerText = 'Starting camera...';
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = currentStream;
        document.getElementById('cam-status').innerText = 'Face-a pakkathula vanga...';
        
        video.addEventListener('play', () => {
            const interval = setInterval(async () => {
                if(document.getElementById('camera-screen').classList.contains('active')) {
                    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
                    if (detections) {
                        const mood = Object.keys(detections.expressions).reduce((a, b) => detections.expressions[a] > detections.expressions[b] ? a : b);
                        clearInterval(interval);
                        stopVideo();
                        saveAndShowResult(mood, 'camera');
                    }
                } else {
                    clearInterval(interval);
                }
            }, 1000);
        });
    } catch (err) {
        // Inga thaan antha puthu error kaatura lines add panniruken
        document.getElementById('cam-status').innerText = 'Error: ' + err.message + ' (' + err.name + ')';
        console.error("Camera Error: ", err);
    }
}

function stopVideo() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
}

// Text Sentiment Logic (Client-side)
function analyzeText() {
    const text = document.getElementById('mood-text').value.toLowerCase();
    if (!text) return alert('Edhavathu type pannunga bro/sis!');
    
    const positiveWords = ['happy', 'super', 'good', 'great', 'awesome', 'jolly', 'nalla'];
    const negativeWords = ['sad', 'bad', 'angry', 'kovam', 'depressed', 'sogam', 'worst'];
    
    let score = 0;
    const words = text.split(/\W+/);
    
    words.forEach(word => {
        if (positiveWords.includes(word)) score++;
        if (negativeWords.includes(word)) score--;
    });

    let detectedMood = 'neutral';
    if (score > 0) detectedMood = 'happy';
    if (score < 0) detectedMood = 'sad';
    
    saveAndShowResult(detectedMood, 'text');
}

// Save & Show Result (Using LocalStorage)
function saveAndShowResult(moodStr, source) {
    let mood = moodStr === 'happy' ? 'happy' : (moodStr === 'sad' ? 'sad' : (moodStr === 'angry' ? 'angry' : 'neutral'));
    
    // Save to LocalStorage
    let history = JSON.parse(localStorage.getItem('moodAppHistory')) || [];
    history.push({ date: new Date().toLocaleDateString(), mood: mood });
    localStorage.setItem('moodAppHistory', JSON.stringify(history));

    const info = moodData[mood];
    document.getElementById('detected-mood').innerText = `${mood.toUpperCase()} ${info.emoji}`;
    document.getElementById('quote').innerText = `"${info.quote}"`;
    document.getElementById('song').innerText = info.song;
    
    navigate('result-screen');
}

// Chart.js History Logic
function loadHistory() {
    navigate('history-screen');
    let history = JSON.parse(localStorage.getItem('moodAppHistory')) || [];
    
    const moodCounts = { happy: 0, sad: 0, angry: 0, neutral: 0 };
    history.forEach(item => { if(moodCounts[item.mood] !== undefined) moodCounts[item.mood]++; });

    const ctx = document.getElementById('moodChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Happy', 'Sad', 'Angry', 'Neutral'],
            datasets: [{
                data: [moodCounts.happy, moodCounts.sad, moodCounts.angry, moodCounts.neutral],
                backgroundColor: ['#6c5ce7', '#00cec9', '#ff7675', '#dfe6e9']
            }]
        }
    });
}