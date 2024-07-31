export class Device {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly os: string,
        public readonly ip: string,
    ) {}
}
