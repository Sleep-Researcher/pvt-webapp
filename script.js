const startBtn = document.getElementById("startBtn");
const testArea = document.getElementById("testArea");
const message = document.getElementById("message");
const reactBtn = document.getElementById("reactBtn");
const downloadBtn = document.getElementById("downloadBtn");

let reactionStart = 0;
let results = [];
let maxTrials = 5;
let testDate = new Date(); // テスト開始時刻を保存

// テスト開始
startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  testArea.style.display = "block";
  testDate = new Date(); // テスト日時を記録
  results = [];
  nextTrial();
});

// 1試行実行
function nextTrial() {
  message.textContent = "次に表示されたらすぐ押してね！";
  reactBtn.style.display = "none";

  const waitTime = 2000 + Math.random() * 3000;

  setTimeout(() => {
    message.textContent = "今！押して！";
    reactionStart = performance.now();
    reactBtn.style.display = "inline-block";
  }, waitTime);
}

// ユーザーの反応処理
reactBtn.addEventListener("click", () => {
  const reactionTime = performance.now() - reactionStart;
  results.push({
    trial: results.length + 1,
    time: Math.round(reactionTime)
  });
  console.log(`試行${results.length}: ${Math.round(reactionTime)}ms`);

  if (results.length >= maxTrials) {
    const avg = average(results.map(r => r.time));
    message.textContent = `テスト終了！平均: ${Math.round(avg)}ms`;
    reactBtn.style.display = "none";
    downloadBtn.style.display = "inline-block";
  } else {
    nextTrial();
  }
});

// 平均計算
function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// CSVダウンロード処理
downloadBtn.addEventListener("click", () => {
  const formattedDate = formatDate(testDate);
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += `テスト日時,${formattedDate}\n`;
  csvContent += "試行,反応時間(ms)\n";

  results.forEach(r => {
    csvContent += `${r.trial},${r.time}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `pvt_results_${formattedDate.replace(/[: ]/g, "_")}.csv`);
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
