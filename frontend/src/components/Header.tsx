import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MdSearch, MdLocationOn, MdPerson } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { colors, Container, Button, Flex } from '../styles/GlobalStyles';

const HeaderWrapper = styled.header`
  background: ${colors.white};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const HeaderContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: ${colors.primary};
  text-decoration: none;

  &:hover {
    color: ${colors.primaryDark};
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${colors.gray[100]};
  border-radius: 25px;
  padding: 8px 16px;
  width: 100%;
  max-width: 400px;
  margin: 0 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  padding: 4px 8px;
  font-size: 14px;

  &::placeholder {
    color: ${colors.gray[500]};
  }
`;

const LocationSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${colors.gray[100]};
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-right: 20px;

  &:hover {
    background: ${colors.gray[200]};
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid ${colors.gray[300]};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.gray[100]};
  }
`;

const DropdownMenu = styled.div<{ show: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${colors.white};
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 180px;
  display: ${props => props.show ? 'block' : 'none'};
  z-index: 1001;
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 12px 20px;
  color: ${colors.gray[700]};
  text-decoration: none;
  transition: background 0.3s ease;

  &:hover {
    background: ${colors.gray[100]};
  }
`;

const DropdownButton = styled.button`
  display: block;
  width: 100%;
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: ${colors.gray[700]};
  text-align: left;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: ${colors.gray[100]};
  }
`;

const MobileMenuToggle = styled.button`
  display: none;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity] = useState('Mumbai'); // removed unused setter

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/movies?search=${searchTerm}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <Logo to="/">BookMyShow</Logo>

        <SearchContainer>
          {/* <MdSearch color={colors.gray[500]} size={20} /> */}
          <form onSubmit={handleSearch} style={{ width: '100%' }}>
            <SearchInput
              type="text"
              placeholder="Search for Movies, Events, Plays, Sports and Activities"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </SearchContainer>

        <Flex align="center" gap="16px">
          <LocationSelector>
            {/* <MdLocationOn color={colors.primary} size={14} /> */}
            <span>{selectedCity}</span>
          </LocationSelector>

          {isAuthenticated ? (
            <UserMenu>
              <UserButton onClick={() => setShowUserMenu(!showUserMenu)}>
                {/* <MdPerson size={20} /> */}
                <span>Hi, {user?.name.split(' ')[0]}</span>
              </UserButton>
              <DropdownMenu show={showUserMenu}>
                <DropdownItem to="/profile" onClick={() => setShowUserMenu(false)}>
                  My Profile
                </DropdownItem>
                <DropdownItem to="/bookings" onClick={() => setShowUserMenu(false)}>
                  My Bookings
                </DropdownItem>
                <DropdownButton onClick={handleLogout}>
                  Sign Out
                </DropdownButton>
              </DropdownMenu>
            </UserMenu>
          ) : (
            <Flex gap="12px">
              <Button
                variant="outline"
                size="small"
                onClick={() => navigate('/login')}
              >
                Sign in
              </Button>
              <Button
                size="small"
                onClick={() => navigate('/register')}
              >
                Sign up
              </Button>
            </Flex>
          )}

          <MobileMenuToggle>
            ☰
          </MobileMenuToggle>
        </Flex>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

export default Header;
