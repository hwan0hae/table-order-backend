import express, { Request, Response } from 'express';
import { body, checkSchema, Schema, validationResult } from 'express-validator';

export const UserRouter = express.Router();

const signUpCheck: Schema = {
    email: {
        exists: true,
    },
    password: {
        exists: true,
    },
};

UserRouter.post(
    '/signup',
    checkSchema(signUpCheck),
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send('ERROR');
            return;
        }
        console.log(req.body);
        res.send('OK');
    }
);
