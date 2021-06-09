/// <reference types="node" />
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
    protected lastHeartBeatTs?: Date;
    sendQueue: string[];
    headers: any;
    constructor(options?: WsReconnect.Options);
    protected heartBeat(): void;
    getLastHeartBeat(): Date | undefined;
    setHeaders(headers: any): void;
    open(url: string): void;
    close(): void;
    send(data: string, option?: any): void;
    reconnect(e: any): void;
    private onopen;
    private onmessage;
    private onerror;
    private onclose;
}
