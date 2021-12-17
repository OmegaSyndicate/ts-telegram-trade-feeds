import { numWithCommas, shortenAddress, createEtherscanLink } from "./Radix-uniswap";
import { generateDots } from "./Wise-stakes-uniswap";
export interface Message {
    amountDeft: string,
    amountDeftInUsd: string,
    blockNumber: string,
    feedType: 'buy' | 'sell',
    from: string,
    id: string,
    logIndex: string,
    sender: string,
    timestamp: string,
    to: string,
    transactionFeeInEth: string,
    txHash: string,
    transactionFeeInUsd: string,
    otherInUsdPrice: string,
    deftInUsd: string
}

export function createMessage(options: any, constants) {
    options.deftInUsd = +options.amountDeftInUsd / +options.amountDeft;
     return `${options.feedType == "buy" ? "🚀" : "👹"} *1 CERBY = ${Number(options.deftInUsd).toFixed(7)} ${constants.token.toUpperCase()}*\n` +
            `${options.feedType == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.floor(options.amountDeft * 1000) / 1000)} CERBY* for *${numWithCommas(Math.ceil(options.amountDeftInUsd * 1000) / 1000)} ${constants.token.toUpperCase()}* on ${constants.stakingType} (Gas Fee: $${numWithCommas(Math.ceil(options.transactionFeeInUsd))})\n\n` +
            `${generateDots(options.amountDeftInUsd, constants, options.feedType == "buy" ? "🟢" : "🔴")}\n\n` +
            `From address: [${shortenAddress(options.from)}](${constants.scanURL}address/${options.from})\n\n` +
            `${constants.chain} | 📶 [Tx Hash](${constants.scanURL}tx/${options.txHash}) ${constants.DexToolsLink ? `| 📊 [Dextools](${constants.DexToolsLink}) ` : ''}| 💥 [Powered by CERBY Token](https://t.me/CerbyToken)`
}