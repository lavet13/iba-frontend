import {
  Center,
  Flex,
  Icon,
  Heading,
  Image,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FC, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWbOrders } from '../../features/wb-orders';
import { parseIntSafe } from '../../utils/helpers/parse-int-safe';

const WbOrders: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const before = searchParams.get('before') ?? null;
  const after = searchParams.get('after') ?? null;

  const {
    data: wbOrdersResult,
    error,
    isPending,
    refetch: refetchWbOrders,
  } = useWbOrders(
    { take: 2, after: parseIntSafe(after!), before: parseIntSafe(before!) },
    {
      meta: {
        toastEnabled: false,
      },
    }
  );
  console.log({ wbOrdersResult });

  useEffect(() => {
    if (wbOrdersResult?.wbOrders.edges.length === 0) {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());

        query.delete('after');
        query.delete('before');

        return query;
      });
    }
  }, [wbOrdersResult]);

  const fetchNextPage = () => {
    if (wbOrdersResult?.wbOrders.pageInfo.hasNextPage) {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());

        query.set('after', `${wbOrdersResult.wbOrders.pageInfo.endCursor}`);
        query.delete('before');

        return query;
      });
    }
  };

  const fetchPreviousPage = () => {
    if (wbOrdersResult?.wbOrders.pageInfo.hasPreviousPage) {
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());

        query.set('before', `${wbOrdersResult.wbOrders.pageInfo.startCursor}`);
        query.delete('after');

        return query;
      });
    }
  };

  if (error) {
    throw error;
  }

  return (
    <>
      {isPending ? (
        <TableContainer>
          <Table variant='simple' size='sm'>
            <Thead>
              <Tr>
                <Th isNumeric>Номер заявки</Th>
                <Th>ФИО</Th>
                <Th>Телефон</Th>
                <Th>QR-код</Th>
                <Th isNumeric>Код заказа</Th>
                <Th>Телефон Wb</Th>
                <Th>Статус</Th>
                <Th isNumeric>Создано</Th>
                <Th isNumeric>Обновлено</Th>
              </Tr>
            </Thead>

            <Tbody>
              {Array.from({ length: 30 }).map((_, i) => (
                <Tr key={i}>
                  <Td isNumeric>
                    <Skeleton height='20px' />
                  </Td>
                  <Td>
                    <Skeleton height='20px' />
                  </Td>
                  <Td>
                    <Skeleton height='20px' />
                  </Td>
                  <Td>
                    <Skeleton height='20px' />
                  </Td>
                  <Td isNumeric>
                    <Skeleton height='20px' />
                  </Td>
                  <Td>
                    <Skeleton height='20px' />
                  </Td>
                  <Td>
                    <Skeleton height='20px' />
                  </Td>
                  <Td isNumeric>
                    <Skeleton height='20px' />
                  </Td>
                  <Td isNumeric>
                    <Skeleton height='20px' />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : wbOrdersResult.wbOrders.edges.length !== 0 ? (
        <TableContainer>
          <Table variant='simple' size='sm'>
            <Thead>
              <Tr>
                <Th isNumeric>Номер заявки</Th>
                <Th>ФИО</Th>
                <Th>Телефон</Th>
                <Th>QR-код</Th>
                <Th isNumeric>Код заказа</Th>
                <Th>Телефон Wb</Th>
                <Th>Статус</Th>
                <Th>Создано</Th>
                <Th>Обновлено</Th>
              </Tr>
            </Thead>

            <Tbody>
              {wbOrdersResult.wbOrders.edges.map(o => (
                <Tr key={o.id}>
                  <Td isNumeric>{o.id}</Td>
                  <Td>{o.name}</Td>
                  <Td>{o.phone}</Td>
                  <Td>
                    <Image
                      width='130px'
                      src={`${import.meta.env.VITE_API_URI}/assets/qr-codes/${
                        o.qrCode
                      }`}
                      fallbackSrc='https://via.placeholder.com/133'
                      alt='qr-code'
                    />
                  </Td>
                  <Td isNumeric>{o.orderCode}</Td>
                  <Td>{o.wbPhone}</Td>
                  <Td>{o.status}</Td>
                  <Td>
                    {formatDistanceToNow(new Date(o.createdAt), {
                      addSuffix: true,
                      locale: ru,
                      includeSeconds: true,
                    })}
                  </Td>
                  <Td>
                    {formatDistanceToNow(new Date(o.updatedAt), {
                      addSuffix: true,
                      locale: ru,
                      includeSeconds: true,
                    })}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Center>
          <Heading>Нет данных :(</Heading>
        </Center>
      )}
    </>
  );
};

export default WbOrders;
