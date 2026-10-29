const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollToId = (id) => document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });

// ===== 友だち追加（デモ） =====
const toast = document.getElementById("toast");
let toastTimer;
document.querySelectorAll(".js-cta").forEach((button) => {
  button.addEventListener("click", () => {
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.hidden = true), 4000);
  });
});

// ===== 端末の画面（生成した画像を切り替える） =====
// box は画像に対する [左, 上, 幅, 高さ]（%）。to は次の画面、scroll は移動先のセクション、auto は自動で進む画面
const flows = {
  chat: {
    start: "A1",
    frames: {
      A1: { img: "images/screens/a1.jpg", spots: [
        { label: "時間割のスクショとシラバスの URL を送る", box: [3.5, 32.3, 93, 6.6], to: "A2" },
        { label: "添付する", box: [3.5, 89.4, 10.5, 5.4], to: "A2" },
      ] },
      A2: { img: "images/screens/a2.jpg", auto: { to: "A3", ms: 1800 } },
      A3: { img: "images/screens/a3.jpg", spots: [
        { label: "LINE で通知を受け取る", box: [3.8, 78.8, 92.4, 7.4], scroll: "step3" },
      ] },
    },
  },
  timetable: {
    start: "T1",
    frames: { T1: { img: "images/screens/t1.jpg" } },
  },
  lock: {
    start: "N1",
    frames: {
      N1: { img: "images/screens/n1.jpg", spots: [
        { label: "通知を開く", box: [2.5, 28.5, 95, 26.5], scroll: "step4" },
      ] },
    },
  },
  line: {
    start: "L1",
    frames: {
      L1: { img: "images/screens/l1.jpg", spots: [
        { label: "了解", box: [16.2, 53.2, 70, 6], to: "L2" },
      ] },
      L2: { img: "images/screens/l2.jpg", spots: [
        { label: "やった", box: [16.6, 53.5, 68.8, 5.8], to: "L4" },
        { label: "まだ", box: [16.6, 60, 68.8, 6.1], to: "L3" },
      ] },
      L3: { img: "images/screens/l3.jpg", spots: [
        { label: "30分後", box: [16.6, 41, 68.8, 6], to: "L4" },
        { label: "1時間後", box: [16.6, 47.7, 68.8, 6], to: "L4" },
        { label: "明日の朝", box: [16.6, 54.3, 68.8, 6.1], to: "L4" },
      ] },
      L4: { img: "images/screens/l4.jpg", spots: [
        { label: "始めた", box: [17, 50.4, 68.8, 5.9], to: "L5" },
        { label: "明日やる", box: [17, 57, 68.8, 5.9], to: "L5" },
      ] },
      L5: { img: "images/screens/l5.jpg", spots: [
        { label: "来週も（最初に戻る）", box: [16.5, 59.5, 69.2, 6.3], to: "L1" },
      ] },
    },
  },
};

const stages = {};

function setupStage(stage) {
  const flow = flows[stage.dataset.flow];
  // 画像はすべて重ねて置き、表示中の1枚だけを見せる（切り替えたときに待たせない）
  const shots = {};
  for (const [id, frame] of Object.entries(flow.frames)) {
    const img = document.createElement("img");
    img.className = "shot";
    img.src = frame.img;
    img.alt = "";
    stage.append(img);
    shots[id] = img;
  }
  const state = { flow, stage, shots, current: null, timer: null };
  stages[stage.dataset.flow] = state;
  show(state, flow.start);
}

function show(state, id) {
  const frame = state.flow.frames[id];
  clearTimeout(state.timer);
  state.current = id;
  Object.entries(state.shots).forEach(([key, img]) => img.classList.toggle("is-current", key === id));
  state.stage.querySelectorAll(".spot").forEach((spot) => spot.remove());
  for (const spot of frame.spots ?? []) {
    const [left, top, width, height] = spot.box;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "spot";
    button.setAttribute("aria-label", spot.label);
    Object.assign(button.style, { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` });
    button.addEventListener("click", () => {
      if (spot.to) show(state, spot.to);
      if (spot.scroll) scrollToId(spot.scroll);
    });
    state.stage.append(button);
  }
  if (frame.auto) state.timer = setTimeout(() => show(state, frame.auto.to), frame.auto.ms);
}

document.querySelectorAll(".shot-stage").forEach(setupStage);

document.querySelectorAll(".js-replay").forEach((button) => {
  button.addEventListener("click", () => {
    const state = stages[button.dataset.flow];
    show(state, state.flow.start);
  });
});

// ===== 自分で用意した素材（images/own-sketch.jpg があるときだけ表示する） =====
const sketch = new Image();
sketch.onload = () => {
  document.getElementById("sketch-img").src = sketch.src;
  document.getElementById("sketch").hidden = false;
};
sketch.src = "images/own-sketch.jpg";
