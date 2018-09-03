var wifi = require('node-wifi');
var fs = require('fs');
var utils = require('./utils');
const spawn = require("child_process").spawn;

/**
 * Uses a recursive function for repeated scans, since scans are asynchronous.
 */
async function record(n=1, completion=function(data) {}, hook=function(i, sample) {}) {
  console.log(" * [INFO] Starting to listen")
  wifi.init({
      iface : null // network interface, choose a random wifi interface if set to null
  });

  samples = []
  function startScan(i) {
    var date1 = new Date();
    wifi.scan(function(err, networks) {
        if (err || networks.length == 0) {
          console.log(" * [ERR] Failed to collect " + i + ". Waiting for a second before retrying... (" + err + ")")
          utils.sleep(1000)
          startScan(i);
          return
        }
        console.log(" * [INFO] Collected sample " + i + " with " + networks.length + " networks in " + ( (new Date() - date1) / 1000 ) + "s")
        samples.push(networks)
        hook(i, networks);
        if (i <= 1) return completion({samples: samples});
        startScan(i-1);
    });
  }

  startScan(n);
}

function main() {
  n = process.argv.length <= 2 ? 1 : process.argv[2]
  record(n, function(data) {
    fs.writeFile('samples.json', JSON.stringify(data), 'utf8', function() {});
  })
}

function interface(n) {

  var status = document.querySelector('#add-status');
  var room_name_field = document.querySelector('#add-room-name');
  var room_name = room_name_field.value;
  if (!room_name) {
    room_name_field.classList.add('error');
    status.style.display = "block"
    status.innerHTML = "Need a non-empty room name."
    return
  }
  room_name_field.classList.remove('error');
  console.log(room_name);

  status.style.display = "block"
  status.innerHTML = "Listening for wifi..."

  var button = document.querySelector('#start-recording');
  // dim button and make unclickable

  function hook(i, sample) {
    document.querySelector('#add-title').innerHTML = n-i+1;
    status.innerHTML = "Found " + sample.length + " networks for sample " + (n-i+1) + "."
  }

  function completion(data) {
    train_data = {samples: data['samples'].slice(0, 15)}
    test_data = {samples: data['samples'].slice(15)}
    var train_json = JSON.stringify(train_data);
    var test_json = JSON.stringify(test_data);

    fs.writeFile('data/' + room_name + '_train.json', train_json, 'utf8', function() {});
    fs.writeFile('data/' + room_name + '_test.json', test_json, 'utf8', function() {});

    console.log(" * [INFO] Successfully saved data.")
    status.innerHTML = "Done. Retraining model..."

    retrain((data) => {
      var status = document.querySelector('#add-status');
      accuracies = data.toString().split('\n')[0];
      status.innerHTML = "Retraining succeeded: " + accuracies
    });
  }

  return record(n, completion, hook);
}

function retrain(completion=function(data) {}) {
  var filenames = utils.get_filenames()
  const pythonProcess = spawn('python', ["./model/train_kmeans.py"].concat(filenames));
  pythonProcess.stdout.on('data', completion);
  pythonProcess.stderr.on('data', (data) => {
    console.log(" * [ERROR] " + data.toString())
  })
}

if (typeof document == 'undefined') {
  main();
} else {
  document.querySelector('#start-recording').addEventListener('click', function() { interface(20) })
}
