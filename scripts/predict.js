var fs = require('fs');
var utils = require('./utils');
const spawn = require("child_process").spawn;

function predict(completion=function() {}) {
  const nodeProcess = spawn('node', ["scripts/observe.js"]);  // TODO - catch errors
  const pythonProcess = spawn('python', ["-W", "ignore", "./model/eval_kmeans.py", "samples.json"]);
  pythonProcess.stdout.on('data', (data) => {
    information = JSON.parse(data.toString());
    console.log(" * [INFO] Room '" + information.category + "' with confidence '" + information.confidence + "'")
    completion()

    if (typeof document != "undefined") {
      document.querySelector('#predicted-room-name').innerHTML = information.category
      document.querySelector('#predicted-confidence').innerHTML = information.confidence
    }
  });
  pythonProcess.stderr.on('data', (data) => {
    console.log(data.toString());
  })
}

function main() {
  f = function() { predict(f) }
  predict(f)

  if (typeof document == "undefined") return
  var cards = document.querySelector('.cards');

  if (cards) {
    console.log(utils.get_filenames())
    utils.get_filenames().forEach(function(element) {
      var div = document.createElement('div');
      div.classList = ["card"]

      var p = document.createElement('p');
      p.classList = ["card-title"]
      p.innerHTML = element

      div.appendChild(p)
      document.querySelector('.cards').appendChild(div)
    })
  }
}

main()
