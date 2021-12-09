import { request } from '../helpers/request';

const apiUrl = 'https://api.thegraph.com/subgraphs/name/omegasyndicate/defiplaza';

export async function* sync(latestMessage, settings, logger) {
    let latestSaved;
    let data;
    try {
        while(true) {
            const latest = (await latestMessage())?.value;
            latestSaved = latest ? String(latest) : latestSaved;
            console.log("LatestSaved", latestSaved);
            if(!latest && latestSaved) {
                logger.error("The received last saved transaction from kafka does not match the one saved in the current instance.\n" +
                            `Received from kafka: ${String(latest)}\nLatest saved: ${String(latestSaved)}\nAn exception will be thrown after 1 minute.`);
                await new Promise((resolve) => setTimeout(resolve, 60000));
                throw new Error("The received last saved transaction from kafka does not match the one saved in the current instance.");
            }
            console.log("Latest", String(latest));
            yield data = (await makeRequest(logger, latestSaved, latest)).map(t => JSON.stringify(t));
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

async function makeRequest(logger, latestSaved, latest?) {
    let received = [];
    if(!latest) {
        for(let amount = 1000, offset = 0; amount >= 1000; offset += amount) {
            let tempReceived = await request("POST", apiUrl, { query: createSwapsQuery(0, 1000, offset) }, logger);
            if(tempReceived['errors']) {
                logger.error(tempReceived.errors);
                return;
            }
            tempReceived.data.swaps = tempReceived.data.swaps.map((t) => 
                Object.assign(t, { ethPriceUSD: tempReceived.data.token.tokenPriceUSD })
            )
            received = received.concat(tempReceived.data.swaps);
            amount = tempReceived.data.swaps.length;
        }
        return received;
    } else {
        const lastObject = JSON.parse(String(latest));
        let lastString = searchString(lastObject);
        let tempReceived = await request("POST", apiUrl, { query: createSwapsQuery(lastObject.timestamp, 1000, 0) });
        if(tempReceived['errors']) {
            logger.error(tempReceived.errors);
            return;
        }
        tempReceived.data.swaps = tempReceived.data.swaps.filter(t => +t.timestamp > +lastObject.timestamp);
        tempReceived.data.swaps = tempReceived.data.swaps.map((t) => 
                Object.assign(t, { ethPriceUSD: tempReceived.data.token.tokenPriceUSD })
        )
        console.log(tempReceived.data.swaps, lastObject.timestamp);
        const tempIds = tempReceived.data.swaps.map(searchString);
        if(~tempIds.indexOf(searchString(lastString)) || ~tempIds.indexOf(searchString(JSON.parse(latestSaved)))) {
            logger.error(`An attempt to insert a duplicate was detected, throwing an exception. Timestamp: ${lastObject.timestamp}`);

            logger.log(`Received: ${JSON.stringify(tempReceived.data.swaps)}`);
            logger.log(`LastObject: ${latestSaved}`)
            throw "Duplicate";
        }
        return tempReceived.data.swaps;
    }
}

function searchString(transaction) {
    return `${transaction.id}-${transaction.timestamp}`;
}


function createSwapsQuery(timestamp: number, first = 1000, skip = 0) {
    return `query {swaps(first: ${first}, skip: ${skip}, orderBy: timestamp, orderDirection: asc,
        where: {timestamp_gte: ${timestamp}}) {
          id
          timestamp
          sender
          pair {
            id
          }
          inputAmount
          inputToken {
            symbol
            tokenPriceUSD
          }
          transaction {
            gasLimit
            gasPrice
          }
          outputAmount
          outputToken {
            symbol
            tokenPriceUSD
          }
          swapUSD
        }
        token(id: "0x0000000000000000000000000000000000000000") {
            id
            symbol
            tokenPriceUSD
        }
    }`.split(/ |\n/gm).filter(el => el).join(' ');
}