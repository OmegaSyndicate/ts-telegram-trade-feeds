import { request } from "../helpers/request";

// GET https://api-cloud.bitmart.com/spot/v1/symbols/trades?symbol=CSPR_USDT

export async function* sync(latestMessage, settings, logger) {
    while(true) {
        const latest = (await latestMessage())?.value;
        yield await makeRequest(settings, logger, latest);
    }
}

async function makeRequest(settings, logger, latestString?) {
    const received: apiResponse = (await request("GET", `https://api-cloud.bitmart.com/spot/v1/symbols/trades`, { params: { symbol: settings.pair  } }));
    if(received.code != 1000 || !(received.data.trades instanceof Array) || !received.data.trades.length) {
        logger.error(`An error occurred while making a request from bitmart.`);
        logger.error(received);
        return undefined;
    }
    let data: Transaction[] | [];
    if(latestString) {
        const latest: Transaction = JSON.parse(latestString);
        data = received.data.trades.reverse().filter((transaction: Transaction) => Number(transaction.order_time) > Number(latest.order_time));
    } else {
        data = received.data.trades.reverse();
    }
    return data.filter(t => +t.amount >= 10000).map(t => JSON.stringify(t));
}

interface apiResponse {
    message: string, // ok - ok
    code: number, // 1000 - ok
    data: {
        trades: Transaction[]
    }

}

interface Transaction {
    amount: string, // in usd
    order_time: number,
    price: string,
    count: string, // in casper
    type: "sell" | "buy"
}