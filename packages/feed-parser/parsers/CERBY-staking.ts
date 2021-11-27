import { request } from '../helpers/request';
import * as URL from 'url';

let rpcURL;
let cerby = 'deft';
export async function* sync(latestMessage, settings, logger) {
    rpcURL = URL.parse(settings.jsonRpc);
    let latestSaved;
    let data;
    if(settings.cerby) {
        cerby = settings.cerby;
    }
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
            yield data = (await normalization((await makeRequest(settings.stakingType, settings.apiURL, logger, latestSaved, latest)), settings)).map(t => JSON.stringify(t));
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

async function makeRequest(stakeType, apiUrl, logger, latestSaved, latest?) {
    let received = [];
    let data = [];
    console.log(apiUrl)
    if(!latest) {
        for(let amount = 1000, offset = 0; amount >= 1000; offset += amount) {
            let tempReceived = await request("POST", apiUrl, { query: createBridgeQuery(stakeType, 1000, offset) }, logger);
            if(tempReceived['errors']) {
                logger.error(tempReceived.errors);
                return;
            }
            received = received.concat(tempReceived.data.stakes);
            amount = tempReceived.data.stakes.length;
        }
        return received;
    } else {
        const lastObject = JSON.parse(String(latest));
        let lastString = searchString(lastObject);
        let tempReceived = await request("POST", apiUrl, { query: createBridgeQuery(stakeType, 1000, 0, lastObject.timestamp) }, logger);
        console.log(tempReceived)
        if(tempReceived['errors']) {
            logger.error(tempReceived.errors);
            return;
        }
        tempReceived.data.stakes = tempReceived.data.stakes.filter(t => t.timestamp > lastObject.timestamp);
        const tempIds = tempReceived.data.stakes.map(searchString);
        if(~tempIds.indexOf(searchString(lastString)) || ~tempIds.indexOf(searchString(JSON.parse(latestSaved)))) {
            logger.error(`An attempt to insert a duplicate was detected, throwing an exception. Timestamp: ${lastObject.timestamp}`);

            logger.log(`Received: ${JSON.stringify(tempReceived.data.stakes)}`);
            logger.log(`LastObject: ${latestSaved}`)
            throw "Duplicate";
        }
        return tempReceived.data.stakes;
    }
}

async function normalization(received, settings) {
    await received;
    let OtherPrice = await getPrice(`${settings.pair.toLowerCase()}InUsd`, settings.ETHpriceGraph);
    let DEFTPrice = await getPrice(`${cerby}InUsd`, settings.DEFTpriceGraph);
    console.log(OtherPrice, DEFTPrice);
    let promises = received.map(async (stake) => {
        stake.transactionFeeInUsd = ((Number(stake.gasUsed) * Number(stake.gasPrice)) / 1e18) * +OtherPrice
        stake.otherInUsdPrice = OtherPrice;
        stake.deftInUsd = DEFTPrice;
        if(+stake.completedAt) {
            stake.feedType = "stakeCompleted";
            console.log('\n\n\n\nStakeCompleted\n\n\n\n')
            // let days = stake.endDay//BigInt((await createRPCRequest("getCurrentDay", {})).result);
            // stake.interest = BigInt((await createRPCRequest("getInterest", { id: stake.id, days })).result || 0).toString();
            // stake.penalty = BigInt((await createRPCRequest("getPenalty", { id: stake.id, days, interest: BigInt(stake.interest)})).result || 0).toString();
            stake.rewardAmount = (Number(stake.interest)) - (Number(stake.penalty));
            stake.roi = (((stake.rewardAmount) / Number(stake.stakedAmount)) * 100).toString();
        } else if(+stake.endDay && +stake.endDay < +stake.startDay + +stake.lockDays - 1) {
            stake.feedType = "stakeCanceled";
            stake.rewardAmount = (Number(stake.interest)) - (Number(stake.penalty));
            stake.roi = (((stake.rewardAmount) / Number(stake.stakedAmount)) * 100).toString();
        } else {
            stake.feedType = "stakeStarted";
            console.log("Stake started");
        }
        return stake;
    });
    await Promise.all(promises);
    for(let i = 0; i < promises.length; i++) {
        promises[i] = await promises[i];
    }
    return promises;
}

function createRPCRequest(reqType: "getPenalty" | "getInterest" | "getCurrentDay", input) {
    console.log("createdREQUEST", requestRPCSerialize(reqType, input))
    return request("GET", rpcURL.href, {
        auth: {
            username: rpcURL.auth.split(':')[0],
            password: rpcURL.auth.split(':')[1]
        },
        data: requestRPCSerialize(reqType, input)
    });
}

function requestRPCSerialize(reqType: "getPenalty" | "getInterest" | "getCurrentDay", input, from="0x0000000000000000000000000000000000000000", to="0xdef1fafc79cd01cf6797b9d7f51411bef486262a") {
    let funcSignature;
    let dataSign;
    switch(reqType) {
        case "getPenalty":
            funcSignature = 0x82c44854;
            {
                let { id, days, interest } = input;
                dataSign = `${numTo256(id)}${numTo256(days)}${numTo256(interest)}`;
            }
            break;
        case "getInterest":
            funcSignature = 0x388a1a81;
            {
                let { id, days } = input;
                dataSign = `${numTo256(id)}${numTo256(days)}`;
            }
            break;
        case "getCurrentDay":
                funcSignature = 0xe99884a3;
                dataSign = '';
                break;
        default:
            throw "This request type isn't supported";
    }
    const data = `0x${funcSignature.toString(16)}${dataSign}`;
    return {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
            {
                from,
                data,
                to,
            },
            "latest"
        ],
    }
}


function numTo256(number) {
    let numStr = number.toString(16).split('');
    for(let i = 64; i > numStr.length;) {
        numStr.unshift('0');
    }
    return numStr.join('');
}


function searchString(transaction) {
    return `${transaction.blockNumber}-${transaction.startTx}-${transaction.timestamp}`;
}


function createBridgeQuery(stakeType: string, first = 1000, skip = 0, fromTimestamp = 0) {
    return `query {
        stakes(first: ${first}, skip: ${skip}, where: {${stakeType}At_gte: ${fromTimestamp}},
            orderBy: timestamp, orderDirection: asc) {
            id
            owner {
                id
            }
            stakedAmount
            startDay
            lockDays
            endDay
            interest
            penalty
            sharesCount
            startTx
            endTx
            startedAt
            completedAt
            canceledAt
            timestamp
            blockNumber
            gasPrice
            gasUsed
          }
      }`.split(/ |\n/gm).filter(el => el).join(' ');
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