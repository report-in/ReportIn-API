import { Application, Router } from 'express';
import { RouteRouter } from './route';
import { UserRouter } from './user.route';
import { AreaRouter } from './area.route';

const _routes: Array<[string, Router]> = [
    ['/', RouteRouter],
    ['/user', UserRouter],
    ['/area', AreaRouter],
];

export const routes = (app: Application) => {
    _routes.forEach((route) => {
        const [url, router] = route;
        app.use(url, router);
    });
};
