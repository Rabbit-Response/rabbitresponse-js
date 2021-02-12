const rabbitResponse = require('../');
const rr = rabbitResponse();

const queue = 'terminationExample';

setInterval(()=>{
        rr.post(queue,"not terminated yet",{masterId: 'masterId'})
}
,1000);

rr.consumeQueue(queue,(req,res)=>{
    console.log(req.content);
});

setTimeout(()=>{
    rr.terminate('masterId');
},3000);
