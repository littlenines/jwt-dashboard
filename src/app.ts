import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import router from './routes';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(express.json())

app.use(helmet());
app.use(router);
app.use(cookieParser());

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
