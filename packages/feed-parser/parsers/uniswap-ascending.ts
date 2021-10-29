import { request } from '../helpers/request';

const limit = 100;
const fromTimestamp = 0;
let stakingType = "uniswap";
let token;

export async function* sync(latestMessage, settings, logger) {
    token = settings.token;
    if(settings.stakingType) {
        stakingType = settings.stakingType;
    }
    let page = 0;
    let data;
    console.log("started");
    while(true) {
        console.log("In while")
        try {
            const toTimestamp = Math.ceil(new Date().getTime() / 1e3);
            const latest = (await latestMessage())?.value;
            console.log(String(latest));
            if(latest == undefined) {
                console.log("latest no");
                page = 0;
                do {
                    console.log(`In sync page: ${page}`);
                    let URL = url(settings.apiUrl, page++, limit, fromTimestamp, toTimestamp);
                    const received = await checkStatus(URL, logger);
                    if(!received) {
                        logger.error(`This page returned an invalid status, I skip it. URL: ${URL}`);
                        continue;
                    }
                    yield data = received?.map(transaction => JSON.stringify(transaction))
                } while(data?.length);
                page--;
            } else {
                console.log("Latest is present")
                const latestObject = JSON.parse(String(latest));
                let searchedPage;
                if(!page) {
                    searchedPage = page = await searchTransactionPage(settings.apiUrl, latestObject, toTimestamp, logger);
                } else {
                    searchedPage = page;
                }
                let URL = url(settings.apiUrl, page, limit, fromTimestamp, toTimestamp);
                const received = await checkStatus(URL, logger);
                if(!received) {
                    logger.error(`This page returned an invalid status, I skip it. URL: ${URL}`);
                    page++;
                } else if(!received.length) {
                    searchedPage = page = await searchTransactionPage(settings.apiUrl, latestObject, toTimestamp, logger);
                    continue;
                }
                const transactionHashes = received?.map(searchString);
                const offset = transactionHashes?.indexOf(searchString(latestObject)) + 1;
                if(offset == undefined || searchedPage == undefined || !transactionHashes || !received || !latestObject) {
                    throw new Error('Error in sync. One of the variables is empty.\n'
                    + `offset: ${offset}\ntransactionHashes:\n${JSON.stringify(transactionHashes)}\n\nreceived:\n${JSON.stringify(received)}\n\nlatestObject:\n${JSON.stringify(latestObject)}`);
                }
                console.log(
                    "latestObject", latestObject,
                    "searchedPage", searchedPage,
                    "received", received?.length,
                    "offset", offset
                )
                do {
                    if(searchedPage == page) {
                        yield data = received?.slice(offset)?.map(transaction => JSON.stringify(transaction));
                    } else {
                        URL = url(settings.apiUrl, page, limit, fromTimestamp, toTimestamp);
                        data = await checkStatus(URL, logger);
                        if(!data) {
                            logger.error(`This page returned an invalid status, I skip it. URL: ${URL}`);
                            page++;
                            continue;
                        }
                        yield data?.map(transaction => JSON.stringify(transaction))
                    }
                    page++;
                } while(data?.length || offset == 100)
                page--;
                console.log("page", page);
            }
        } catch(err) {
            logger.error(`${err}\n${err.stack}`);
            console.error(err);
            yield undefined;
        }
    }
    yield undefined;
}

// async function firstStartStats(toTimestamp) {
//     for(let i = 7; i >= 1; i--) {
//         let date = new Date().setDate(new Date(toTimestamp * 1e3).getDate() - i)
        
//     }
// }

// firstStartStats(new Date().getTime() / 1e3);

async function checkStatus(URL: string, logger, attempt: number = 1) {
    const received = await request("GET", URL, {}, logger);
    let { status, data } = received;
    console.log(status)
    if(attempt >= 6) {
        return undefined;
    }
    if(status != "ok") {
        logger.error(`Api returned a non-successful response. Retry ${attempt}. URL: ${URL}.\nReceived: ${JSON.stringify(received)}`);
        await new Promise(resolve => setTimeout(resolve, 10000))
        return await checkStatus(URL, logger, ++attempt);
    } else {
        return data;
    }
}

function searchString(transaction): string {
    return `${transaction.transactionHash}-${transaction.blockNumber}-${transaction[`amount${token}`]}`;
}

async function searchFirstTransactionPage(apiUrl, toTimestamp, logger) {
    let maxPage = 0;
    let maxStep = 100;
    while(true) {
        const received = (await request("GET", url(apiUrl, maxPage + maxStep, limit, fromTimestamp, toTimestamp), {}, logger)).data;
        if(received?.length) {
            maxPage += maxStep;
        } else if(maxStep == 1) {
            break;
        } else if(!received) {
            throw new Error(`In searchFirstTransactionPage the received data is invalid.\n\nreceived:\n${JSON.stringify(received)}`);
        } else {
            maxStep = Math.ceil(maxStep / 2);
        }
        console.log(maxPage, maxStep);
    }
    return maxPage;
}

async function searchTransactionPage(apiUrl, latest, toTimestamp, logger) {
    let page = await searchFirstTransactionPage(apiUrl, toTimestamp, logger);
    for(;;page--) {
        console.log(page);
        const URL = url(apiUrl, page, limit, fromTimestamp, toTimestamp);
        let data = await checkStatus(URL, logger);
        if(!data) {
            logger.error(`This page returned an invalid status, I skip it. URL: ${URL}`);
            continue;
        }
        let transactionHashes = data.map(searchString);
        if(!transactionHashes) {
            return undefined;
        }
        if(~transactionHashes?.indexOf(searchString(latest))) {
            break;
        }
        if(!data.length || page <= 0) {
            console.error("Last post not found");
            logger.error("Last post not found");
            return undefined;
            break;
        }
    }
    return page;
}

function url(apiUrl: string, page: number, limit: number, fromTimestamp: number, toTimestamp: number) {
    return `${apiUrl}/staking/${stakingType}/feed?orderBy=ascending&type=any&page=${page}&limit=${limit}&fromTimestamp=${fromTimestamp}&toTimestamp=${toTimestamp}`;
}