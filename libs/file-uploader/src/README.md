- Config
```json
{
  isGlobal: true,
  mapping: {
    media: {
      driver: 's3-media',
      prefix: '',
      directoryNamer: ScanDirectoryNaming,
      fileNamer: UniqueFileNamer,
      options: {
        signed: true,
        expiry: 86400,
      },
    },
  },
  entities: [Record],
  disks: [
    {
      driver: LocalFileSystemStorage,
      driverName: 'local',
      config: {
        root: join(appRoot, '/storage/'),
        host: `${process.env.CLIENT_API_URL}`,
      },
    },
    {
      driver: AmazonWebServicesS3Storage,
      driverName: 's3-media',
      config: {
        key: process.env.AWS_S3_AEMASS_KEY,
        secret: process.env.AWS_S3_AEMASS_SECRET,
        bucket: process.env.AWS_S3_AEMASS_BUCKET,
        region: process.env.AWS_S3_AEMASS_REGION,
        // endpoint: 's3-accelerate.amazonaws.com',
      },
    },
  ],
};
```

=Entity
```ts
@Entity({
    tableName: 'record',
})
@Exclude()
export class ScanBodyModel {
    @Expose()
    @ApiProperty()
    @PrimaryKey({ fieldName: 'id', type: BinaryHexUuid })
    readonly id = uuid4();
    
    @Property({ fieldName: 'file_path', type: 'string', length: 255, nullable: true })
    filePath!: string;

    @Property({ fieldName: 'data_set', type: 'string', length: 255, nullable: true })
    dataSet!: string;

    @UploadableField({
        fileNameProperty: 'dataSet',
        filePathProperty: 'filePath',
        mapping: 'media',
    })
    dataSetFile!: File;

    @Expose()
    @ApiProperty()
    @Property({
        onCreate: getCurrentTimestamp,
        columnType: 'timestamp',
        fieldName: 'created_at',
    })
    @IsString()
    createdAt: number | Date = getCurrentTimestamp();

    @Property({
        onUpdate: getCurrentTimestamp,
        columnType: 'timestamp',
        fieldName: 'updated_at',
    })
    @IsString()
    updatedAt: number | Date = getCurrentTimestamp();

    setDataSetFile(file?: File) {
        this.dataSetFile = file;
        if (file) {
            this.updatedAt = getCurrentTimestamp();
        }
    }

    @Expose({ name: 'dataSet' })
    @ApiProperty({ name: 'dataSet', type: 'string' })
    async getDataSet(): Promise<string> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fileHelper: FileHelper = Reflect.getMetadata(FILE_STORAGE_FILE_HELPER, this);

        return await fileHelper.getUrl(this as any, 'dataSetFile');
    }
}

```

= Upload Event Subscriber
```ts
@Injectable()
export class UploadRecordFileSubscriber {
    constructor(private readonly em: EntityManager) {}

    @OnEvent(`${UploadEvent.eventName}.scan`, { async: true, promisify: true })
    async handleUpload(event: UploadEvent) {
        // If record exists then update it.
        const record = new Record();

        record.setDataSetFile(event.file);

        await this.em.persistAndFlush(record);
    }
}
```

= Clear chunk trash. Keep in mind filestorage-chunk-storage store all chunks on the 
local disk. Make and run this command at least every week.

```ts
import { Command, Console } from 'nestjs-console';
import { ChunkManager } from '../service/chunk-manager';

@Console({
    command: 'file:uploader',
    description: 'A command to create users',
})
export class ClearChunkCommand {
    constructor(private readonly chunkManager: ChunkManager) {}

    @Command({
        command: 'clear-chunks',
        description: 'Clear old chunks',
    })
    async execute(): Promise<void> {
        await this.chunkManager.clear();
    }
}

```

Use dependencies: 
---------------
---------------

``` npm install @nestjs/common@10.3.0```

``` npm install @nestjs/core@10.3.0 ```

``` npm install @nestjs/platform-express@10.3.0 ```

``` npm install @nestjs/swagger@7.1.17 ```

``` npm install @nestjs/event-emitter@2.0.3 ```

``` npm install @slynova/flydrive@1.0.3 ```

``` npm install @aws-sdk/client-s3@3.572.0 ```

``` npm install @songkeys/nestjs-redis@10.0.0 ```

``` npm install class-transformer@0.3.0 ```

``` npm install class-validator@^0.11.0 ```

``` npm install del@^6.0.0 ```

``` npm install lodash@4.17.21 ```

``` npm install rxjs@7.8.1 ```


Configure package:
---------------
---------------

``` 
import { join } from 'path';
import { path as appRoot } from 'app-root-path';
import { S3ChunkStorage } from './service/s3-chunk-storage';
import { FilesystemChunkStorage } from './service/filesystem-chunk-storage';
import { DropzoneAdapter } from './service/adapters/dropzone-adapter';
import { FilesystemValidator } from './service/filesystem-validator';
import { FilesystemChunkValidator } from './service/filesystem-chunk-validator';

export const fileUploaderConfig = {
  isGlobal: false,
  multerTmpPath: join(appRoot, '/storage/tmp'),
  uploader: DropzoneAdapter,
  fileValidator: FilesystemValidator,
  chunkStorage: S3ChunkStorage, // or FilesystemChunkStorage
  chunkValidator: FilesystemChunkValidator,
  allowedMimetypes: {},
  maxSize: {},
  minSize: {},
  minChunkSize: {},
  maxChunkSize: {},
  allowedFormats: {}
};

```
