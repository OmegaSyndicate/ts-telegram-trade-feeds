import { request } from '../helpers/request';
import { appendFile } from 'fs';

const limit = 100;
const fromTimestamp = 0;

export async function* sync(latestMessage, settings, logger) {
    let page = 0;
    let data;
    while(true) {
        const toTimestamp = new Date().getTime() / 1e3;
        const latest = (await latestMessage())?.value;
        console.log(String(latest));
        if(latest == undefined) {
            page = 0;
            do {
                yield data = (await request("GET", url(settings.apiUrl, page++, limit, fromTimestamp, toTimestamp))).data.map(transaction => JSON.stringify(transaction))
            } while(data?.length);
            page--;
        } else {
            const latestObject = JSON.parse(String(latest));
            const searchedPage = page = await searchTransactionPage(settings.apiUrl, latestObject, toTimestamp);
            const received = (await request("GET", url(settings.apiUrl, page, limit, fromTimestamp, toTimestamp))).data;
            const transactionHashes = received.map(searchString);
            const offset = transactionHashes.indexOf(searchString(latestObject)) + 1;
            do {
                if(searchedPage == page) {
                    yield data = received.slice(offset)?.map(transaction => JSON.stringify(transaction));
                } else {
                    yield data = (await request("GET", url(settings.apiUrl, page, limit, fromTimestamp, toTimestamp))).data.map(transaction => JSON.stringify(transaction))
                }
                page++;
            } while(data?.length)
            page--;
        }
    }
}

function searchString(transaction): string {
    return `${transaction.transactionHash}-${transaction.blockNumber}-${transaction.amountRadix}`;
}

async function searchFirstTransactionPage(apiUrl, toTimestamp) {
    let maxPage = 0;
    let maxStep = 100;
    while(true) {
        const received = (await request("GET", url(apiUrl, maxPage + maxStep, limit, fromTimestamp, toTimestamp))).data;
        if(received.length) {
            maxPage += maxStep;
        } else if(maxStep == 1) {
            break;
        } else {
            maxStep = Math.ceil(maxStep / 2);
        }
    }
    return maxPage;
}

async function searchTransactionPage(apiUrl, latest, toTimestamp) {
    let page = await searchFirstTransactionPage(apiUrl, toTimestamp);
    for(;;page--) {
        const received = (await request("GET", url(apiUrl, page, limit, fromTimestamp, toTimestamp))).data;
        const transactionHashes = received.map(searchString)
        console.log(page)
        if(~transactionHashes.indexOf(searchString(latest))) {
            break;
        }
        if(!received.length || page <= 0) {
            console.error("Last post not found");
            break;
        }
    }
    return page;
}

function url(apiUrl: string, page: number, limit: number, fromTimestamp: number, toTimestamp: number) {
    return `${apiUrl}/staking/uniswap/feed?orderBy=ascending&type=any&page=${page}&limit=${limit}&fromTimestamp=${fromTimestamp}&toTimestamp=${toTimestamp}`;
}