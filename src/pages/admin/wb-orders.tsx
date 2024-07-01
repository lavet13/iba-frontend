import {
  Center,
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
  Alert,
  AlertIcon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  Stack,
  StackDivider,
  Box,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
} from '@chakra-ui/react';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FC, Fragment, useEffect, useRef } from 'react';
import { useInfiniteWbOrders } from '../../features/wb-orders';
import { Waypoint } from 'react-waypoint';
import { MutationUpdateWbOrderArgs, OrderStatus } from '../../gql/graphql';
import { useSearchParams } from 'react-router-dom';
import { useWbOrderById, useUpdateWbOrder } from '../../features/wb-order-by-id';
import { Formik, Form, FormikHelpers, FormikProps } from 'formik';
import SelectWrapper from '../../components/select-wrapper';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { ConsoleLog } from '../../utils/debug/console-log';

type HandleSubmitProps = (
  values: InitialValues,
  formikHelpers: FormikHelpers<InitialValues>
) => void | Promise<any>;

const statusKeys = Object.values(OrderStatus);

export type StatusKey = (typeof statusKeys)[number];

const statusMapText: Record<StatusKey, string> = {
  ASSEMBLED: 'СОБРАН',
  NOT_ASSEMBLED: 'НЕСОБРАН',
  REJECTED: 'ОТКЛОНЕН',
};

const statusMap: Record<StatusKey, JSX.Element> = {
  NOT_ASSEMBLED: (
    <Alert status='warning' variant='solid'>
      <AlertIcon />
      НЕСОБРАН
    </Alert>
  ),
  ASSEMBLED: (
    <Alert status='success' variant='solid'>
      <AlertIcon />
      СОБРАН
    </Alert>
  ),
  REJECTED: (
    <Alert status='error' variant='solid'>
      <AlertIcon />
      ОТКЛОНЕН
    </Alert>
  ),
};

const statusValues = [
  OrderStatus.Assembled,
  OrderStatus.NotAssembled,
  OrderStatus.Rejected,
] as const;

const Schema = z.object({
  status: z.enum(statusValues, { required_error: 'Нужно выбрать статус!' }),
});

type FormSchema = Omit<z.infer<typeof Schema>, 'status'>;

type InitialValues = FormSchema & { status: StatusKey | '' };

const WbOrders: FC = () => {
  const formRef = useRef<FormikProps<InitialValues>>(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [searchParams, setSearchParams] = useSearchParams();
  const wbOrderIdToEdit = searchParams.get('edit')!;
  const {
    data: infWbOrdersResult,
    error: infWbOrdersError,
    isError: isInfWbOrdersError,
    fetchNextPage: fetchNextInfPage,
    hasNextPage: hasNextInfPage,
    isPending: isPendingInfinite,
    isFetching: isFetchingInfinite,
    isFetchingNextPage,
    refetch: refetchWbOrders
  } = useInfiniteWbOrders();

  const {
    data: wbOrderByIdResult,
    fetchStatus,
    status,
    refetch: refetchWbOrderById,
  } = useWbOrderById(wbOrderIdToEdit, {
    enabled: !!wbOrderIdToEdit,
  });

  const { mutateAsync: updateWbOrder } = useUpdateWbOrder();

  const initialValues: InitialValues = {
    status: wbOrderByIdResult?.wbOrderById?.status ?? '',
  };

  const handleEditOpen = (id: string) => () => {
    setSearchParams(params => {
      const query = new URLSearchParams(params.toString());

      query.set('edit', id);

      return query;
    });

    onEditOpen();
  };

  const handleEditClose = () => {
    if(formRef.current !== null) {
      formRef.current.dirty && refetchWbOrderById();
      onEditClose();
      setSearchParams(params => {
        const query = new URLSearchParams(params.toString());
        query.delete('edit');
        return query;
      });
    }
  };

  const handleSubmit: HandleSubmitProps = async (values, actions) => {
    ConsoleLog('submitted!');
    ConsoleLog({ values });

    // Check if the status is empty and handle accordingly
    if (!values.status) {
      // Handle the error or set a default status
      // For example, you might want to set a default status or show a validation error
      console.error('Status cannot be empty');
      actions.setSubmitting(false);
      return;
    }

    const payload: MutationUpdateWbOrderArgs = {
      input: {
        id: wbOrderIdToEdit,
        status: values.status,
      },
    };

    if(formRef.current !== null && formRef.current.dirty) {
      await updateWbOrder({ ...payload });
      refetchWbOrders();
    }

    actions.setSubmitting(false);
    handleEditClose();
  };

  useEffect(() => {
    if (wbOrderByIdResult?.wbOrderById && wbOrderIdToEdit) {
      onEditOpen();
    }
  }, [wbOrderByIdResult]);

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
                  {group.wbOrders.edges.length !== 0 ? (
                    group.wbOrders.edges.map(o => (
                      <Tr
                        transitionTimingFunction={'ease-in-out'}
                        transitionDuration={'fast'}
                        transitionProperty={'common'}
                        _dark={{ _hover: { background: 'gray.700' } }}
                        _hover={{ background: 'gray.100', cursor: 'pointer' }}
                        onClick={handleEditOpen(o.id)}
                        key={o.id}
                      >
                        <Td isNumeric>{o.id}</Td>
                        <Td>{o.name}</Td>
                        <Td>{o.phone}</Td>
                        <Td>
                          <Image
                            width='60px'
                            src={`${
                              import.meta.env.VITE_API_URI
                            }/assets/qr-codes/${o.qrCode}`}
                            fallbackSrc='/src/assets/images/no-preview.webp'
                            alt='qr-code'
                          />
                        </Td>
                        <Td isNumeric>{o.orderCode}</Td>
                        <Td>{o.wbPhone}</Td>
                        <Td>{statusMap[o.status]}</Td>
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
                    ))
                  ) : (
                    <Tr>
                      <Td borderBottom='none' textAlign='center' colSpan={999}>
                        Нет данных
                      </Td>
                    </Tr>
                  )}
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
              {isFetchingNextPage && Array.from({ length: 15 }).map((_, i) => (
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
      )}
      <Modal size='xl' isOpen={isEditOpen} onClose={handleEditClose}>
        <ModalOverlay />

        <ModalContent>
          <Stack divider={<StackDivider />}>
            <Box>
              <ModalHeader sx={{ display: 'flex', alignItems: 'center' }}>
                Редактирование{' '}
                {fetchStatus === 'fetching' && status === 'success' && (
                  <Spinner />
                )}
              </ModalHeader>
              <ModalCloseButton />
            </Box>
            <ModalBody pb={5}>
              {/* For initial loading */}
              {fetchStatus === 'fetching' && status === 'pending' ? (
                <Spinner />
              ) : (
                <Formik
                  initialValues={initialValues}
                  validationSchema={toFormikValidationSchema(Schema)}
                  enableReinitialize={true}
                  onSubmit={handleSubmit}
                  innerRef={formRef}
                >
                  {({ isSubmitting }) => {
                    return (
                      <Form>
                        <SelectWrapper
                          name='status'
                          label='Выберите статус'
                          placeholder='Выберите статус'
                          data={Object.entries(statusMapText).map(
                            ([value, label]) => ({
                              label,
                              value,
                            })
                          )}
                        />

                        <Button
                          w={['full', 'auto']}
                          isLoading={isSubmitting}
                          mt={4}
                          type='submit'
                        >
                          Подтвердить
                        </Button>
                      </Form>
                    );
                  }}
                </Formik>
              )}
            </ModalBody>
          </Stack>
        </ModalContent>
      </Modal>

    </>
  );
};

export default WbOrders;
