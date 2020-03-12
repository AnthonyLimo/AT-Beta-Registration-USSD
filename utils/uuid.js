import {v4 as uuidv4} from 'uuid';

const getuuid = () => {
    return uuidv4();
};

module.exports = getuuid