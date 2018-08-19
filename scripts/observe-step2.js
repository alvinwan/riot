var wifi = require('node-wifi');
var fs = require('fs');

/**
 * Uses a recursive function for repeated scans, since scans are asynchronous.
 */
function record(completion) {
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
        console.log(" * [INFO] Collected sample " + (21-i) + " with " + networks.length + " networks")
        samples.push(networks)
        startScan(i-1);
    });
  }

  startScan(20);
}

record(function(data) {
  fs.writeFile('samples.json', JSON.stringify(data), 'utf8', function() {});
})
