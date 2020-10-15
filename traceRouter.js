const Traceroute = require("nodejs-traceroute");
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
  const hopsResponse = [];

  for (let i = 0; i < 10; i++) {
    try {
      const response = await runTracer(ip);
      hopsResponse.push(response);
    } catch (error) {
      console.log(error);
    }
  }

  const latencies = hopsResponse.map((hop) =>
    Number(hop[hop.length - 1].rtt.split(" ")[0])
  );

  writeHopsResponse(ip, hopsResponse);
  writeLatency(ip, latencies);
};

const writeHopsResponse = (ip, response) => {
  const dir = "./logs/" + ip;
  const dateStr = getDateString();

  //Create IP folder
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const stream = fs.createWriteStream(dir + "/" + dateStr + ".txt", {
    flags: "a",
  });

  response.forEach((hops) => {
    hops.forEach((hop) => {
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
    stream.write("--------------------\n");
  });
};

const writeLatency = (ip, latencyArr) => {
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
  const ipAdresses = [
    "88.255.121.218", //İstanbul - Ataşehir
    "5.2.87.161", //İzmir
    "84.205.246.215", //Greece
    "40.68.3.51", //Netherlands
    "95.173.136.168", //Russia, Moscow
  ];
  startTracerLoop("88.255.121.218");
  //startTracerLoop("");
};

main();
