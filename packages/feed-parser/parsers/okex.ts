import * as ws from 'ws';

// wss://ws.okex.com:8443/ws/v5/public

export async function* sync(latestMessage, settings, logger) {
    let connected = false;
    let tempReceived = [];
    const latestBuffer = (await latestMessage())?.value;
    let latest = latestBuffer ? JSON.parse(String(latestBuffer)) : undefined;
    const w = new ws('wss://ws.okex.com:8443/ws/v5/public');
    w.on('open', () => {
            w.send(JSON.stringify({op: "subscribe",args:[{channel:"trades",instId: settings.pair}]}));
            setInterval(() => {
                w.send('ping');
            }, 20000)
            setTimeout(() => {
                if(!connected) {
                    tempReceived = undefined;
                    throw "The connection failed for an unknown reason after 5 minutes.";
                }
            }, 300*1e3)
    })
    w.on('message', (msg: webSocketEvent) => {
        if(String(msg) == 'pong') {
            return;
        }
        msg = JSON.parse(String(msg));
        // console.log(msg)
        if(msg.event == "subscribe" ) {
            connected = true;
        }
        if(msg.data) {
            tempReceived = tempReceived.concat(msg.data);
        }
    });
    w.on('close', () => {
        tempReceived = undefined;
        logger.error("The websocket connection was closed.");
    });
    w.on('error', (msg) => {
        console.log(String(msg))
        logger.error('An error has occurred in the websocket connection.');
        tempReceived = undefined;
        // throw "An error has occurred in the websocket connection."
    })
    while(true) {
        let received = tempReceived;
        tempReceived = []
        yield received.filter(t => (+t.sz * +t.px) >= 10000).map(t => JSON.stringify(t));
    }
}

interface webSocketEvent {
    time: number,
    channel: "spot.trades",
    event:  "subscribe",
    data: status & Transaction
}

interface status {
    status: "success" | "failed"
}

interface Transaction {
    instId: string, // pair
    tradeId: string,
    px: string, // price
    sz: string, // size
    side: 'sell' | 'buy',
    ts: string // timestamp
}

// (async () => {
//     const w = new ws('wss://ws.okex.com:8443/ws/v5/public');
//     w.on('open', () => {
//             w.send(JSON.stringify(
//                 {op: "subscribe",args:[{channel:"trades",instId:"TONCOIN-USDT"}]}
//             ));
//     })
//     w.on('message', (msg: webSocketEvent) => {
//         msg = JSON.parse(String(msg));
//         console.log(msg);
//     });
// })()