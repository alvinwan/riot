var wifi = require('node-wifi');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {

// Initialize wifi module
// Absolutely necessary even to set interface to null
wifi.init({
    iface : null // network interface, choose a random wifi interface if set to null
});

data = {samples: []}

if (process.argv.length <= 2) {
  n = 1
} else {
  n = process.argv[2]
}

for (var i=0; i < n; i++){
// Scan networks
wifi.scan(function(err, networks) {
    if (err) {
        console.log(err);
    } else {
        sample = []
        networks.forEach(function(network) {
            sample.push({mac: network['mac'], signal_level: network['signal_level'], ssid: network['ssid']})
        })
        data['samples'].push(sample)
    }
});
await sleep(5000);
}

var json = JSON.stringify(data)
var fs = require('fs');
fs.writeFile('samples.json', json, 'utf8', function() {});
}

demo();
