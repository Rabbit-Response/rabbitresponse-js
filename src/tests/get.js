const testGet = (rr, id) => {
    rr.consumeQueue(id,(req,res)=>{
        res.send(req.content+'sed');
    });

    const app = async () =>{
        console.log(`${id}:`,await rr.get(id,'pas'));
    };

    app();
};

module.exports = testGet;
