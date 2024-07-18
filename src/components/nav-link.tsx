import { FC, PropsWithChildren } from 'react';
import {
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
} from 'react-router-dom';
import { Button, ButtonProps } from '@chakra-ui/react';

type NavLinkProps = ButtonProps & RouterNavLinkProps & PropsWithChildren;

const NavLink: FC<NavLinkProps> = ({ to, children, ...props }) => {
  return (
    <RouterNavLink to={to} style={{ flex: 0.5 }}>
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
    </RouterNavLink>
  );
};

export default NavLink;
