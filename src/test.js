const rabbitResponse = require('../');

const rr = rabbitResponse({
    reQueueAttempts: 1
});

//test1 - post
require("./tests/post")(rr,'test1');

//test2 - broadcast
require("./tests/broadcast")(rr,'test2');

//test 3 - get
require("./tests/get")(rr,'test3');

//test 4 - reject
require("./tests/reject")(rr,'test4');

//test 5 - robust
require("./tests/robust")(rr,'test5');

//test 6 - payloads
require("./tests/payloads")(rr,'test6');
