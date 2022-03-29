import { request } from '../helpers/request';

const apiURL = 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2';


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
            yield data = (await makeRequest(settings.token, settings.pairs, latest, logger)).map(t => JSON.stringify(t));
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

async function makeRequest(token: string, pairs: string[], latest, logger) {
    let timestamp_gt = 0;
    const lastObject = latest ? JSON.parse(String(latest)) : '';

    if(latest) {
        timestamp_gt = lastObject.transaction.timestamp;
    }

    let tempReceived = await request("POST", apiURL, { query: createQuery(pairs, timestamp_gt) }, logger);
    if(tempReceived['errors']) {
        logger.error(tempReceived.errors);
        return;
    }
    tempReceived.data.swaps = tempReceived.data.swaps.reverse().map(swap => Object.assign(swap, { feedType: swap.pair.token0.symbol == token ? (swap.amount0In > 0 ? "sold" : "buy" ) : (swap.amount1In > 0 ? "sold" : "buy" ) }));
    if(latest) {
        // not really necessary, just for safety
        tempReceived.data.swaps = tempReceived.data.swaps.filter(t => t.transaction.timestamp > lastObject.transaction.timestamp);
        const tempIds = tempReceived.data.swaps.map(searchString);
        if(~tempIds.indexOf(searchString(lastObject))) {
            logger.error(`An attempt to insert a duplicate was detected, throwing an exception. Timestamp: ${lastObject.timestamp}`);

            logger.log(`Received: ${JSON.stringify(tempReceived.data.swaps)}`);
            logger.log(`LastObject: ${JSON.stringify(lastObject)}`);
            throw "Duplicate";
        }
    }
    return tempReceived.data.swaps;
}

function searchString(swap) {
    return swap.id;
}


function createQuery(pairs: string[], timestamp_gt: number): string {
    pairs = pairs.map(pair => `"${pair}"`);
    return `query {
        swaps(first: 1000, where: {pair_in: [${pairs}], timestamp_gt: ${timestamp_gt}}, orderBy: timestamp, orderDirection: desc) {
          transaction {
            id
            timestamp
          }
          id
          pair {
            token0Price
            token1Price
            id
            token0 {
              id
              symbol
              decimals
                }
            token1 {
              id
              symbol
              decimals
            }
          }
          amount0In
          amount0Out
          amount1In
          amount1Out
          amountUSD
          to
        }
      }`.split(/ |\n/gm).filter(el => el).join(' '); // String compression
}