import { request } from '../helpers/request';

const apiURL = 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph';


export async function* sync(latestMessage, settings, logger) {
    let latestSaved;
    let data;
    try {
        while(true) {
            const latest = (await latestMessage())?.value;
            latestSaved = latest ? String(latest) : latestSaved;
            console.log("Latest saved", latestSaved);
            if(!latest && latestSaved) {
                logger.error("The received last saved transaction from kafka does not match the one saved in the current instance.\n" +
                            `Received from kafka: ${String(latest)}\nLatest saved: ${String(latestSaved)}\nAn exception will be thrown after 1 minute.`);
                await new Promise((resolve) => setTimeout(resolve, 60000));
                throw new Error("The received last saved transaction from kafka does not match the one saved in the current instance.");
            }
            yield data = (await makeRequest(settings.token, settings.tokenHash, latest, logger, settings.fromTimestamp)).map(t => JSON.stringify(t));
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

async function makeRequest(token: string, tokenHash: string, latest, logger, fromTimestamp) {
    let timestamp_gt = fromTimestamp || 0;
    const lastObject = latest ? JSON.parse(String(latest)) : '';

    if (latest && lastObject.timestamp > timestamp_gt) {
        timestamp_gt = lastObject.timestamp;
    }

    let tempReceived = await request("POST", apiURL, { query: createQuery(tokenHash, timestamp_gt) }, logger);
    if(tempReceived['errors']) {
        logger.error(tempReceived.errors);
        return;
    }

    return mergeTransactions(tempReceived.data, token, latest, logger);
}

interface receivedType {
    swapAs0: Array<any>
    swapAs1: Array<any>
}

function mergeTransactions(received: receivedType, token: string, latestSaved, logger) {
    let i, j;
    i = j = 0;
    let n = received.swapAs0.length;
    let m = received.swapAs1.length;
    received.swapAs0 = received.swapAs0.reverse()
    received.swapAs1 = received.swapAs1.reverse()
    let result = [];
    while (i < n && j < m) {
        if (received.swapAs0[i].timestamp < received.swapAs1[j].timestamp) {
            result.push(received.swapAs0[i++]);
        } else {
            result.push(received.swapAs1[j++]);
        }
    }
    while (i < n) {
        result.push(received.swapAs0[i++]);
    }
    while (j < m) {
        result.push(received.swapAs1[j++]);
    }
    if(latestSaved) {
        const latestTHash = JSON.parse(latestSaved).id;
        result.forEach((transaction) => {
            if(transaction.id == latestTHash) {
                if(result.length >= 3) {
                    result = result.slice(-1);
                    logger.warn("Auto-correction after a duplicate transaction was found, 5 transactions were missed. This could be due to chain reorg");
                } else {
                    throw new Error("Duplicate transaction found during merge.\n"
                                    + `latestSaved: ${latestSaved}`
                                    + `received: ${JSON.stringify(received)}`
                                    + `with merge: ${JSON.stringify(result)}`);
                }
            }
        })
    }
    return result.map(t => Object.assign(t, { feedType: t.pool.token0.symbol == token ? (t.amount1 < 0 ? 'sold' : 'buy') : (t.amount0 < 0 ? 'sold' : 'buy') }));
}


function createQuery(token: string, timestamp_gt: number): string {
    return `query {
        swapAs0: swaps(first: 1000 orderBy: timestamp orderDirection: desc where: {
            token0: "${token}"
            timestamp_gt: ${timestamp_gt}
        } subgraphError: allow) {
            id
            timestamp
            transaction {
                id
            }
            pool {
                id
                token0 {
                    id symbol
                }
                token1 {
                    id symbol
                }
            }
            origin amount0 amount1 amountUSD
        }
        swapAs1: swaps(first: 1000 orderBy: timestamp orderDirection: desc where: {
                token1: "${token}"
                timestamp_gt: ${timestamp_gt}
            } subgraphError: allow) {
            timestamp
            id
            transaction {
                id 
            }
            pool {
                id
                token0 {
                    id symbol 
                }
                token1 {
                    id symbol
                }
            }
            origin amount0 amount1 amountUSD 
        }
    }`.split(/ |\n/gm).filter(el => el).join(' '); // String compression
}