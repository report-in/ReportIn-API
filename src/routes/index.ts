import { Application, Router } from 'express';
import { RouteRouter } from './route';
import { UserRouter } from './user.route';
import { ReportRouter } from './report.route';
import { AreaRouter } from './area.route';
import { CategoryRouter } from './category.route';
import { NotificationRouter } from './notification.route';

const _routes: Array<[string, Router]> = [
    ['/', RouteRouter],
    ['/user', UserRouter],
    ['/report', ReportRouter],
    ['/area', AreaRouter],
    ['/category', CategoryRouter],
    ['/notification', NotificationRouter],
];

export const routes = (app: Application) => {
    _routes.forEach((route) => {
        const [url, router] = route;
        app.use(url, router);
    });
};
