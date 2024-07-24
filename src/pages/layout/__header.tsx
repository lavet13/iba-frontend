import { Fragment, useEffect, useTransition } from 'react';
import {
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
  useColorModeValue,
  cssVar,
  useColorMode,
} from '@chakra-ui/react';
import { FC } from 'react';
import { HiMenu } from 'react-icons/hi';
import { useGetMe } from '../../features/auth';
import AccountMenu from '../../components/account-menu';
import NavLink from '../../components/nav-link';
import useIntersectionObserver from '../../hooks/use-intersection-observer';
import { HiMoon } from 'react-icons/hi2';
import { HiMiniSun } from 'react-icons/hi2';

const Header: FC = () => {
  const { data: getMeResult } = useGetMe();
  const theme = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLargerThanMd] = useMediaQuery(
    `(min-width: ${theme.breakpoints.md})`,
    { ssr: true, fallback: false }
  );
  const [isPending, startTransition] = useTransition();
  const { colorMode, toggleColorMode } = useColorMode();

  const [headerRef, isNotAtTop] = useIntersectionObserver({
    threshold: 1,
    rootMargin: '-1px 0px 0px 0px',
  });

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

  const isNotLargerAndIsOpen = !isLargerThanMd && isOpen;

  const buttons = [
    getMeResult?.me && getMeResult.me.role === 'ADMIN' && (
      <NavLink
        to={'/admin/wb-orders'}
        onClick={() => {
          onClose();
        }}
        colorScheme='teal'
      >
        Заявки WB
      </NavLink>
    ),
    <NavLink
      to={'/wb-order'}
      onClick={() => {
        onClose();
      }}
      colorScheme='pink'
    >
      Wildberries
    </NavLink>,
    getMeResult?.me && <AccountMenu onClose={onClose} />,
  ].filter(Boolean);

  let content = (
    <Container>
      <Flex pt='1.5' align={'center'} minH={'58px'} overflow='auto'>
        <ButtonGroup>
          <NavLink
            to={'/'}
            size={'sm'}
            colorScheme='teal'
            onClick={() => {
              onClose();
            }}
          >
            Главная
          </NavLink>
          <IconButton
            isLoading={isPending}
            variant='ghost'
            onClick={() =>
              startTransition(() => {
                toggleColorMode();
              })
            }
            size='sm'
            aria-label='Color Mode'
            icon={colorMode === 'light' ? <Icon as={HiMiniSun} boxSize={5} /> : <Icon as={HiMoon} boxSize={4} />}
          />
        </ButtonGroup>
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

  console.log({ isNotAtTop });

  const { reference: gray700 } = cssVar('chakra-colors-gray-700');
  const { reference: gray300 } = cssVar('chakra-colors-gray-300');
  const borderBottom = useColorModeValue(
    `1px solid ${gray300}`,
    `1px solid ${gray700}`
  );

  return (
    <>
      <Box height={'1px'} />
      <Box
        ref={headerRef}
        bg='chakra-body-bg'
        position='sticky'
        top='0'
        zIndex='100'
        w='full'
        minH={isNotLargerAndIsOpen ? '100vh' : 'auto'}
        borderBottom={
          isNotLargerAndIsOpen
            ? '1px solid transparent'
            : isNotAtTop
            ? '1px solid transparent'
            : borderBottom
        }
        transitionTimingFunction={'ease-in-out'}
        transitionDuration={'fast'}
        transitionProperty={'common'}
      >
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
    </>
  );
};

export default Header;
