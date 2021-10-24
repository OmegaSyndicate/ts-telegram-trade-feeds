import { request } from '../helpers/request';

const apiUrl = 'https://api.thegraph.com/subgraphs/name/omegasyndicate/defiplaza';

export async function* sync(latestMessage, settings, logger) {
    let token = await getToken(settings.token);
    if(!token) {
        logger.error("Token not found");
    }
    while(true) {
        const latest = (await latestMessage())?.value;
        console.log("LATEST", String(latest))
        yield (await makeRequest(token, logger, latest)).map(t => JSON.stringify(t));
    }
}

async function getToken(symbol) {
    let token = await request("POST", apiUrl, { query: `query {
        tokens(orderBy: swapCount, orderDirection: desc, where: {symbol: "eXRD"}) {
          id
          symbol
          tokenAmount
          swapCount
        }
      }`});
    return token.data.tokens[0].id;
}

async function makeRequest(token, logger?, latest?) {
    let received: receivedType = {
        buy: [],
        sold: []
    };
    if(!latest) {
        for(let type = 0; type <= 1; type++) { // type 0 == 'buy', type 1 == 'sold'
            let typeTransaction: "buy" | "sold" = type ? "sold" : "buy";
            for(let amount = 1000, offset = 0; amount >= 1000; offset += amount) {
                let tempReceived = await request("POST", apiUrl, { query: createSwapsQuery(typeTransaction, token, 1000, offset) });
                if(tempReceived['errors']) {
                    logger.error(tempReceived.errors);
                    return;
                }
                received[typeTransaction] = received[typeTransaction].concat(tempReceived.data.swaps);
                amount = tempReceived.data.swaps.length;
            }
        }
        return mergeTransactions(received);
    } else {
        const lastObject = JSON.parse(latest);
        let found: number = 0; // 0 or timestamp
        let amounts: searchType = {
            buy: 10,
            sold: 10
        };
        let offsets: searchType = {
            buy: 0,
            sold: 0
        };
        let lastString = searchString(lastObject);
        for(let type = 0; type <= 1; type++) {
            let typeTransaction: "buy" | "sold" = type ? "sold" : "buy";
            let amount = amounts[typeTransaction] || 10,
                offset = offsets[typeTransaction] || 0;
            let tempReceived = await request("POST", apiUrl, { query: createSwapsQuery(typeTransaction, token, amount, offset) });
            if(tempReceived['errors'] || (!tempReceived.data.swaps.length && type > 1)) {
                logger.error(tempReceived.errors || "The transaction was not found.");
                return;
            }
            if(!(tempReceived.data?.swaps.length)) {
                continue; // skip if there is nothing to send
            }
            let founded = 0;
            if(found) {
                // if the transaction is found, then we cut it to the desired point in time
                tempReceived.data.swaps = tempReceived.data.swaps.filter(t => Number(t.timestamp) > found);
            } else {
                // Search for transactions in this type
                founded = tempReceived.data.swaps.map(searchString).indexOf(lastString) + 1;
            }
            if(founded) {
                found = Number(tempReceived.data.swaps[founded-1].timestamp);
            }
            received[typeTransaction] = received[typeTransaction].concat(tempReceived.data.swaps.slice(founded));
            offsets[typeTransaction] += amount;
            if(amount != 1000) {
                amounts[typeTransaction] *= 2;
            }
            if(amounts[typeTransaction] > 1000) {
                amounts[typeTransaction] = 1000;
            }
            if(!found && !founded && type == 1) {
                type = -1;
            }
        }
        return mergeTransactions(received).filter(t => Number(t.timestamp) > found);
    }
}

interface searchType {
    buy: number;
    sold: number;
}

function searchString(transaction) {
    return `${transaction.id}-${transaction.timestamp}`;
}

function mergeTransactions(received: receivedType) {
    let i, j;
    i = j = 0;
    let n = received.buy.length;
    let m = received.sold.length;
    let result = [];
    while (i < n && j < m) {
        if (received.buy[i].timestamp < received.sold[j].timestamp) {
            result.push(received.buy[i++]);
        } else {
            result.push(received.sold[j++]);
        }
    }
    while (i < n) {
        result.push(received.buy[i++]);
    }
    while (j < m) {
        result.push(received.sold[j++]);
    }
    return result;
}

interface receivedType {
    buy: Array<any>;
    sold: Array<any>;
}

console.log(createSwapsQuery("buy", "0x6468e79a80c0eab0f9a2b574c8d5bc374af59414"))

function createSwapsQuery(type: "buy" | "sold", token: string, first = 1000, skip = 0) {
    return `query {swaps(first: ${first}, skip: ${skip}, orderBy: timestamp, orderDirection: asc,
        where: {${type == "buy" ? "inputToken" : "outputToken"}: \"${token}\"}) {
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
        }}`.split(/ |\n/gm).filter(el => el).join(' ');
}