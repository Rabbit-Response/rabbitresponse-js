const testReject = (rr, id) => {
    rr.consumeQueue(id,(req,res)=>{
        res.reject('passed');
    });

    const getReject = async ()=>{
        try {
            await rr.get(id);
            console.log(`${id}: failed`);
        }catch (e){
            console.log(`${id}:`,e);
        }
    }

    getReject();
};

module.exports = testReject;
