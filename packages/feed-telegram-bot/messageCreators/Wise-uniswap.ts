import { numWithCommas, shortenAddress, createEtherscanLink } from './Radix-uniswap';

export interface Message {
    feedType: string,
    wiseInUsd: number,
    wiseInEth: number,
    amountWise: number,
    amountWiseInUsd: number,
    amountWiseInEth: number,
    transactionFeeInUsd: number,
    fromAddress: string,
    transactionHash: string
}

export function generateDots(options: Message | any, constants) {
    var dots = options.amountWiseInUsd < 2*constants.USDInterval? 1: options.amountWiseInUsd / constants.USDInterval - 1;
    dots = dots > 1000 ? 1000 : dots;
    let message = "";
    for (let i = 0; i < dots; i++)
        message += (options.feedType == "uniswapBuy" ? "🟢" : "🔴");
    return message;
}

export function createMessage(options: Message, constants={USDInterval: 500, uniswapPair: "0x684b00a5773679f88598a19976fbeb25a68e9a5f"}) {
     return `${options.feedType == "uniswapBuy" ? "🚀" : "👹"} *1 WISE = ${options.wiseInUsd.toFixed(4)} USD* (${options.wiseInEth.toFixed(7)} ETH)\n` +
            `${options.feedType == "uniswapBuy" ? "Bought" : "Sold"} *${numWithCommas(Math.floor(options.amountWise * 1000) / 1000)} WISE* for *${numWithCommas(Math.floor(options.amountWiseInEth * 1000) / 1000)} ETH* on Uniswap (Gas Fee: $${numWithCommas(Math.ceil(options.transactionFeeInUsd))})\n\n` +
            `${generateDots(options, constants)}\n\n` +
            `From address: [${shortenAddress(options.fromAddress)}](${createEtherscanLink("address", options.fromAddress)})\n\n` +
            `🦄 [Uniswap](https://v2.info.uniswap.org/pair/${constants.uniswapPair}) | 📶 [Tx Hash](${createEtherscanLink("tx", options.transactionHash)}) | 💥 [Powered by Cerby Finance](https://cerby.fi)`
}