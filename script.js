const startBtn = document.getElementById("startBtn");
const testArea = document.getElementById("testArea");
const message = document.getElementById("message");
const reactBtn = document.getElementById("reactBtn");

let reactionStart = 0;
let results = [];

startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  testArea.style.display = "block";
  nextTrial();
});

function nextTrial() {
  message.textContent = "次に表示されたらすぐ押してね！";
  reactBtn.style.display = "none";

  const waitTime = 2000 + Math.random() * 3000; // 2〜5秒待つ

  setTimeout(() => {
    message.textContent = "今！押して！";
    reactionStart = performance.now();
    reactBtn.style.display = "inline-block";
  }, waitTime);
}

reactBtn.addEventListener("click", () => {
  const reactionTime = performance.now() - reactionStart;
  results.push(reactionTime);
  console.log(`反応時間: ${Math.round(reactionTime)}ms`);
  
  if (results.length >= 5) {
    message.textContent = `テスト終了！平均: ${Math.round(average(results))}ms`;
    reactBtn.style.display = "none";
  } else {
    nextTrial();
  }
});

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
