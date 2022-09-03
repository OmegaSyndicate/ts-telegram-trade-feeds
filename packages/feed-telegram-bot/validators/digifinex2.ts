export function validate(config, msg): boolean {
    return (+msg.amount * +msg.price) >= config.minUSD;
}