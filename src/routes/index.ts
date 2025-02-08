import { Application, Router } from 'express';
import { RouteRouter } from './route';

const _routes: Array<[string, Router]> = [
    ['/', RouteRouter],
];

export const routes = (app: Application) => {
    _routes.forEach((route) => {
        const [url, router] = route;
        app.use(url, router);
    });
};
