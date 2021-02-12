/*
 * rabbit response
 * Copyright(c) 2020 - 2021 Jonathan Amit-Kohn
 */

'use strict';

/*
 * Module dependencies.
 */

const amqp = require('amqplib/callback_api');
const {MessageTypes} = require("./Enums/messages");
const {v4: uuidv4} = require('uuid');
const {QueueTypes} = require('./Enums/Queue');
const {queueOptions} = require('./definitions/queue.js');
const defaultSettings = require('./defaultSettings');
const {reservedExchanges} = require("./Enums/exchange");
const {bufferizePayload, deBufferizePayload} = require("./payload");
const request = require("./request");
const {composeMiddleWare} = require("./middleWare");
const {appendToHeader, buildHeader} = require("./headers");

/*
 * Expose `createApplication()`.
 */

module.exports = createApplication;

/*
 * Create a rabbit response application.
 */
function createApplication(userSettings = {}) {
    const logger = userSettings.logger || console.log;
    const settings = {...defaultSettings, ...userSettings};
    let channel = null;
    let replyTo = `replyTo-${uuidv4()}`;
    const pendingPromises = {};
    const terminatedIds = {};
    const queueConsumers =[];
    const queueBinds =[];
    const middleWare = [];

    const verboseLog = (...args) =>{
        if(settings.verbose){
            logger(...args);
        }
    };

    const use = (method) =>{
      middleWare.push(method);
    };

    const checkChannel = (method) => {
        const checkChannelAndRun = (...args) => {
            if (channel) {
                method(...args);
            } else {
                setTimeout(() => checkChannelAndRun(...args), settings.reconnectAttemptDelay);
            }
        }
        return checkChannelAndRun;
    }

    const assertQueue = (queueName, queueType, callback = () => undefined) => {
        const options = queueOptions[queueType];
        channel.assertQueue(queueName, options, callback);
    };

    const assertExchange = (exchangeName, exchangeType, callback = () => undefined) => {
        channel.assertExchange(exchangeName, exchangeType, {}, callback);
    };

    const consume = ([queueName, queueType, callback, consumerTag]) => {
        assertQueue(queueName, queueType, () => {
            channel.consume(queueName, async (msg) => {
                const masterId = msg.properties.headers.masterId;
                if(masterId && terminatedIds[masterId]) return channel.ack(msg);
                callback(msg);
            }, {noAck: false, consumerTag});
        });
    };

    const bind = ([queueName, exchangeName]) => {
        assertExchange(exchangeName, 'fanout', ()=> assertQueue(queueName, QueueTypes.exchangeBind, () => {
            channel.bindQueue(queueName,exchangeName, '');
        }));
    };

    const setConsume = (queueName, queueType, callback) =>{
        const consumerTag = `${queueName}-${uuidv4()}`;
        queueConsumers.push([queueName,queueType,callback,consumerTag]);
        if(channel){
            consume([queueName, queueType, callback, consumerTag]);
        }
        return consumerTag;
    }

    const setBind = (queueName, exchangeName) =>{
        queueBinds.push([queueName, exchangeName]);
        if(channel){
            bind([queueName, exchangeName]);
        }
    }

    const publishToQueue = checkChannel(
        (queueName, QueueType, payload, options) =>
            assertQueue(queueName, QueueType, () => {
                const [bufferedPayload , payloadType] = bufferizePayload(payload);
                channel.sendToQueue(queueName, bufferedPayload, {...options, headers: {...options.headers, payloadType}});
            }
        )
    );

    const get = (queueName, payload, userOptions = {}) => {
        const correlationId = uuidv4();
        return new Promise(function (resolve, reject) {
            const masterId = userOptions.masterId;
            const expiration = userOptions.expiration ||  settings.expiration;
            const header = buildHeader({masterId,replyTo,correlationId, expiration});
            publishToQueue(queueName, QueueTypes.durable, payload, header);
            pendingPromises[correlationId] = {
                queueName,
                masterId,
                payload,
                resolve,
                reject,
                expires: Date.now() + expiration,
                progress: userOptions.progress
            };
        });
    };

    const post = (queueName, payload, userOptions = {})=>{
        const expiration = userOptions.expiration ||  settings.expiration;
        const options = buildHeader({
            expiration,
            masterId:userOptions.masterId,
        });
        publishToQueue(queueName, QueueTypes.durable, payload, options);
    };

    const broadcast = checkChannel(
        (exchangeName, payload, userOptions = {})=>
            assertExchange(exchangeName, 'fanout', ()=> {
                const [bufferedPayload , payloadType] = bufferizePayload(payload);
                const expiration = userOptions.expiration ||  settings.expiration;
                const options = buildHeader({
                    payloadType,
                    expiration,
                    masterId:userOptions.masterId
                });
                channel.publish(exchangeName, '', bufferedPayload, options);
            }
        )
    );

    const onReceivedReply = (msg) => {
        const msgType = msg.properties.headers.msgType;
        const correlationId = msg.properties.correlationId;
        const msgObj = deBufferizePayload(msg.content, msg.properties.headers.payloadType);
        if (!correlationId || !pendingPromises[correlationId]) return;
        switch (msgType) {
            case MessageTypes.reply:
                pendingPromises[correlationId].resolve(msgObj);
                delete pendingPromises[correlationId];
                break;
            case MessageTypes.reject:
                pendingPromises[correlationId].reject(msgObj);
                delete pendingPromises[correlationId];
                break;
            case MessageTypes.progress:
                if(pendingPromises[correlationId].progress){
                    pendingPromises[correlationId].progress(msgObj);
                }
                break;
        }
    };

    const unSubscribeQueue = (tag)=>{
        const index = queueConsumers.findIndex((consumer)=>consumer[3]===tag);
        if(index > -1){
            queueConsumers.splice(index,1);
        }
        if(channel){
            channel.cancel(tag);
        }
    };

    const unSubscribeExchange = (tag, queueName)=>{
        const index = queueBinds.findIndex((bind)=>bind[0]===queueName);
        if(index > -1){
            queueBinds.splice(index,1);
        }
        unSubscribeQueue(tag);
        if(channel){
            channel.deleteQueue(queueName);
        }
    };

    const onServiceFail = (msg, queueName, e)=>{
        verboseLog(e);
        if(!channel) return;
        channel.ack(msg);
        let failedAttempts = msg.properties.headers.failedAttempts || 0;
        if(failedAttempts < settings.reQueueAttempts){
            const header = appendToHeader(msg.properties,{failedAttempts: failedAttempts + 1 });
            channel.sendToQueue(queueName, msg.content, header);
        }else{
            const header = appendToHeader(msg.properties,{msgType:  MessageTypes.reject});
            publishToQueue(msg.properties.replyTo, QueueTypes.replyTo, e, header);
        }
    };

    const consumeQueue = (queueName, ...methods) => {
        const callback = composeMiddleWare([...middleWare,...methods]);
        const tag = setConsume(queueName, QueueTypes.durable, async (msg) => {
            try {
                const req = request(msg);
                const res = response(msg);
                verboseLog('received msg: ',req.content);
                await callback(req, res);
                channel.ack(msg);
            } catch (e) {
                onServiceFail(msg, queueName, e);
            }
        });
        return {unSubscribe: ()=>unSubscribeQueue(tag)}
    };

    const consumeExchange = (exchangeName, ...methods)=> {
        const queueName = `exchangeBind-${exchangeName}-${uuidv4()}`;
        const callback = composeMiddleWare([...middleWare,...methods]);
        setBind(queueName, exchangeName);
        const tag = setConsume(queueName, QueueTypes.exchangeBind, async (msg) => {
            try {
                const req = request(msg);
                const res= {};
                callback(req, res);
                channel.ack(msg);
            } catch (e) {
                logger(e);
            }
        });
        return {unSubscribe: ()=>unSubscribeExchange(tag,queueName)}
    };

    const terminate = (masterId) => {
        broadcast(reservedExchanges.terminate, masterId);
    };

    //TODO: move to separate file
    function response(msg) {
        let replySent = false;
        const replyTo = msg.properties.replyTo;
        const correlationId = msg.properties.correlationId;
        const masterId = msg.properties.headers.masterId;

        const reply = (data, msgType) =>{
            const options = buildHeader({
                masterId, msgType, correlationId,
                expiration: settings.expiration
            });
            publishToQueue(replyTo, QueueTypes.replyTo, data, options);
        };

        const replyOnce = (data, msgType) =>{
            if (replySent) return;
            reply(data,msgType);
            replySent = true;
        };
        const send = (data) => replyOnce(data, MessageTypes.reply);
        const reject = (error)=> replyOnce(error, MessageTypes.reject);
        const progress = (data) => reply(data, MessageTypes.progress);
        return {replyTo, send, reject, progress}
    }

    const removeExpiredPromises = () => {
        const now = Date.now();
        const promisesToRemove = Object.keys(pendingPromises)
            .filter( key => pendingPromises[key].expires < now);
        if(promisesToRemove.length){
            promisesToRemove.forEach(id=> {
                verboseLog(`removing expired task id: ${id}
                 for queue: ${pendingPromises[id].queueName}
                  request content: ${pendingPromises[id].payload}`);
                delete pendingPromises[id];
            });
        }
    }

    const setListeners = () => {
        setConsume(replyTo, QueueTypes.replyTo, (msg) => {
            channel.ack(msg);
            onReceivedReply(msg);
        });
        consumeExchange(reservedExchanges.terminate, (msg)=>{
            const masterId= msg.content;
            if(!masterId) return;
            terminatedIds[masterId] = true;
            const promisesToTerminate = Object.keys(pendingPromises)
                .filter( key => pendingPromises[key].masterId === masterId );
            if(promisesToTerminate.length){
                promisesToTerminate.forEach(id=> delete pendingPromises[id]);
                verboseLog(`terminating task: ${masterId}`);
            }
        });
        // set a remover for old get requests
        setInterval(removeExpiredPromises,Math.min(settings.expiration,300000));
    };

    const bindAndConsumeQueues =()=>{
        queueConsumers.forEach(consume);
        queueBinds.forEach(bind);
    };

    const onChannelDisconnect =  (e) => {
        logger(`channel disconnected ${e?`with error: ${e}`:''}`);
        channel = null;
        if(settings.robust){
            setTimeout(connect,settings.reconnectAttemptDelay);
            return;
        }
        throw e;
    };

    const connect = () => {
        amqp.connect(`${settings.protocol}://${settings.username}:${settings.password}@${settings.host}:${settings.port}`, function (error0, connection) {
            if (error0) {
                if(settings.robust){
                    setTimeout(connect,settings.reconnectAttemptDelay);
                    return;
                }
                throw error0;
            }
            logger('connected to server');
            connection.createChannel(function (error1, ch) {
                channel = ch;
                ch.prefetch(settings.prefetchLimit);
                ch.on('close', onChannelDisconnect);
                ch.on('error', onChannelDisconnect);
                bindAndConsumeQueues();
            });
        });
    }

    setListeners();
    connect();
    return {
        broadcast,
        consumeExchange,
        consumeQueue,
        get,
        post,
        terminate,
        use
    };
}
