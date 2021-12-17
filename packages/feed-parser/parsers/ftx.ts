import { request } from "../helpers/request";

// https://ftx.com/api/markets/TONCOIN/USD/trades

export async function* sync(latestMessage, settings, logger) {
    while(true) {
        const latest = (await latestMessage())?.value;
        yield await makeRequest(settings, logger, latest);
    }
}

async function makeRequest(settings, logger, latestString?) {
    const fromTimestamp = (latestString ? new Date(JSON.parse(latestString).time).getTime() : new Date().getTime() - 600 * 1e3) / 1e3;
    const toTimestamp = new Date().getTime() / 1e3;
    const received: apiResponse = (await request("GET", `https://ftx.com/api/markets/${settings.pair}/trades`, { params: { fromTimestamp, toTimestamp } }));
    if(!received.success) {
        logger.error(`An error occurred while making a request from FTX.`);
        logger.error(received);
        return undefined;
    }
    let data: Transaction[] | [];
    if(latestString) {
        const latest: Transaction = JSON.parse(latestString);
        data = received.result.reverse().filter((transaction: Transaction) => Number(transaction.id) > Number(latest.id) && new Date(transaction.time) >= new Date(latest.time));
    } else {
        data = received.result.reverse();
    }
    return data.map(t => JSON.stringify(t));
}

interface apiResponse {
    success: boolean,
    result: Transaction[] | [] // order direction descending
}

interface Transaction {
    id: number,
    price: number,
    size: number,
    side: "sell" | "buy",
    liquidation: boolean,
    time: Date
}