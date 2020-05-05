import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const libs = ['corporate-accounts'];

const definitionsFactory = new GraphQLDefinitionsFactory();
libs.forEach(lib => {
  generateTypings(lib);
});

function generateTypings(lib) {
  definitionsFactory.generate({
    typePaths: [`./libs/ffdc-apis/${lib}/**/*.graphql`],
    path: join(process.cwd(), `libs/ffdc-apis/${lib}/src/graphql.ts`),
    outputAs: 'class',
    watch: true,
  });
}
