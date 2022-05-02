import { CerbyFinance, generateDots, numWithCommas, ScanText } from "./helpers"

export interface Message {
    amount: number,
    feedType: "stakeStarted",
    price: number,
    block_timestamp: number// 1651093596,
    block_num: number //14550338,
    extrinsic_index: string, //"14550338-1",
    call_module_function: "unbond" | "withdraw_unbond",
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

export function createMessage(options: Message, constants) {
    return `📗 ${options.call_module_function == 'unbond' ? 'Requested unstake' : 'Withdrawn unstaked'} of *${numWithCommas(Math.floor(options.amount))} AZERO (${numWithCommas(Math.floor(options.amount * options.price))}$)*\n\n`
        + `${generateDots((options.amount * options.price), constants, options.call_module_function == 'unbond' ? '🟣' : '🟤')}\n\n`
        + `From address: ${ScanText.createScanText(ScanText.ScanChain.AlephZeroSubscan, ScanText.ScanType.account, options.account_id)}\n\n`
        + `🅰️ [Aleph Zero](https://alephzero.org/) | ${ScanText.createScanText(ScanText.ScanChain.AlephZeroSubscan, ScanText.ScanType.tx, options.extrinsic_hash)} | ${CerbyFinance}`
}