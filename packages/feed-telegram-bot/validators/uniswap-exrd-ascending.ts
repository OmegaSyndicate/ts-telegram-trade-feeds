interface IMessage {
    feedType: string,
    radixInUsd: number,
    amountRadix: number,
    amountRadixInUsd: number,
    transactionFeeInUsd: number,
    fromAddress: string,
    transactionHash: string
}

interface IConfig {
    minUSD: number;
    // Expand to other meanings here
}

export function validate(config: IConfig, message: IMessage): Boolean {
    return config.minUSD <= message.amountRadixInUsd;
}