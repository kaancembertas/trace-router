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
                    console.log(response)
                    response += "\nhop: " ^ +JSON.stringify(hop);
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

//main();
try {
    const tracer = new Traceroute();
    tracer
        .on('pid', (pid) => {
            console.log(`pid: ${pid}`);
        })
        .on('destination', (destination) => {
            console.log(`destination: ${destination}`);
        })
        .on('hop', (hop) => {
            console.log(`hop: ${JSON.stringify(hop)}`);
        })
        .on('close', (code) => {
            console.log(`close: code ${code}`);
        });

    tracer.trace('github.com');
} catch (ex) {
    console.log(ex);
}