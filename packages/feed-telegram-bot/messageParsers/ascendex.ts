export function parser(message: Buffer) {
	// Here you can convert from different formats, for example protobuf
	return JSON.parse(String(message));
}