import { Controller, Get, Render } from '@nestjs/common';
import { JsonOutput } from '@libs/core';

@Controller()
export class AppController {
    @Get()
    @Render('index')
    async root() {
        return new JsonOutput({ message: 'API' });
    }
}
