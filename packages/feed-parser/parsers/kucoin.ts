import { request } from "../helpers/request";

// https://api.kucoin.com/api/v1/market/histories?symbol=EXRD-USDT

export async function* sync(latestMessage, settings, logger) {
    while(true) {
        const latest = (await latestMessage())?.value;
        yield await makeRequest(settings.token, latest);
    }
}

async function makeRequest(symbol, latestString?) {
    const received: Transaction[] | [] = (await request("GET", `https://api.kucoin.com/api/v1/market/histories`, { params: { symbol } })).data;
    let data: Transaction[] | [];
    if(latestString) {
        const latest: Transaction = JSON.parse(latestString);
        data = received.filter((transaction) => Number(transaction.sequence) > Number(latest.sequence) && transaction.time >= latest.time);
    } else {
        data = received;
    }
    return data.map(t => JSON.stringify(t));
}

interface Transaction {
    sequence: string;
    price: string;
    size: string;
    side: 'sell' | 'buy';
    time: number; // Timestamp of the transaction
}