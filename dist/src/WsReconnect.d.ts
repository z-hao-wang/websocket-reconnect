import * as EventEmitter from 'events';
export declare namespace WsReconnect {
    interface Options {
        reconnectDelay?: number;
    }
}
export declare class WsReconnect extends EventEmitter {
    private autoReconnectInterval;
    private url;
    private instance;
    lastHeartBearTs?: Date;
    sendQueue: string[];
    constructor(options?: WsReconnect.Options);
    protected heartBeat(): void;
    getLastHeartBeat(): Date | undefined;
    open(url: string): void;
    close(): void;
    send(data: string, option?: any): void;
    reconnect(e: any): void;
    private onopen;
    private onmessage;
    private onerror;
    private onclose;
}
