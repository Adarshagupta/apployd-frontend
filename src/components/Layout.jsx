import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useDisclosure,
  useColorMode,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  CloseButton,
  Image,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { 
  TbMenu2, 
  TbChevronDown, 
  TbChevronRight, 
  TbSun, 
  TbMoon,
  TbUser,
  TbLogout,
  TbSettings,
  TbBell,
  TbSearch,
  TbHelp
} from 'react-icons/tb';

import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const Layout = ({ navItems }) => {
  const { isOpen, onToggle } = useDisclosure();
  const { toggleColorMode, colorMode } = useColorMode();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Theme colors - matching the auth pages
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtleTextColor = useColorModeValue('gray.600', 'gray.400');
  const headerBgGradient = useColorModeValue(
    'linear(to-r, purple.500, pink.400, blue.400)',
    'linear(to-r, purple.600, pink.500, blue.500)'
  );
  const buttonGradient = useColorModeValue(
    'linear(to-r, purple.400, pink.400, blue.400)',
    'linear(to-r, purple.500, pink.500, blue.500)'
  );
  const buttonHoverGradient = useColorModeValue(
    'linear(to-r, purple.500, pink.500, blue.500)',
    'linear(to-r, purple.600, pink.600, blue.600)'
  );
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <Box minH="100vh" bg={pageBg}>
      {/* Mobile nav */}
      <MobileNav
        isOpen={isOpen}
        onToggle={onToggle}
        navItems={navItems}
        colorMode={colorMode}
        toggleColorMode={toggleColorMode}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      {/* Desktop sidebar */}
      <Sidebar display={{ base: 'none', md: 'block' }} />
      
      {/* Main content */}
      <Box
        ml={{ base: 0, md: '250px' }}
        transition="margin-left 0.3s"
      >
        {/* Header */}
        <Flex
          as="header"
          position="sticky"
          top={0}
          bg={bgColor}
          borderBottomWidth="1px"
          borderColor={borderColor}
          h="64px"
          align="center"
          px={6}
          zIndex={10}
          boxShadow="sm"
        >
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onToggle}
            icon={<TbMenu2 />}
            variant="ghost"
            aria-label="Toggle Navigation"
            mr={2}
          />
          
          <Box flex={1} />
          
          <HStack spacing={4}>
            <Tooltip label="Search" placement="bottom">
              <IconButton
                icon={<TbSearch />}
                variant="ghost"
                aria-label="Search"
                fontSize="lg"
                color={subtleTextColor}
              />
            </Tooltip>
            
            <Tooltip label="Notifications" placement="bottom">
              <IconButton
                icon={<TbBell />}
                variant="ghost"
                aria-label="Notifications"
                fontSize="lg"
                color={subtleTextColor}
                position="relative"
              >
                <Box 
                  position="absolute" 
                  top="2" 
                  right="2" 
                  bg="red.500" 
                  borderRadius="full" 
                  w="2" 
                  h="2" 
                />
              </IconButton>
            </Tooltip>
            
            <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} placement="bottom">
              <IconButton
                icon={colorMode === 'light' ? <TbMoon /> : <TbSun />}
                onClick={toggleColorMode}
                variant="ghost"
                aria-label="Toggle color mode"
                fontSize="lg"
                color={subtleTextColor}
              />
            </Tooltip>
            
            <Menu>
              <MenuButton 
                as={Button} 
                variant="ghost" 
                rounded="full" 
                cursor="pointer" 
                minW={0}
              >
                <HStack>
                  <Avatar 
                    size="sm" 
                    name={`${currentUser?.firstName || 'User'} ${currentUser?.lastName || ''}`} 
                    src={currentUser?.avatar} 
                    bg="purple.500"
                  />
                  <Text display={{ base: 'none', md: 'block' }} color={textColor}>
                    {currentUser?.firstName || 'User'}
                  </Text>
                  <Icon as={TbChevronDown} color={subtleTextColor} />
                </HStack>
              </MenuButton>
              <MenuList shadow="lg" borderColor={borderColor}>
                <MenuItem icon={<TbUser />} onClick={() => navigate('/profile')}>
                  Profile
                </MenuItem>
                <MenuItem icon={<TbSettings />} onClick={() => navigate('/settings')}>
                  Settings
                </MenuItem>
                <MenuItem icon={<TbHelp />} onClick={() => navigate('/help')}>
                  Help Center
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<TbLogout />} onClick={handleLogout}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        {/* Page content */}
        <Box as="main" p={6}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

// Mobile Navigation drawer
const MobileNav = ({ isOpen, onToggle, navItems, colorMode, toggleColorMode, currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtleTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeColor = useColorModeValue('purple.600', 'purple.300');
  const activeBg = useColorModeValue('purple.50', 'purple.900');
  const logoGradient = useColorModeValue(
    'linear(to-r, purple.500, pink.500, blue.500)',
    'linear(to-r, purple.400, pink.400, blue.400)'
  );
  const buttonGradient = useColorModeValue(
    'linear(to-r, purple.400, pink.400, blue.400)',
    'linear(to-r, purple.500, pink.500, blue.500)'
  );
  
  return (
    <Box>
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onToggle}
        returnFocusOnClose={false}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent bg={bgColor}>
          <Box p={6}>
            <Flex 
              alignItems="center" 
              justifyContent="space-between"
              mb={8}
            >
              <Box>
                <Image 
                  src="/images/symbo+text-logo.png" 
                  alt="Neon Logo" 
                  maxW="180px" 
                  width="100%"
                />
              </Box>
              <CloseButton onClick={onToggle} />
            </Flex>
            
            <VStack spacing={1} align="stretch" mb={8}>
              {navItems.map((navItem) => {
                const isActive = location.pathname === navItem.path;
                return (
                  <Link
                    key={navItem.name}
                    as={NavLink}
                    to={navItem.path}
                    style={{ textDecoration: 'none' }}
                    _hover={{ textDecoration: 'none' }}
                    onClick={onToggle}
                  >
                    <Flex 
                      align="center" 
                      p={3}
                      borderRadius="md"
                      bg={isActive ? activeBg : 'transparent'}
                      color={isActive ? activeColor : textColor}
                      _hover={{ bg: activeBg, color: activeColor }}
                    >
                      <Icon as={navItem.icon} mr={3} />
                      <Text fontWeight={isActive ? "600" : "medium"}>{navItem.name}</Text>
                    </Flex>
                  </Link>
                );
              })}
            </VStack>
            
            <Box mt={12} pt={6} borderTopWidth="1px" borderColor={borderColor}>
              <Flex justifyContent="space-between" alignItems="center">
                <Button 
                  onClick={toggleColorMode} 
                  leftIcon={colorMode === 'light' ? <TbMoon /> : <TbSun />}
                  variant="ghost"
                >
                  {colorMode === 'light' ? 'Dark' : 'Light'} Mode
                </Button>
                
                <Button 
                  onClick={onLogout} 
                  leftIcon={<TbLogout />} 
                  colorScheme="red" 
                  variant="ghost"
                >
                  Logout
                </Button>
              </Flex>
              
              <Flex mt={8} align="center">
                <Avatar 
                  size="sm" 
                  name={`${currentUser?.firstName || 'User'} ${currentUser?.lastName || ''}`} 
                  src={currentUser?.avatar}
                  bg="purple.500"
                  mr={3}
                />
                <Box>
                  <Text fontWeight="medium">{currentUser?.firstName || 'User'} {currentUser?.lastName || ''}</Text>
                  <Text fontSize="sm" color={subtleTextColor}>{currentUser?.email || 'user@example.com'}</Text>
                </Box>
              </Flex>
            </Box>
          </Box>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Layout; 