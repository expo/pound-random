/**
 * Usage:
 * 
 * 
  
    > time.start();require("jsdom");time.end()
    time: 553ms  
  
    > time(() => {require("./package.json");})
    time: 0ms
    undefined

    > time(() => {require("./package.json");}, 'package-json-require')
    package-json-require: 1ms
    undefined

    > time(links.infoForLinkAsync("https://en.wikipedia.org/wiki/Kevin_Bacon"), 'kevin-bacon')
    Promise { ...
    > kevin-bacon: 603ms

    > time(links.infoForLinkAsync("https://en.wikipedia.org/wiki/Kevin_Bacon"))
    Promise { ...
    > time: 522ms

    > time.start('outer');for(let i=0;i<2;i++){time.start();for(let j=0;j<100000000;j++){Math.random();};time.end()};time.end('outer')
    time: 1421ms
    time: 1348ms
    outer: 2770ms
    2770
    >

 * 
 */

let startTimes = {};

function start(key = '') {
  startTimes[key] = Date.now();
}

function end(key = '', label, opts) {
  opts = opts || {};
  let message = opts.message;
  let threshold = opts.threshold;
  key = '' + key;
  let endTime = Date.now();
  let t = endTime - startTimes[key];
  delete startTimes[key];
  if (threshold && (t < threshold)) {
    return t;
  }
  label = label || key;
  if (label.startsWith('0.') || (label === '')) {
    label = 'time';
  }
  message = message || '';
  console.log(label + ': ' + t + 'ms', message);
  return t;
}

function time(f, ...args) {
  key = Math.random();
  start(key);
  if (Promise.resolve(f) === f) {
    x = f;
  } else {
    x = f(...args);
  }
  if (Promise.resolve(x) === x) {
    return new Promise((resolve, reject) => {
      x.then((...results) => {
        end(key);
        resolve(...results);
      }).catch((err) => {
        end(key);
        reject(err);
      });
    });
  } else {
    end(key);
    return x;
  }
}

time.start = start;
time.end = end;

module.exports = time;
