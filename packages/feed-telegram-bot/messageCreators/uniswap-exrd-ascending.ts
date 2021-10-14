export interface Message {
    feedType: string,
    radixInUsd: number,
    amountRadix: number,
    amountRadixInUsd: number,
    transactionFeeInUsd: number,
    fromAddress: string,
    transactionHash: string
}

export function numWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function shortenAddress(address) {
    return address.substring(0, 6) + "..." + address.substring(address.length - 4);
}

export function createEtherscanLink(type: "address" | "tx", address: string) {
    return `https://etherscan.io/${type}/${address}`
}

export function generateDots(options: Message, constants) {
    var dots = options.amountRadixInUsd < 2*constants.USDInterval? 1: options.amountRadixInUsd / constants.USDInterval - 1;
    dots = dots > 1000 ? 1000 : dots;
    let message = "";
    for (let i = 0; i < dots; i++)
        message += (options.feedType == "uniswapBuy" ? "🟢" : "🔴");
    return message;
}

export function createMessage(options: Message, constants={USDInterval: 500, uniswapPair: "0x684b00a5773679f88598a19976fbeb25a68e9a5f"}) {
     return `${options.feedType == "uniswapBuy" ? "🚀" : "👹"} *1 EXRD = ${options.radixInUsd.toFixed(4)}*\n` +
            `${options.feedType == "uniswapBuy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(options.amountRadix))} EXRD* for *${numWithCommas(Math.ceil(options.amountRadixInUsd))} USDC* on Uniswap (Gas Fee: $${numWithCommas(Math.ceil(options.transactionFeeInUsd))})\n\n` +
            `${generateDots(options, constants)}\n\n` +
            `From address: [${shortenAddress(options.fromAddress)}](${createEtherscanLink("address", options.fromAddress)})\n\n` +
            `🦄 [Uniswap](https://v2.info.uniswap.org/pair/${constants.uniswapPair}) | 📶 [Tx Hash](${createEtherscanLink("tx", options.transactionHash)}) | ℹ️ [Info](https://telegra.ph/Valar-List-of-informational-bots-03-23)`
}