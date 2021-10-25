import { request } from '../helpers/request';

const limit = 100;
const fromTimestamp = 0;

export async function* sync(latestMessage, settings, logger) {
    let page = 0;
    let data;
    console.log("started");
    while(true) {
        console.log("In while")
        try {
            const toTimestamp = new Date().getTime() / 1e3;
            const latest = (await latestMessage())?.value;
            console.log(String(latest));
            if(latest == undefined) {
                page = 0;
                do {
                    console.log(`In sync page: ${page}`);
                    yield data = (await request("GET", url(settings.apiUrl, page++, limit, fromTimestamp, toTimestamp), {}, logger)).data?.map(transaction => JSON.stringify(transaction))
                } while(data?.length);
                page--;
            } else {
                console.log("Latest is present")
                const latestObject = JSON.parse(String(latest));
                const searchedPage = page = await searchTransactionPage(settings.apiUrl, latestObject, toTimestamp, logger);
                const received = (await request("GET", url(settings.apiUrl, page, limit, fromTimestamp, toTimestamp), {}, logger)).data;
                const transactionHashes = received?.map(searchString);
                const offset = transactionHashes?.indexOf(searchString(latestObject)) + 1;
                if(!offset || searchedPage == undefined || !transactionHashes || !received || !latestObject) {
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
                        yield data = (await request("GET", url(settings.apiUrl, page, limit, fromTimestamp, toTimestamp), {}, logger)).data?.map(transaction => JSON.stringify(transaction))
                    }
                    page++;
                } while(data?.length || offset == 100)
                page--;
                console.log("page", page);
            }
        } catch(err) {
            logger.error(err);
            yield undefined;
        }
    }
    yield undefined;
}

function searchString(transaction): string {
    return `${transaction.transactionHash}-${transaction.blockNumber}-${transaction[`amountWise`]}`;
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
        const received = (await request("GET", url(apiUrl, page, limit, fromTimestamp, toTimestamp), {}, logger)).data;
        const transactionHashes = received?.map(searchString);
        if(!transactionHashes) {
            return undefined;
        }
        if(~transactionHashes?.indexOf(searchString(latest))) {
            break;
        }
        if(!received.length || page <= 0) {
            console.error("Last post not found");
            logger.error("Last post not found");
            return undefined;
            break;
        }
    }
    return page;
}

function url(apiUrl: string, page: number, limit: number, fromTimestamp: number, toTimestamp: number) {
    return `${apiUrl}/staking/uniswap/feed?orderBy=ascending&type=any&page=${page}&limit=${limit}&fromTimestamp=${fromTimestamp}&toTimestamp=${toTimestamp}`;
}