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
    switch(address) {
        case "0x8149C0a6f5b5417d30F70e00a05d8D15CF471853".toLowerCase():
            return "Cerby Stablecoin Reserve"
        case "0x72aCC602f185692b80d66f933Bb679b04aD4583d".toLowerCase():
            return "Cerby Business Development Fund";
        case "0x43cFD604C3a59f2eE315d25D5D982257D9D28a3E".toLowerCase():
            return "MaratCerby";
        case "0xaeF1352112eE0E98148A10f8e7AAd315c738E98b".toLowerCase():
            return "Cerby Team #2";
        case "0x72fe4aB74214f88e48eF39e7B7Fee7a25085e851".toLowerCase():
            return "Cerby Team #3";
        case "0xBD50733cE43871F80AdFb344aB6F7C43B666763F".toLowerCase():
            return "Cerby Team #4";

    }
    return address.substring(0, 6) + "..." + address.substring(address.length - 4);
}

export function createEtherscanLink(type: "address" | "tx", address: string) {
    return `https://etherscan.io/${type}/${address}`
}

export function generateDots(options: Message | any, constants) {
    var dots = options.amountRadixInUsd < 2*constants.USDInterval? 1: options.amountRadixInUsd / constants.USDInterval - 1;
    dots = dots > 1000 ? 1000 : dots;
    let message = "";
    for (let i = 0; i < dots; i++)
        message += (options.feedType == "uniswapBuy" ? "🟢" : "🔴");
    return message;
}

export function createMessage(options: Message, constants={USDInterval: 500, uniswapPair: "0x684b00a5773679f88598a19976fbeb25a68e9a5f"}) {
     return `${options.feedType == "uniswapBuy" ? "🚀" : "👹"} *1 EXRD = ${options.radixInUsd.toFixed(4)} USDC*\n` +
            `${options.feedType == "uniswapBuy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(options.amountRadix))} EXRD* for *${numWithCommas(Math.ceil(options.amountRadixInUsd))} USDC* on Uniswap (Gas Fee: $${numWithCommas(Math.ceil(options.transactionFeeInUsd))})\n\n` +
            `${generateDots(options, constants)}\n\n` +
            `From address: [${shortenAddress(options.fromAddress)}](${createEtherscanLink("address", options.fromAddress)})\n\n` +
            `🦄 [Uniswap](https://v2.info.uniswap.org/pair/${constants.uniswapPair}) | 📶 [Tx Hash](${createEtherscanLink("tx", options.transactionHash)}) | 📊 [Dextools](https://www.dextools.io/app/ether/pair-explorer/0x684b00a5773679f88598a19976fbeb25a68e9a5f) | 💥 [Powered by Cerby Finance](https://cerby.fi)`
}