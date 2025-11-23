import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();


// get data from redis 
async function getRedis(buildingId) {
    const array = [];
    for (let i = 0; i < 100; i++) {
        const row = await client.get(`building:${buildingId}:row:${i}`);
        if (!row) break;
        array.push(JSON.parse(row));
    }
    return array;
}; 

// make changes to redis data
async function updateRedis(buildingId, update) {
    const {x, y, color} = update;

    const rowKey = `building:${buildingId}:row:${y}`;
    const rowData = await client.get(rowKey);
    if (!rowData) return;

    const rowArray = JSON.parse(rowData);
    rowArray[x] = color;

    await client.set(rowKey, JSON.stringify(rowArray));
}; 

// load data to redis
async function loadRedis(buildingId, data) {
    for (let i = 0; i < data.length; i++) {
        await client.set(`building:${buildingId}:row:${i}`, JSON.stringify(data[i])); 
    }; 
}; 

export {getRedis, updateRedis, loadRedis}; 
