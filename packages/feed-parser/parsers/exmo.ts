import { isBuffer } from "util";
import { request } from "../helpers/request";

// POST https://api.exmo.com/v1.1/trades 'pair=TONCOIN_USDT'

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
    const received: apiResponse = (await request("POST", `https://api.exmo.com/v1.1/trades`, `pair=${pair}` ));
    if(!Object.keys(received).length || received.error) {
        logger.error(`An error occurred while making a request from EXMO.`);
        logger.error(received);
        return undefined;
    }
    let data: Transaction[] | [];
    if(latestString) {
        const latest: Transaction = JSON.parse(latestString);
        data = received[pair].reverse().filter((transaction: Transaction) => Number(transaction.trade_id) > Number(latest.trade_id) && new Date(transaction.date) >= new Date(latest.date));
    } else {
        data = received[pair].reverse()
    }
    if(!pair.toLowerCase().includes('usd')) {
        let anotherSymbol = pair.split('_')[1].toLowerCase();
        if(anotherSymbol.includes('btc')) {
            anotherSymbol = 'bitcoin';
        } else if(anotherSymbol.includes('eth')) {
            anotherSymbol = 'ethereum';
        }
        let anotherPrice = (await request('GET', "https://api.coingecko.com/api/v3/simple/price", { params: {
            ids: anotherSymbol,
            vs_currencies: "usd"
        }}))[anotherSymbol].usd;
        data = data.map(t => Object.assign(t, { anotherPrice }))
    }
    return data.filter((t: any) => {
        if(t.anotherPrice) {
            return (+t.amount * t.anotherPrice) >= 10000;
        }
        return +t.amount >= 10000;
    }).map((t: Transaction) => Object.assign(t, {pair}));
}


function mergeTransactions(first: Transaction[], two: Transaction[], latestSaved) {
    let i, j;
    i = j = 0;
    let n = first.length;
    let m = two.length;
    let result = [];
    while (i < n && j < m) {
        if (first[i].trade_id < two[j].trade_id) {
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
        const latestTHash = JSON.parse(String(latestSaved)).trade_id;
        result.forEach((transaction) => {
            if(transaction.trade_id == latestTHash) {
                throw new Error("Duplicate transaction found during merge.\n"
                                + `latestSaved: ${latestSaved}`
                                + `received: ${JSON.stringify({first, two})}`
                                + `with merge: ${JSON.stringify(result)}`);
            }
        })
    }
    return result;
}

interface apiResponse {
    result?: boolean,
    error?: string,
    ([pair]: Transaction[] | []) // order direction descending
}

interface Transaction {
    trade_id: number,
    price: string,
    quanity: string,
    amount: string,
    type: "sell" | "buy",
    date: Date,
    anotherPrice?: number
}

(async () => {
//     let pairs = await Promise.all(["TONCOIN_USDT", "TONCOIN_BTC"].map(async (pair) => {
//         return makeRequest(pair);
//     }));
//     console.log(mergeTransactions(pairs[0], pairs[1], undefined))
// let anotherPrice = await request('GET', "https://api.coingecko.com/api/v3/simple/price", { params: {
//     ids: 'bitcoin',
//     vs_currencies: "usd"
// }});
// console.log(anotherPrice);
})()