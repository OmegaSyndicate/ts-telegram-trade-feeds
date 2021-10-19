import { request } from "../helpers/request";


export async function* sync(latestMessage, settings, logger) {
    let params: IParams = {
        type: "1min",
        symbol: settings.token,
        startAt: 0,
        endAt: Date.now() / 1e3,
    };
    let data;
    while(true) {
        let latest = (await latestMessage())?.value;
        if(latest == undefined) {
            do {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const { received, latestStart } = await makeRequest(params);
                if(latestStart) {
                    params.startAt = latestStart + 1;
                }
                yield data = received.map(transaction => JSON.stringify(transaction));
            } while(data.length)
        } else {
            const latestTimestamp = JSON.parse(String(latest))[0];
            if(Number(latestTimestamp) == NaN) {
                latest = undefined;
                continue;
            }
            params.startAt = latestTimestamp + 1;
            while(true) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                params.endAt = Date.now() / 1e3;
                const { received, latestStart } = await makeRequest(params);
                if(latestStart) {
                    params.startAt = latestStart + 1;
                }
                yield data = received.map(transaction => JSON.stringify(transaction));
            }
        }
    }
}

async function makeRequest(params: IParams) {
    const received = (await request("GET", `https://api.kucoin.com/api/v1/market/candles`, { params })).data.reverse();
    let latestStart = 0;
    if(received instanceof Array) {
        if(received[received.length - 1] instanceof Array) {
            latestStart = received[received.length - 1][0];
        }
    }
    // return received;
    return { received, latestStart }
}

interface IParams {
    symbol: string; // Example BTC-USDT
    startAt: number; // Start timestamp in seconds
    endAt: number; // End timestamp in seconds
    type: "1min" | "3min" | "5min" | "15min" | "30min" | "1hour" | "2hour" | "4hour" | "6hour" | "8hour" | "12hour" | "1day" | "1week"; // Type of candlestick patterns: 
}