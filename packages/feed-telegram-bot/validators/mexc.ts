export function validate(config, msg): boolean {
	return (msg.trade_price * msg.trade_quantity) >= config.minUSD;
}