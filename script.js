// DOM取得
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

// 変数定義
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

  isPractice = false;
  results = [];
  testDate = new Date();
  testEndTime = Date.now() + testDurationMinutes * 60 * 1000;

  formArea.style.display = "none";
  testArea.style.display = "block";
  practiceEndMenu.style.display = "none";
  downloadBtn.style.display = "none";

  nextTrial();

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
  downloadBtn.style.display = "none";

  nextPracticeTrial();
});

// 練習の1試行
function nextPracticeTrial() {
  if (practiceCount >= 3) {
    endPractice();
    return;
  }

  message.textContent = "練習：表示されたらすぐに押してください";
  reactBtn.classList.remove("visible");

  const waitTime = 2000 + Math.random() * 3000;
  setTimeout(() => {
    message.textContent = "押す";
    reactionStart = performance.now();
    reactBtn.classList.add("visible");
  }, waitTime);
}

// 本番の1試行
function nextTrial() {
  if (Date.now() >= testEndTime) {
    endTest();
    return;
  }

  message.textContent = "表示されたらすぐに押してください";
  reactBtn.classList.remove("visible");

  const waitTime = 2000 + Math.random() * 3000;
  setTimeout(() => {
    if (Date.now() >= testEndTime) {
      endTest();
      return;
    }
    message.textContent = "押す";
    reactionStart = performance.now();
    reactBtn.classList.add("visible");
  }, waitTime);
}

// 押したときの反応
reactBtn.addEventListener("click", () => {
  const reactionTime = performance.now() - reactionStart;

  if (isPractice) {
    practiceCount++;
    results.push({ trial: practiceCount, time: Math.round(reactionTime) });
    reactBtn.classList.remove("visible");
    nextPracticeTrial();
  } else {
    results.push({ trial: results.length + 1, time: Math.round(reactionTime) });
    reactBtn.classList.remove("visible");
    nextTrial();
  }
});

// 練習終了
function endPractice() {
  message.textContent = `練習終了！試行回数: ${practiceCount}`;
  reactBtn.classList.remove("visible");
  practiceEndMenu.style.display = "block";
}

// 練習リトライ
practiceRetryBtn.addEventListener("click", () => {
  practiceCount = 0;
  results = [];
  practiceEndMenu.style.display = "none";
  testArea.style.display = "block";
  nextPracticeTrial();
});

// 練習終了 → ホームに戻る
practiceExitBtn.addEventListener("click", () => {
  isPractice = false;
  practiceCount = 0;
  testArea.style.display = "none";
  practiceEndMenu.style.display = "none";
  formArea.style.display = "block";
});

// 本番終了
function endTest() {
  clearTimeout(testTimer);

  const avg = average(results.map(r => r.time));
  message.textContent = `テスト終了！平均: ${Math.round(avg)}ms（試行回数: ${results.length}）`;
  reactBtn.classList.remove("visible");
  downloadBtn.style.display = "inline-block";
}

// 平均計算
function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// CSV出力
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

