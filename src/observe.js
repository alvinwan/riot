var wifi = require('node-wifi');
var fs = require('fs');

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function demo(n=1, completion=function(data) {}, hook=function(i, sample) {}) {

  console.log(" * [INFO] Starting to listen")

  // Initialize wifi module
  // Absolutely necessary even to set interface to null
  wifi.init({
      iface : null // network interface, choose a random wifi interface if set to null
  });

  data = {samples: []}

  function startScan(i) {
    var date1 = new Date();
    wifi.scan(function(err, networks) {
        if (err) {
            console.log(err);
        } else {
            sample = []
            networks.forEach(function(network) {
                sample.push({mac: network['mac'], signal_level: network['signal_level'], ssid: network['ssid']})
            })
            data['samples'].push(sample)

            var date2 = new Date();

            if (networks.length > 0) {
              console.log(" * [INFO] Collected sample " + i + " in " + ( (date2 - date1) / 1000 ) + "s")
              hook(i, sample);
            } else {
              console.log(" * [INFO] Failed to collect " + i + ". Waiting for a second before retrying...")
              sleep(1000)
              startScan(i);
              return
            }


            if (i > 1) {
              startScan(i-1);
            } else {
              console.log(" * [INFO] Done")
              completion(data);
            }
        }
    });
  }

  startScan(n);
}

function main() {
  if (process.argv.length <= 2) {
    n = 1
  } else {
    n = process.argv[2]
  }
  demo(n, function(data) {
    var json = JSON.stringify(data);
    var fs = require('fs');
    fs.writeFile('samples.json', json, 'utf8', function() {});
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

  return demo(n, completion, hook);
}

function retrain(completion=function(data) {}) {
  const spawn = require("child_process").spawn;

  var filenames = get_filenames()

  // TODO: - recode training script in NodeJS
  arguments = ["./train.py"].concat(filenames)
  console.log('python', arguments)
  const pythonProcess = spawn('python', arguments);
  pythonProcess.stdout.on('data', completion);
  pythonProcess.stderr.on('data', (data) => {
    console.log(" * [ERROR] " + data.toString())
  })
}

function get_filenames() {
  filenames = new Set([]);
  fs.readdirSync("data/").forEach(function(filename) {
      filenames.add(filename.replace('_train', '').replace('_test', '').replace('.json', '' ))
  });
  filenames = Array.from(filenames.values())
  filenames.sort();
  return filenames
}

if (typeof document == 'undefined') {
  main();
} else {
  document.querySelector('#start-recording').addEventListener('click', function() { interface(20) })
}
