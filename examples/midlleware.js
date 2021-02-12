const rabbitResponse = require('../index');
const queueName = 'middleware_example';

const rr = rabbitResponse();

const middlewareExample1 = (req,res,next) =>{
    req.allCaps = req.content.toUpperCase();
    next();
};

const middlewareExample2 = (req,res,next) =>{
    req.noTs = req.content.replace(/t/g,'');
    next();
};

rr.use(middlewareExample1);

rr.consumeQueue(queueName, middlewareExample2, (req, res) => {
    console.log('content:', req.content);
    console.log('all Caps:', req.allCaps);
    console.log('no T\'s:', req.noTs);
});

rr.post(queueName,'Hello my name is inigo montoya you killed my father prepare to die');
