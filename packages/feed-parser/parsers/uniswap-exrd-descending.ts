import { request } from '../helpers/request';
import { appendFile } from 'fs';

const limit = 100;
const fromTimestamp = 0;

export async function* sync(latestMessage, settings) {
    let page = 0;
    let data;
    while(true) {
        const toTimestamp = new Date().getTime() / 1e3;
        const latest = (await latestMessage())?.value;
        console.log(String(latest));
        if(latest == undefined) {
            page = await searchFirstTransactionPage(settings.apiUrl, toTimestamp);
            do {
                yield data = (await request("GET", url(settings.apiUrl, page--, limit, fromTimestamp, toTimestamp))).data.reverse().map(transaction => JSON.stringify(transaction))
            } while(page);
            page = 0;
        } else {
            const latestObject = JSON.parse(String(latest));
            const searchedPage = page = await searchTransactionPage(settings.apiUrl, latestObject, toTimestamp);
            const received = (await request("GET", url(settings.apiUrl, page, limit, fromTimestamp, toTimestamp))).data.reverse();
            const transactionHashes = received.map(searchString);
            const offset = transactionHashes.indexOf(searchString(latestObject)) + 1;
            console.log(offset);
            for(;page >= 0; page--) {
                if(searchedPage == page) {
                    yield data = received.slice(offset)?.map(transaction => JSON.stringify(transaction));
                } else {
                    yield data = (await request("GET", url(settings.apiUrl, page, limit, fromTimestamp, toTimestamp))).data.reverse().map(transaction => JSON.stringify(transaction))
                }
            }
            page = 0;
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
    let page = 0;
    for(;;page++) {
        const received = (await request("GET", url(apiUrl, page, limit, fromTimestamp, toTimestamp))).data;
        const transactionHashes = received.map(searchString)
        console.log(page)
        if(~transactionHashes.indexOf(searchString(latest))) {
            break;
        }
        if(!received.length) {
            console.error("Last post not found");
            break;
        }
    }
    return page;
}

// (async () => {
//     let latest = () => {
//         return { value: JSON.stringify({
//             feedType: "uniswapSell",
//             radixInUsd: 0.134866,
//             amountRadix: 2068,
//             amountRadixInUsd: 278.903818,
//             blockNumber: 13353460,
//             fromAddress: "0x54A80223E78C36ad29B4fb3b3F63E0FED917b29D",
//             toAddress: "0x6C2b384401F5aC765bfe6D128D785480f0FF2E71",
//             transactionHash: "0xa90c7bb9b3261375ebc4822d59ae6830a9e482bf8ac8b41b0f36f1b4c0d264b9",
//             netUsdBuys24Hours: 0,
//             netUsdBuysAvgDailyFor7Days: 0,
//             transactionFeeInEth: 0.084175602,
//             transactionFeeInUsd: 289.63141136160004
//         })}
//     }
//     let sss = sync(latest, { apiUrl: "https://api-exrd.wisetoken.me"});
//     for(let i = 0; i < 10; i++) {
//         console.log((await sss.next()).value)
//     }
// })()

function url(apiUrl: string, page: number, limit: number, fromTimestamp: number, toTimestamp: number) {
    return `${apiUrl}/staking/uniswap/feed?orderBy=descending&type=any&page=${page}&limit=${limit}&fromTimestamp=${fromTimestamp}&toTimestamp=${toTimestamp}`;
}

// getData();