import { DateTime } from 'luxon';

const getCurrentTimestamp = (): any => {
    return DateTime.now().toUTC().toFormat('yyyy-MM-dd HH:mm:ss.SSS');
};

const getCurrentIso8601 = (): any => {
    return DateTime.now().toUTC().toISO({ includeOffset: true, suppressSeconds: false, suppressMilliseconds: false });
};

export { getCurrentTimestamp, getCurrentIso8601 };
