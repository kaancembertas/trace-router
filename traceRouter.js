const Traceroute = require('nodejs-traceroute');

const runTracer = (destination) => {
    let response = '';
    return new Promise((resolve, reject) => {
        try {
            const tracer = new Traceroute();
            tracer
                .on('destination', (currentDestination) => {
                    console.log(response)
                    response += "\ndestination: " + currentDestination;
                })
                .on('hop', (hop) => {
                    if (hop.rtt1 === '*') return;
                    response += "\nhop: " + hop.hop;
                    response += "\trtt1:" + hop.rtt1;
                    response += "\trtt2:" + hop.rtt2;
                    response += "\trtt3:" + hop.rtt3;
                    response += "\tip:" + hop.ip
                })
                .on('close', (code) => {
                    resolve(response);
                });

            tracer.trace(destination);
        } catch (err) {
            reject(err)
        }
    });
}

const onTracerComplete = (response) => {
    console.log(response);
}

const onTracerError = (err) => {
    console.log(err);
}

const main = () => {
    runTracer("twitchsozluk.com")
        .then(onTracerComplete)
        .catch(onTracerError);
}

main();