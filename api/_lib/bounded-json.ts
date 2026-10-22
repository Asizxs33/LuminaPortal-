// Bound provider responses while streaming, before allocating/parsing the JSON.
export async function boundedJson(response: Response, maxBytes: number): Promise<any> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Empty provider response');
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        while (true) {
            const {done,value} = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > maxBytes) { await reader.cancel(); throw new Error('Provider response too large'); }
            chunks.push(value);
        }
    } finally { reader.releaseLock(); }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
