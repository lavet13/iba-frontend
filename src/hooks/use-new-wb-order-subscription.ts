import { print } from 'graphql';
import { useEffect, useState } from 'react';
import { graphql } from '../gql';
import {
  NewWbOrderSubscriptionSubscription,
  NewWbOrderSubscriptionDocument,
} from '../gql/graphql';

export const useNewWbOrderSubscription = () => {
  const [newOrder, setNewOrder] = useState<NewWbOrderSubscriptionSubscription['newWbOrder']>();
  const [error, setError] = useState<Error | null>(null);

  graphql(`
    subscription NewWbOrderSubscription {
      newWbOrder {
        id
        name
        phone
        qrCode
        orderCode
        wbPhone
        status
      }
    }
  `);

  useEffect(() => {
    const subscriptionQuery = print(NewWbOrderSubscriptionDocument);
    const url = new URL(`${import.meta.env.VITE_GRAPHQL_URI}`);
    url.searchParams.append('query', subscriptionQuery);

    const eventSource = new EventSource(url);

    eventSource.addEventListener('next', (event) => {
      const data = JSON.parse(event.data) as { data: NewWbOrderSubscriptionSubscription};
      if(data.data && data.data.newWbOrder) {
        setNewOrder(data.data.newWbOrder);
      }
    });

    eventSource.addEventListener('error', e => {
      console.error('SSE error: ', e);
      setError(new Error('SSE connection error'));
      eventSource.close();
    });

    eventSource.addEventListener('complete', () => {
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  return { newOrder, error };
};
