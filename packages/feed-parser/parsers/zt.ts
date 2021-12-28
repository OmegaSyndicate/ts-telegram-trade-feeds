import { request } from "../helpers/request";

// https://www.ztb.im/api/v1/trades?symbol=BTC_USDT&size=100

export async function* sync(latestMessage, settings, logger) {
    while(true) {
        const latest = (await latestMessage())?.value;
        yield await makeRequest(settings, logger, latest);
    }
}

async function makeRequest(settings, logger, latestString?) {
    const received: Transaction[] = (await request("GET", `https://www.ztb.im/api/v1/trades`, { params: { symbol: settings.pair, size: 100 } }));
    if(!(received instanceof Array) || !received.length) {
        logger.error(`An error occurred while making a request from ZT.`);
        logger.error(received);
        return undefined;
    }
    let data: Transaction[] | [];
    if(latestString) {
        const latest: Transaction = JSON.parse(latestString);
        console.log(latest)
        data = received.reverse().filter((transaction: Transaction) => new Date(+transaction.timestamp) >= new Date(+latest.timestamp));
    } else {
        data = received.reverse();
    }
    return data.filter(t => (+t.amount * +t.price) >= settings.minUSD).map(t => JSON.stringify(Object.assign(t, { pair: settings.pair })));
}

interface Transaction {
    amount: string,
    price: string,
    side: "buy" | "sell",
    timestamp: string
}