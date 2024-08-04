import { fetchEventSource } from '@microsoft/fetch-event-source';
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
        qrCodeFile
        orderCode
        wbPhone
        status
      }
    }
  `);

  useEffect(() => {
    const subscriptionQuery = print(NewWbOrderSubscriptionDocument);
    const url = new URL(`${import.meta.env.VITE_GRAPHQL_URI}`);
    let ctrl: AbortController | null = null;

    const startEventSource = async () => {
      ctrl = new AbortController();

      await fetchEventSource(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        openWhenHidden: true,
        credentials: 'include',
        body: JSON.stringify({
          query: subscriptionQuery,
        }),
        signal: ctrl.signal,
        onmessage(event) {
          if (event.event === 'next') {
            const data = JSON.parse(event.data) as { data: NewWbOrderSubscriptionSubscription };
            if (data.data && data.data.newWbOrder) {
              setNewOrder(data.data.newWbOrder);
            }
          }
        },
        onerror(err: any) {
          console.error({ err });
          setError(new Error('SSE connection error'));
          // The library will automatically retry on most errors
        },
      });
    };

    startEventSource();

    return () => {
      ctrl?.abort();
    };
  }, []);

  return { newOrder, error };
};
