const rabbitResponse = require('../../');
const rr = rabbitResponse();
const queue = 'squareNumber';

rr.consumeQueue(queue,(req,res)=>{
   res.send(req.content*req.content);
});
