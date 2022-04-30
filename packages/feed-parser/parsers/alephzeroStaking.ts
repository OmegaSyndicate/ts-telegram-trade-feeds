import { Logger } from "../helpers/logger";
import { request } from "../helpers/request";

const apiURL = "https://alephzero.api.subscan.io/";
const apiKey = "03f7cf1c0d0741aed2be3cfb53855f9c";


export async function* sync(latestMessage, settings, logger) {
    let latestSaved, data;
    try {
        while(true) {
            const latest: stake | undefined = (await latestMessage())?.value;
            latestSaved = latest ? String(latest) : latestSaved;
            if(!latest && latestSaved) {
                logger.error("The received last saved transaction from kafka does not match the one saved in the current instance.\n" +
                            `Received from kafka: ${String(latest)}\nLatest saved: ${String(latestSaved)}\nAn exception will be thrown after 1 minute.`);
                await new Promise((resolve) => setTimeout(resolve, 60000));
                throw new Error("The received last saved transaction from kafka does not match the one saved in the current instance.");
            }
            yield data = (normalization(await makeRequest(latest ? JSON.parse(String(latest)).extrinsic_index : undefined))).map(t => JSON.stringify(t));
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

export async function makeRequest(extrinsic_index?: string, logger?): Promise<stake[]> {
    const response = await request("POST", apiURL + 'api/scan/extrinsics', {
        data_raw: `{ "row": 100, "page": 0, "module": "staking", "call": "bond"}`,
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey
        }
    });
    const price = (await request('GET', "https://api.coingecko.com/api/v3/simple/price", { params: {
        ids: "aleph-zero",
        vs_currencies: "usd"
    }}))['aleph-zero'].usd;
    if(response.code != 0) {
        throw response;
    }
    const extrinsics: stake[] = response.data.extrinsics.map((extrinsic) => {
        return { ...extrinsic, price, amount: +JSON.parse(extrinsic.params)[1].value / 1e12 }
    }).reverse();
    if(!extrinsic_index) {
        return extrinsics;
    } else {
        return extrinsics.filter((extrinsic) => extrinsic.extrinsic_index > extrinsic_index);
    }
}

export function normalization(extrinsics: stake[]): stake[] {
    return extrinsics.map((extrinsic) => {
        extrinsic.feedType = "stakeStarted"
        return extrinsic;
    });
}


interface stake {
    amount: number,
    feedType: "stakeStarted",
    price: number,
    block_timestamp: number// 1651093596,
    block_num: number //14550338,
    extrinsic_index: string, //"14550338-1",
    call_module_function: "bond",
    call_module: "staking",
    params: string // "[{\"name\":\"controller\",\"type\":\"sp_runtime:multiaddress:MultiAddress@77\",\"type_name\":\"Address\",\"value\":{\"Id\":\"0x201804b161f2a281e5f33e89aec3d8c0aeb0d3c38d74a85d5ff562ce2b0daf22\"}},{\"name\":\"value\",\"type\":\"compact\\u003cU128\\u003e\",\"type_name\":\"BalanceOf\",\"value\":\"89176200000000\"},{\"name\":\"payee\",\"type\":\"pallet_staking:RewardDestination\",\"type_name\":\"RewardDestination\\u003cAccountId\\u003e\",\"value\":{\"Staked\":null}}]",
    account_id: string // "5CnnXNMWk2PR5839SWVueWJAXSaLWHwV6fF3yxmhM4yHz1BB", // Отправитель
    account_index: string // "",
    signature: string // "0x12937afd65bdc6e6405d9a99276855948477b5f5278a1b81f5167926d87f11027b5e6bac4345c9a743b671c31a2ae8a129cf4f9701494cff411eb69a5df49a8b",
    nonce: number //0,
    extrinsic_hash: string // "0x9a6fe390871abfa56d1c270c61bc7a1897463358871d21c62bdd07a375f171fc", // Хэш транзы
    success: true,
    fee: string //"723865148",
    from_hex: string // "201804b161f2a281e5f33e89aec3d8c0aeb0d3c38d74a85d5ff562ce2b0daf22",
    finalized: true,
    account_display: {
        address: string // "5CnnXNMWk2PR5839SWVueWJAXSaLWHwV6fF3yxmhM4yHz1BB",
        display: string //"",
        judgements: string | null //null,
        account_index: string// "",
        identity: boolean // false,
        parent: string | null
    }
}