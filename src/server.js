import express from 'express';
import router from './router';

const app = express();

app.use(router);

const server = app.listen(3030, () => {
    const { port } = server.address();
    console.log(`[SERVER API] Listening for requests at port ${port}`);
});