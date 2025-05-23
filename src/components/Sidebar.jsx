import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  VStack,
  Heading,
  Link,
  Text,
  Icon,
  Flex,
  Divider,
  Image,
  useColorModeValue,
  HStack,
} from '@chakra-ui/react';
import { 
  HiHome, 
  HiDatabase, 
  HiPlus, 
  HiCode,
  HiChartBar,
  HiCog,
  HiSupport
} from 'react-icons/hi';

const NavItem = ({ icon, children, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  // Theme colors
  const activeBg = useColorModeValue('purple.50', 'purple.900');
  const activeColor = useColorModeValue('purple.700', 'purple.200');
  const hoverBg = useColorModeValue('purple.50', 'purple.900');
  const hoverColor = useColorModeValue('purple.700', 'purple.200');
  const iconColor = useColorModeValue('purple.500', 'purple.300');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  
  return (
    <Link
      as={RouterLink}
      to={to}
      textDecoration="none"
      _hover={{ textDecoration: 'none' }}
      w="full"
    >
      <Flex
        align="center"
        p={3}
        borderRadius="md"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : textColor}
        _hover={{ bg: hoverBg, color: hoverColor }}
        transition="all 0.2s"
      >
        <Icon
          mr={4}
          fontSize="18"
          as={icon}
          color={isActive ? activeColor : iconColor}
        />
        <Text fontSize="sm" fontWeight={isActive ? "600" : "medium"}>{children}</Text>
        {isActive && (
          <Box 
            w="4px" 
            h="24px" 
            bg="purple.500" 
            position="absolute" 
            right="0" 
            borderLeftRadius="md"
          />
        )}
      </Flex>
    </Link>
  );
};

const Sidebar = () => {
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('purple.600', 'purple.300');
  const dividerColor = useColorModeValue('gray.200', 'gray.700');
  const logoGradient = useColorModeValue(
    'linear(to-r, purple.500, pink.500, blue.500)',
    'linear(to-r, purple.400, pink.400, blue.400)'
  );
  
  return (
    <Box
      w="250px"
      h="100vh"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      p={0}
      position="fixed"
      top="0"
      left="0"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)'),
          borderRadius: '24px',
        },
      }}
    >
      <Box px={6} py={6}>
        <Box mb={8} textAlign="center">
          <Image 
            src="/images/symbo+text-logo.png" 
            alt="Neon Logo" 
            maxW="180px" 
            width="100%"
            mx="auto"
          />
          </Box>
        
        <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={4} textTransform="uppercase" letterSpacing="wider">
          Core
        </Text>
        
        <VStack align="stretch" spacing={1} mb={8}>
          <NavItem icon={HiHome} to="/dashboard">Dashboard</NavItem>
          <NavItem icon={HiDatabase} to="/databases">Databases</NavItem>
          <NavItem icon={HiCode} to="/query">SQL Editor</NavItem>
          <NavItem icon={HiChartBar} to="/monitoring">Monitoring</NavItem>
        </VStack>
        
        <Divider borderColor={dividerColor} mb={6} />
        
        <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={4} textTransform="uppercase" letterSpacing="wider">
          Management
        </Text>
        
        <VStack align="stretch" spacing={1} mb={8}>
          <NavItem icon={HiPlus} to="/create-database">Create Database</NavItem>
          <NavItem icon={HiCog} to="/settings">Settings</NavItem>
          <NavItem icon={HiSupport} to="/support">Support</NavItem>
        </VStack>
        
        <Box mt="auto" pt={6}>
          <Flex 
            bg="purple.50" 
            p={4} 
            borderRadius="md" 
            flexDirection="column"
            alignItems="flex-start"
            borderLeft="4px solid"
            borderColor="purple.500"
          >
            <Text fontSize="sm" fontWeight="bold" color="purple.700">Need help?</Text>
            <Text fontSize="xs" color="gray.600" mt={1}>
              Check our documentation or contact support for assistance.
            </Text>
            <Link 
              as={RouterLink} 
              to="/docs" 
              fontSize="xs" 
              color="purple.500" 
              fontWeight="medium" 
              mt={2}
              _hover={{ textDecoration: 'none', color: 'purple.600' }}
            >
              View Documentation →
            </Link>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar; 