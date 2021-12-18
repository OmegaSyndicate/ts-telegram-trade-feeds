import * as ws from 'ws';
import { ungzip } from 'node-gzip';

// wss://www.huobi.com/-/s/pro/ws

export async function* sync(latestMessage, settings, logger) {
    let connected = false;
    let tempReceived = [];
    // const latestBuffer = (await latestMessage())?.value;
    // let latest = latestBuffer ? JSON.parse(String(latestBuffer)) : undefined;
    const w = new ws('wss://api.huobi.pro/ws');
    w.on('open', () => {
        settings.pairs.forEach((pair) => {
            w.send(JSON.stringify(
                { sub:`market.${pair}.trade.detail`, symbol: pair}
            ));
        });
        setTimeout(() => {
            if(!connected) {
                tempReceived = undefined;
                logger.error("The connection failed for an unknown reason after 5 minutes.");
                w.close();
            }
        }, 300*1e3)
    })
    w.on('message', async (msg: webSocketEvent) => {
        connected = true;

        msg = await ungzip(msg).then((r) => {
            let data = JSON.parse(r.toString());
            return data;
        }).catch(logger.error);
        console.log(msg)

        if(msg.ping) {
            w.send(JSON.stringify({ pong: msg.ping }))
        }

        if(msg.tick) {
            tempReceived = tempReceived.concat(msg.tick.data);
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
        w.close();
        // throw "An error has occurred in the websocket connection."
    })
    while(true) {
        let received = tempReceived;
        tempReceived = []
        yield received.map(t => JSON.stringify(t));
    }
}

interface webSocketEvent {
    ch: string | 'market.csprusdt.trade.detail',
    ts: number,
    tick: { id: number, ts: number, data: Transaction[] },
    ping?: number
}

interface Transaction {
    id: number,
    ts: number,
    tradeId: number,
    amount: number,
    price: number,
    direction: 'sell' | 'buy'
}

// (async () => {
//     const w = new ws('wss://api.huobi.pro/ws');
//     w.on('open', () => {
//             w.send(JSON.stringify(
//                 {sub:"market.csprusdt.trade.detail",symbol:"csprusdt"}
//             ));
//             w.send(JSON.stringify(
//                 {"sub":"market.btcusdt.trade.detail","symbol":"btcusdt"}
//             ));
//     })
//     w.on('message', async (msg: webSocketEvent) => {
//         // msg = JSON.parse(String(msg));

//         msg = await ungzip(msg).then((r) => {
//             let data = JSON.parse(r.toString());
//             // console.log(data); 
//             return data;
//         }).catch(console.error);
//         if(msg.ping) {
//             w.send(JSON.stringify({ pong: msg.ping }))
//         }
//         if(msg.tick) {
//             console.log(msg);
//         }
//     });
// })()