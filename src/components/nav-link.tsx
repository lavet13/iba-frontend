import { FC, PropsWithChildren } from 'react';
import {
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
} from 'react-router-dom';
import { Button, ButtonProps, Link } from '@chakra-ui/react';

type NavLinkProps = ButtonProps & RouterNavLinkProps & PropsWithChildren;

const NavLink: FC<NavLinkProps> = ({ to, children, ...props }) => {
  return (
    <Link as={RouterNavLink} to={to} sx={{ flex: ['0.1', '0.2'] }}>
      {/* @ts-ignore */}
      {({ isActive }) =>
        isActive ? (
          <Button
            variant='solid'
            w={'full'}
            size={['md', null, 'sm']}
            {...props}
          >
            {children}
          </Button>
        ) : (
          <Button
            w={'full'}
            variant='outline'
            size={['md', null, 'sm']}
            {...props}
          >
            {children}
          </Button>
        )
      }
    </Link>
  );
};

export default NavLink;
