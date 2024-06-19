import { FC, memo } from 'react';
import 'react-phone-number-input/style.css';

import { ErrorMessage, FastField, FastFieldProps } from 'formik';

import {
  type InputProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import PhoneInputWithCountrySelect from 'react-phone-number-input';
import ru from 'react-phone-number-input/locale/ru.json';
import { E164Number } from 'libphonenumber-js/types.cjs';

type PhoneInputProps = {
  name: string;
  label: string;
} & InputProps;

const PhoneInput: FC<PhoneInputProps> = memo(({ name, label, onChange, value, ...props }) => {
  return (
    <FastField name={name}>
      {({
        field: { onChange, value, ...field },
        meta,
        form: { setFieldValue }
      }: FastFieldProps) => {
        const handleChange = (value: E164Number | undefined) => {
          setFieldValue(name, value || '');
        };

        return (
          <FormControl
            isRequired={props.isRequired}
            isInvalid={!!meta.error && meta.touched}
          >
            <FormLabel htmlFor={props.id || name}>{label}</FormLabel>
            <PhoneInputWithCountrySelect
              countries={['RU']}
              international
              labels={ru}
              countryCallingCodeEditable={false}
              defaultCountry={'RU'}
              value={value || ''}
              onChange={handleChange}
              id={props.id || name}
              inputComponent={Input}
              {...field}
              {...props}
            />
            <ErrorMessage name={name} component={FormErrorMessage} />
          </FormControl>
        );
      }}
    </FastField>
  );
});

export default PhoneInput;
