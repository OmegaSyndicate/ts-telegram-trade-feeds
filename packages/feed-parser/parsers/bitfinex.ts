import { request } from "../helpers/request";

export async function* sync(latestMessage, settings, logger) {
    let params: IParams = {
        limit: 10000,
        start: settings.fromTimestamp,
        end: Date.now(),
        sort: 1
    };
    let data;
    while(true) {
        let latest = (await latestMessage())?.value;
        if(latest == undefined) {
            do {
                console.log("In while");
                await new Promise(resolve => setTimeout(resolve, 2000));
                const { received, latestStart } = await makeRequest(settings.token, params);
                if(latestStart) {
                    params.start = latestStart + 1;
                }
                yield data = received.map(transaction => JSON.stringify(transaction));
            } while(data.length)
        } else {
            const latestTimestamp = JSON.parse(String(latest))[1];
            if(Number(latestTimestamp) == NaN) {
                latest = undefined;
                continue;
            }
            params.start = latestTimestamp + 1;
            while(true) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                params.end = Date.now();
                const { received, latestStart } = await makeRequest(settings.token, params);
                if(latestStart) {
                    params.start = latestStart + 1;
                }
                yield data = received.map(transaction => JSON.stringify(transaction));
            }
        }
    }
}

interface IParams {
    limit: number; // Max 10000
    start: number; // ms
    end: number; // ms
    sort: number; // if = 1 it sorts results returned with old > new
}

async function makeRequest(token: string, params: IParams) {
    const received = await request("GET", `https://api-pub.bitfinex.com/v2/trades/${token}/hist`, { params });
    let latestStart = 0;
    if(received instanceof Array) {
        if(received[received.length - 1] instanceof Array) {
            latestStart = received[received.length - 1][1];
        }
    }
    return { received, latestStart }
}

// (async () => {
//     let ss = sync(async () => { return { value: undefined }}, { token: "tXRDUSD"}, ()=>{})
//     console.log( (await ss.next()).value)
//     console.log( (await ss.next()).value)
//     console.log( (await ss.next()).value)
//     console.log( (await ss.next()).value)
// })()

// makeRequest("tXRDUSD", { limit: 10000, start: 0, end: Date.now(), sort: 1})