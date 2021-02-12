const {deBufferizePayload} = require("./payload");

const request = (msg) => {
    //TODO: move decoding to middleware?
    const payloadType = msg.properties.headers.payloadType;
    const content = deBufferizePayload(msg.content, payloadType);
    const properties = msg.properties
    return {...properties, ...properties.headers, content}
}

module.exports = request;
