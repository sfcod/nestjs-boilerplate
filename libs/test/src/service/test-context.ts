import { MetadataScanner } from '@nestjs/core';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { TestBuilderContext } from './test-builder-context';

export class TestContext {
    static createTestingContext(metadata: ModuleMetadata): TestBuilderContext {
        return new TestBuilderContext(new MetadataScanner(), metadata);
    }
}
