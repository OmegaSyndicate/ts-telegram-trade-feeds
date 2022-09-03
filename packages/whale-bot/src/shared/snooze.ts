export async function snooze(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}