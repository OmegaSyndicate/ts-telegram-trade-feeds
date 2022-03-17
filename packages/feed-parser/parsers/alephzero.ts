import { isBuffer } from "util";
import { Logger } from "../helpers/logger";
import { request } from "../helpers/request";

const apiURL = "https://alephzero.api.subscan.io/api/scan/transfers";
const apiKey = "03f7cf1c0d0741aed2be3cfb53855f9c";
const mexcAddress = "5H3JuUqCKm28Gz6Z1JpLhRzN3f4UJK1XhktbUQWhFuRJnFvb";


export async function* sync(latestMessage, settings, logger) {
    let latestSaved, data;
    try {
        while(true) {
            const latest: transfer | undefined = (await latestMessage())?.value;
            latestSaved = latest ? String(latest) : latestSaved;
            if(!latest && latestSaved) {
                logger.error("The received last saved transaction from kafka does not match the one saved in the current instance.\n" +
                            `Received from kafka: ${String(latest)}\nLatest saved: ${String(latestSaved)}\nAn exception will be thrown after 1 minute.`);
                await new Promise((resolve) => setTimeout(resolve, 60000));
                throw new Error("The received last saved transaction from kafka does not match the one saved in the current instance.");
            }
            yield data = (normalization(await makeRequest(latest ? String(latest.extrinsic_index) : undefined))).map(t => JSON.stringify(t));
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

export async function makeRequest(extrinsic_index?: string, logger?): Promise<transfer[]> {
    const response = await request("POST", apiURL, {
        data_raw: `{ "row": 100, "page": 0, "address": "${mexcAddress}" }`,
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey
        }
    })
    if(response.code != 0) {
        throw response;
    }
    let transfers: transfer[] = response.data.transfers.reverse();
    if(!extrinsic_index) {
        return transfers;
    } else {
        return transfers.filter((transfer) => transfer.extrinsic_index > extrinsic_index);
    }
}

export function normalization(transfers: transfer[]): transfer[] {
    return transfers.map((transfer) => {
        transfer.feedType = transfer.from == mexcAddress ? "withdraw" : "deposit";
        return transfer;
    });
}


interface transfer {
    feedType: "withdraw" | "deposit",
    from: string,
    to: string
    extrinsic_index: string,
    success: true,
    hash: string,
    block_num: number
    block_timestamp: number
    module: 'balances',
    amount: '1',
    fee: string,
    nonce: number,
    asset_symbol: '',
    from_account_display: {
        address: string,
        display: '',
        judgements: null,
        account_index: '',
        identity: false,
        parent: null
    },
    to_account_display: {
        address: string,
        display: '',
        judgements: null,
        account_index: '',
        identity: false,
        parent: null
    }
}