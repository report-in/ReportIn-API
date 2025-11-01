import { Application, Router } from 'express';
import { RouteRouter } from './route';
import { UserRouter } from './user.route';
import { ReportRouter } from './report.route';
import { AreaRouter } from './area.route';
import { CategoryRouter } from './category.route';
import { NotificationRouter } from './notification.route';
import { PersonRouter } from './person.route';
import { LeaderboardRouter } from './leaderboard.route';
import { CampusRouter } from './campus.route';
import { TechnicianPreferenceRouter } from './technician-preference.route';
import { FacilityItemRouter } from './facility-item.route';

const _routes: Array<[string, Router]> = [
    ['/', RouteRouter],
    ['/user', UserRouter],
    ['/person', PersonRouter],
    ['/leaderboard', LeaderboardRouter],
    ['/report', ReportRouter],
    ['/area', AreaRouter],
    ['/facility-item', FacilityItemRouter],
    ['/campus', CampusRouter],
    ['/category', CategoryRouter],
    ['/notification', NotificationRouter],
    ['/technician-preference', TechnicianPreferenceRouter],
];

export const routes = (app: Application) => {
    _routes.forEach((route) => {
        const [url, router] = route;
        app.use(url, router);
    });
};
