import { Fragment, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  CloseButton,
  Container,
  Flex,
  IconButton,
  Spacer,
  useDisclosure,
  useMediaQuery,
  useTheme,
  Icon,
  SimpleGrid,
  Box,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FC } from 'react';
import { HiMenu } from 'react-icons/hi';
import { useGetMe } from '../../features/auth';
import AccountMenu from '../../components/account-menu';
import { isGraphQLRequestError } from '../../utils/graphql/is-graphql-request-error';
import queryClient from '../../react-query/query-client';

const Header: FC = () => {
  const {
    error,
    data: getMeResult,
    isPending: getMePending,
  } = useGetMe();
  const theme = useTheme();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLargerThanMd] = useMediaQuery(
    `(min-width: ${theme.breakpoints.md})`,
    { ssr: true, fallback: false }
  );

  useEffect(() => {
    const body = document.body;
    if (isNotLargerAndIsOpen) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = 'auto';
    }

    // Clean up the effect when the component unmounts
    return () => {
      body.style.overflow = 'auto';
    };
  }, [isOpen, isLargerThanMd]);

  console.log({ error });

  if (error) {
    if (isGraphQLRequestError(error) && error.response.errors[0].extensions.code === 'UNAUTHENTICATED') {
      queryClient.setQueryData(['Me'], null);
      console.warn('Unauthenticated!');
    }
    if(isGraphQLRequestError(error) && error.response.errors[0].extensions.code === 'AUTHENTICATION_REQUIRED') {
      queryClient.setQueryData(['Me'], null);
      console.warn('Session timeout!');
    }
  }

  const isNotLargerAndIsOpen = !isLargerThanMd && isOpen;

  const buttons = getMePending
    ? []
    : [
        getMeResult?.me && getMeResult.me.role === 'ADMIN' && (
          <Button
            onClick={() => {
              navigate('/admin/wb-orders');
              onClose();
            }}
            variant='ghost'
            size={['md', null, 'sm']}
            colorScheme='red'
          >
            Заявки WB
          </Button>
        ),
        <Button
          onClick={() => {
            navigate('/wb-order');
            onClose();
          }}
          variant='ghost'
          size={['md', null, 'sm']}
        >
          Wildberries
        </Button>,
        getMeResult?.me && (
          <AccountMenu onClose={onClose} />
        )
      ].filter(Boolean);

  let content = (
    <Container>
      <Flex pt='1.5' align={'center'} minH={'58px'} overflow='auto'>
        <Button
          variant='link'
          onClick={() => {
            navigate('/');
            onClose();
          }}
        >
          Главная
        </Button>
        <Spacer />
        {isLargerThanMd ? (
          <ButtonGroup alignItems='center' gap='2'>
            {buttons.map((button, idx) => (
              <Fragment key={idx}>{button}</Fragment>
            ))}
          </ButtonGroup>
        ) : (
          <>
            {!isOpen ? (
              <IconButton
                size='sm'
                variant='outline'
                icon={<Icon as={HiMenu} boxSize={5} />}
                aria-label={'Open menu'}
                onClick={onOpen}
              />
            ) : (
              <CloseButton onClick={onClose} size='md' />
            )}
          </>
        )}
      </Flex>
    </Container>
  );

  return (
    <Box bg="chakra-body-bg" position="sticky" top="0" zIndex="100" w='full' minH={isNotLargerAndIsOpen ? '100vh' : 'auto'}>
      {isNotLargerAndIsOpen ? (
        <Flex direction='column' gap='4' h={'100vh'}>
          {content}
          <SimpleGrid
            px={2}
            alignItems={'center'}
            spacing={'20px'}
            minChildWidth={'200px'}
            overflow='auto'
          >
            {buttons.map((button, idx) => (
              <Fragment key={idx}>{button}</Fragment>
            ))}
          </SimpleGrid>
        </Flex>
      ) : (
        content
      )}
    </Box>
  );
};

export default Header;
