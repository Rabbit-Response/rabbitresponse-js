# API

## Table of Content
[rabbit-response](#rabbitresponse)     

> [broadcast](#broadcast)     
> [consumeExchange](#consumeexchange)     
> [consumeQueue](#consumequeue)       
> [get](#get)     
> [post](#post)       
> [terminate](#terminate)     
> [use](#use)    

[request / response](#request-response)   

> [request](#request)   
> [response](#response)   

[Middleware](#middleware)   
## <a name="rabbitresponse"/> rabbit-response({options})
Create a Rabbit Response application. The **rabbit-response** function is a top-level function exported by the rabbit-response module.
```
const rabbitResponse = require('rabbit-response');
const rr = rabbitResponse({options});
```

#### options

|  Param   | Description | Required / Optional  |  Type |  Default | Example |
| :-----   | :--- | :-------------------: | :---- | :------- | :---: |
| expiration | Message expiration time (ms) | optional | Number | 86,400,000 (24 Hours)| |
| host | IP or URL |  optional | String           | 'localhost' | [Example](../examples/remoteServer.js) |
| password | | optional | String           | 'guest'    | [Example](../examples/remoteServer.js) |
| port | | optional | Number     | 5672 |  [Example](../examples/remoteServer.js)|
| prefetchLimit| The max amount of messages to work on simultaneously from each queue | optional | Number     | 100 | |
| protocol | 'amqp' / 'amqps' | optional | String | 'amqp'     | [Example](../examples/remoteServer.js) |
| reconnectAttemptDelay | Reconnection time (ms) | optional | Number | 100 | |
| reQueueAttempts | In case of an error the message will be re-queued this many times(attempts). | optional | Number | 0 | |
| robust | Should Rabbit Response withstand RabbitMQ unavailability and errors | optional | Boolean | true | |
| username | | optional | String           | 'guest'    | [Example](../examples/remoteServer.js) |
| verbose | Should log be verbose | optional | Boolean          | false   | |
| logger | A function to log errors | optional | Function | console.log | |


## methods
[broadcast](#broadcast)     
[consumeExchange](#consumeexchange)     
[consumeQueue](#consumequeue)       
[get](#get)     
[post](#post)       
[terminate](#terminate)     
[use](#use)     


### get
`rr.get(queueName, payload, options)`

**queueName** *(String)* - The queue for processing the request.

**payload** *(Null/Buffer/String/Number/Boolean/Object)* - Any data needed to process the request.

#### options

|  Param   | Description | Required / Optional  |  Type |  Default | Example |
| :-----   | :--- | :-------------------: | :---- | :-------: | :---: |
| expiration | Message expiration time (ms) | optional | Number | 86,400,000 (24 Hours)| |
| masterId | An Id relating all messages for a specific task. used to terminate anything related to the task on all services.  | optional | String / Number | --- | [Example](../examples/terminate.js) |
| progress | A function to be called on progress events | optional | Function | --- | [Example](../examples/progress.js) |
[Example](../examples/get.js)

### post
`rr.post(queueName, payload, options)`

**queueName** *(String)* - The queue to which you will post the message.

**payload** *(Null/Buffer/String/Number/Boolean/Object)* - The payload that will be posted to the queue.

#### options

|  Param   | Description | Required / Optional  |  Type |  Default | Example |
| :-----   | :--- | :-------------------: | :---- | :-------: | :---: |
| expiration | Message expiration time (ms) | optional | Number | 86,400,000 (24 Hours)| |
| masterId | An Id relating all messages for a specific task. Used to terminate anything related to the task on all services. | optional | String / Number | --- | [Example](../examples/terminate.js) |

[Example](../examples/post.js)

### broadcast
`rr.broadcast(exchangeName, payload, options)`

**exchangeName** *(String)* - The exchange to which to broadcast the message.

**payload** *(Null/Buffer/String/Number/Boolean/Object)* - The payload that will be broadcasted.

#### options

|  Param   | Description | Required / Optional  |  Type |  Default | Example |
| :-----   | :--- | :-------------------: | :---- | :-------: | :---: |
| expiration | Message expiration time (ms) | optional | number | 86,400,000 (24 Hours)| |
| masterId | An Id relating all messages for a specific task. Used to terminate anything related to the task on all services.  | optional | String / Number | --- | [Example](../examples/terminate.js) |

[Example](../examples/broadcast.js)

### consumeQueue
`rr.consumeQueue(queueName, Middleware, Middleware, callback)`

**queueName** *(String)* - The queue that receives the requests..

[**Middleware**](#middleware)  - Optional - as many as needed. these will be piped after the middleware used for the entire app (with **use**) 

**callback** *(Function)* - A function that will be run for every Message in the queue. the function receives to arguments [request and response](#request-response).

**returns**: The following consumer object:

> ##### Methods:
> **unSubscribe** - Stops listening to new messages. Any message in process will finish normally.

[Example](../examples/get.js)

### consumeExchange
`rr.consumeQueue(exchangeName, Middleware, Middleware, callback)`

**exchangeName** *(String)* - The exchange to register to.

[**Middleware**](#middleware)  - Optional - as many as needed. these will be piped after the middleware used for the entire app (with **use**) 

**callback** *(Function)* - A function that will be run for every Message in the queue. the function receives to arguments [request and response](#request-response).

**returns**: The following consumer object:

> ##### Methods:
> **unSubscribe** - Stops listening to new messages. Any message in process will finish normally.

[Example](../examples/broadcast.js)

### terminate
`rr.consumeQueue(masterId)`

**masterId** *(String/Number)* - ID by which to terminate all services.

Will terminate all services that share the "Master ID".

[Example](../examples/terminate.js)

### use
`rr.use(Middleware)`

Receives a [Middleware](#middleware) function.
Will add it at the beginning of all 'consumeQueue' and 'consumeExchange' declared after this call.

[Example](../examples/midlleware.js)

## <a name="request-response"/>request / response
The consume methods (consumeQueue & consumeExchange) as well as any middleware they use, receive 2 objects.
The first - request containing the data for the request.

The second - response - helps you handle replying to requests.

Both object can be extended by [middleware](#middleware).

#### request
An object containing the request data.      
Main attributes:

| Attribute | Description |
| --- | --- |
| content | the request content in the same format as the original message (*Null/Buffer/String/Number/Boolean/Object*) |
| correlationId | An ID used by the source to identify the message and the response. |
| replyTo| The queue to which the requesting service is expecting to receive a response. |
| expiration | The max amount of the the requesting service is willing to wait for a response (from the moment the request was made). |
| payloadType | The type of payload can be on of: *Null/Buffer/String/Number/Boolean/Object* |
| failedAttempts | the number of times processing this message was attempted and failed. If it hasn't failed might be undefined |
| masterId | An Id relating all messages for a specific task. Used to terminate anything related to the task on all services. If a service receives a masterID it is usually recommended to pass it on to any subsequent service requests. |
| msgType | A number that represents the type of message sent (request/response/reject ETC). |

#### response
An object containing attributes and methods to assist in responding to a request.

|  | Attribute / Method | Description | Example |
| --- | --- | --- | :--- |
| replyTo | Attribute | Queue to which the sender of the message is listening. | |
| send | Method | Used to send a response to service that made the request. Receives one argument of type: *Null/Buffer/String/Number/Boolean/Object* | [Example](../examples/get.js) |
| reject |  Method | Send a rejection to the requesting service. Receives a single argument that will be given as the error on the requesting side. supports types: *Null/Buffer/String/Number/Boolean/Object* | [Example](../examples/reject.js) |
| progress |  Method | Used to pass a response to sender while in the process of working on a request. These do not interfere with sending a reply/rejection and are not limited in number. Receives one argument of type: *Null/Buffer/String/Number/Boolean/Object* | [Example](../examples/progress.js) |
* **send** and **reject** can only be sent once and are mutually exclusive.

## Middleware
Middleware is a great way to extend the capabilities of Rabbit Response.
To use a middle ware all you need to do is import it and use the "use" function.

```
const middleware = require('superAmazingMiddleware');
rr.use(middleware);
```

Writing your own middleware is just as easy.
A middleware is just a function that receives 3 things: request, response, next.
Manipulate the request and response object as needed and call the next function when done.

```
const myMiddleware = (req,res,next) => {
    // Do somthing to request.
    // Do simthing else to response.
    next();
}
```

[Example](../examples/midlleware.js)
