const rabbitResponse = require('../');
const rr = rabbitResponse();

const queue = 'getExample';

const app = async () =>{
    const result = await rr.get(queue,2);
    console.log('2 + 2 =', result);
};

app();

rr.consumeQueue(queue,(req,res)=>{
    res.send(req.content + req.content);
});
