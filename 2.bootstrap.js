(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[2],{

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! exports provided: main, setup */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"main\", function() { return main; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"setup\", function() { return setup; });\nvar Plotly = __webpack_require__(/*! plotly.js-dist */ \"./node_modules/plotly.js-dist/plotly.js\");\nlet wasm = null;\n\nfunction main() {\n    document.getElementById(\"compute_btn\").addEventListener(\"click\", plot); \n}\n\nfunction setup(Wasm) {\n    wasm = Wasm;\n}\n\nfunction plot() {\n    let res = wasm.compute();\n    var trace1 = {\n      x: res.get('time'),\n      y: res.get('0'),\n      type: 'scatter'\n    };\n    \n    var trace2 = {\n        x: res.get('time'),\n        y: res.get('1'),\n        type: 'scatter'\n      };\n\n    var data = [trace1, trace2];\n    Plotly.newPlot('myDiv', data);\n    console.log(\"ok\");\n}\n\n//# sourceURL=webpack:///./index.js?");

/***/ })

}]);