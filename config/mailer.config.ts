import { join } from 'path';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { path as appRoot } from 'app-root-path';
import {
    adminPanelUrl,
    apiUrl,
    concat,
    inlineStyle,
    secondsToReadable,
    userPortalUrl,
    websiteUrl,
    increment,
    ifEqual,
    ifNotEqual,
    currency,
    unsubscribeUrl,
    partialExists,
    ifOr,
    ifAnd,
} from '../libs/mailer/src/helpers/hbs';
import { HandlebarsAdapter } from '../libs/mailer/src/plugin/handlebars-adapter';

const plugins = {
    inline_style: inlineStyle,
    api_url: apiUrl,
    concat: concat,
    ifEqual: ifEqual,
    ifNotEqual: ifNotEqual,
    ifOr: ifOr,
    ifAnd: ifAnd,
    seconds_to_readable: secondsToReadable,
    user_portal_url: userPortalUrl,
    admin_panel_url: adminPanelUrl,
    website_url: websiteUrl,
    increment: increment,
    currency: currency,
    unsubscribe_url: unsubscribeUrl,
    partial_exists: partialExists,
};

export default {
    transport: process.env.MAILER_TRANSPORT,
    defaults: {
        from: `"Project Name" <${process.env.MAILER_FROM}>`,
    },
    template: {
        dir: join(appRoot, 'templates/emails'),
        adapter: new HandlebarsAdapter(plugins),
        options: {
            strict: true,
        },
    },
    preview: ['development'].includes(process.env.NODE_ENV),
    options: {
        partials: {
            dir: join(appRoot, 'templates/partials'),
            options: {
                strict: true,
            },
        },
    },
};
