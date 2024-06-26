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
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FC, Fragment } from 'react';
import { useInfiniteWbOrders } from '../../features/wb-orders';
import { Waypoint } from 'react-waypoint';

const WbOrders: FC = () => {
  const {
    data: infWbOrdersResult,
    error: infWbOrdersError,
    isError: isInfWbOrdersError,
    fetchNextPage: fetchNextInfPage,
    hasNextPage: hasNextInfPage,
    isPending: isPendingInfinite,
    isFetching: isFetchingInfinite,
    isFetchingNextPage,
  } = useInfiniteWbOrders({ take: 4 });

  if (isInfWbOrdersError) {
    throw infWbOrdersError;
  }

  return (
    <>
      {isPendingInfinite ? (
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
                    <Skeleton height='65px' />
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
      ) : (
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
              {infWbOrdersResult.pages.map((group, i, arrGroup) => (
                <Fragment key={i}>
                  {group.wbOrders.edges.map(o => (
                    <Tr key={o.id}>
                      <Td isNumeric>{o.id}</Td>
                      <Td>{o.name}</Td>
                      <Td>{o.phone}</Td>
                      <Td>
                        <Image
                          width='130px'
                          src={`${
                            import.meta.env.VITE_API_URI
                          }/assets/qr-codes/${o.qrCode}`}
                          fallbackSrc='https://via.placeholder.com/133'
                          alt='qr-code'
                        />
                      </Td>
                      <Td isNumeric>{o.orderCode}</Td>
                      <Td>{o.wbPhone}</Td>
                      <Td>{o.status}</Td>
                      <Td>
                        <Tooltip
                          label={format(
                            new Date(o.createdAt),
                            'dd.MM.yyyy, HH:mm:ss',
                            {
                              locale: ru,
                            }
                          )}
                        >
                          {formatDistanceToNow(new Date(o.createdAt), {
                            addSuffix: true,
                            locale: ru,
                            includeSeconds: true,
                          })}
                        </Tooltip>
                      </Td>
                      <Td>
                        <Tooltip
                          label={format(
                            new Date(o.updatedAt),
                            'dd.MM.yyyy, HH:mm:ss',
                            {
                              locale: ru,
                            }
                          )}
                        >
                          {formatDistanceToNow(new Date(o.updatedAt), {
                            addSuffix: true,
                            locale: ru,
                            includeSeconds: true,
                          })}
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))}
                  {i === arrGroup.length - 1 && (
                    <Waypoint
                      onEnter={() =>
                        !isFetchingInfinite &&
                        hasNextInfPage &&
                        fetchNextInfPage()
                      }
                    />
                  )}
                </Fragment>
              ))}
            </Tbody>
          </Table>
          {isFetchingNextPage && (
            <Center>
              <Spinner />
            </Center>
          )}
        </TableContainer>
      )}
    </>
  );
};

export default WbOrders;
