import { Application, Router } from 'express';
import { RouteRouter } from './route';
import { UserRouter } from './user.route';

const _routes: Array<[string, Router]> = [
    ['/', RouteRouter],
    ['/user', UserRouter],
];

export const routes = (app: Application) => {
    _routes.forEach((route) => {
        const [url, router] = route;
        app.use(url, router);
    });
};
