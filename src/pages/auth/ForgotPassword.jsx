import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isEmailValid } from '../../utils/validation';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  Heading,
  Text,
  VStack,
  Link,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiMail } from 'react-icons/fi';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('purple.500', 'purple.300');
  const buttonGradient = useColorModeValue(
    'linear(to-r, purple.400, pink.400, blue.400)',
    'linear(to-r, purple.500, pink.500, blue.500)'
  );
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    
    // Clear error when user types
    if (emailError) {
      setEmailError('');
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isEmailValid(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await forgotPassword(email);
      
      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxW="md" py={12}>
      <Box 
        p={8} 
        bg={bgColor} 
        rounded="lg" 
        boxShadow="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={6} align="flex-start" w="full">
          <Box textAlign="center" w="full">
            <Heading as="h1" size="xl" mb={2} bgGradient="linear(to-r, purple.500, pink.500, blue.500)" bgClip="text">
              Reset Your Password
            </Heading>
            <Text color="gray.600">
              {!isSubmitted 
                ? "Enter your email address and we'll send you instructions to reset your password."
                : "Check your email for instructions to reset your password."}
            </Text>
          </Box>
          
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          )}
          
          {isSubmitted ? (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Email Sent</AlertTitle>
                <AlertDescription>
                  We've sent password reset instructions to {email}.
                  Please check your inbox and spam folder.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Box as="form" onSubmit={handleSubmit} w="full">
              <VStack spacing={4}>
                <FormControl isInvalid={!!emailError}>
                  <FormLabel>Email Address</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiMail} color="gray.500" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="your-email@example.com"
                      size="lg"
                    />
                  </InputGroup>
                  <FormErrorMessage>{emailError}</FormErrorMessage>
                </FormControl>
                
                <Button
                  type="submit"
                  colorScheme="purple"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Sending"
                  bgGradient={buttonGradient}
                  _hover={{
                    bgGradient: 'linear(to-r, purple.500, pink.500, blue.500)',
                  }}
                >
                  Send Reset Instructions
                </Button>
              </VStack>
            </Box>
          )}
          
          <Box textAlign="center" w="full" pt={4}>
            <Text fontSize="sm">
              Remember your password? {' '}
              <Link as={RouterLink} to="/login" color={accentColor}>
                Back to Login
              </Link>
            </Text>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 