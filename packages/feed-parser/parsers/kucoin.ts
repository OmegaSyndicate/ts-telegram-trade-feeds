import { request } from "../helpers/request";

// https://api.kucoin.com/api/v1/market/histories?symbol=EXRD-USDT

export async function* sync(latestMessage, settings, logger) {
    while(true) {
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));
        let latest = (await latestMessage())?.value;
        yield await makeRequest(settings.token, latest);
    }
}

async function makeRequest(symbol, latest?) {
    const received = (await request("GET", `https://api.kucoin.com/api/v1/market/histories`, { params: { symbol } })).data;
    let offset = 0;
    if(latest) {
        const latestString = transactionString(JSON.parse(String(latest)));
        offset = received.map(transactionString).indexOf(latestString) + 1;
    }
    return received.slice(offset)?.map(t => JSON.stringify(t));
}

interface Transaction {
    sequence: string;
    price: string;
    size: string;
    side: 'sell' | 'buy';
    time: number; // Timestamp of the transaction
}

function transactionString(t: Transaction) {
    return `${t.sequence}-${t.price}-${t.size}-${t.side}-${t.time}`;
}