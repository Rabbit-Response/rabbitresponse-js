const buildHeader = ({replyTo, masterId, msgType, payloadType, correlationId, expiration,failedAttempts})=>{
  return {
      replyTo,
      correlationId,
      expiration:expiration.toString(),
      headers:{
          failedAttempts,
          masterId,
          msgType,
          payloadType
      }
  }
};

const appendToHeader = (header,{masterId, msgType, payloadType, correlationId, expiration,failedAttempts, replyTo})=>
    buildHeader({
        correlationId: correlationId || header.correlationId,
        expiration: expiration || header.expiration,
        replyTo: replyTo || header.replyTo,
        failedAttempts: failedAttempts || header.headers.failedAttempts,
        masterId: masterId || header.headers.masterId,
        msgType: msgType || header.headers.msgType,
        payloadType: payloadType || header.headers.payloadType,
    });

module.exports = {buildHeader, appendToHeader};
