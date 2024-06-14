import React, { FC, memo, useRef, useState } from 'react';

import { ErrorMessage, FastField, FastFieldProps } from 'formik';

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  Icon,
} from '@chakra-ui/react';
import { ConsoleLog } from '../utils/debug/console-log';
import { HiOutlinePaperClip } from 'react-icons/hi';

type FileInputProps = {
  label: string;
  name: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  accept?: string;
  multipleFiles?: boolean;
  id?: string;
} & InputProps;

const MAX_FILE_NAME_LENGTH = 20;

const FileInput: FC<FileInputProps> = memo(
  ({ label, name, accept, multipleFiles = false, ...props }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
      <FastField name={name}>
        {({
          field: { value },
          meta,
          form: { setFieldValue },
        }: FastFieldProps) => {
          const fileName = value?.length
            ? (value as File[])
                .map(({ name }) => getShortFileName(name, MAX_FILE_NAME_LENGTH))
                .join(' & ')
            : '';

          const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const fileList = Array.from(e.currentTarget.files || []);
            setFieldValue(name, fileList);
            clearInnerInput();
          };

          const clearInnerInput = () => {
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          };

          const handleInputClick = () => {
            if (inputRef.current) {
              inputRef.current.value = '';
              inputRef.current.click();
            }
          };

          return (
            <FormControl
              isRequired={props.isRequired}
              isInvalid={!!meta.error && meta.touched}
            >
              <FormLabel id={props.id || name} htmlFor={props.id || name}>
                {label}
              </FormLabel>
              <InputGroup>
                <input
                  type='file'
                  name={name}
                  accept={accept}
                  style={{ display: 'none' }}
                  multiple={multipleFiles}
                  onChange={handleFileChange}
                  ref={inputRef}
                />
                <Input
                  placeholder={props.placeholder}
                  cursor={'pointer'}
                  {...{
                    ...props,
                    readOnly: true,
                    isReadOnly: true,
                    value: fileName,
                    onClick: handleInputClick,
                  }}
                />
                <InputRightElement>
                  <Icon as={HiOutlinePaperClip} boxSize={5} />
                </InputRightElement>
              </InputGroup>
              <ErrorMessage name={name} component={FormErrorMessage} />
            </FormControl>
          );
        }}
      </FastField>
    );
  }
);

const getShortFileName = (fileName: string, maxLength: number) => {
  const lastDotIndex = fileName.lastIndexOf('.');
  const extension = fileName.slice(fileName.lastIndexOf('.'));
  const name = fileName.slice(0, fileName.lastIndexOf('.'));
  const totalLength = name.length + extension.length + 1;

  if (totalLength <= maxLength) {
    return fileName;
  }

  const maxNameLength = maxLength - extension.length - 6;
  const truncatedName = name.slice(0, maxNameLength);
  const endPart = name.slice(lastDotIndex - 6, lastDotIndex);
  return `${truncatedName}...${endPart}${extension}`;
};

export default FileInput;
