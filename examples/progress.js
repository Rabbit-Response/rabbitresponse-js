const rabbitResponse = require('../');
const rr = rabbitResponse();
const queue = 'progress';

let counter = 0;
rr.consumeQueue(queue , (req, res) => {
    const interval = setInterval(()=>{
        if(counter<9){
            counter ++;
            res.progress(counter/10);
        }else{
            res.send('Done');
            clearInterval(interval);
        }
    }, 1000);
});

const onProgress = (progressMessage) => {
    console.log(`algorithm progress:${progressMessage*100}%`);
};

const app = async () => {
    const result = await rr.get(queue, null,{
        progress: onProgress
    });
    console.log(`algorithm finished. result: ${result}`);
    process.exit();
};

app();
