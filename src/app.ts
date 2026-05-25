import express, { Application } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { schema, rootResolvers } from './graphql/schema';

const app: Application = express();

app.use(express.json());

// GraphQL route with full playground configured
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: rootResolvers,
  graphiql: true
}));

export default app;
