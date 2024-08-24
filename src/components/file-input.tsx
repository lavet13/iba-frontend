import React, { FC, memo, useRef, useEffect, useState } from 'react';

import {
  ErrorMessage,
  FastField,
  FastFieldProps,
  useFormikContext,
} from 'formik';

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  Icon,
  Flex,
  Image,
  Box,
  IconButton,
  DarkMode,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { HiOutlinePaperClip } from 'react-icons/hi';
import isEqual from 'react-fast-compare';

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
    const [imagesURI, setImagesURI] = useState<(string | ArrayBuffer | null)[]>(
      []
    );
    const previousURI = useRef(imagesURI);
    const formControlRef = useRef<HTMLDivElement | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const formik = useFormikContext<any>();
    const value = formik.values?.[name];

    useEffect(() => {
      const isFileExist =
        value?.[0] && typeof value[0] === 'object' && 'name' in value[0];

      if (!isFileExist) {
        formik.setFieldValue(name, null);
      }

      if (formControlRef.current) {
        formControlRef.current.role = '';
      }
    }, [value]);

    return (
      <FastField
        name={name}
        {...(isEqual(imagesURI, previousURI.current) ? { imagesURI } : {})}
      >
        {({
          field: { value },
          meta,
          form: { setFieldValue },
        }: FastFieldProps) => {
          if (!isEqual(imagesURI, previousURI.current)) {
            previousURI.current = imagesURI;
          }

          const fileName = value?.length
            ? (value as File[])
                .map(({ name }) => getShortFileName(name, MAX_FILE_NAME_LENGTH))
                .join(' & ')
            : '';

          const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const fileList = Array.from(e.currentTarget.files || []);
            setFieldValue(name, fileList);

            const readers = fileList.map(f => {
              return new Promise<string | ArrayBuffer | null>(resolve => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target?.result || null);
                reader.readAsDataURL(f);
              });
            });

            Promise.all(readers).then(results => {
              setImagesURI(results.filter(Boolean));
            });

            clearInnerInput();
          };

          const clearInnerInput = () => {
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          };

          const handleDeleteImage = (index: number) => {
            const newImagesURI = imagesURI.filter((_, i) => i !== index);
            setImagesURI(newImagesURI);

            const newFileList = Array.from(value || []).filter(
              (_, i) => i !== index
            );
            setFieldValue(name, newFileList.length > 0 ? newFileList : null);
          };

          const handleOnClearClick = () => {
            setFieldValue(name, null);
            setImagesURI([]);
            clearInnerInput();
          };

          const handleOnInputClick = () => {
            if (inputRef.current) {
              inputRef.current.value = '';
              inputRef.current.click();
            }
          };

          return (
            <FormControl
              ref={formControlRef}
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
                    onClick: handleOnInputClick,
                  }}
                />
                {!value?.length ? (
                  <InputRightElement pointerEvents={'none'}>
                    <Icon as={HiOutlinePaperClip} boxSize={5} />
                  </InputRightElement>
                ) : (
                  <InputRightElement
                    onClick={handleOnClearClick}
                    cursor={'pointer'}
                  >
                    <Flex
                      align={'center'}
                      justify={'center'}
                      p={2}
                      rounded={'md'}
                      _hover={{ bg: 'blackAlpha.100' }}
                      _dark={{ _hover: { bg: 'whiteAlpha.100' } }}
                      transitionTimingFunction={'ease-in-out'}
                      transitionDuration={'fast'}
                      transitionProperty='common'
                    >
                      <CloseIcon boxSize={3} />{' '}
                    </Flex>
                  </InputRightElement>
                )}
              </InputGroup>
              {imagesURI.length !== 0 && (
                <Flex py='1' gap='1' display='inline-flex' wrap={'wrap'}>
                  {imagesURI.map((img, idx) => (
                    <Box
                      key={idx}
                      position={'relative'}
                      width='100px'
                      height='100px'
                      zIndex={1}
                      role='group'
                    >
                      <Image
                        src={img as string}
                        objectFit='cover'
                        width='100%'
                        height='100%'
                        rounded={'md'}
                      />
                      <DarkMode>
                        <IconButton
                          aria-label='Delete Image'
                          variant='solid'
                          icon={<CloseIcon boxSize={2.5} />}
                          size='xs'
                          position='absolute'
                          top='1'
                          right='1'
                          onClick={() => handleDeleteImage(idx)}
                          zIndex={10}
                        />
                      </DarkMode>
                    </Box>
                  ))}
                </Flex>
              )}
              <ErrorMessage name={name} component={FormErrorMessage} />
            </FormControl>
          );
        }}
      </FastField>
    );
  }
);

function getShortFileName(fileName: string, maxLength: number) {
  if (!fileName) return null;
  const lastDotIndex = fileName.lastIndexOf('.');
  const extension = fileName.slice(lastDotIndex);
  const name = fileName.slice(0, lastDotIndex);
  const totalLength = name.length + extension.length + 1;

  if (totalLength <= maxLength) {
    return fileName;
  }

  const maxNameLength = maxLength - extension.length - 6;
  const truncatedName = name.slice(0, maxNameLength);
  const endPart = name.slice(lastDotIndex - 6, lastDotIndex);
  return `${truncatedName}...${endPart}${extension}`;
}

export default FileInput;
