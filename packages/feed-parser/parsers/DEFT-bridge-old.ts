import { request } from '../helpers/request';

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
            yield data = (await makeRequest(settings.apiURL, logger, latestSaved, latest)).map(t => JSON.stringify(t));
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

async function makeRequest(apiUrl, logger, latestSaved, latest?) {
    let received = [];
    let data = [];
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
        let lastString = searchString(lastObject);
        let tempReceived = await request("POST", apiUrl, { query: createBridgeQuery(1000, 0, lastObject.timestamp) }, logger);
        console.log(tempReceived)
        if(tempReceived['errors']) {
            logger.error(tempReceived.errors);
            return;
        }
        tempReceived.data.proofs = tempReceived.data.proofs.filter(t => t.timestamp > lastObject.timestamp);
        const tempIds = tempReceived.data.proofs.map(searchString);
        if(~tempIds.indexOf(searchString(lastString)) || ~tempIds.indexOf(searchString(JSON.parse(latestSaved)))) {
            logger.error(`An attempt to insert a duplicate was detected, throwing an exception. Timestamp: ${lastObject.timestamp}`);

            logger.log(`Received: ${JSON.stringify(tempReceived.data.proofs)}`);
            logger.log(`LastObject: ${latestSaved}`)
            throw "Duplicate";
        }
        return tempReceived.data.proofs;
    }
}


function searchString(transaction) {
    return `${transaction.id}-${transaction.timestamp}`;
}


function createBridgeQuery(first = 1000, skip = 0, fromTimestamp = 0) {
    return `query {
        proofs(
            orderBy: timestamp
            orderDirection: asc
            first: ${first},
            skip: ${skip},
            where: {type: "Mint", timestamp_gte: ${fromTimestamp}}
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