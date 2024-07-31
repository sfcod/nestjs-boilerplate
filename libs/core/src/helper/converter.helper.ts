const padLeadingZeros = (num: number, size: number): string => {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
};

export const inchesToCm = (inches: number) => Number((inches * 2.54).toFixed(0));

export const inchesToFt = (value: number): string => {
    return `${padLeadingZeros(~~(value / 12), 1)}'${padLeadingZeros(value % 12, 2)}''`;
};

export const lbsToKg = (value: number) => Number((value * 0.453592).toFixed(0));
