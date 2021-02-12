const rabbitResponse = require('../');
const rr = rabbitResponse();

const queue = 'helloWorld';

const app = async () =>{
    console.log(await rr.get(queue));
};

app();

rr.consumeQueue(queue,(req,res)=>{
    res.send('Hello World');
});


