var wifi = require('node-wifi');

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
            console.log(" * [INFO] Collected sample " + i + " in " + ( (date2 - date1) / 1000 ) + "s")
            hook(i, sample);
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
    status.innerHTML = "Found " + sample.length + " networks for sample " + i + "."
  }

  function completion(data) {
    var json = JSON.stringify(data);
    var fs = require('fs');
    fs.writeFile('data/' + room_name + '.json', json, 'utf8', function() {});
    console.log(" * [INFO] Successfully saved data.")
    status.innerHTML = "Done. Retraining model..."
    // TODO: retrigger training
  }

  return demo(n, completion, hook);
}

if (typeof document == 'undefined') {
  main();
} else {
  document.querySelector('#start-recording').addEventListener('click', function() { interface(1) })
}
