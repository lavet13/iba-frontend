import { Flex, FormControl, FormLabel, Icon, Tooltip, useClipboard } from '@chakra-ui/react';
import { FC } from 'react';
import { HiClipboard, HiClipboardCheck } from 'react-icons/hi';

type ClipboardInputProps = {
  label: string;
  value?: string | null;
};

const ClipboardInput: FC<ClipboardInputProps> = ({ label, value }) => {
  const { onCopy, hasCopied } = useClipboard(value ?? '');

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Tooltip
        hasArrow
        label={`Скопировать ${label.toLowerCase()}`}
        placement='right'
      >
        <Flex
          display='inline-flex'
          mb={2}
          align='center'
          cursor={'pointer'}
          onClick={onCopy}
        >
          {value}{' '}
          {hasCopied ? (
            <>
              <Icon as={HiClipboardCheck} boxSize={5} />
              {'Скопировано!'}
            </>
          ) : (
            <Icon as={HiClipboard} boxSize={5} />
          )}
        </Flex>
      </Tooltip>
    </FormControl>
  );
};

export default ClipboardInput;
