import * as moment from 'moment';

const getCurrentTimestamp = (): any => {
    return moment().utc().format('YYYY-MM-DD HH:mm:ss.SSSSSS');
};

const getCurrentIso8601 = (): any => {
    return moment().utc().format('YYYY-MM-DD[T]HH:mm:ss.SSSZ');
};

export { getCurrentTimestamp, getCurrentIso8601 };
