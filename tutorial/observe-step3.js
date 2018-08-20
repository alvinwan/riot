var wifi = require('node-wifi');
var fs = require('fs');

/**
 * Uses a recursive function for repeated scans, since scans are asynchronous.
 */
function record(n, completion, hook) {
  wifi.init({
      iface : null // network interface, choose a random wifi interface if set to null
  });

  samples = []
  function startScan(i) {
    wifi.scan(function(err, networks) {
        if (err || networks.length == 0) {
          startScan(i);
          return
        }
        if (i <= 0) {
          return completion({samples: samples});
        }
        hook(i, networks)
        samples.push(networks)
        startScan(i-1);
    });
  }

  startScan(n);
}

function cli() {
  record(1, function(data) {
    fs.writeFile('samples.json', JSON.stringify(data), 'utf8', function() {});
  }, function(i, networks) {
    console.log(" * [INFO] Collected sample " + (1-i) + " with " + networks.length + " networks")
  })
}

function ui() {
  var status = document.querySelector('#add-status');
  status.style.display = "block"
  status.innerHTML = "Listening for wifi..."

  function completion() {
    train_data = {samples: data['samples'].slice(0, 15)}
    test_data = {samples: data['samples'].slice(15)}
    var train_json = JSON.stringify(train_data);
    var test_json = JSON.stringify(test_data);

    fs.writeFile('data/' + room_name + '_train.json', train_json, 'utf8', function() {});
    fs.writeFile('data/' + room_name + '_test.json', test_json, 'utf8', function() {});
    console.log(" * [INFO] Done")
    status.innerHTML = "Done"
  }
  record(20, completion, function(i, networks) {
    console.log(" * [INFO] Collected sample " + (21-i) + " with " + networks.length + " networks")
  })
}

if (typeof document == 'undefined') {
  cli();
} else {
  document.querySelector('#start-recording').addEventListener('click', ui)
}
