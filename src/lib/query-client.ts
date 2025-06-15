import { QueryCache, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
    mutations: {
      onError: (response) => {
        console.log('error', response);
      },
    },
  },
  queryCache: new QueryCache({
    onError: (response) => {
      console.log('error', response);
    },
  }),
});

export default queryClient;
