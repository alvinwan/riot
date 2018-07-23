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
    completion()
  });
}

function main() {
  predict(predict)
}

main()
