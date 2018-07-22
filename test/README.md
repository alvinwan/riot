# riot
room detection for mobile interaction with internet of things (IoT) devices

```
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
```
