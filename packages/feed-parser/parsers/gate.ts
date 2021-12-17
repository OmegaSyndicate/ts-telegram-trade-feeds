import * as ws from 'ws';
import { request } from '../helpers/request';

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
                    logger.error("The connection failed for an unknown reason after 5 minutes.");
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
        logger.error("The websocket connection was closed.");
    });
    w.on('error', (msg) => {
        logger.error('An error has occurred in the websocket connection.');
        tempReceived = undefined;
        // throw "An error has occurred in the websocket connection."
    })
    while(true) {
        let received = tempReceived;
        tempReceived = []

        let ethereum;
        let bitcoin;
        if(received.length > 0) {
            await Promise.all(settings.pairs.map(async (pair) => {
                if(!pair.toLowerCase().includes('usd')) {
                    let anotherSymbol = pair.split('_')[1].toLowerCase();
                    if(anotherSymbol.includes('btc')) {
                        anotherSymbol = 'bitcoin';
                    } else if(anotherSymbol.includes('eth')) {
                        anotherSymbol = 'ethereum';
                    }
                    let anotherPrice = (await request('GET', "https://api.coingecko.com/api/v3/simple/price", { params: {
                        ids: anotherSymbol,
                        vs_currencies: "usd"
                    }}))[anotherSymbol].usd;
                    if(anotherSymbol == 'bitcoin') {
                        bitcoin = anotherPrice;
                    } else if(anotherSymbol == 'ethereum') {
                        ethereum = anotherPrice;
                    }
                }
            }));
        }
        yield received.map((t) => {
            if(t.currency_pair.toLowerCase().includes('btc')) {
                t.anotherPrice = bitcoin;
            } else if(t.currency_pair.toLowerCase().includes('eth')) {
                t.anotherPrice = ethereum;
            }
            return JSON.stringify(t);
        });
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
