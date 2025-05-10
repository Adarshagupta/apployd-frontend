import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { TbLock } from 'react-icons/tb';

const Unauthorized = () => {
  const bgColor = useColorModeValue('white', 'gray.700');
  
  return (
    <Box 
      height="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Box 
        p={10} 
        bg={bgColor} 
        borderRadius="lg" 
        boxShadow="lg" 
        maxW="md" 
        w="full" 
        textAlign="center"
      >
        <VStack spacing={6}>
          <Box 
            p={4} 
            bg="red.100" 
            borderRadius="full" 
            color="red.500" 
            boxSize="80px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <TbLock size={40} />
          </Box>
          
          <Heading size="xl">Access Denied</Heading>
          
          <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
            You don't have permission to access this page. 
            Please contact your administrator if you think this is an error.
          </Text>
          
          <Button 
            as={RouterLink} 
            to="/dashboard" 
            colorScheme="blue" 
            size="lg" 
            width="full"
          >
            Return to Dashboard
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default Unauthorized; 