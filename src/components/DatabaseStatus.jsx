import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  Text,
  Tooltip,
  HStack,
  Spinner,
  useToast,
  Flex,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { HiDatabase, HiStatusOnline, HiExclamation } from 'react-icons/hi';
import axios from 'axios';

// Component to display the connectivity status for both local and Apployd DB databases
const DatabaseStatus = () => {
  const [status, setStatus] = useState({
    local: { connected: false, checking: true, message: 'Checking...' },
    apployd: { connected: false, checking: true, message: 'Checking...' }
  });
  const toast = useToast();
  
  // Theme colors
  const badgeBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const connectedColor = useColorModeValue('green.400', 'green.300');
  const disconnectedColor = useColorModeValue('red.400', 'red.300');
  
  // Function to check PostgreSQL connection
  const checkConnection = async (type, host, port, user, password) => {
    try {
      console.log(`Checking ${type} connection to ${host}:${port}...`);
      
      // Simple query to test connection using direct axios call to avoid 404 issues
      const result = await axios.post('/api/direct-sql', {
        query: 'SELECT 1 as connected',
        params: [],
        host,
        port,
        user,
        password,
        database: 'postgres'
      });
      
      console.log(`${type} connection response:`, result.data);
      
      if (result.data.success && result.data.rows?.[0]?.connected === 1) {
        setStatus(prev => ({
          ...prev,
          [type]: {
            connected: true, 
            checking: false,
            message: 'Connected'
          }
        }));
        return true;
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      console.error(`${type} connection error:`, error);
      
      // More detailed error message
      const errorMessage = error.response 
        ? `${error.response.status}: ${error.response.data?.message || error.message}`
        : error.message;
      
      setStatus(prev => ({
        ...prev,
        [type]: {
          connected: false, 
          checking: false,
          message: `Disconnected: ${errorMessage}`
        }
      }));
      
      if (!toast.isActive(`${type}-connection-error`)) {
        toast({
          id: `${type}-connection-error`,
          title: `${type === 'local' ? 'Local' : 'Apployd DB'} PostgreSQL disconnected`,
          description: `Database connection unavailable: ${errorMessage}`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
      
      return false;
    }
  };
  
  // Set up periodic connection checks
  useEffect(() => {
    // Initial checks with a slight delay to allow other components to load
    const initialCheckTimer = setTimeout(() => {
      checkConnection('local', 'localhost', 5432, 'prazwolgupta', '');
      checkConnection('apployd', 'localhost', 55433, 'cloud_admin', 'cloud_admin');
    }, 2000);
    
    // Set up interval for periodic checks
    const intervalId = setInterval(() => {
      checkConnection('local', 'localhost', 5432, 'prazwolgupta', '');
      checkConnection('apployd', 'localhost', 55433, 'cloud_admin', 'cloud_admin');
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearTimeout(initialCheckTimer);
      clearInterval(intervalId);
    };
  }, []);

  // Render a connection status badge
  const renderStatusBadge = (type, typeLabel) => {
    const isConnected = status[type].connected;
    const isChecking = status[type].checking;
    const statusMessage = status[type].message;
    
    return (
      <Tooltip 
        label={statusMessage} 
        placement="top"
        hasArrow
        borderRadius="md"
      >
        <Flex 
          alignItems="center" 
          bg={badgeBg} 
          px={3} 
          py={2} 
          borderRadius="md"
          minW="120px"
        >
          <HStack spacing={2}>
            <Icon 
              as={HiDatabase} 
              color={isConnected ? connectedColor : disconnectedColor} 
              boxSize={4} 
            />
            <Box>
              <Text fontSize="xs" color={textColor} fontWeight="medium">
                {typeLabel}
              </Text>
              <HStack spacing={1} alignItems="center">
                {isChecking ? (
                  <Spinner size="xs" color="blue.400" />
                ) : (
                  <Icon 
                    as={isConnected ? HiStatusOnline : HiExclamation} 
                    color={isConnected ? connectedColor : disconnectedColor}
                    boxSize={3} 
                  />
                )}
                <Text 
                  fontSize="xs" 
                  fontWeight="medium" 
                  color={isConnected ? connectedColor : disconnectedColor}
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </HStack>
            </Box>
          </HStack>
        </Flex>
      </Tooltip>
    );
  };
  
  return (
    <HStack spacing={3} my={1}>
      {renderStatusBadge('local', 'Local Database')}
      {renderStatusBadge('apployd', 'Apployd DB')}
    </HStack>
  );
};

export default DatabaseStatus; 