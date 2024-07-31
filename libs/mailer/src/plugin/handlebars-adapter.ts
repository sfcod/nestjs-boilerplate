// import { MailerOptions } from '@nestjs-modules/mailer';
// var Inky = require('inky').Inky;
import * as Inky from 'inky';
import { load } from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { get } from 'lodash';
import * as glob from 'glob';
import { MailerOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';
import { TemplateAdapter } from '@nestjs-modules/mailer/dist/interfaces/template-adapter.interface';
import * as inlineCss from 'inline-css';
import { Options } from 'inline-css';
import handlebars from 'handlebars';
import { HelperDeclareSpec } from 'handlebars';

export interface TemplateAdapterConfig {
    inlineCssOptions?: Options;
    inlineCssEnabled?: boolean;
    inkyOptions: any;
}

export class HandlebarsAdapter implements TemplateAdapter {
    private precompiledTemplates: {
        [name: string]: handlebars.TemplateDelegate;
    } = {};

    private config: TemplateAdapterConfig = {
        inlineCssOptions: { url: ' ', preserveMediaQueries: true },
        inlineCssEnabled: true,
        inkyOptions: {},
    };

    constructor(helpers?: HelperDeclareSpec, config?: TemplateAdapterConfig) {
        handlebars.registerHelper('concat', (...args) => {
            args.pop();
            return args.join('');
        });
        handlebars.registerHelper(helpers || {});
        Object.assign(this.config, config);
    }

    compile(mail: any, callback: any, mailerOptions: MailerOptions) {
        const precompile = (template: any, callback: any, options: any, name?: string) => {
            const templateExt = path.extname(template) || '.hbs';
            const templateName = name || path.basename(template, path.extname(template));
            const templateDir = get(options, 'dir', '');
            const templatePath = path.join(templateDir, templateName + templateExt);

            if (!this.precompiledTemplates[templateName]) {
                try {
                    const template = fs.readFileSync(templatePath, 'utf8');

                    this.precompiledTemplates[templateName] = handlebars.compile(template, get(options, 'options', {}));
                } catch (err) {
                    return callback(err);
                }
            }

            return {
                templateExt,
                templateName,
                templateDir,
                templatePath,
            };
        };

        const { templateName } = precompile(mail.data.template, callback, mailerOptions.template);

        const runtimeOptions = get(mailerOptions, 'options', {
            partials: false,
            data: {},
        });

        if (runtimeOptions.partials) {
            const files = glob.sync(path.join(runtimeOptions.partials.dir, '/**/*.hbs'));

            files.forEach((file) => {
                const ext = path.extname(file);
                const templateName = path
                    .relative(runtimeOptions.partials.dir, file)
                    .slice(0, -ext.length)
                    .replace(/[ -]/g, '_')
                    .replace(/\\/g, '/');

                // eslint-disable-next-line @typescript-eslint/no-empty-function
                precompile(file, () => {}, runtimeOptions.partials, templateName);
            });
        }

        const rendered = this.precompiledTemplates[templateName](
            {
                // default values
                __template: 'default',
                __unsubscribe_email: '',
                __unsubscribe_hash: '',
                ...(mail.data.context || {}),
            },
            {
                ...runtimeOptions,
                partials: this.precompiledTemplates,
            },
        );

        const i = new Inky.Inky(this.config.inkyOptions);
        const html = load(rendered || '');
        const convertedHtml = i.releaseTheKraken(html);

        if (this.config.inlineCssEnabled) {
            inlineCss(convertedHtml, this.config.inlineCssOptions).then((html) => {
                mail.data.html = html;
                return callback();
            });
        } else {
            mail.data.html = convertedHtml;
            return callback();
        }
    }
}
