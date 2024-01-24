import {Schema} from './utils';

export function createComponentSchema() {}

type CustomSchemaType = 'object' | 'array';

type CustomSchema<Type extends CustomSchemaType = 'object'> = {
  name: string;
  type: Type;
  nullable?: boolean;
} & (Type extends 'object'
  ? {
      properties?: Record<string, Schema>;
    }
  : {
      items?: Schema;
    });

const y: CustomSchema<'array'> = {
  name: 'List',
  type: 'array',
  nullable: true,
};

class TypedEvent<T extends any[]> {
  public emit(...args: T): void {
    /* ... */
  }
}
const eventHandler = new TypedEvent<[string, number]>();
eventHandler.emit('1', 1);

function doInfinite<T extends CustomSchemaType = 'object'>(
  ...args: CustomSchema<T>[]
) {
  return args;
}

const x = doInfinite(
  {
    name: '',
    type: 'array',
  },
  {
    name: '',
    type: 'object',
    properties: {
      fds: {
        type: 'integer',
        format: 'binary',
      },
    },
  },
);
