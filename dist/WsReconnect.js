"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsReconnect = void 0;
const ws_1 = __importDefault(require("ws"));
const events_1 = __importDefault(require("events"));
class WsReconnect extends events_1.default {
    constructor(options) {
        super();
        this.autoReconnectInterval = 5 * 1000; // ms
        this.url = '';
        this.instance = null;
        this.sendQueue = [];
        if (options && options.reconnectDelay !== undefined) {
            this.autoReconnectInterval = options.reconnectDelay;
        }
    }
    heartBeat() {
        this.lastHeartBeatTs = new Date();
    }
    getLastHeartBeat() {
        return this.lastHeartBeatTs;
    }
    // support header when connecting ws.
    setConnectionOptions(options) {
        this.options = options;
    }
    open(url) {
        this.url = url;
        this.instance = new ws_1.default(this.url, undefined, this.options);
        this.instance.on('open', () => {
            this.onopen();
            while (this.sendQueue.length > 0) {
                const data = this.sendQueue.pop();
                this.instance.send(data);
            }
        });
        this.instance.on('message', (data, flags, arg3, arg4, arg5, arg6) => {
            this.onmessage(data, flags, arg3, arg4, arg5, arg6);
        });
        this.instance.on('close', (e) => {
            switch (e.code) {
                case 1000: // CLOSE_NORMAL
                    console.log(`WebSocket: normally closed ${this.url}`);
                    break;
                default:
                    // Abnormal closure
                    this.reconnect(e);
            }
            this.onclose(e);
        });
        this.instance.on('error', (e) => {
            switch (e.code) {
                case 'ECONNREFUSED':
                    this.reconnect(e);
                    break;
                default:
                    this.onerror(e);
            }
        });
    }
    close() {
        console.log(`WsReconnect: closing connection normally ${this.url}`);
        if (!this.instance)
            return;
        try {
            this.instance.removeAllListeners();
            this.instance.close();
        }
        catch (e) {
            console.error(`WsReconnect: closing err ${this.url}`, e);
        }
    }
    send(data, option) {
        if (!this.instance) {
            this.sendQueue.push(data);
            this.emit('warn', `socket instance is not initialized. must call open(${this.url}) first`);
            return;
        }
        if (this.instance.readyState !== 1) {
            this.sendQueue.push(data);
            this.emit('warn', `socket instance is not in ready state, retry when ready ${this.url} readyState=` + this.instance.readyState);
            return;
        }
        try {
            this.instance.send(data, option);
        }
        catch (e) {
            this.instance.emit('error', e);
        }
    }
    reconnect(e) {
        console.log(`WsReconnect: retry in ${this.autoReconnectInterval}ms ${this.url}`, e);
        this.instance && this.instance.removeAllListeners();
        this.instance = null;
        setTimeout(() => {
            console.log(`WsReconnect: reconnecting... in ${this.autoReconnectInterval}ms ${this.url}`);
            this.open(this.url);
        }, this.autoReconnectInterval);
        this.emit('reconnect');
    }
    onopen() {
        // console.log('WsReconnect: open', this.url);
        this.emit('open');
    }
    onmessage(data, flag, arg3, arg4, arg5, arg6) {
        this.emit('message', data, flag, arg3, arg4, arg5, arg6);
        this.heartBeat();
    }
    onerror(e) {
        // console.error('WsReconnect: error', this.url, arguments);
        this.emit('error', e);
    }
    onclose(e) {
        console.log(`WsReconnect: close ${this.url}`, arguments);
        this.emit('close', e);
    }
}
exports.WsReconnect = WsReconnect;
