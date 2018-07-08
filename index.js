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

for (var i=0; i < 1; i++){
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
        // console.log("[", i, "]", " Read ", networks.length, "networks");
        /*
        networks = [
            {
              ssid: '...',
              bssid: '...',
              mac: '...', // equals to bssid (for retrocompatibility)
              channel: <number>,
              frequency: <number>, // in MHz
              signal_level: <number>, // in dB
              security: 'WPA WPA2' // format depending on locale for open networks in Windows
              security_flags: '...' // encryption protocols (format currently depending of the OS)
              mode: '...' // network mode like Infra (format currently depending of the OS)
            },
            ...
        ];
        */
    }
});
await sleep(5000);
}

var json = JSON.stringify(data)
var fs = require('fs');
fs.writeFile('samples.json', json, 'utf8', function() {});
}

demo();
