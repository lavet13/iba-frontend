import {
  Center,
  Container,
  Button,
  Heading,
  ToastId,
  useToast,
} from '@chakra-ui/react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { FC, useRef } from 'react';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import FileInput from '../components/file-input';
import PhoneInput from '../components/phone-input';
import TextInput from '../components/text-input';
import { ConsoleLog } from '../utils/debug/console-log';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import CodeInput from '../components/code-input';
import { isMobile } from 'react-device-detect';
import { MutationSaveWbOrderArgs } from '../gql/graphql';
import { useCreateWbOrder, useWbOrderById } from '../features/wb-order-by-id';
import { isGraphQLRequestError } from '../utils/graphql/is-graphql-request-error';
import useIsClient from '../utils/ssr/use-is-client';

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
  const toastIdRef = useRef<ToastId | null>(null);
  const { isClient, key } = useIsClient();
  const { data } = useWbOrderById('8');
  console.log({ data });

  const Schema = z.object({
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
  });

  const FinalSchema = !isMobile
    ? Schema.merge(
        z.object({
          wbPhone: z
            .string({ required_error: 'Телефон обязателен к заполнению!' })
            .refine(
              value => value === undefined || isPossiblePhoneNumber(value),
              'Проверьте пожалуйста еще раз! Телефон не заполнен до конца!'
            ),
          orderCode: z
            .string({ required_error: 'Код заказа обязателен к заполнению!' })
            .refine(value => {
              return value === undefined || value.length === 5;
            }, 'Код не заполнен!'),
        })
      )
    : Schema.merge(
        z.object({
          QR: z
            .array(z.custom<File>())
            .nullable()
            .refine(
              files => {
                return files?.every(file => file instanceof File);
              },
              {
                message: 'Файл не прикреплен!',
              }
            )
            .refine(files => {
              return files?.every(file => file.size <= MAX_FILE_SIZE);
            }, `Максимальный размер файла не должен превышать 5 мегабайт.`)
            .refine(
              files =>
                files?.every(file => ACCEPTED_IMAGE_TYPES.includes(file.type)),
              '.jpg, .jpeg, .png, .webp расширения файла необходимо прикреплять!'
            ),
        })
      );

  type HandleSubmitProps = (
    values: InitialValues,
    formikHelpers: FormikHelpers<InitialValues>
  ) => void | Promise<any>;

  type InitialValues = z.infer<typeof FinalSchema>;
  const initialValues: InitialValues = {
    phone: '',
    wbPhone: '',
    FLP: '',
    orderCode: '',
    QR: null,
  };

  const { mutateAsync: createOrder } = useCreateWbOrder();

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
      actions.setStatus('submitted');
      actions.resetForm();

      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
      }

      toastIdRef.current = toast({
        title: 'WildBerries',
        description: 'Заявка успешно оформлена. Ожидайте ответа!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
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

  return (
    <Center flex='1'>
      <Container maxW={'600px'} flex='1'>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={toFormikValidationSchema(FinalSchema as any)}
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
                />
                <PhoneInput
                  key={key}
                  label='Телефон'
                  name='phone'
                  placeholder='Ваш телефон'
                />

                {isClient && (
                  <>
                    {isMobile ? (
                      <>
                        <Center mt={5} mb={1}>
                          <Heading size='sm'>
                            Если мобильное приложение Wb
                          </Heading>
                        </Center>
                        <FileInput
                          placeholder={'Прикрепите фотографию'}
                          label='QR-код для получения заказа'
                          accept='.png,.jpg,.jpeg,.webp'
                          name='QR'
                        />
                      </>
                    ) : (
                      <>
                        <Center mt={5} mb={1}>
                          <Heading size='sm'>Если Wb с компьютера</Heading>
                        </Center>
                        <CodeInput
                          name='orderCode'
                          label={'Код для получения заказа'}
                        />
                        <PhoneInput
                          key={key}
                          label='Телефон Wb'
                          name='wbPhone'
                          placeholder='Ваш Wb телефон'
                        />
                      </>
                    )}
                  </>
                )}

                <Button
                  type='submit'
                  isLoading={isSubmitting}
                  mt='4'
                  spinnerPlacement='end'
                  loadingText='Отправка заявки'
                  width={['100%', 'auto']}
                >
                  Оформить заявку
                </Button>
              </Form>
            );
          }}
        </Formik>
      </Container>
    </Center>
  );
};

export default WbOrder;
