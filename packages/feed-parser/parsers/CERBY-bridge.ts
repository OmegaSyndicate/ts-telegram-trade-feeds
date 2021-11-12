import { appendFile, writeFileSync } from 'fs';
import { request } from '../helpers/request';

export async function* sync(latestMessage, settings, logger) {
    let latestSaved;
    let data;
    try {
        while(true) {
            const latest = (await latestMessage())?.value;
            latestSaved = latest ? String(latest) : latestSaved;
            if(!latest && latestSaved) {
                logger.error("The received last saved transaction from kafka does not match the one saved in the current instance.\n" +
                            `Received from kafka: ${String(latest)}\nLatest saved: ${String(latestSaved)}\nAn exception will be thrown after 1 minute.`);
                await new Promise((resolve) => setTimeout(resolve, 60000));
                throw new Error("The received last saved transaction from kafka does not match the one saved in the current instance.");
            }
            const price = await getPriceUSD(settings.getPriceGraph, logger);
            yield data = await (await searchBridges(settings, price, logger, latestSaved, latest)).map(t => JSON.stringify(t));
            if(data.length) {
                latestSaved = JSON.stringify(data.slice(-1));
            }
        }
    } catch(err) {
        logger.error(err);
        console.error(err);
        yield undefined;
    }
}

async function searchBridges(settings, price, logger, latestSaved, latest) {
    let bridges = settings.bridges.map(async (bridge) => {
        let received = await makeRequest(bridge.apiURL, logger, latestSaved, latest);
        return {
            ...bridge,
            Burn: received.filter(t => t.type == "Burn"),
            Mint: received.filter(t => t.type == "Mint")
        };
    })
    await Promise.all(bridges);
    for(let i = 0; i < bridges.length; i++) {
        bridges[i] = await bridges[i];
    }
    let data = [];
    while(true) {
        let Burnimestamp = { index: -1, timestamp: 0};
        // console.log("BRIDGES", bridges);
        for(let i = 0; i < bridges.length; i++) {
            if(bridges[i].Mint.length && (Number(bridges[i].Mint[0].timestamp) < Burnimestamp.timestamp || Burnimestamp.timestamp == 0)) {
                Burnimestamp = {
                    index: i,
                    timestamp: Number(bridges[i].Mint[0].timestamp)
                };
            }
        }
        if(!Burnimestamp.timestamp) {
            break;
        }
        let currentMintTransaction = {
            symbol: bridges[Burnimestamp.index].symbol,
            ...bridges[Burnimestamp.index].Mint.shift()
        };
        let currentBurnTransaction;
        // console.log("currentBurn", currentBurnTransaction)
        // Search transaction
        // console.log("Burnimestamp", Burnimestamp);
        for(let i = 0; i < bridges.length; i++) {
            if(Burnimestamp.index == i) {
                continue;
            } else if(i > bridges.length) {
                break;
            }
            let offset = bridges[i].Burn.map(t => t.id).indexOf(currentMintTransaction.id);
            console.log(offset);
            if(~offset) {
                console.log(offset, i);
                currentBurnTransaction = {
                    symbol: bridges[i].symbol,
                    ...bridges[i].Burn[offset] };
                bridges[i].Burn.splice(offset, 1);
                break;
            }
        }
        if(currentBurnTransaction) {
            data.push({
                Burn: currentBurnTransaction,
                Mint: currentMintTransaction,
                ...price
            });
        } else {
            break;
        }
    }
    console.log(bridges);
    return data;
}

async function makeRequest(apiUrl, logger, latestSaved, latest?) {
    let received = [];
    if(!latest) {
        for(let amount = 1000, offset = 0; amount >= 1000; offset += amount) {
            let tempReceived = await request("POST", apiUrl, { query: createBridgeQuery(1000, offset) }, logger);
            if(tempReceived['errors']) {
                logger.error(tempReceived.errors);
                return;
            }
            received = received.concat(tempReceived.data.proofs);
            amount = tempReceived.data.proofs.length;
        }
        return received;
    } else {
        const lastObject = JSON.parse(String(latest));
        // console.log("Last object", lastObject);
        let data = [];
        for(let amount = 1000, offset = 0; amount >= 1000; offset += amount) {
            let tempReceived = await request("POST", apiUrl, { query: createBridgeQuery(1000, 0, lastObject.Burn.timestamp) }, logger);
            if(tempReceived['errors']) {
                logger.error(tempReceived.errors);
                return;
            }
            amount = tempReceived.data.proofs.length;
            tempReceived.data.proofs = tempReceived.data.proofs.filter(t => {
                if(t.type == "Mint") {
                    return t.timestamp > lastObject.Mint.timestamp;
                } else {
                    return true
                }
            })
            console.log(tempReceived)
            const tempIds = tempReceived.data.proofs.map(searchString);
            if(~tempIds.indexOf(searchString(lastObject.Mint))) {
                await logger.error(`An attempt to insert a duplicate was detected, throwing an exception. Timestamp: ${lastObject.timestamp}`);
                await logger.log(`Received: ${JSON.stringify(tempReceived.data.proofs)}`);
                await logger.log(`LastObject: ${latestSaved}`)
                throw "Duplicate";
            }
            data = data.concat(tempReceived.data.proofs)
        }
        return data;
    }
}


function searchString(transaction) {
    return `${transaction.id}-${transaction.timestamp}`;
}


async function getPriceUSD(apiURL, logger) {
    let tempReceived = await request("POST", apiURL, { query: `query { tokens(where: { id: "deftInUsd" }, first: 1 ) { price } }`}, logger);
    if(tempReceived['errors']) {
        logger.error(tempReceived.errors);
        throw "Error while getting the current price DEFT";
    }
    return tempReceived.data.tokens[0];
}

getPriceUSD("http://nodes2.valar-solutions.com:8000/subgraphs/name/deft/deft-pancakeswap-v2", ()=>{})

function createBridgeQuery(first = 1000, skip = 0, fromTimestamp = 0) {
    return `query {
        proofs(
            orderBy: timestamp
            orderDirection: asc
            first: ${first},
            skip: ${skip},
            where: {timestamp_gte: ${fromTimestamp}}
          ) {
            id
            type
            src
            dest
            nonce
            sender
            amount
            txHash
            fee
            txFee
            timestamp
         }
      }`.split(/ |\n/gm).filter(el => el).join(' ');
}