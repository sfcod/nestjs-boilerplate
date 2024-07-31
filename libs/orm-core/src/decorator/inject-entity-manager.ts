import { Inject } from '@nestjs/common';

export const getConnectionServiceName = (connectionName) => `Connection${connectionName}`;

export const InjectEntityManager = (name?: string): ParameterDecorator => Inject(getConnectionServiceName(name));
