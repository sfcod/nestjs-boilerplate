import { TestingModuleBuilder } from '@nestjs/testing/testing-module.builder';
import { NestApplicationContext } from '@nestjs/core';

export class TestBuilderContext extends TestingModuleBuilder {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    async compile(): Promise<NestApplicationContext> {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.applyLogger();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.scanner.scan(this.module);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.applyOverloadsMap();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.instanceLoader.createInstancesOfDependencies();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.scanner.applyApplicationProviders();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const root = this.getRootModule();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return new NestApplicationContext(this.container, [], root);
    }
}
