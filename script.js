const equation = document.getElementById("equation");
const angleSwitch = document.getElementById("angle-switch");
const labelText = document.querySelector(".label-text");
let graphList = [];

angleSwitch.addEventListener("change", () => {
  labelText.textContent = angleSwitch.checked ? "度" : "ラジアン";
});

function insertFunction(fnName) {
  const sel = window.getSelection();
  const range = sel.getRangeAt(0);

  const textNode = document.createTextNode(fnName + "()");
  range.insertNode(textNode);

  range.setStart(textNode, fnName.length + 1);
  range.setEnd(textNode, fnName.length + 1);

  sel.removeAllRanges();
  sel.addRange(range);
  equation.focus();
}

function insertVariable(varName) {
  const sel = window.getSelection();
  const range = sel.getRangeAt(0);

  const preRange = range.cloneRange();
  preRange.setStart(equation, 0);
  const preText = preRange.toString();

  let textNode;
  if (/[\w)]$/.test(preText)) {
    textNode = document.createTextNode(varName);
  } else {
    textNode = document.createTextNode(varName);
  }

  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);

  sel.removeAllRanges();
  sel.addRange(range);
  equation.focus();
}

function insert(value) {
  const sel = window.getSelection();
  const range = sel.getRangeAt(0);

  const textNode = document.createTextNode(value);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);

  sel.removeAllRanges();
  sel.addRange(range);
  equation.focus();
}

["x-min", "x-max", "x-step"].forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^0-9π\.\-\/]/g, "");
  });
});

function parseInputValue(value) {
  if (!value) return NaN;
  value = value.replace(/\s+/g, "");
  value = value.replace(/π/g, "Math.PI");

  const variables = ["Θ", "x", "y"];
  variables.forEach((v) => {
    value = value.replace(new RegExp(`(\\d)(${v})`, "g"), "$1*$2");
    value = value.replace(new RegExp(`(${v})(\\d)`, "g"), "$1*$2");
    value = value.replace(new RegExp(`(Math\\.PI)(${v})`, "g"), "$1*$2");
    value = value.replace(new RegExp(`(${v})(Math\\.PI)`, "g"), "$1*$2");
  });

  value = value.replace(/(\d)(Math\.PI)/g, "$1*$2");
  value = value.replace(/(Math\.PI)(\d)/g, "$1*$2");

  try {
    return eval(value);
  } catch {
    return NaN;
  }
}

function addGraph() {
  const expr = equation.innerText.trim();
  if (!expr) return;

  const xMin = parseInputValue(document.getElementById("x-min").value);
  const xMax = parseInputValue(document.getElementById("x-max").value);
  const xStep = parseInputValue(document.getElementById("x-step").value);

  if (isNaN(xMin) || isNaN(xMax) || isNaN(xStep) || xStep <= 0) {
    alert("範囲入力が正しくありません");
    return;
  }

  const mode = angleSwitch.checked ? "deg" : "rad";
  const xValues = [];
  const yValues = [];

  for (let x = xMin; x <= xMax; x += xStep) {
    try {
      let evalX = x;
      if (expr.includes("Θ")) {
        evalX = mode === "deg" ? (x * Math.PI) / 180 : x;
      }
      const scope = { Θ: evalX, x: evalX, y: evalX, pi: Math.PI, e: Math.E };
      const y = math.evaluate(expr, scope);
      xValues.push(x);
      yValues.push(y);
    } catch {
      alert("数式エラー: " + expr);
      return;
    }
  }

  const color = getRandomColor();
  const trace = {
    x: xValues,
    y: yValues,
    mode: "lines",
    name: expr,
    line: { color: color },
  };

  graphList.push(trace);
  Plotly.newPlot("graph", graphList);
  addHistory(expr);
}

function getRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function addHistory(expr) {
  const historyDiv = document.getElementById("history");
  const div = document.createElement("div");
  div.innerHTML = `<span>${expr}</span>
    <span>
      <button class="history-btn" onclick="reuseGraph('${expr}')">再描画</button>
      <button class="history-btn" onclick="deleteHistory(this)">削除</button>
    </span>`;
  historyDiv.prepend(div);
}

function reuseGraph(expr) {
  equation.innerText = expr;
}

function deleteHistory(btn) {
  btn.closest("div").remove();
}

function clearEquation() {
  equation.innerText = "";
  equation.focus();
}

equation.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addGraph();
    equation.innerText = "";
  }
  if (event.key === "(") {
    event.preventDefault();
    insert("()");
  }
});
