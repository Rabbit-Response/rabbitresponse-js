const rabbitResponse = require('../');
const rr = rabbitResponse();

const queue = 'rejectExample';

rr.consumeQueue(queue,(req,res)=>{
    res.reject('Some Error');
});

const getReject = async ()=>{
    try {
        const result = await rr.get(queue);
        console.log(`received result:`,result);
    }catch (e){
        console.log(`failed with Error:`,e);
    }
}

getReject();
