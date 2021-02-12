# rabbit-response
Rabbit Response is a framework designed to help you build advanced micro-service systems using    
**Quick, Easy to read, Linear JavaScript**.


```
const result = await rr.get('complicatedAlgorithm',data);
```


### Installation
This is a Node.js module available through the npm registry.        
Installation is done via the npm install command:

``` $ npm install rabbit-response```

You will also need an instance of RabbitMQ to connect to.     
If you don't have one, the easiest way to spin one up is using [Docker](https://www.docker.com/get-started).
```
docker run -d --hostname my-rabbit --name some-rabbit rabbitmq:3
```
* If you don't have docker installed check out [Docker home page](https://www.docker.com/get-started)

### Documentation
* [Getting Started](./documentation/gettingStarted.md)
* [API guide](./documentation/api.md)
* [Examples](./examples/examples.md)


### Examples 
We have several [Examples](./examples/examples.md). Here is the first one to get you started.
```
const rabbitResponse = require('rabbit-response');
const rr = rabbitResponse();

rr.consumeQueue('getStringQueue',(req,res)=>{
    res.send('Hello World');
});

const app = async () =>{
    const stringToPrint = await rr.get('getStringQueue');
    console.log(stringToPrint);
};

app();

```

This example will print "Hello World" to console.
You may notice the code is in a single file.        
To learn how to separate services check out the [Getting Started section](./documentation/gettingStarted.md).

### License
[MIT](./LICENSE-MIT)
