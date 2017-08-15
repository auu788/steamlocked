import express from 'express';
import router from './router';

const app = express();

app.use(router);

const server = app.listen(3000, () => {
    const { address, port } = server.address();
    console.log('[SERVER API] Listening at http://${address}:${port}');
});