const testArea = document.getElementById("testArea");
const formArea = document.getElementById("formArea");
const message = document.getElementById("message");
const reactBtn = document.getElementById("reactBtn");
const downloadBtn = document.getElementById("downloadBtn");

const participantIdInput = document.getElementById("participantId");
const ageInput = document.getElementById("age");
const durationSelect = document.getElementById("testDuration"); // ★追加

const startBtn = document.getElementById("startBtn"); // ★追加

let reactionStart = 0;
let results = [];
let testDate = new Date();
let participantId = "";
let age = "";

let testDurationMinutes = 1;
let testEndTime = 0;
let testTimer = null;

// テスト開始
startBtn.addEventListener("click", () => {
  participantId = participantIdInput.value.trim();
  age = ageInput.value.trim();
  testDurationMinutes = parseInt(durationSelect.value, 10); // ★変更

  if (!participantId || !age) {
    alert("被験者IDと年齢を入力してください！");
    return;
  }

  // 初期化
  results = [];
  testDate = new Date();
  testEndTime = Date.now() + testDurationMinutes * 60 * 1000;

  // 表示切替
  formArea.style.display = "none";
  testArea.style.display = "block";

  nextTrial();

  // 終了タイマーセット
  testTimer = setTimeout(() => {
    endTest();
  }, testDurationMinutes * 60 * 1000);
});

// 1試行実行
function nextTrial() {
  if (Date.now() >= testEndTime) {
    endTest();
    return;
  }

  message.textContent = "次に表示されたらすぐ押してね！";
  reactBtn.style.display = "none";

  const waitTime = 2000 + Math.random() * 3000;

  setTimeout(() => {
    if (Date.now() >= testEndTime) {
      endTest();
      return;
    }

    message.textContent = "今！押して！";
    reactionStart = performance.now();
    reactBtn.style.display = "inline-block";
  }, waitTime);
}

// 反応処理
reactBtn.addEventListener("click", () => {
  const reactionTime = performance.now() - reactionStart;
  results.push({
    trial: results.length + 1,
    time: Math.round(reactionTime)
  });

  reactBtn.style.display = "none";
  nextTrial();
});

// 平均計算
function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// テスト終了処理
function endTest() {
  clearTimeout(testTimer);

  const avg = average(results.map(r => r.time));
  message.textContent = `テスト終了！平均: ${Math.round(avg)}ms（試行回数: ${results.length}）`;
  reactBtn.style.display = "none";
  downloadBtn.style.display = "inline-block";
}

// CSVダウンロード処理
downloadBtn.addEventListener("click", () => {
  const formattedDate = formatDate(testDate);
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += `テスト日時,${formattedDate}\n`;
  csvContent += `被験者ID,${participantId}\n`;
  csvContent += `年齢,${age}\n`;
  csvContent += `テスト時間（分）,${testDurationMinutes}\n\n`;
  csvContent += "試行,反応時間(ms)\n";

  results.forEach(r => {
    csvContent += `${r.trial},${r.time}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `pvt_${participantId}_${formattedDate.replace(/[: ]/g, "_")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// 日付整形（例：2025-05-07 17:45:22）
function formatDate(date) {
  const pad = n => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
