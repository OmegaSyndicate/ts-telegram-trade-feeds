import { request } from "../helpers/request";

export async function* sync(latestMessage, settings, logger) {
    let params: IParams = {
        limit: 10000,
        start: 0,
        end: Date.now(),
        sort: 1
    };
    let data;
    let latest = (await latestMessage())?.value;
    while(true) {
        if(latest == undefined) {
            do {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const { received, latestStart } = await makeRequest(settings.token, params);
                params.start = latestStart;
                yield data = received.map(transaction => JSON.stringify(transaction));
            } while(data.length)
        } else {
            const latestTimestamp = JSON.parse(String(latest))[1];
            if(Number(latestTimestamp) == NaN) {
                latest = undefined;
                continue;
            }
            params.start = latestTimestamp;
            while(true) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                params.end = Date.now();
                const { received, latestStart } = await makeRequest(settings.token, params);
                params.start = latestStart;
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
    return { received, latestStart: received.slice(-1)[0][1] }
}

// (async () => {
//     let ss = sync(async () => { return { value: undefined }}, { token: "tXRDUSD"}, ()=>{})
//     console.log( (await ss.next()).value)
//     console.log( (await ss.next()).value)
//     console.log( (await ss.next()).value)
//     console.log( (await ss.next()).value)
// })()

// makeRequest("tXRDUSD", { limit: 10000, start: 0, end: Date.now(), sort: 1})