const {QueueTypes} = require('../Enums/Queue');

const queueOptions = {};
queueOptions[QueueTypes.replyTo] =  {autoDelete: true, durable: false};
queueOptions[QueueTypes.durable] =  {autoDelete: false, durable: true};
queueOptions[QueueTypes.exchangeBind] =  {autoDelete: true, durable: false};

module.exports = {queueOptions};
