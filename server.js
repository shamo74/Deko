const express = require('express');
const app = express();
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const RTSP_URL = 'rtsp://172.30.20.137:1578/Shamson';
const PORT = 8000;
const HLS_OUTPUT_DIR = path.join(__dirname, 'live');
const HLS_OUTPUT_PATH = path.join(HLS_OUTPUT_DIR, 'stream.m3u8');

// إنشاء مجلد HLS إذا لم يكن موجوداً
if (!fs.existsSync(HLS_OUTPUT_DIR)) {
    fs.mkdirSync(HLS_OUTPUT_DIR, { recursive: true });
}

// تشغيل FFmpeg لتحويل RTSP إلى HLS
const ffmpeg = spawn('ffmpeg', [
    '-i', RTSP_URL,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '3',
    '-hls_flags', 'delete_segments',
    '-hls_segment_filename', path.join(HLS_OUTPUT_DIR, 'segment_%03d.ts'),
    HLS_OUTPUT_PATH
]);

ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data}`);
});

ffmpeg.on('close', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
});

// تقديم ملفات HLS
app.use('/live', express.static(HLS_OUTPUT_DIR));

// تقديم صفحة الويب
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
