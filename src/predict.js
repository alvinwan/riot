var fs = require('fs');

function predict(completion=function() {}) {
  const spawn = require("child_process").spawn;
  const nodeProcess = spawn('node', ["observe.js"]);  // TODO - catch errors
  const pythonProcess = spawn('python', ["eval.py", "samples.json"]);
  pythonProcess.stdout.on('data', (data) => {
    var information = data.toString().split('\n')[0].split(',');
    var category = information[0];
    var confidence = information[1];

    document.querySelector('#predicted-room-name').innerHTML = category
    document.querySelector('#predicted-confidence').innerHTML = confidence
    console.log(" * [INFO] Room '" + category + "' with confidence '" + confidence + "'")
    completion()
  });
  pythonProcess.stderr.on('data', (data) => {
    console.log(data.toString());
  })
}

function get_filenames() {
  filenames = new Set([]);
  fs.readdirSync("data/").forEach(function(filename) {
      filenames.add(filename.replace('_train', '').replace('_test', '').replace('.json', '' ))
  });
  filenames = Array.from(filenames.values())
  filenames.sort();
  filenames.splice(filenames.indexOf('.DS_Store'), 1)
  return filenames
}

function main() {
  var cards = document.querySelector('.cards');

  if (cards) {
    console.log(get_filenames())
    get_filenames().forEach(function(element) {
      var div = document.createElement('div');
      div.classList = ["card"]

      var p = document.createElement('p');
      p.classList = ["card-title"]
      p.innerHTML = element

      div.appendChild(p)
      document.querySelector('.cards').appendChild(div)
    })
  }

  f = function() { predict(f) }
  predict(f)
}

main()
