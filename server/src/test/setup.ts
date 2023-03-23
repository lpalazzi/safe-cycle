import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config({ path: './src/test/test.env' });
import joi from '../loaders/joi';
joi();
