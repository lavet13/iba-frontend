import {
  Center,
  Container,
  Button,
  Heading,
  ToastId,
  useToast,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Alert,
  LinkBox,
  LinkOverlay,
  Image,
  Text,
} from '@chakra-ui/react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { FC, ReactNode, useRef, useState } from 'react';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import FileInput from '../components/file-input';
import PhoneInput from '../components/phone-input';
import TextInput from '../components/text-input';
import { ConsoleLog } from '../utils/debug/console-log';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import CodeInput from '../components/code-input';
import { MutationSaveWbOrderArgs } from '../gql/graphql';
import { useCreateWbOrder } from '../features/wb-order-by-id';
import { isGraphQLRequestError } from '../utils/graphql/is-graphql-request-error';
import { Persist } from '../components/persist-form';
import { useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE = 5_000_000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const WbOrder: FC = () => {
  const formRef = useRef<FormikProps<InitialValues>>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const toastIdRef = useRef<ToastId | null>(null);
  const [isReset, setIsReset] = useState(false);

  const Schema = z
    .object({
      FLP: z
        .string({ required_error: 'ФИО обязательно к заполнению!' })
        .refine(value => {
          const parts = value.trim().split(/\s+/);
          const namePattern = /^[a-zа-я]+$/i;
          return (
            parts.length === 3 && parts.every(part => namePattern.test(part))
          );
        }, 'Необходимо заполнить Имя, Фамилию и Отчество'),
      phone: z
        .string({ required_error: 'Телефон обязателен к заполнению!' })
        .refine(
          value => isPossiblePhoneNumber(value),
          'Проверьте пожалуйста еще раз! Телефон не заполнен до конца!'
        ),
      wbPhone: z
        .string({ required_error: 'Телефон обязателен к заполнению!' })
        .optional()
        .refine(
          value => value === undefined || isPossiblePhoneNumber(value),
          'Проверьте пожалуйста еще раз! Телефон не заполнен до конца!'
        ),
      orderCode: z
        .string({ required_error: 'Код заказа обязателен к заполнению!' })
        .optional()
        .refine(value => {
          return value === undefined || value.length === 5;
        }, 'Код не заполнен!'),
      QR: z
        .array(z.custom<File>())
        .nullable()
        .optional()
        .refine(files => {
          return (
            files === null || files?.every(file => file.size <= MAX_FILE_SIZE)
          );
        }, `Максимальный размер файла не должен превышать 5 мегабайт.`)
        .refine(
          files =>
            files === null ||
            files?.every(file => ACCEPTED_IMAGE_TYPES.includes(file.type)),
          '.jpg, .jpeg, .png, .webp расширения файла необходимо прикреплять!'
        ),
    })
    .refine(
      data => {
        const isWbFilled = !!data.wbPhone && !!data.orderCode;
        const isQRFilled = !!data.QR;

        return isWbFilled || isQRFilled;
      },
      {
        message:
          'Заполните либо (Телефон Wb и Код для получения заказа), либо прикрепите QR-код, либо все вместе',
        path: ['QR'],
      }
    );

  type HandleSubmitProps = (
    values: InitialValues,
    formikHelpers: FormikHelpers<InitialValues>
  ) => void | Promise<any>;

  type InitialValues = z.infer<typeof Schema>;
  const initialValues: InitialValues = {
    phone: '',
    wbPhone: '',
    FLP: '',
    orderCode: '',
    QR: null,
  };

  const { mutateAsync: createOrder, data } = useCreateWbOrder();

  const handleSubmit: HandleSubmitProps = async (values, actions) => {
    try {
      ConsoleLog({ values });
      const capitalizeFirstLetter = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      const unformattedFLP = values.FLP.split(/\s+/);
      const FLP = unformattedFLP.map(capitalizeFirstLetter).join(' ').trim();
      const phone = values.phone;

      // @ts-ignore
      const QR = values.QR?.[0] || (null as File | null);
      ConsoleLog({ QR });

      // @ts-ignore
      const orderCode = values.orderCode || null;
      // @ts-ignore
      const wbPhone = values.wbPhone || null;

      const payload: MutationSaveWbOrderArgs = {
        input: {
          FLP,
          QR,
          orderCode,
          wbPhone,
          phone,
        },
      };
      ConsoleLog({ payload });

      await createOrder({ ...payload });
      actions.resetForm();
      actions.setStatus('submitted');

      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
      }

      toastIdRef.current = toast({
        title: 'Wildberries',
        description: 'Заявка успешно оформлена!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setIsReset(true);
    } catch (error: unknown) {
      if (isGraphQLRequestError(error)) {
        if (toastIdRef.current) {
          toast.close(toastIdRef.current);
        }

        toastIdRef.current = toast({
          title: 'WildBerries',
          description: `${error.response.errors[0].message}`,
          status: 'error',
          isClosable: true,
        });
      } else if (error instanceof Error) {
        if (toastIdRef.current) {
          toast.close(toastIdRef.current);
        }

        toastIdRef.current = toast({
          title: 'WildBerries',
          description: `${error.message}`,
          status: 'error',
          isClosable: true,
        });
      }
      ConsoleLog({ error });
      actions.setStatus('error');
    } finally {
      actions.setSubmitting(false);
    }
  };

  let content: ReactNode | null = null;

  content = (
    <Center flex='1'>
      <Container maxW={'600px'} flex='1' py={[6, 8, 10]}>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={toFormikValidationSchema(Schema)}
          innerRef={formRef}
        >
          {({ isSubmitting }) => {
            ConsoleLog({ isSubmitting });

            return (
              <Form>
                <TextInput
                  placeholder={'Иванов Иван Иванович'}
                  label='ФИО'
                  name='FLP'
                  focusBorderColor='pink.400'
                  variant='filled'
                />
                <PhoneInput
                  label='Телефон'
                  name='phone'
                  placeholder='Ваш телефон'
                  focusBorderColor='pink.400'
                  variant='filled'
                />

                <Center mt={5} mb={1}>
                  <Heading size='sm'>Если мобильное приложение Wb</Heading>
                </Center>
                <FileInput
                  placeholder={'Прикрепите фотографию'}
                  label='QR-код для получения заказа'
                  accept='.png,.jpg,.jpeg,.webp'
                  name='QR'
                  focusBorderColor='pink.400'
                  variant='filled'
                />
                <Center mt={5} mb={1}>
                  <Heading size='sm'>Если Wb с компьютера</Heading>
                </Center>
                <CodeInput
                  name='orderCode'
                  label={'Код для получения заказа'}
                  focusBorderColor='pink.400'
                  variant='filled'
                />
                <PhoneInput
                  label='Телефон Wb'
                  name='wbPhone'
                  placeholder='Ваш Wb телефон'
                  focusBorderColor='pink.400'
                  variant='filled'
                />

                <Button
                  type='submit'
                  isLoading={isSubmitting}
                  mt='4'
                  spinnerPlacement='end'
                  loadingText='Отправка заявки'
                  colorScheme='pink'
                  variant='outline'
                  w='full'
                >
                  Оформить заявку
                </Button>

                <Persist name='wb-order' />
              </Form>
            );
          }}
        </Formik>
      </Container>
    </Center>
  );

  if (data && isReset) {
    content = (
      <Center flex='1'>
        <Container maxW={'600px'} flex='1'>
          <Alert
            status='success'
            variant='subtle'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            textAlign='center'
            maxW='container.lg'
            mx='auto'
            py='5'
          >
            <AlertIcon boxSize='40px' mr={0} />
            <AlertTitle mt={4} mb={1} fontSize='lg'>
              Подтверждено!
            </AlertTitle>
            <AlertDescription maxWidth='sm'>
              Заявка оформлена!
              <Text pt={2}>
                Ваш идентификатор заявки № {<b>{data.saveWbOrder.id}</b>}
                <br />
                Ваши введенные данные:
                <br />
                ФИО: <b>{data.saveWbOrder.name}</b>
                <br />
                Телефон: <b>{data.saveWbOrder.phone}</b>
                <br />
                {data.saveWbOrder.qrCode ? (
                  <>
                    {'QR-code:'}{' '}
                    <LinkBox>
                      <LinkOverlay
                        href={`${
                          import.meta.env.VITE_API_URI
                        }/assets/qr-codes/${data.saveWbOrder.qrCode}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Image
                          width='300px'
                          mx='auto'
                          src={`${
                            import.meta.env.VITE_API_URI
                          }/assets/qr-codes/${data.saveWbOrder.qrCode}`}
                          fallbackSrc='/images/no-preview.webp'
                          alt='qr-code'
                        />
                      </LinkOverlay>
                    </LinkBox>
                    <br />
                  </>
                ) : null}
                {data.saveWbOrder.orderCode ? (
                  <>
                    {'Код получения заказа: '}
                    {<b>{data.saveWbOrder.orderCode}</b>}
                    <br />
                  </>
                ) : null}
                {data.saveWbOrder.wbPhone ? (
                  <>
                    {'Телефон Wb: '}
                    {<b>{data.saveWbOrder.wbPhone}</b>}
                  </>
                ) : null}
              </Text>
            </AlertDescription>
            <Button
              mt={6}
              px={6}
              py={4}
              colorScheme='green'
              variant='outline'
              onClick={() => setIsReset(false)}
            >
              Оформить заявку
            </Button>
          </Alert>
        </Container>
      </Center>
    );
  }

  return content;
};

export default WbOrder;
