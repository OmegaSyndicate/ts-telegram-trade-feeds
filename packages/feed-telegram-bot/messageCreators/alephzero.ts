import { createEtherscanLink, numWithCommas, shortenAddress } from "./Radix-uniswap"
import { generateDots } from './wise-stakes';

export interface Message {
    feedType: "withdraw" | "deposit",
    price: number,
    from: string,
    to: string
    extrinsic_index: string,
    success: true,
    hash: string,
    block_num: number
    block_timestamp: number
    module: 'balances',
    amount: string,
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

export function createMessage(options: Message, constants) {
    return `📥 ${options.feedType[0].toUpperCase() + options.feedType.slice(1)} *${numWithCommas(Math.ceil(+options.amount))} AZERO (${numWithCommas(Math.ceil(+options.amount * options.price))}$)* ${options.feedType == 'deposit' ? "to" : "from"} ${constants.token}\n\n` +
           `${generateDots(+options.amount * options.price, constants, options.feedType == 'deposit' ? '⚪' : '⚫')}\n\n` +
           `${options.feedType == 'deposit' ? "From" : "To"} address: [${shortenAddress(options.feedType == 'deposit' ? options.from : options.to)}](https://alephzero.subscan.io/account/${options.feedType == 'deposit' ? options.from : options.to})\n\n` +
           `🅰️ [Aleph Zero](https://alephzero.org/) | ${constants.tradeLink} | 📶 [Tx Hash](https://alephzero.subscan.io/extrinsic/${options.hash}) | 💥 [Powered by Cerby Finance](https://cerby.fi)`
}