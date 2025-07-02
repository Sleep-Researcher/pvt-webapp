const testArea = document.getElementById("testArea");
const formArea = document.getElementById("formArea");
const message = document.getElementById("message");
const reactBtn = document.getElementById("reactBtn");
const downloadBtn = document.getElementById("downloadBtn");

const participantNameInput = document.getElementById("participantName");
const genderSelect = document.getElementById("gender");
const ageInput = document.getElementById("age");
const durationSelect = document.getElementById("testDuration");

const startBtn = document.getElementById("startBtn");
const practiceBtn = document.getElementById("practiceBtn");
const practiceEndMenu = document.getElementById("practiceEndMenu");
const practiceRetryBtn = document.getElementById("practiceRetryBtn");
const practiceExitBtn = document.getElementById("practiceExitBtn");

let reactionStart = 0;
let results = [];
let testDate = new Date();
let participantName = "";
let gender = "";
let age = "";

let testDurationMinutes = 1;
let testEndTime = 0;
let testTimer = null;

let isPractice = false;
let practiceCount = 0;

// テスト開始（本番）
startBtn.addEventListener("click", () => {
  participantName = participantNameInput.value.trim();
  gender = genderSelect.value;
  age = ageInput.value.trim();
  testDurationMinutes = parseInt(durationSelect.value, 10);

  if (!participantName || !age) {
    alert("氏名と年齢を入力してください！");
    return;
  }

  // 初期化
  isPractice = false;
  results = [];
  testDate = new Date();
  testEndTime = Date.now() + testDurationMinutes * 60 * 1000;

  // 表示切替
  formArea.style.display = "none";
  testArea.style.display = "block";
  practiceEndMenu.style.display = "none";

  nextTrial();

  // 終了タイマーセット
  testTimer = setTimeout(() => {
    endTest();
  }, testDurationMinutes * 60 * 1000);
});

// 練習開始
practiceBtn.addEventListener("click", () => {
  isPractice = true;
  practiceCount = 0;
  results = [];
  testDate = new Date();

  formArea.style.display = "none";
  testArea.style.display = "block";
  practiceEndMenu.style.display = "none";

  nextPracticeTrial();
});

// 練習の1試行
function nextPracticeTrial() {
  if (practiceCount >= 3) {
    endPractice();
    return;
  }

  message.textContent = "練習：次に表示されたらすぐ押してね！";
  reactBtn.style.display = "none";

  const waitTime = 2000 + Math.random() * 3000;

  setTimeout(() => {
    message.textContent = "今！押して！";
    reactionStart = performance.now();
    reactBtn.style.display = "inline-block";
  }, waitTime);
}

// 本番の1試行
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

// ボタン押下処理（共通）
reactBtn.addEventListener("click", () => {
  const reactionTime = performance.now() - reactionStart;

  if (isPractice) {
    practiceCount++;
    results.push({
      trial: practiceCount,
      time: Math.round(reactionTime)
    });

    reactBtn.style.display = "none";
    nextPracticeTrial();
  } else {
    results.push({
      trial: results.length + 1,
      time: Math.round(reactionTime)
    });

    reactBtn.style.display = "none";
    nextTrial();
  }
});

// 練習終了処理
function endPractice() {
  message.textContent = `練習終了！試行回数: ${practiceCount}`;
  reactBtn.style.display = "none";
  practiceEndMenu.style.display = "block";
}

// 練習再実行
practiceRetryBtn.addEventListener("click", () => {
  practiceCount = 0;
  results = [];
  practiceEndMenu.style.display = "none";
  testArea.style.display = "block";
  nextPracticeTrial();
});

// 練習終了→ホームに戻る
practiceExitBtn.addEventListener("click", () => {
  isPractice = false;
  practiceCount = 0;
  testArea.style.display = "none";
  practiceEndMenu.style.display = "none";
  formArea.style.display = "block";
});

// 本番テスト終了処理
function endTest() {
  clearTimeout(testTimer);

  const avg = average(results.map(r => r.time));
  message.textContent = `テスト終了！平均: ${Math.round(avg)}ms（試行回数: ${results.length}）`;
  reactBtn.style.display = "none";
  downloadBtn.style.display = "inline-block";
}

// 平均計算
function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// CSVダウンロード処理
downloadBtn.addEventListener("click", () => {
  const formattedDate = formatDate(testDate);
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += `テスト日時,${formattedDate}\n`;
  csvContent += `氏名,${participantName}\n`;
  csvContent += `性別,${gender}\n`;
  csvContent += `年齢,${age}\n`;
  csvContent += `テスト時間（分）,${testDurationMinutes}\n\n`;
  csvContent += "試行,反応時間(ms)\n";

  results.forEach(r => {
    csvContent += `${r.trial},${r.time}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `pvt_${participantName}_${formattedDate.replace(/[: ]/g, "_")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// 日付整形
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
