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
  Drawer,
  DrawerOverlay,
  DrawerHeader,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
} from '@chakra-ui/react';
import { FC } from 'react';
import { HiMenu, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import { useGetMe } from '../../features/auth';
import AccountMenu from '../../components/account-menu';
import NavLink from '../../components/nav-link';
import useIntersectionObserver from '../../hooks/use-intersection-observer';

const Header: FC = () => {
  const { data: getMeResult } = useGetMe();
  const theme = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLargerThanSm] = useMediaQuery(
    `(min-width: ${theme.breakpoints.sm})`,
    { ssr: true, fallback: false }
  );
  const [isLargerThanMd] = useMediaQuery(
    `(min-width: ${theme.breakpoints.md})`,
    {
      ssr: true,
      fallback: false,
    }
  );
  const { colorMode, toggleColorMode } = useColorMode();

  const [headerRef, isNotAtTop] = useIntersectionObserver({
    threshold: 1,
    rootMargin: '-1px 0px 0px 0px',
  });

  const isNotLargerAndIsOpen = (!isLargerThanSm || !isLargerThanMd) && isOpen;

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
  }, [isOpen, isLargerThanSm, isLargerThanMd]);

  const buttons = [
    getMeResult?.me && getMeResult.me.role === 'ADMIN' && (
      <NavLink
        to={'/admin/wb-orders'}
        onClick={() => {
          onClose();
        }}
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
            onClick={() => {
              onClose();
            }}
          >
            Главная
          </NavLink>
          <IconButton
            variant='ghost'
            onClick={() =>
              toggleColorMode()
            }
            size='sm'
            aria-label='Color Mode'
            icon={
              colorMode === 'light' ? (
                <Icon as={HiOutlineMoon} boxSize={4} />
              ) : (
                <Icon as={HiOutlineSun} boxSize={5} />
              )
            }
          />
        </ButtonGroup>
        <Spacer />
        {isLargerThanMd && (
          <ButtonGroup alignItems='center' gap='2'>
            {buttons.map((button, idx) => (
              <Fragment key={idx}>{button}</Fragment>
            ))}
          </ButtonGroup>
        )}
        {isLargerThanSm && !isLargerThanMd && (
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
        {isLargerThanSm ? null : (
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
        minH={!isLargerThanSm && isOpen ? '100vh' : 'auto'}
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
        {!isLargerThanSm && isOpen ? (
          <Flex direction='column' gap='4' h={'100vh'}>
            {content}
            <SimpleGrid
              px={2}
              alignItems={'center'}
              spacing={'10px'}
              minChildWidth={'220px'}
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
      {(isLargerThanSm && !isLargerThanMd) && isOpen && (
        <Drawer onClose={onClose} isOpen={isOpen} size={'xs'}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Меню</DrawerHeader>
            <DrawerBody>
              <SimpleGrid
                alignItems={'center'}
                spacing={'10px'}
                minChildWidth={'200px'}
                overflow='auto'
              >
                {buttons.map((button, idx) => (
                  <Fragment key={idx}>{button}</Fragment>
                ))}
              </SimpleGrid>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default Header;
