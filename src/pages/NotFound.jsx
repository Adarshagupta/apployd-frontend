import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { TbError404 } from 'react-icons/tb';

const NotFound = () => {
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
          <Heading size="4xl" color="blue.500">404</Heading>
          
          <Heading size="xl">Page Not Found</Heading>
          
          <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
            The page you are looking for doesn't exist or has been moved.
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

export default NotFound; 