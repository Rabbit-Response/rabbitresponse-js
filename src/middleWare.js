const composeMiddleWare = (methods) => {
    return async (...params) => {
        let prevIndex = -1

        const runner = async (index) => {
            if (index <= prevIndex) {
                throw new Error('invalid middleware next() called more than once');
            }
            prevIndex = index;
            if (methods[index]) {
                await methods[index](...params, () => runner(index + 1));
            }
        }

        await runner(0);
    };
};

module.exports = {composeMiddleWare};
