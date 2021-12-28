import { request } from "../helpers/request";

// GET https://api.bkex.com/v2/q/deals?symbol=CSPR_USDT&size=20

export async function* sync(latestMessage, settings, logger) {
    while(true) {
        const latest = (await latestMessage())?.value;
        yield await makeRequest(settings, logger, latest);
    }
}

async function makeRequest(settings, logger, latestString?) {
    const received: apiResponse = (await request("GET", `https://api.bkex.com/v2/q/deals`, { params: { symbol: settings.pair } }));
    if(received.code != 0 || !(received.data instanceof Array) || !received.data.length) {
        logger.error(`An error occurred while making a request from BKEX.`);
        logger.error(received);
        return undefined;
    }
    let data: Transaction[] | [];
    if(latestString) {
        const latest: Transaction = JSON.parse(latestString);
        data = received.data.reverse().filter((transaction: Transaction) => Number(transaction.ts) > Number(latest.ts));
    } else {
        data = received.data.reverse();
    }
    return data.filter(t => (+t.price * t.volume) >= settings.minUSD).map(t => JSON.stringify(t));
}

interface apiResponse {
    code: number, // 200 - success
    data: Transaction[]
}

interface Transaction {
    direction: "B" | "S", // B - Buy, S - Sell
    price: number,
    symbol: string,
    ts: number, // timestamp
    volume: number
}