import {
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';

const suspenseFallbackMap = new Map([
  [
    'admin/wb-orders',
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
    </TableContainer>,
  ],
]);

export default suspenseFallbackMap;
