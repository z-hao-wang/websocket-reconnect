# Getting Started

This repo will create a websocket client that auto retry to reconnect to the sever
It will also cache the messages that failed to send and send after reconnect success.

Come with typescript support
```
npm i websocket-reconnect --save

import { WsReconnect } from '../src/WsReconnect';
const ws = new WsReconnect({ reconnectDelay: 5000 });
ws.open(`ws://${host}:${port}`);

ws.on('open', function open() {
    // this will only be called once, not on reconnect
});

ws.on('reconnect', function open() {
    // this will only be called on every reconnect attempt
});

ws.on('message', (data: string) => {
    const json = JSON.parse(data);
    console.log('======== received', json);
});

ws.on('close', () => {
    interval && clearInterval(interval);
});
```
Please refer the examples for more details

## Testing with examples
```
npm ci
npm run tsc
# run this in terminal #1
node dist/example/WsServer.js
# run this in terminal #2
node dist/example/WsClient.js
```

Then ctrl + c to exist terminal #1, watch the terminal #2 WsClient to auto reconnect, once WsServer is restarted, the WsClient can rebuild connect.