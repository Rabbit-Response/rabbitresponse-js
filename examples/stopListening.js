const rabbitResponse = require('../');
const rr = rabbitResponse();

const queue = 'unsubscribeExample';

setInterval(()=>{
        rr.post(queue,"still listening");
}
,500);

// 1. Store the consumerObject returned from the consumeQueue function
const consumerObject = rr.consumeQueue(queue,(req)=>{
    console.log(req.content);
});


// 2. call the unSubscribe method of the consumerObject
setTimeout(()=>{
    consumerObject.unSubscribe();
},3000);
