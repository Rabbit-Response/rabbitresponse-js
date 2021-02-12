const rabbitResponse = require('../../');
const rr = rabbitResponse();
const queue = 'squareNumber';

const app = async () =>{
    const numbersToSquare = [1,2,3,4,5,6,7,8,9,10];
    const promiseList = numbersToSquare.map(async number => await rr.get(queue,number));
    const squaredNumbers = await Promise.all(promiseList)
    console.log(squaredNumbers);
};

app();
