import {getRedis, loadRedis} from './redisService.js';


const getState = (buildingId) => {
    state  /* some sql */;
    loadRedis(buildingId, state);
}; 


const loadState = async (buidlingId) => {
    redisData = await getRedis(buidlingId);
    return /* some sql */;
}

export { getState , loadState };