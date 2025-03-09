import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:1337/graphql', // Asegúrate de que el endpoint de Strapi GraphQL esté activo
  cache: new InMemoryCache(),
});

export default client;
