import * as WebSocket from 'ws';
import * as EventEmitter from 'events';

export namespace WsReconnect {
  export interface Options {
    reconnectDelay?: number;
  }
}

export class WsReconnect extends EventEmitter {
  private autoReconnectInterval = 5 * 1000; // ms
  private url: string = '';
  private instance: WebSocket | null = null;
  lastHeartBearTs?: Date;
  sendQueue: string[] = [];

  constructor(options?: WsReconnect.Options) {
    super();
    if (options && options.reconnectDelay !== undefined) {
      this.autoReconnectInterval = options.reconnectDelay;
    }
  }

  protected heartBeat() {
    this.lastHeartBearTs = new Date();
  }

  getLastHeartBeat(): Date | undefined {
    return this.lastHeartBearTs;
  }

  open(url: string) {
    this.url = url;
    this.instance = new WebSocket(this.url);
    this.instance.on('open', () => {
      this.onopen();
      while (this.sendQueue.length > 0) {
        const data = this.sendQueue.pop()!;
        this.instance!.send(data);
      }
    });
    this.instance.on('message', (data: string, flags: any, arg3: any, arg4: any, arg5: any, arg6: any) => {
      this.onmessage(data, flags, arg3, arg4, arg5, arg6);
    });
    this.instance.on('close', (e: any) => {
      switch (e.code) {
        case 1000: // CLOSE_NORMAL
          console.log('WebSocket: normally closed');
          break;
        default:
          // Abnormal closure
          this.reconnect(e);
      }
      this.onclose(e);
    });
    this.instance.on('error', (e: any) => {
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
    console.log(`WsReconnect: closing connection normally`);
    if (!this.instance) return;
    try {
      this.instance.removeAllListeners();
      this.instance.close();
    } catch (e) {
      console.error(`WsReconnect: closing err`, e);
    }
  }

  send(data: string, option?: any) {
    if (!this.instance) {
      return console.error('socket instance is not initialized. must call open(url) first');
    }
    if (this.instance.readyState !== 1) {
      this.sendQueue.push(data);
      return console.warn('socket instance is not in ready state, retry when ready', this.instance.readyState);
    }
    try {
      this.instance.send(data, option);
    } catch (e) {
      this.instance.emit('error', e);
    }
  }

  reconnect(e: any) {
    console.log(`WsReconnect: retry in ${this.autoReconnectInterval}ms`, e);
    this.instance && this.instance.removeAllListeners();
    this.instance = null;
    setTimeout(() => {
      console.log(`WsReconnect: reconnecting... in ${this.autoReconnectInterval}ms`);
      this.open(this.url);
    }, this.autoReconnectInterval);
    this.emit('reconnect');
  }

  private onopen() {
    console.log('WsReconnect: open', this.url);
    this.emit('open');
  }

  private onmessage(data: string, flag: any, arg3: any, arg4: any, arg5: any, arg6: any) {
    this.emit('message', data, flag, arg3, arg4, arg5, arg6);
    this.heartBeat();
  }

  private onerror(e: any) {
    console.error('WsReconnect: error', this.url, arguments);
    this.emit('error', e);
  }

  private onclose(e: any) {
    console.log('WsReconnect: close', arguments);
    this.emit('close', e);
  }
}
