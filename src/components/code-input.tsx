import { FC, memo } from 'react';

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  PinInput,
  PinInputField,
  PinInputProps,
} from '@chakra-ui/react';

import { ErrorMessage, FastField, FastFieldProps } from 'formik';

type PinProps = Omit<PinInputProps, 'children'>;

type CodeInputProps = { name: string; label: string } & PinProps;

const CodeInput: FC<CodeInputProps> = memo(({ name, label, ...props }) => {
  return (
    <FastField name={name}>
      {({
        field: { onChange, value, ...field },
        meta,
        form: { setFieldValue },
      }: FastFieldProps) => {
        console.log({ value });
        const handleChange = (value: string) => {
          setFieldValue(name, value ?? '');
        };

        return (
          <FormControl isInvalid={!!meta.error && meta.touched}>
            <FormLabel htmlFor={props.id || name}>{label}</FormLabel>
            <HStack>
              <PinInput
                id={props.id || name}
                size={['sm', 'md', 'lg']}
                onChange={handleChange}
                value={value ?? ''}
                {...props}
                {...field}
              >
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>
            <ErrorMessage name={name} component={FormErrorMessage} />
          </FormControl>
        );
      }}
    </FastField>
  );
});

export default CodeInput;
