// A sample code, this file is not being used directly.
import { WsReconnect } from '../src/WsReconnect';
const host = 'localhost';
const port = 9888;

export function runClient() {
  const ws = new WsReconnect();
  ws.open(`ws://${host}:${port}`);

  let interval: any = null;

  ws.on('open', function open() {
    // auto ping.
    interval = setInterval(() => {
      ws.send(
        JSON.stringify({
          type: 'ping',
          t: new Date(),
        }),
      );
    }, 5000);
  });

  ws.on('message', (data: string) => {
    const json = JSON.parse(data);
    console.log('======== received', json);
  });

  ws.on('close', () => {
    interval && clearInterval(interval);
  });
  return ws;
}

runClient();