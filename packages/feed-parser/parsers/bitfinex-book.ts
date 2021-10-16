import * as ws from 'ws';

export async function* sync(latestMessage, settings, logger) {
    let latestData = [];
    const w = new ws('wss://api-pub.bitfinex.com/ws/2');
    let msg = JSON.stringify({ 
        event: 'subscribe', 
        channel: 'book', 
        symbol: settings.token,
        len: "250"
    })
    w.on('message', (msg) => {
        msg = JSON.parse(msg);
        if(Array.isArray(msg)) {
            let transactions = msg[1];
            if(!(transactions instanceof Array)) {
                return;
            }
            if(transactions[0] instanceof Array) {
                transactions = transactions
                    .filter(transaction => transaction[2] != 1 && transaction[2] != -1)
                    .map(formatTrans);
                
                latestData = latestData.concat(transactions);
                return;
            }
            if(transactions[2] == -1 || transactions[2] == 1) {
                return;
            }
            latestData.push(formatTrans(transactions));
            return;
        }
    })
    w.on('open', () => w.send(msg))
    const latestMsg = (await latestMessage())?.value
    let isFirstRunning = true;
    while(true) {
        let receivedData = latestData;
        latestData = [];
        if(isFirstRunning && latestMsg && receivedData?.length) {
            let latestString = stringTransaction(JSON.parse(String(latestMsg)));
            

            const offset = receivedData.map(stringTransaction).indexOf(latestString) + 1;
            if(offset == -1) {
                yield receivedData = [];
                continue;
            }
            receivedData = receivedData.slice(offset);
            isFirstRunning = false;
        }
        yield receivedData;
    }
}

// Bitfinex Related Code
function formatTrans(ticker) {
  return JSON.stringify(ticker, null)
}

function stringTransaction(arr: number[]) {
    return `${arr[0]}${arr[1]}${arr[2]}`;
}