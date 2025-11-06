import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import authRouter from './routes/authRouter';
import blogRouter from './routes/blogRouter';
import morgan from 'morgan';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRouter);
app.use('/api/blogs', blogRouter);

export default app;
