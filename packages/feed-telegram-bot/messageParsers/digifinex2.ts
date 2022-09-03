export function parser(message: Buffer) {
    return JSON.parse(String(message));
}