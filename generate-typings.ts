import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const libs = ['corporate-accounts'];

const definitionsFactory = new GraphQLDefinitionsFactory();
libs.forEach(lib => {
  generateTypings(lib);
});

function generateTypings(lib: string) {
  definitionsFactory.generate({
    typePaths: [`./libs/ffdc-apis/${lib}/**/*.graphql`],
    path: join(process.cwd(), `libs/ffdc-apis/${lib}/src/interfaces/graphql.interface.ts`),
    watch: true,
  });
}
