const testBroadcast = (rr, id) => {
    rr.consumeExchange(id,(req)=>{
        console.log(`${id}: ${req.content}`);
    });

    rr.broadcast(id,'passed');
};

module.exports = testBroadcast;
