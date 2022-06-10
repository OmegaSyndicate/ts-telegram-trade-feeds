import { traceDeprecation } from "process";
import { request } from "../../shared/helpers/request";

// GET https://www.mexc.com/open/api/v2/market/deals?symbol=cspr_usdt

export async function* sync(latestMessage, settings, logger) {
    while(true) {
        const latest = (await latestMessage())?.value;
        yield await makeRequest(settings, logger, latest);
    }
}

async function makeRequest(settings, logger, latestString?) {
    const received: apiResponse = (await request("GET", `https://www.mexc.com/open/api/v2/market/deals?symbol=${settings.token}`, {  }));
    if(received.code != 200 || !(received.data instanceof Array) || !received.data.length) {
        logger.error(`An error occurred while making a request from MEXC.`);
        logger.error(received);
        return undefined;
    }
    let data: Transaction[] | [];

    // Filter out old transactions
    data = received.data.reverse().filter((transaction: Transaction) => new Date(transaction.trade_time) > new Date(settings.fromTimestamp * 1000));

    if(latestString) {
        const latest: Transaction = JSON.parse(latestString);
        data = data.reverse().filter((transaction: Transaction) => new Date(transaction.trade_time) > new Date(latest.trade_time));
    } 
    
    return data.filter((t) => (+t.trade_quantity * +t.trade_price) >= settings.minUSD).map(t => JSON.stringify(t));
}

interface apiResponse {
    code: number, // 200 - success
    data: Transaction[]
}

interface Transaction {
    trade_time: number,
    trade_price: string,
    trade_quantity: string,
    trade_type: "BID" | "ASK" // BID - BUY, ASK - SELL
}