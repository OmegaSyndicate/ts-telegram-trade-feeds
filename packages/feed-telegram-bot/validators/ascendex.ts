

export function validate(config, msg): boolean {
	return (msg.q * msg.p) >= config.minUSD;
}