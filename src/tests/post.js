const testPost = (rr, id) => {
    rr.post(id,'passed');

    rr.consumeQueue(id,(req)=>{
        console.log(`${id}: ${req.content}`);
    });
};

module.exports = testPost;
