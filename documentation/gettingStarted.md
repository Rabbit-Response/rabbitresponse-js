# Getting Started

#### Installing
This is a Node.js module available through the npm registry.        
Installation is done via the npm install command:

``` $ npm install rabbit-response```

#### RabbitMQ
If you don't have an instance of RabbitMQ to connect to, you will need to spin one up.
The easiest way to do that is using docker.  
All you need to do is run the following command:
```
docker run -d --hostname my-rabbit --name some-rabbit rabbitmq:3
```
* If you don't have docker installed check out  [Docker](https://www.docker.com/get-started)

#### Initialization
```
const rabbitResponse = require('rabbit-response');
const rr = rabbitResponse();
```
To initialize Rabbit Response all you need to do is import it and call it.  
In this case we assume you are running rabbitmq on your local host with its default settings. 
If not you will need to pass the host details into the function when initializing.  
For more details see [API guide](./api.md).

#### Building The App
```
const app = async () =>{
    const stringToPrint = await rr.get('getStringQueue');
    console.log(stringToPrint);
};

app();
```
Here we build a simple app that request a string from the 'getStringQueue' queue and prints the response.


#### Creating a Service
```
rr.consumeQueue('getStringQueue',(req,res)=>{
    res.send('Hello World');
});
```
Let's create a simple service that consumes 'getStringQueue' queue and always returns 'Hello World'.
Since we don't send any data we can ignore the 'req' item that holds the data sent in the request.

#### Putting It All Together
We could run every thing together.  
However, since we want micro service that can run on separate machines we will split the app, and the consumer to different files.  


###### app.js
```
const rabbitResponse = require('rabbit-response');
const rr = rabbitResponse();

const app = async () =>{
    console.log(await rr.get('getStringQueue'));
};

app();
```

###### consumer.js
```
const rabbitResponse = require('rabbit-response');
const rr = rabbitResponse();

rr.consumeQueue(queue,(req,res)=>{
    res.send('Hello World');
});
```

#### You're Done🐰
Good Job, you've just created a micro service app with Rabbit Response.

Check out our [examples](../examples/examples.md) section for more cool things to try.
