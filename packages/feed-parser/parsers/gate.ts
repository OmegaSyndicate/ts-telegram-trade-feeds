import { request } from "../helpers/request";

// GET https://api.gateio.ws/api/v4/spot/trades?currency_pair=XRD_USDT


export async function* sync(latestMessage, settings, logger) {
    while (true) {
        const latest = (await latestMessage())?.value;
        yield await makeRequest(settings, logger, latest);
    }
}

async function makeRequest(settings, logger, latestString?: string) {
    let lastID = '';

    if (latestString) {
        const latest: Transaction = JSON.parse(latestString);
        
        lastID = `&last_id=${latest.id}`;
    }

    const received = await request("GET", `https://api.gateio.ws/api/v4/spot/trades?currency_pair=${settings.token}${lastID}`, {});
    
    return received;
}

interface Transaction {
    id: string,
    create_time: string,
    create_time_ms: string,
    currency_pair: string,
    side: "BID" | "ASK", // BID - BUY, ASK - SELL
    amount: string,
    price: string
}