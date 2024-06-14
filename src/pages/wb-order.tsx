import { Center, Container, Button, Heading } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { FC } from 'react';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import FileInput from '../components/file-input';
import PhoneInput from '../components/phone-input';
import TextInput from '../components/text-input';
import { ConsoleLog } from '../utils/debug/console-log';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import CodeInput from '../components/code-input';

const MAX_FILE_SIZE = 5_000_000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const Schema = z.object({
  FLP: z
    .string({ required_error: 'ФИО обязательно к заполнению!' })
    .refine(value => {
      const parts = value.trim().split(/\s+/);
      const namePattern = /^[a-zа-я]+$/i;
      return parts.length === 3 && parts.every(part => namePattern.test(part));
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
    .string()
    .optional()
    .refine(value => {
      return value === undefined || value.length === 5;
    }, 'Код не заполнен!'),
  QR: z
    .array(z.custom<File>())
    .nullable()
    .refine(files => {
      return files === null || files.every(file => file.size <= MAX_FILE_SIZE);
    }, `Максимальный размер файла не должен превышать 5 мегабайт.`)
    .refine(
      files =>
        files === null ||
        files.every(file => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      '.jpg, .jpeg, .png, .webp расширения файла необходимо прикреплять!'
    ),
});

type HandleSubmitProps = (
  values: InitialValues,
  formikHelpers: FormikHelpers<InitialValues>
) => void | Promise<any>;

type InitialValues = z.infer<typeof Schema>;

const WbOrder: FC = () => {
  const initialValues: InitialValues = {
    phone: '',
    wbPhone: '',
    FLP: '',
    orderCode: '',
    QR: null,
  };

  const handleSubmit: HandleSubmitProps = (values, actions) => {
    ConsoleLog({ values });
    const capitalizeFirstLetter = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const unformattedFLP = values.FLP.split(/\s+/);
    const FLP = unformattedFLP.map(capitalizeFirstLetter).join(' ').trim();
    const QR = values.QR?.[0] ?? null as File | null;
    const orderCode = values.orderCode;
    const phone = values.phone;
    const wbPhone = values.wbPhone;

    const payload = {
      FLP,
      QR,
      orderCode,
      phone,
    };

    ConsoleLog({ payload });

    actions.setSubmitting(false);
    actions.resetForm();
  };

  return (
    <Center flex='1'>
      <Container maxW={'600px'} flex='1'>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={toFormikValidationSchema(Schema)}
        >
          {({ isSubmitting }) => {
            return (
              <Form>
                <TextInput
                  placeholder={'Иванов Иван Иванович'}
                  label='ФИО'
                  name='FLP'
                />
                <PhoneInput
                  label='Телефон'
                  name='phone'
                  placeholder='Ваш телефон'
                />

                <Center mt={5} mb={1}>
                  <Heading size='sm'>Если мобильное приложение Wb</Heading>
                </Center>
                <FileInput
                  placeholder={'Прикрепите фотографию'}
                  label='QR-код для получения заказа'
                  accept='.png,.jpg,.jpeg,.webp'
                  name='QR'
                />

                <Center mt={5} mb={1}>
                  <Heading size='sm'>Если Wb с компьютера</Heading>
                </Center>
                <CodeInput
                  name='orderCode'
                  label={'Код для получения заказа'}
                />
                <PhoneInput
                  label='Телефон Wb'
                  name='wbPhone'
                  placeholder='Ваш Wb телефон'
                />

                <Button
                  type='submit'
                  isLoading={isSubmitting}
                  mt='4'
                  spinnerPlacement='end'
                  loadingText='Проверка'
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
