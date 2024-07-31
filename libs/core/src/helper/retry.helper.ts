export const delay = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout));

export const retry = async (
    callback: () => Promise<any>,
    count: number,
    timeout: number,
    ignoreException?: (e: Error) => boolean,
) => {
    let tries = 0;
    while (tries < count) {
        try {
            return await callback();
        } catch (e) {
            tries++;
            console.warn(`Retry #${tries}. Error: ${e.name} - ${e.message}`);
            if (tries >= count || (ignoreException && !ignoreException(e))) {
                throw e;
            }
        }

        await delay(timeout);
    }
};
