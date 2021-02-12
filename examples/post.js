const rabbitResponse = require('../');
const rr = rabbitResponse();

const queue = 'postExample';

rr.consumeQueue(queue,(req,res)=>{
    console.log('received a',req.content);
});

rr.post(queue,"random message");
