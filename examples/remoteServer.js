const rabbitResponse = require('../');

// To connect to a remote rabbitmq server simply set the details when initiating.
const rr = rabbitResponse({
    protocol: 'amqp',
    username: 'guest',
    password: 'guest',
    host: 'localhost',
    port: 5672
});

const queue = 'getExample';

const app = async () =>{
    const result = await rr.get(queue,2);
    console.log('2 + 2 =', result);
};

app();

rr.consumeQueue(queue,(req,res)=>{
    res.send(req.content + req.content);
});
