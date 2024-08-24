import { type CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  documents: ['src/**/*.{tsx,ts}', '!src/gql/**/*'],
  ignoreNoDocuments: true, // for better DX with the watcher
  generates: {
    './src/gql/': {
      preset: 'client',
    },
  },
};

export default config;

