import { request } from "../helpers/request";

// GET https://openapi.digifinex.com/v3/trades?symbol=XRD_USDT

export async function* sync(latestMessage, settings, logger) {
    while (true) {
        const latest = (await latestMessage())?.value;
        yield await makeRequest(settings, logger, latest);
    }
}

async function makeRequest(settings, logger, latestString?: string) {    
    const received: ApiResponse = await request("GET", `https://openapi.digifinex.com/v3/trades?symbol=${settings.token}`, { });
    let result: Transaction[] = [];

    if (latestString) {
        const latest: Transaction = JSON.parse(latestString);        

        result = received.data.filter((transaction: Transaction) => {
            if (transaction.date > latest.date) {
                console.log(`Latest id = ${latest.id}: ${transaction.date} > ${latest.date} = ${transaction.date > latest.date}`);
            }
            return new Date(transaction.date * 1000) > new Date(latest.date * 1000)
        });
    } else {
        console.log("Digifinex no latest message: " + received.data.length);

        result = received.data;
    }

    return result.map(t => JSON.stringify(t));
}

interface ApiResponse {
    data: Transaction[],
    date: number,
    code: number
}

interface Transaction {
    id: number,
    date: number,
    type: "buy" | "sell", // BID - BUY, ASK - SELL
    amount: number,
    price: number
}