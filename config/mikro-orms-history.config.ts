import { OrmHistoryOptions } from '@libs/orm-history';
import { Clinic } from '@libs/orm';
import { Company } from '@libs/orm';
import { UserDoctor } from '@libs/orm';
import { UserPatient } from '@libs/orm';
import { Scan } from '@libs/orm';
import { ScanBodyRecord } from '@libs/orm';
import { ScanBodyModel } from '@libs/orm';
import { UserProvider } from '@libs/orm';
import { Exercise } from '@libs/orm';
import { ExerciseInstruction } from '@libs/orm';
import { ExerciseVideo } from '@libs/orm';
import { ScanBodySet } from '@libs/orm';
import { ScanRecordBackground } from '@libs/orm';
import { ScanRecordUpload } from '@libs/orm';
import { ScanModelUpload } from '@libs/orm';
import { UserSetting } from '@libs/orm';
import { ScanScore } from '@libs/orm';

const config: Omit<OrmHistoryOptions, 'storage' | 'user' | 'appName'> = {
    entities: [
        Clinic,
        Company,
        UserDoctor,
        UserPatient,
        UserSetting,
        Scan,
        ScanRecordUpload,
        ScanBodyRecord,
        ScanModelUpload,
        ScanBodyModel,
        ScanBodySet,
        ScanRecordBackground,
        UserProvider,
        Exercise,
        ExerciseInstruction,
        ExerciseVideo,
        ScanScore,
    ],
};

export default config;
