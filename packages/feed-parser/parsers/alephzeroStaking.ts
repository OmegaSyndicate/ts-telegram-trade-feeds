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

            const bond = await makeRequest('bond', logger) as stake[],
                  bond_extra = await makeRequest('bond_extra', logger) as extrastake[],
                  rebond = await makeRequest('rebond', logger) as extrastake[]

            // API RATE LIMITED
            // type bonds = [stake[], extrastake[], extrastake[]]
            // const [bond, bond_extra, rebond]: bonds = await Promise.all([
            //     makeRequest('bond', logger) as Promise<stake[]>,
            //     makeRequest('bond_extra', logger) as Promise<extrastake[]>,
            //     makeRequest('rebond', logger) as Promise<extrastake[]>
            // ])

            yield data = (await normalization(
                mergeTransactions(
                    mergeTransactions(bond, bond_extra, latestSaved) as stake[],
                    rebond, latestSaved
                ),
                latest ? JSON.parse(String(latest)).extrinsic_index : '0'
            )).map(t => JSON.stringify(t));

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

export async function makeRequest(type: 'bond_extra' | 'bond' | 'rebond', logger?): Promise<stake[] | extrastake[]> {
    const response = await request("POST", apiURL + 'api/scan/extrinsics', {
        data_raw: `{ "row": 100, "page": 0, "module": "staking", "call": "${type}"}`,
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey
        }
    }, logger);
    if(response.code != 0) {
        throw response;
    }
    return response.data.extrinsics.reverse();
}

export async function normalization(extrs: ReturnType<typeof mergeTransactions>, extrinsic_index?: string): Promise<(stake | extrastake)[]> {
    const extrinsics = extrs.filter((extrinsic) => extrinsic.extrinsic_index > extrinsic_index);
    if(extrinsics.length) {
        const price = (await request('GET', "https://api.coingecko.com/api/v3/simple/price", { params: {
            ids: "aleph-zero",
            vs_currencies: "usd"
        }}))['aleph-zero'].usd;
        return extrinsics.map((extrinsic: stake | extrastake) => {
            extrinsic.feedType = "stakeStarted";
            extrinsic.price = price;
            extrinsic.amount = 
                extrinsic.call_module_function == 'bond'
                ? +JSON.parse(extrinsic.params)[1].value / 1e12
                : +JSON.parse(extrinsic.params)[0].value / 1e12
            return extrinsic;
        });
    } else {
        return [];
    }
}


function mergeTransactions(first: stake[], two: extrastake[], latestSaved): (stake | extrastake)[] {
    let i, j;
    i = j = 0;
    let n = first.length;
    let m = two.length;
    let result = [];
    while (i < n && j < m) {
        if (first[i].extrinsic_index < two[j].extrinsic_index) {
            result.push(first[i++]);
        } else {
            result.push(two[j++]);
        }
    }
    while (i < n) {
        result.push(first[i++]);
    }
    while (j < m) {
        result.push(two[j++]);
    }
    if(latestSaved) {
        const latestTHash: (stake | extrastake)['extrinsic_index'] = JSON.parse(String(latestSaved)).tid;
        result.forEach((transaction: (stake | extrastake)) => {
            if(transaction.extrinsic_index == latestTHash) {
                throw new Error("Duplicate transaction found during merge.\n"
                                + `latestSaved: ${latestSaved}\n`
                                + `received: ${JSON.stringify({first, two})}\n`
                                + `with merge: ${JSON.stringify(result)}\n`);
            }
        })
    }
    return result;
}

interface extrastake {
    amount: number,
    feedType: "stakeStarted",
    price: number,
    block_timestamp: number // 1651415980,
    block_num: number //14872563,
    extrinsic_index: string //'14872563-1',
    call_module_function: 'bond_extra' | 'rebond',
    call_module: 'staking',
    params: string //'[{"name":"max_additional","type":"compact\\u003cU128\\u003e","type_name":"BalanceOf","value":"4850000000000000"}]',
    account_id: string //'5F9qHWiP4ZbiJsbt2QHaHGyNqAQUaU43J8J9SCaNTop9MypN',
    account_index: string //'',
    signature: string //'0x2caeb5db5ee79624876cb849f55630793206b7e60e62b2b2f11d445df8ca0d2a7315be777dff1a816433a42e335373e240babab71e922dbea11abb563317678c',
    nonce: number //9,
    extrinsic_hash: string //'0xbf2994ecb8d35f40ded7807cc37795d27e9a2dc1086075f2d0485b8a56336b96',
    success: boolean // true,
    fee: string // '1139296115',
    from_hex: string //'889deef5e8112a89e4f2d973b9250c8c5b44427d31f52558fe40c88b42bfb553',
    finalized: boolean,
    account_display: {
        address: string // "5CnnXNMWk2PR5839SWVueWJAXSaLWHwV6fF3yxmhM4yHz1BB",
        display: string //"",
        judgements: string | null //null,
        account_index: string// "",
        identity: boolean // false,
        parent: string | null
    }
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