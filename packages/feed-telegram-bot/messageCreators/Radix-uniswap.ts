import { generateDots, numWithCommas, ScanText, CerbyFinance } from "./helpers"

export interface Message {
    feedType: string,
    radixInUsd: number,
    amountRadix: number,
    amountRadixInUsd: number,
    transactionFeeInUsd: number,
    fromAddress: string,
    transactionHash: string
}

export function createMessage(options: Message, constants={USDInterval: 500, uniswapPair: "0x684b00a5773679f88598a19976fbeb25a68e9a5f"}) {
     return `${options.feedType == "uniswapBuy" ? "🚀" : "👹"} *1 EXRD = ${options.radixInUsd.toFixed(4)} USDC*\n` +
            `${options.feedType == "uniswapBuy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(options.amountRadix))} EXRD* for *${numWithCommas(Math.ceil(options.amountRadixInUsd))} USDC* on Uniswap (Gas Fee: $${numWithCommas(Math.ceil(options.transactionFeeInUsd))})\n\n` +
            `${generateDots(options.amountRadixInUsd, constants, options.feedType == "uniswapBuy" ? "🟢" : "🔴")}\n\n` +
            `From address: ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.account, options.fromAddress)}\n\n` +
            `🦄 [Uniswap](https://v2.info.uniswap.org/pair/${constants.uniswapPair}) | ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.tx, options.transactionHash)} | 📊 [Dextools](https://www.dextools.io/app/ether/pair-explorer/0x684b00a5773679f88598a19976fbeb25a68e9a5f) ${CerbyFinance}`
}