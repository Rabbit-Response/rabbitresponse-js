const testRobust = (rr, id) => {
    let errorCount1=0;
    let errorCount2=0;
    rr.consumeQueue(id+'-a',(req,res)=>{
        if(errorCount1 < 1){
            errorCount1++;
            throw('failed');
        }
        res.send('passed');
    });

    rr.consumeQueue(id+'-b',(req,res)=>{
        if(errorCount2 < 2){
            errorCount2++;
            throw('passed');
        }
        res.send('failed');
    });

    const app = async ()=>{
        try {
            await rr.get(id+'-a'); //fails once
            try {
                await rr.get(id+'-b'); // fails twice
                console.log(`${id}: failed`);
            }catch (e){
                console.log(`${id}: ${e}`);
            }
        }catch (e){
            console.log(`${id}: failed`);
        }
    }
    app();
};

module.exports = testRobust;
