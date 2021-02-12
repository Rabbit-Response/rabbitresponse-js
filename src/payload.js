const bufferizePayload = (payload) => {
    if(payload == null) return [Buffer.alloc(0), 'null'];
    const payloadType = Buffer.isBuffer(payload) ? 'buffer' : typeof payload;
    switch (payloadType) {
        case "boolean":
        case "number":
        case "object":
            payload = JSON.stringify(payload);
        case "string":
            payload = Buffer.from(payload);
            break;
    }
    return [payload, payloadType];
}

const deBufferizePayload = (payload, payloadType) => {
    switch (payloadType) {
        case "null":
            return null;
        case "buffer":
            return payload;
        case "string":
            return payload.toString();
        case "boolean":
            return payload.toString() === 'true';
        case "number":
            return parseFloat(payload.toString());
        case "object":
            return JSON.parse(payload.toString());
    }
}

module.exports = {
    bufferizePayload,
    deBufferizePayload
}
