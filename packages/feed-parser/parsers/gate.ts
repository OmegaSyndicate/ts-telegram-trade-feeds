import * as ws from 'ws';

// wss://api.gateio.ws/ws/v4/

export async function* sync(latestMessage, settings, logger) {
    let connected = false;
    let tempReceived = [];
    const latestBuffer = (await latestMessage())?.value;
    let latest = latestBuffer ? JSON.parse(String(latestBuffer)) : undefined;
    const w = new ws('wss://api.gateio.ws/ws/v4/');
    w.on('open', () => {
            w.send(JSON.stringify({
                time: latest ? latest.create_time : new Date().getDate() - 1200*1e3,
                channel: "spot.trades",
                event: "subscribe",
                payload: settings.pairs
            }));
            setTimeout(() => {
                if(!connected) {
                    tempReceived = undefined;
                    throw "The connection failed for an unknown reason after 5 minutes.";
                }
            }, 300*1e3)
    })
    w.on('message', (msg: webSocketEvent) => {
        msg = JSON.parse(String(msg));
        if(msg.event == "subscribe" && msg.result.status && msg.result.status == "success") {
            connected = true;
        }
        if(msg.event == "update") {
            tempReceived.push(msg.result);
        }
    });
    w.on('close', () => {
        tempReceived = undefined;
        throw "The websocket connection was closed."
    });
    w.on('error', (msg) => {
        logger.error('An error has occurred in the websocket connection.');
        tempReceived = undefined;
        throw "An error has occurred in the websocket connection."
    })
    while(true) {
        let received = tempReceived;
        tempReceived = []
        yield received.map(t => JSON.stringify(t));
    }
}

interface webSocketEvent {
    time: number,
    channel: "spot.trades",
    event: "update" | "subscribe",
    result: status & Transaction
}

interface status {
    status: "success" | "failed"
}

interface Transaction {
    id: number,
    create_time: number,
    create_time_ms: string,
    side: "sell" | "buy",
    currency_pair: string,
    amount: string,
    price: string
}
