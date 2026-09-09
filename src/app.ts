import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(router);
app.use(errorHandler);

app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });
