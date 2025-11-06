import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/database';

dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Promise output
connectDB().catch((error) => {
    console.log(error);
});