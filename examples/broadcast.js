const rabbitResponse = require('../');
const rr = rabbitResponse();

const queue = 'broadcastExample';

rr.consumeExchange(queue,(req)=>{
   console.log('consumer1 received message :',req.content);
});

rr.consumeExchange(queue,(req)=>{
    console.log('consumer2 received message :',req.content);
});

rr.broadcast(queue, 42);
