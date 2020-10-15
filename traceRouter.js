const Traceroute = require("nodejs-traceroute");
var ping = require('jjg-ping');
const fs = require("fs");

const runTracer = (destination) => {
  let response = [];
  return new Promise((resolve, reject) => {
    try {
      const tracer = new Traceroute();
      tracer
        .on("hop", (hop) => {
          console.log(hop);
          if (hop.rtt1 === "*") return;
          response.push({
            hop: hop.hop,
            rtt: hop.rtt1,
            ip: hop.ip,
          });
        })
        .on("close", (code) => {
          console.log("Response:", response);
          resolve(response);
        });

      tracer.trace(destination);
    } catch (err) {
      reject(err);
    }
  });
};

const runPing = (destination) => {
  return new Promise((resolve, reject) => {
    ping.system.ping(destination, (latency, status) => {
      if (status) {
        resolve(latency)
      }
      else reject();
    })
  });
}

const getDateString = () => {
  const date = new Date();
  const dateStr =
    date.getDate() +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    date.getFullYear() +
    "-" +
    date.getHours() +
    "-" +
    date.getMinutes();
  return dateStr;
};

const startTracerLoop = async (ip) => {
  let hopResponse;
  const latencyArr = [];
  try {
    const response = await runTracer(ip);
    hopResponse = response;

    for (let i = 0; i < 10; i++) {
      const latency = await runPing(ip);
      latencyArr.push(latency);
    }
  } catch (error) {
    console.log(error);
  }

  writeHopResponse(ip, hopResponse);
  writeLatency(ip, latencyArr);
};

const writeHopResponse = (ip, response) => {
  const dir = "./logs/" + ip;
  const dateStr = getDateString();

  //Create IP folder
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const stream = fs.createWriteStream(dir + "/" + dateStr + ".txt", {
    flags: "a",
  });

  response.forEach((hop) => {
    stream.write(
      "hop:" +
      hop.hop +
      "\t" +
      "rtt:" +
      hop.rtt +
      "\t" +
      "ip:" +
      hop.ip +
      "\n"
    );
  });
};

const writeLatency = (ip, latencyArr) => {
  //Create latencies folder
  if (!fs.existsSync("./latencies")) {
    fs.mkdirSync("./latencies");
  }
  const stream = fs.createWriteStream("latencies/" + ip + ".txt", {
    flags: "a",
  });

  const dateString = getDateString();
  const min = Math.min(...latencyArr);
  const max = Math.max(...latencyArr);
  const avg = latencyArr.reduce((a, b) => a + b, 0) / latencyArr.length;

  stream.write(dateString + "\t" + min + "\t" + max + "\t" + avg + "\n");
};

const main = () => {
  //Create logs folder
  if (!fs.existsSync("./logs")) {
    fs.mkdirSync("./logs");
  }
  const ipAdresses = [
    "88.255.121.218", //İstanbul - Ataşehir
    "5.2.87.161", //İzmir
    "157.240.9.35", //Bulgaria
    "140.82.121.3", //Netherlands
    "151.101.194.167", //Canada, nytimes.com
  ];

  ipAdresses.forEach(ip => startTracerLoop(ip));

  //Run per hour
  setInterval(() => {
    ipAdresses.forEach(ip => startTracerLoop(ip));
  }, 1000 * 60 * 60);
};

main();