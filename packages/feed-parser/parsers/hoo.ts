import { request } from "../helpers/request";

// GET
const tradeApiURL = 'https://api.hoolgd.com/open/v1/trade/market';

export async function* sync(latestMessage, settings, logger) {
    while(true) {
        const latest = (await latestMessage())?.value;
        yield await makeRequest(settings, logger, latest);
    }
}

async function makeRequest(settings, logger, latestString?) {
    const received: apiResponse = (await request("GET", tradeApiURL, { params: { symbol: settings.pair } }));
    if(received.code != 0 || !(received.data instanceof Array) || !received.data.length) {
        logger.error(`An error occurred while making a request from HOO.`);
        logger.error(received);
        return undefined;
    }
    let data: Transaction[] | [];
    if(latestString) {
        const latest: Transaction = JSON.parse(latestString);
        data = received.data.filter((transaction: Transaction) => Number(transaction.time) > Number(latest.time));
    } else {
        data = received.data;
    }
    return data.filter(t => (+t.price * +t.volume) >= settings.minUSD).map(t => JSON.stringify(t));
}

interface apiResponse {
    code: number, // 200 - success
    data: Transaction[]
}

interface Transaction {
    amount: string //'0.918',
    price: string //'2.04',
    side: -1 | 1, // -1 — sell, 1 - buy. if(~side) { /* buy */ } else { /* sell */ }
    time: number //1574942822160,
    volume: string //'0.45'
}