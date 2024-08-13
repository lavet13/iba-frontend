import { FC, memo } from 'react';

import { ErrorMessage, FastField, FastFieldProps } from 'formik';

import {
  FormErrorMessage,
  FormControl,
  FormLabel,
  Box,
  Spinner,
  Flex,
  ResponsiveValue,
} from '@chakra-ui/react';

import { Select as ChakraSelect } from 'chakra-react-select';

import type {
  ChakraStylesConfig,
  Props as ChakraSelectProps,
} from 'chakra-react-select';

export type SelectProps = {
  name: string;
  label?: string;
  labelSize?: ResponsiveValue<string>;
  placeholder?: string;
  isRequired?: boolean;
  id?: string;
  data?: any[];
  isGroup?: boolean;
  isLoading?: boolean;
} & Partial<ChakraSelectProps>;

const Select: FC<SelectProps> = memo(
  ({ name, label, labelSize, data, isGroup = false, isLoading, ...props }) => {
    // field { name, value, onChange, onBlur }
    // meta { value, error, touched, initialValue, initialError, initialTouched }
    // helpers { setValue, setTouched, setError }

    return (
      <FastField
        name={name}
        {...(isLoading ? { isLoading } : {})}
        {...(label ? { label } : {})}
      >
        {({
          field: { onChange, ...field },
          meta,
          form: { setFieldValue },
        }: FastFieldProps) => {
          const handleChange = (option: any) => {
            if (props.isMulti) {
              const options = option.map((o: any) => o.value);
              return setFieldValue(name, options);
            }
            setFieldValue(name, option.value);
          };

          const handleGroupSelection = (value: any) => {
            if (props.isMulti) {
              // TODO: make similar selection as handleSelection
            }

            if (value === '') {
              return { label: props.placeholder || '', value: '' };
            }

            const options = data?.reduce(
              (acc, { options }) => [...acc, ...options],
              []
            );

            const selectedOption = options?.find(
              (option: any) => option.value === field.value
            );

            return selectedOption;
          };

          const handleSelection = (value: any) => {
            if (props.isMulti) {
              if (Array.isArray(value) && value.length === 0) {
                return [];
              }

              const selectedOptions = data?.map(
                (option: any) => value.includes(option.value) ? option : null
              ).filter(Boolean);

              return selectedOptions;
            }

            if (value === '') {
              return { label: props.placeholder || '', value: '' };
            }

            const selectedOption = data?.find(
              (option: any) => option.value === field.value
            );

            return selectedOption;
          };

          const chakraStyles: ChakraStylesConfig = {
            control: provided => ({
              ...provided,
              alignSelf: 'end',
            }),
            dropdownIndicator: (provided, { selectProps }) => ({
              ...provided,
              '> svg': {
                transform: `rotate(${selectProps.menuIsOpen ? -180 : 0}deg)`,
              },
            }),
          };

          return (
            <FormControl
              isRequired={props.isRequired}
              isInvalid={!!meta.error && meta.touched}
              display='flex'
              flexDirection='column'
              justifyContent='space-between'
            >
              {label && (
                <FormLabel fontSize={labelSize} htmlFor={props.id || name}>{label}</FormLabel>
              )}

              <ChakraSelect
                {...field}
                size={['sm', 'sm', 'md']}
                isLoading={isLoading}
                id={props.id || name}
                value={
                  isGroup
                    ? handleGroupSelection(field.value)
                    : handleSelection(field.value)
                }
                onChange={handleChange}
                loadingMessage={() => (
                  <Flex justify='center' gap={2}>
                    <Spinner />
                  </Flex>
                )}
                selectedOptionStyle={'check'}
                noOptionsMessage={() => <Box>Нет данных</Box>}
                options={data}
                chakraStyles={chakraStyles}
                {...props}
              />
              <ErrorMessage name={name} component={FormErrorMessage} />
            </FormControl>
          );
        }}
      </FastField>
    );
  }
);

export default Select;
