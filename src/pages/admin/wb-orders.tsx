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
  LinkBox,
  LinkOverlay,
  useClipboard,
  Text,
  Icon,
  Flex,
  FormControl,
  FormLabel,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FC, Fragment, useEffect, useRef } from 'react';
import { useInfiniteWbOrders } from '../../features/wb-orders';
import { Waypoint } from 'react-waypoint';
import { MutationUpdateWbOrderArgs, OrderStatus } from '../../gql/graphql';
import { useSearchParams } from 'react-router-dom';
import {
  useWbOrderById,
  useUpdateWbOrder,
} from '../../features/wb-order-by-id';
import { Formik, Form, FormikHelpers, FormikProps } from 'formik';
import SelectWrapper from '../../components/select-wrapper';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { ConsoleLog } from '../../utils/debug/console-log';
import TextInput from '../../components/text-input';
import { HiClipboard, HiClipboardCheck } from 'react-icons/hi';
import ClipboardInput from '../../components/clipboard-input';
import queryClient from '../../react-query/query-client';
import { useNewWbOrderSubscription } from '../../hooks/use-new-wb-order-subscription';
import useIsClient from '../../utils/ssr/use-is-client';

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

export const take = 30;

const WbOrders: FC = () => {
  const formRef = useRef<FormikProps<InitialValues>>(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const updatedOrderRef = useRef<HTMLTableRowElement | null>(null);
  const updatedOrderIdRef = useRef<string | number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const wbOrderIdToEdit = searchParams.get('edit')!;
  const wbOrderIdToEditRef = useRef<string | null>(null);
  if (wbOrderIdToEdit !== null) {
    wbOrderIdToEditRef.current = wbOrderIdToEdit;
  }
  const {
    data: infWbOrdersResult,
    error: infWbOrdersError,
    isError: isInfWbOrdersError,
    fetchNextPage: fetchNextInfPage,
    hasNextPage: hasNextInfPage,
    isPending: isPendingInfinite,
    isFetching: isFetchingInfinite,
    isFetchingNextPage,
    fetchStatus: fetchStatusInfinite,
    status: statusInfinite,
  } = useInfiniteWbOrders(take);

  const { newOrder, error } = useNewWbOrderSubscription();

  useEffect(() => {
    newOrder && queryClient.invalidateQueries({ queryKey: ['WbOrders'] });
  }, [newOrder]);

  const {
    data: wbOrderByIdResult,
    fetchStatus,
    status,
  } = useWbOrderById(wbOrderIdToEdit, {
    enabled: !!wbOrderIdToEdit,
  });

  const { mutate: updateWbOrder, variables } = useUpdateWbOrder();

  useEffect(() => {
    setTimeout(() => {
      if (updatedOrderIdRef.current == wbOrderIdToEditRef.current) {
        updatedOrderRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 1);
  }, [updatedOrderRef.current, wbOrderIdToEditRef.current]);

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
    if (formRef.current !== null) {
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
        name: wbOrderByIdResult?.wbOrderById?.name ?? '',
        phone: wbOrderByIdResult?.wbOrderById?.phone ?? '',
        qrCode: wbOrderByIdResult?.wbOrderById?.qrCode ?? null,
        wbPhone: wbOrderByIdResult?.wbOrderById?.wbPhone ?? null,
        createdAt: wbOrderByIdResult?.wbOrderById?.createdAt ?? 0,
        updatedAt: wbOrderByIdResult?.wbOrderById?.updatedAt ?? 0,
        orderCode: wbOrderByIdResult?.wbOrderById?.orderCode ?? null,
      },
    };

    updatedOrderIdRef.current = wbOrderIdToEdit;

    if (formRef.current !== null && formRef.current.dirty) {
      updateWbOrder({ ...payload });
    }

    actions.setSubmitting(false);
    handleEditClose();
  };

  useEffect(() => {
    if (wbOrderByIdResult?.wbOrderById) {
      onEditOpen();
    }
  }, [wbOrderByIdResult]);

  if (isInfWbOrdersError) {
    throw infWbOrdersError;
  }

  const bgUpdated = useColorModeValue('gray.200', 'gray.600');
  const bgAdded = useColorModeValue('teal.100', 'teal.800');

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
                    group.wbOrders.edges.map(o => {
                      const wbOrderPending =
                        fetchStatusInfinite === 'fetching' &&
                        statusInfinite === 'success' &&
                        variables?.input.id == o.id;

                      if (wbOrderPending) {
                        return (
                          <Tr key={o.id}>
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
                        );
                      }

                      return (
                        <Tr
                          key={o.id}
                          transitionTimingFunction={'ease-in-out'}
                          transitionDuration={'fast'}
                          transitionProperty={'common'}
                          {...(variables?.input.id == o.id
                            ? { bg: bgUpdated, ref: updatedOrderRef }
                            : {})}
                          {...(newOrder?.id === o.id ? { bg: bgAdded } : {})}
                          _dark={{ _hover: { background: 'gray.700' } }}
                          _hover={{ background: 'gray.100', cursor: 'pointer' }}
                        >
                          <Td onClick={handleEditOpen(o.id)} isNumeric>
                            {o.id}
                          </Td>
                          <Td onClick={handleEditOpen(o.id)}>{o.name}</Td>
                          <Td onClick={handleEditOpen(o.id)}>{o.phone}</Td>
                          <LinkBox as={Td}>
                            <LinkOverlay
                              href={`${
                                import.meta.env.VITE_API_URI
                              }/assets/qr-codes/${o.qrCode}`}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Image
                                width='60px'
                                src={`${
                                  import.meta.env.VITE_API_URI
                                }/assets/qr-codes/${o.qrCode}`}
                                fallbackSrc='/images/no-preview.webp'
                                alt='qr-code'
                              />
                            </LinkOverlay>
                          </LinkBox>
                          <Td onClick={handleEditOpen(o.id)} isNumeric>
                            {o.orderCode}
                          </Td>
                          <Td onClick={handleEditOpen(o.id)}>{o.wbPhone}</Td>
                          <Td onClick={handleEditOpen(o.id)}>
                            {statusMap[o.status]}
                          </Td>
                          <Td cursor={'auto'}>
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
                          <Td cursor={'auto'}>
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
                      );
                    })
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
              {isFetchingNextPage &&
                Array.from({ length: 15 }).map((_, i) => (
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
                Редактировать заявку{' '}
                {fetchStatus === 'fetching' && status === 'success' && (
                  <Spinner />
                )}
              </ModalHeader>
              <ModalCloseButton />
            </Box>
            <ModalBody pb={5}>
              {/* For initial loading */}
              {fetchStatus === 'fetching' && status === 'pending' ? (
                <Center>
                  <Spinner />
                </Center>
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
                        <ClipboardInput
                          label='ID'
                          value={wbOrderByIdResult?.wbOrderById?.id}
                        />
                        <ClipboardInput
                          label='ФИО'
                          value={wbOrderByIdResult?.wbOrderById?.name}
                        />
                        <ClipboardInput
                          label='Телефон'
                          value={wbOrderByIdResult?.wbOrderById?.phone}
                        />
                        {wbOrderByIdResult?.wbOrderById?.wbPhone && (
                          <ClipboardInput
                            label='Телефон WB'
                            value={wbOrderByIdResult?.wbOrderById?.wbPhone}
                          />
                        )}

                        {wbOrderByIdResult?.wbOrderById?.orderCode && (
                          <ClipboardInput
                            label='Код для получения заказа'
                            value={wbOrderByIdResult.wbOrderById.orderCode}
                          />
                        )}

                        {wbOrderByIdResult?.wbOrderById?.qrCode && (
                          <Button
                            as={Link}
                            size='lg'
                            variant='outline'
                            href={`${
                              import.meta.env.VITE_API_URI
                            }/assets/qr-codes/${
                              wbOrderByIdResult?.wbOrderById?.qrCode ?? ''
                            }`}
                            target='_blank'
                          >
                            Посмотреть QR
                          </Button>
                        )}

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
