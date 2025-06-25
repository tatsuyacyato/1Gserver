const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let currentNumber = 0;
let queue = [];
let currentCalling = '----';
let recentRequests = {};

// 番号発行API
app.post('/api/request-number', (req, res) => {
  const ip = req.ip;
  const now = Date.now();

  // ⚠️ 多重送信防止（30秒以内のリクエストを拒否）
  if (recentRequests[ip] && now - recentRequests[ip] < 30000) {
    return res.status(429).json({ message: 'しばらく待ってください' });
  }
  recentRequests[ip] = now;

  // 🔢 番号生成
  currentNumber++;
  const numberStr = currentNumber.toString().padStart(4, '0');
  queue.push(numberStr);

  res.json({ number: numberStr });
});

// 次の番号を呼び出す（アドミン操作）
app.post('/api/next-number', (req, res) => {
  if (queue.length === 0) {
    return res.status(400).json({ message: '番号がありません' });
  }
  currentCalling = queue.shift();
  res.json({ called: currentCalling });
});

// 現在の呼び出し番号を取得
app.get('/api/current-calling', (req, res) => {
  res.json({ number: currentCalling });
});

// HTML表示ページ（表示用ディスプレイ）
app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/monitor.html'));
});

// HTML表示ページ（管理者用）
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

// HTML表示ページ（送信者用）
app.get('/request', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/reservation.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`呼び出しシステムが http://localhost:${PORT} で起動中`);
});
