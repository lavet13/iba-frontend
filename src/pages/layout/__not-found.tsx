import { Heading, Button, VStack, Center, Container } from '@chakra-ui/react';
import { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const NotFound: FC = () => {
  return (
    <Center flex="1">
      <Container maxW={'600px'} flex='1'>
        <VStack flex="1" spacing={4} sx={{ textAlign: 'center' }}>
          <Heading size={['2xl', null, '3xl']} id='test' sx={{ textAlign: 'center' }}>
            404
          </Heading>
          <Button variant="outline" as={RouterLink} to='/'>
            На главную страницу
          </Button>
        </VStack>
      </Container>
    </Center>
  );
};

export default NotFound;
