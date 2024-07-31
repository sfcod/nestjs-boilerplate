import { Readable } from 'stream';

export class ReadableWebToNodeStream {
    private webStream: ReadableStream;
    private nodeStream: Readable;

    constructor(webStream: ReadableStream) {
        this.webStream = webStream;
        this.nodeStream = new Readable({
            read() {},
        });
        this.pump();
    }

    private pump() {
        const reader = this.webStream.getReader();
        const pump = () => {
            reader
                .read()
                .then(({ done, value }) => {
                    if (done) {
                        this.nodeStream.push(null);
                    } else {
                        this.nodeStream.push(Buffer.from(value));
                        pump();
                    }
                })
                .catch((err) => {
                    this.nodeStream.emit('error', err);
                });
        };
        pump();
    }

    public getNodeStream(): NodeJS.ReadableStream {
        return this.nodeStream;
    }
}
