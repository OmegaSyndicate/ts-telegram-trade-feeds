import { request } from '../helpers/request';

let token;

export async function* sync(latestMessage, settings, logger) {
    token = settings.pair;
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
            yield data = (await normalization((await makeRequest(settings.apiURL, logger, latestSaved, latest)), settings)).map(t => JSON.stringify(t));
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

async function normalization(received, settings) {
    await received;
    let OtherPrice = await getPrice(`${settings.pair.toLowerCase()}InUsd`, settings.apiURL);
    // let DEFTPrice = await getPrice(`deftInUsd`, settings.DEFTPriceGraph || settings.apiURL)
    let promises = received.map(async (swap) => {
        swap.transactionFeeInUsd = swap[`transactionFeeIn${settings.pair}`] * +OtherPrice
        swap.otherInUsdPrice = OtherPrice;
        // swap.deftInUsd = DEFTPrice;
        return swap;
    });
    await Promise.all(promises);
    for(let i = 0; i < promises.length; i++) {
        promises[i] = await promises[i];
    }
    return promises;
}

async function makeRequest(apiUrl, logger, latestSaved, latest?) {
    let received = [];
    if(!latest) {
        for(let amount = 1000, offset = 0; amount >= 1000; offset += amount) {
            let tempReceived = await request("POST", apiUrl, { query: createBridgeQuery(1000, offset) }, logger);
            if(tempReceived['errors']) {
                logger.error(JSON.stringify(tempReceived.errors));
                return;
            }
            received = received.concat(tempReceived.data.swaps);
            amount = tempReceived.data.swaps.length;
        }
        return received;
    } else {
        const lastObject = JSON.parse(String(latest));
        let lastString = searchString(lastObject);
        let tempReceived = await request("POST", apiUrl, { query: createBridgeQuery(1000, 0, lastObject.timestamp) }, logger);
        if(tempReceived['errors']) {
            logger.error(tempReceived.errors);
            return;
        }
        tempReceived.data.swaps = tempReceived.data.swaps.filter(t => t.timestamp > lastObject.timestamp);
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
    return `${transaction.blockNumber}-${transaction.txHash}-${transaction.timestamp}`;
}


function createBridgeQuery(first = 1000, skip = 0, fromTimestamp = 0) {
    return (`query {
        swaps(first: ${first}, skip: ${skip}, where: {timestamp_gte: ${fromTimestamp}},
            orderBy: timestamp, orderDirection: asc
            ) {
            id
            feedType
            txHash
            timestamp
            sender
            from
            to
            ` +
            //deftIn${token}
            `amountDeft ` +
            //amountDeftIn${token}
            `amountDeftInUsd
            transactionFeeIn${token} ` +
            // transactionFeeInUsd
            `logIndex
            blockNumber
          }
      }`).split(/ |\n/gm).filter(el => el).join(' ');
}

async function getPrice(id, priceGraph: string) {
    console.log(id, priceGraph)
    let received = await request("POST", priceGraph, { query: `query { tokens(first: 100, where: {id: \"${id}\"}) { id price } }` });
    if(received['errors']) {
        throw received.errors;
    }
    console.log(received.data.tokens)
    return received.data.tokens[0].price;
}