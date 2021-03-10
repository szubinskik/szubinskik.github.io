(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[2],{

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! exports provided: main, setup */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"main\", function() { return main; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"setup\", function() { return setup; });\n/* harmony import */ var wasm_pie__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! wasm-pie */ \"../pkg/wasm_pie.js\");\n/* harmony import */ var _setListeners_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./setListeners.js */ \"./setListeners.js\");\nvar Plotly = __webpack_require__(/*! plotly.js-dist */ \"./node_modules/plotly.js-dist/plotly.js\");\n\n\n\nlet wasm = null;\n\nconst input_network = document.getElementById(\"input-network\");\nconst input_initial = document.getElementById(\"input-initial\");\nconst input_steps   = document.getElementById(\"input-steps\");\nconst input_time    = document.getElementById(\"input-time\");\n\nconst checkbox_time = document.getElementById(\"checkbox-time\");\n\nfunction main() {\n  document.getElementById(\"button-compute\").addEventListener(\"click\", on_compute);\n  Object(_setListeners_js__WEBPACK_IMPORTED_MODULE_1__[\"setListeners\"])(document);\n}\n\nfunction setup(Wasm) {\n    wasm = Wasm;\n}\n\nfunction on_compute() {\n  let str_net = input_network.value;\n  let str_init = input_initial.value;\n  let reactions = parse(str_net);\n  let [pre, post, species] = to_matrix(reactions);\n  let inits = parse_inits(str_init, species);\n  let hazards = new Float64Array(reactions.map(r => r.rate));\n  let steps = parseInt(input_steps.value);\n  let max_time = null;\n  if (checkbox_time.checked)\n    max_time = parseFloat(input_time.value);\n  let res = compute(pre, post, inits, hazards, steps, max_time);\n  plot(res, species);\n}\n\nfunction parse(raw) {\n\n  function parse_line(line) {\n    let res = {\n      pre : {},\n      post : {}\n    };\n    let buffer = \"\";\n\n    for (let i = 0; i < line.length; i++) {\n      if (line[i] == ':')\n      {\n        res.rate = Number(buffer);\n        buffer = \"\";\n        line = line.slice(i+1);\n        break;\n      }\n      buffer += line[i];\n    }\n\n    let prev_num = 1;\n    for (let i = 0; i < line.length; i++) {\n      if (line[i] == '*') {\n        prev_num = parseInt(buffer);\n        buffer = \"\";\n      }\n      else if ( line[i] == '+' || line[i] == '-' ) {\n        if (buffer.trim() !== \"\")\n          res.pre[buffer.trim()] = prev_num;\n        prev_num = 1;\n        buffer = \"\";\n        if (line[i] == '-') {\n          line = line.slice(i+2);\n          break;\n        }\n      }\n      else\n        buffer += line[i];\n    }\n\n    prev_num = 1;\n    for (let i = 0; i < line.length; i++) {\n      if (line[i] == '*') {\n        prev_num = parseInt(buffer);\n        buffer = \"\";\n      }\n      else if ( line[i] == '+' ) {\n        res.post[buffer.trim()] = prev_num;\n        prev_num = 1;\n        buffer = \"\";\n      }\n      else\n        buffer += line[i];\n    }\n\n    if (buffer.trim() !== \"\")\n      res.post[buffer.trim()] = prev_num;\n\n    if (Object.keys(res.pre).length+Object.keys(res.post) < 1)\n      return undefined;\n    return res;\n  }\n\n  let reactions = [];\n\n  for (let line of raw.trim().split('\\n'))\n  {\n    let l = parse_line(line);\n    if (l !== undefined)\n      reactions.push(l);\n  }\n  \n  return reactions;\n}\n\nfunction to_matrix(reactions) {\n  let species_set = new Set();\n  for (let r of reactions) {\n    species_set = new Set([...species_set, ...Object.keys(r.pre)]);\n    species_set = new Set([...species_set, ...Object.keys(r.post)]);\n  }\n  let species = Array.from(species_set);\n  let n = species.length;\n\n  let pre = [];\n  let post = [];\n\n  for (let r of reactions) {\n    let pre_line = Array(n).fill(0);\n    let post_line = Array(n).fill(0);\n    for (let s of Object.entries(r.pre))\n      pre_line[species.findIndex(e => e == s[0])] = s[1];\n    for (let s of Object.entries(r.post))\n      post_line[species.findIndex(e => e == s[0])] = s[1];\n\n    pre = [...pre, ...pre_line];\n    post = [...post, ...post_line];\n  }\n  return [new Int32Array(pre), new Int32Array(post), species];\n}\n\nfunction parse_inits(raw, species) {\n  // TODO - this sets zero as default\n  let inits = Array(species.length).fill(0);\n  for (let line of raw.trim().split('\\n')) {\n    let name = line.split('=')[0].trim();\n    let val = parseInt(line.split('=')[1]);\n    inits[species.findIndex(e => e == name)] = val;\n  }\n  return new Int32Array(inits);\n}\n\nfunction compute(pre, post, inits, hazards, steps, max_time) {\n  let config = {\n    \"pre\" : pre,\n    \"post\" : post,\n    \"inits\" : inits,\n    \"hazards\" : hazards,\n    \"steps\" : steps,\n    \"max_time\" : max_time,\n  };\n  return wasm.gillespie(config);\n  //return wasm.compute(pre, post, inits, hazards, steps);\n}\n\nfunction plot(res, species) {\n  \n  let data = [];\n  species.forEach((s, i) => {\n    data.push({\n      x: res.get('time'),\n      y: res.get(i.toString()),\n      type: 'scatter',\n      mode: 'line',\n      name: s,\n    });\n  });\n  let layout = { \n    // title: 'Responsive to window\\'s size!',\n    // font: {size: 18}\n  };\n  let config = {responsive: true};\n  Plotly.newPlot('div-graph', data, layout, config);\n}\n\n//# sourceURL=webpack:///./index.js?");

/***/ }),

/***/ "./setListeners.js":
/*!*************************!*\
  !*** ./setListeners.js ***!
  \*************************/
/*! exports provided: setListeners */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"setListeners\", function() { return setListeners; });\nconst Lotka_Volterra_net = \"\\\n1:           Prey -> 2*Prey\\n\\\n0.005: Predator + Prey -> 2*Predator\\n\\\n0.6:      Predator -> \\\n\";\n\nconst Lotka_Volterra_init = \"\\\nPrey = 50\\n\\\nPredator = 100\\\n\";\n\nconst Michaelis_Menten_net = \"\\\n0.00166:  S + E -> SE\\n\\\n0.0001:    SE -> S + E\\n\\\n0.1:            SE -> P + E\\\n\";\n\nconst Michaelis_Menten_init = \"\\\nS = 301\\n\\\nE = 120\\n\\\nSE = 0\\n\\\nP = 0\\\n\";\n\nconst Dimerisation_net = \"\\\n0.00166:  2*P -> P2\\n\\\n0.2:            P2 -> 2*P\\\n\";\n\nconst Dimerisation_init = \"\\\nP = 301\\n\\\nP2 = 0\\\n\";\n\nconst TK_2000_1_net = \"\\\n0.03125:           X1 + X2 -> 2 * X2\\n\\\n0.03125:           X2+ X3 -> 2 * X3\\n\\\n0.03125:           X3 + X4 -> 2 * X4\\n\\\n0.03125:           X4+ X1 -> 2 * X1\\n\\\n\\n\\\n0.00390625:  X1 ->\\n\\\n0.00390625:  X2 ->\\n\\\n0.00390625:  X3 ->\\n\\\n0.00390625:  X4 ->\\n\\\n\\n\\\n0.125: -> X1\\n\\\n0.125: -> X2\\n\\\n0.125: -> X3\\n\\\n0.125: -> X4\";\n\nconst TK_2000_1_init = \"\\\nX1 = 0\\n\\\nX2 = 0\\n\\\nX3 = 0\\n\\\nX4 = 0\";\n\nconst SK_2015_1_net = \"\\\n0.02: A + B -> 2*A\\n\\\n0.02: A + B -> 2*B\\n\\\n\\\n0.01: A -> B\\n\\\n0.01: B -> A\";\n\nconst SK_2015_1_init = \"\\\nA = 25\\n\\\nB = 25\";\n\nconst SK_2015_2_net = \"\\\n0.0005: A + B -> 2*A\\n\\\n0.0005: A + B -> 2*B\\n\\\n\\\n0.01: A -> B\\n\\\n0.01: B -> A\";\n\nconst SK_2015_2_init = \"\\\nA = 1000\\n\\\nB = 1000\";\n\nfunction setListeners(document) {\n    const input_network = document.getElementById(\"input-network\");\n    const input_initial = document.getElementById(\"input-initial\");\n\n    document.getElementById(\"item-lotka\").addEventListener(\"click\", () => {\n        input_network.value = Lotka_Volterra_net;\n        input_initial.value = Lotka_Volterra_init;\n    });\n\n    document.getElementById(\"item-menten\").addEventListener(\"click\", () => {\n        input_network.value = Michaelis_Menten_net;\n        input_initial.value = Michaelis_Menten_init;\n    });\n\n    document.getElementById(\"item-dimerisation\").addEventListener(\"click\", () => {\n        input_network.value = Dimerisation_net;\n        input_initial.value = Dimerisation_init;\n    });\n\n    document.getElementById(\"item-2000-1\").addEventListener(\"click\", () => {\n        input_network.value = TK_2000_1_net;\n        input_initial.value = TK_2000_1_init;\n    });\n\n    document.getElementById(\"item-2015-1\").addEventListener(\"click\", () => {\n        input_network.value = SK_2015_1_net;\n        input_initial.value = SK_2015_1_init;\n    });\n\n    document.getElementById(\"item-2015-2\").addEventListener(\"click\", () => {\n        input_network.value = SK_2015_2_net;\n        input_initial.value = SK_2015_2_init;\n    });\n}\n\n//# sourceURL=webpack:///./setListeners.js?");

/***/ })

}]);