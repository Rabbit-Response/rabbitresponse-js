module.exports = {
    protocol: 'amqp',
    username: 'guest',
    password: 'guest',
    host: 'localhost',
    port: 5672,
    expiration: 86400000,
    reconnectAttemptDelay: 100,
    reQueueAttempts: 0,
    prefetchLimit: 100,
    robust: true,
    verbose: false
};
