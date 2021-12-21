import { isBuffer } from "util";
import { request } from "../helpers/request";

// GET https://api.zb.team/data/v1/trades?market=cspr_usdt

export async function* sync(latestMessage, settings, logger) {
    while(true) {
        const latest = (await latestMessage())?.value;
        let data;
        if(settings.pairs instanceof Array) {
            let pairs: Transaction[][] = await Promise.all(settings.pairs.map(async (pair) => {
                return await makeRequest(pair, logger, latest);
            }));
            let first = pairs[0];
            for(let i = 1; i < pairs.length; i++) {
                let two = pairs[i];
                first = mergeTransactions(first, two, latest);
            }
            data = first;
        } else {
            data = await makeRequest(settings.pairs, logger, latest);
        }
        yield data.map(t => JSON.stringify(t));
    }
}

async function makeRequest(pair, logger?, latestString?) {
    const received: ApiResponse = (await request("GET", `https://api.zb.team/data/v1/trades`, { params: { market: pair }} ));
    if(!(received instanceof Array) || !received.length) {
        logger.error(`An error occurred while making a request from ZB.`);
        logger.error(received);
        return undefined;
    }
    let data: Transaction[] | [];
    if(latestString) {
        const latest: Transaction = JSON.parse(latestString);
        data = received.filter((transaction: Transaction) => Number(transaction.tid) > Number(latest.tid) && new Date(transaction.date) >= new Date(latest.date));
    } else {
        data = received;
    }
    if(!pair.toLowerCase().includes('usd')) {
        let anotherSymbol = pair.split('_')[1].toLowerCase();
        if(anotherSymbol.includes('btc')) {
            anotherSymbol = 'bitcoin';
        } else if(anotherSymbol.includes('eth')) {
            anotherSymbol = 'ethereum';
        } else if(anotherSymbol.includes('qc')) {
            anotherSymbol = 'qcash'
        }
        let anotherPrice = (await request('GET', "https://api.coingecko.com/api/v3/simple/price", { params: {
            ids: anotherSymbol,
            vs_currencies: "usd"
        }}))[anotherSymbol].usd;
        data = data.map(t => Object.assign(t, { anotherPrice }))
    }
    return data.map((t: Transaction) => Object.assign(t, {pair}));
}


function mergeTransactions(first: Transaction[], two: Transaction[], latestSaved) {
    let i, j;
    i = j = 0;
    let n = first.length;
    let m = two.length;
    let result = [];
    while (i < n && j < m) {
        if (first[i].tid < two[j].tid) {
            result.push(first[i++]);
        } else {
            result.push(two[j++]);
        }
    }
    while (i < n) {
        result.push(first[i++]);
    }
    while (j < m) {
        result.push(two[j++]);
    }
    if(latestSaved) {
        const latestTHash: Transaction['tid'] = JSON.parse(String(latestSaved)).tid;
        result.forEach((transaction: Transaction) => {
            if(transaction.tid == latestTHash) {
                throw new Error("Duplicate transaction found during merge.\n"
                                + `latestSaved: ${latestSaved}\n`
                                + `received: ${JSON.stringify({first, two})}\n`
                                + `with merge: ${JSON.stringify(result)}\n`);
            }
        })
    }
    return result;
}

type ApiResponse =  Transaction[] | { error?: string }


interface Transaction {
    date: number,
    amount: string,
    price: string,
    trade_type: "bid" | "ask",
    type: "buy" | "sell",
    tid: number
}