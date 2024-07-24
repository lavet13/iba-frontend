import { FC, PropsWithChildren, useTransition } from 'react';
import {
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
  useNavigate,
} from 'react-router-dom';
import { Button, ButtonProps, Link } from '@chakra-ui/react';

type NavLinkProps = ButtonProps & RouterNavLinkProps & PropsWithChildren;

const NavLink: FC<NavLinkProps> = ({ to, children, onClick, ...props }) => {
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    startTransition(() => {
      navigate(to.toString());
      if (onClick) {
        onClick(e);
      }
    });
  };

  return (
    <Link as={RouterNavLink} to={to} sx={{ flex: ['0.1', '0.2'] }}>
      {/* @ts-ignore */}
      {({ isActive }) => (
        <Button
          variant={isActive || isPending ? 'solid' : 'outline'}
          w={'full'}
          size={['md', null, 'sm']}
          onClick={handleClick}
          isLoading={isPending}
          {...props}
        >
          {children}
        </Button>
      )}
    </Link>
  );
};

export default NavLink;
