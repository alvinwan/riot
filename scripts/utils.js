var fs = require('fs');

module.exports = {
  get_filenames: get_filenames,
  sleep: sleep
}

function get_filenames() {
  filenames = new Set([]);
  fs.readdirSync("data/").forEach(function(filename) {
      filenames.add(filename.replace('_train', '').replace('_test', '').replace('.json', '' ))
  });
  filenames = Array.from(filenames.values())
  filenames.sort();
  if (filenames.indexOf('.DS_Store') > -1) {
    filenames.splice(filenames.indexOf('.DS_Store'), 1)
  }
  return filenames
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}
