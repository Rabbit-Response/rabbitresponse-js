const testPayloads = (rr, id) => {
    rr.consumeQueue(id, (req, res) => {
        res.send(req.content);
    });

    const boolean = true;
    const string = 'string';
    const number = 1000;
    const json = {
        number: 2,
        string: 'string',
        object: {a: 1}
    }
    const buffer = Buffer.from('buffer');

    const app = async () => {
        try {
            if (await rr.get(id, null) !== null) throw('failed');
            if (await rr.get(id, boolean) !== boolean) throw('failed');
            if (await rr.get(id, string) !== string) throw('failed');
            if (await rr.get(id, number) !== number) throw('failed');
            if (JSON.stringify(await rr.get(id, json)) !== JSON.stringify(json)) throw('failed');
            if (Buffer.compare(await rr.get(id, buffer) ,buffer)) throw('failed');
            console.log(`${id}: passed`);
        } catch (e) {
            console.log(`${id}: ${e}`);
        }
    };

    app();
};

module.exports = testPayloads;
