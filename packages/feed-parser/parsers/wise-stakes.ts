import { request } from '../helpers/request';

const mainGraph = "http://nodes2.valar-solutions.com:8000/subgraphs/name/wise-foundation/wise";
const wiseGraph = "https://api.thegraph.com/subgraphs/name/wise-foundation/wise";

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
            yield data = (await makeRequest(latest, logger)).map(t => JSON.stringify(t));
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

async function makeRequest(latest, logger) {
    let timestamp_gt = 0;

    const lastObject = latest ? JSON.parse(String(latest)) : '';

    if(latest) {
        timestamp_gt = lastObject.timestamp;
    }

    let tempReceived = await request("POST", mainGraph, { query: createQuery(timestamp_gt) }, logger);

    if(tempReceived['errors']) {
        logger.error(tempReceived.errors);
        return;
    }
    const price = tempReceived.data.stakes.length ? (await request('GET', "https://api.coingecko.com/api/v3/simple/price", { params: {
        ids: "wise-token11",
        vs_currencies: "usd"
    }}))['wise-token11'].usd : undefined;

    tempReceived.data.stakes = await Promise.all(tempReceived.data.stakes.reverse()
            .map(async (stake) => {
                if(stake.startTx == '0x') {
                    while(true) {
                        let { data: { stake: fullInfo } } = await request("POST", wiseGraph, { query: createQuery(timestamp_gt, stake.id )});
                        if(!fullInfo || fullInfo.closeDay == null) {
                            await new Promise((r) => setTimeout(r, 5000));
                            continue;
                        }
                        // stake.daiEquivalent = fullInfo.stake.daiEquivalent
                        // stake.lastScrapeDay = fullInfo.stake.lastScrapeDay
                        // stake.lockDays = fullInfo.stake.lockDays;
                        // stake.startDay = fullInfo.stake.startDay;
                        return Object.assign({ ...stake, price }, fullInfo);
                    }
                }
            })
        )
    return tempReceived.data.stakes;
}

function createQuery(timestamp_gt: number, stakeID?: string) {
    return `query {
        ${stakeID ? `stake(id: "${stakeID}")`
        : `stakes(first: 1000, where:
            { timestamp_gt: ${timestamp_gt} },orderBy: timestamp, orderDirection: desc)`} {
            ${queryTypes(!stakeID)}
        }
    }`.split(/ |\n/gm).filter(el => el).join(' '); // String compression
}

function queryTypes(additional: boolean): string {
    return `
    id
    staker
    referrer
    principal
    shares
    cmShares
    currentShares
    startDay
    lockDays
    daiEquivalent
    reward
    closeDay
    penalty
    scrapedYodas
    sharesPenalized
    referrerSharesPenalized
    scrapeCount
    lastScrapeDay
    ${additional ? `feedType startTx endTx timestamp` : '' }
    `
}