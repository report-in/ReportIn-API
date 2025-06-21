import { Application, Router } from 'express';
import { RouteRouter } from './route';
import { UserRouter } from './user.route';
import { CategoryRouter } from './category.route';

const _routes: Array<[string, Router]> = [
    ['/', RouteRouter],
    ['/user', UserRouter],
    ['/category', CategoryRouter]
];

export const routes = (app: Application) => {
    _routes.forEach((route) => {
        const [url, router] = route;
        app.use(url, router);
    });
};
