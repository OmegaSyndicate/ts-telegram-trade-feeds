import { shortenAddress, createEtherscanLink, numWithCommas } from "./Radix-uniswap";
import { generateDots } from "./Wise-stakes-uniswap";

export interface Message {
    Burn: Type,
    Mint: Type,
    price: string
}

interface Type {
    symbol: string,
    amount: string,
    id: string,
    sender: string,
    timestamp: string,
    txFee: string,
    txHash: string,
    type: "Mint" | "Burn"
}

export function createMessage(options: Message, constants) {
    let link;
    switch(options.Mint.symbol) {
        case "BSC":
            link = `https://bscscan.com/tx/${options.Mint.txHash}`;
            break;
        case "ETH":
            link = createEtherscanLink('tx', options.Mint.txHash);
            break;
        case "POL":
            link = `https://polygonscan.com/tx/${options.Mint.txHash}`;
            break;
    }
    return `🌉 Bridged *${numWithCommas((Number(options.Mint.amount) / 1e6).toFixed(3))} Million CERBY* ($${numWithCommas((Number(options.Mint.amount) * Number(options.price)).toFixed(2))}) from ${options.Burn.symbol} to ${options.Mint.symbol} chain\n` +
        `From address: [${shortenAddress(options.Burn.sender)}](${createEtherscanLink("address", options.Mint.sender)})\n\n` +
        `${generateDots(Number(options.Mint.amount) * Number(options.price), constants, '🟠')}\n\n` +
        `🌉 [Bridge](https://bridge.cerby.fi) | 📶 [Tx Hash](${link})`;
}