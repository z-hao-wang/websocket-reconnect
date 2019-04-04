import * as WebSocket from "ws";
const port = 9888;

export function createWsServer(optionsOverride: any = {}) {
  const clientTimout = 10000;
  const serverOptions: WebSocket.ServerOptions = {
    port,
  };
  const wss = new WebSocket.Server({ ...serverOptions, ...optionsOverride });

  wss.on('connection', function connection(ws, req) {
    console.log('new connection from', req.connection.remoteAddress);
    let lastPing: Date = new Date();
    ws.on('message', (message: string) => {
      const msgJson = JSON.parse(message);
      if (msgJson.type === 'ping') {
        ws.send(
          JSON.stringify({
            msg: 'pong',
            t: new Date(),
          }),
        );
        lastPing = new Date();
      } else {
        console.log('received: %s', message);
      }
    });

    ws.send(
      JSON.stringify({
        msg: 'connected',
      }),
    );

    const interval = setInterval(() => {
      if (new Date().getTime() - lastPing.getTime() > clientTimout) {
        ws.close();
        clearInterval(interval);
      }
    }, clientTimout);

    ws.on('close', () => {
      console.log('client closed');
      clearInterval(interval);
    });
    ws.on('error', e => {
      console.error(`error`, e);
    });
  });
  return wss;
}

createWsServer();