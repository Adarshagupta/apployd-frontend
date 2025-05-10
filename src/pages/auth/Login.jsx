import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  Stack,
  Text,
  FormErrorMessage,
  useColorModeValue,
  useToast,
  Flex,
  VStack,
  InputGroup,
  InputRightElement,
  Icon,
  Progress
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEyeOff, FiCheck, FiLock, FiMail } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const toast = useToast();
  
  // Theme colors - matching Register.jsx
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('purple.500', 'purple.300');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtleTextColor = useColorModeValue('gray.600', 'gray.400');
  const sidebarBg = useColorModeValue('linear(to-br, purple.500, pink.400)', 'linear(to-br, purple.600, pink.500)');
  const inputBg = useColorModeValue('purple.50', 'gray.700');
  const buttonGradient = useColorModeValue(
    'linear(to-r, purple.400, pink.400, blue.400)',
    'linear(to-r, purple.500, pink.500, blue.500)'
  );
  const buttonHoverGradient = useColorModeValue(
    'linear(to-r, purple.500, pink.500, blue.500)',
    'linear(to-r, purple.600, pink.600, blue.600)'
  );
  const formBgGradient = useColorModeValue(
    'linear(to-br, white, purple.50, blue.50)',
    'linear(to-br, gray.900, purple.900)'
  );
  
  // Add shimmer effect to the sidebar
  const [shimmerPosition, setShimmerPosition] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerPosition(prev => (prev + 1) % 200);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      
      if (!result.success) {
        toast({
          title: 'Login Failed',
          description: result.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Login Successful',
          description: 'Welcome back to Apployd DB!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      let errorMessage = error.message || 'An unexpected error occurred';
      
      if (errorMessage.includes('Server error')) {
        errorMessage = 'Our servers are currently experiencing issues. Please try again later.';
      } else if (errorMessage.includes('invalid credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'The server encountered an error processing your request.';
      }
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
      {/* Left sidebar with branding */}
      <Box
        display={{ base: 'none', md: 'flex' }}
        flexDir="column"
        w="40%"
        bgGradient={sidebarBg}
        color="white"
        p={10}
        justifyContent="center"
        alignItems="center"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" top="0" left="0" right="0" bottom="0" opacity="0.1">
          {/* Background pattern */}
          <svg width="100%" height="100%" fill="none">
            <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#pattern)" />
          </svg>
        </Box>
        
        {/* Shimmer effect */}
        <Box
          position="absolute"
          top="0"
          left={`${shimmerPosition - 100}%`}
          width="100%"
          height="200%"
          transform="rotate(25deg)"
          bgGradient="linear(to-r, transparent, rgba(255,255,255,0.1), transparent)"
          zIndex="0"
        />
        
        <VStack spacing={8} position="relative" zIndex="1" textAlign="center">
          <Heading size="xl" fontWeight="bold" mb={2} bgGradient="linear(to-r, pink.100, purple.100, blue.100)" bgClip="text">
            Welcome Back
          </Heading>
          <Text fontSize="lg" opacity="0.9" maxW="400px">
            Sign in to your Apployd DB account to manage your serverless Postgres databases
          </Text>
          
          <Box 
            mt={10} 
            p={6} 
            bg="rgba(255,255,255,0.1)" 
            borderRadius="lg" 
            backdropFilter="blur(8px)"
            boxShadow="lg"
            maxW="400px"
          >
            <Text fontSize="lg" fontWeight="medium" mb={4}>
              "Apployd DB has transformed how we work with databases. The serverless architecture and branching feature are game changers."
            </Text>
            <Text fontWeight="medium">— Sarah Johnson</Text>
            <Text fontSize="sm" opacity="0.8">CTO, TechFlow Inc.</Text>
          </Box>
        </VStack>
      </Box>
      
      {/* Right side with form */}
      <Flex 
        flex="1" 
        align="center" 
        justify="center" 
        p={{ base: 4, md: 8 }}
        bgGradient={formBgGradient}
      >
        <Box 
          w="full" 
          maxW="450px" 
          mx="auto"
          py={{ base: 6, md: 12 }}
          px={{ base: 6, md: 8 }}
          bg={bgColor}
          borderRadius="xl"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              <Box textAlign="center" mb={4}>
                <Heading size="lg" fontWeight="bold" bgGradient="linear(to-r, purple.500, pink.500, blue.500)" bgClip="text">
                  Sign in to your account
                </Heading>
                <Text mt={2} color={subtleTextColor}>
                  Access your Apployd DB databases and projects
                </Text>
              </Box>
              
              <FormControl id="email" isInvalid={errors.email}>
                <FormLabel>Email address</FormLabel>
                <InputGroup size="lg">
                  <Input 
                    bg={inputBg}
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    borderRadius="md"
                    pl="12"
                  />
                  <Box position="absolute" left="4" top="3.5" pointerEvents="none" color={accentColor}>
                    <FiMail />
                  </Box>
                </InputGroup>
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="password" isInvalid={errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup size="lg">
                  <Input 
                    bg={inputBg}
                    pr="4.5rem"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    borderRadius="md"
                    pl="12"
                  />
                  <Box position="absolute" left="4" top="3.5" pointerEvents="none" color={accentColor}>
                    <FiLock />
                  </Box>
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)}>
                      <Icon as={showPassword ? FiEyeOff : FiEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              
              <Stack spacing={6}>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  align={'start'}
                  justify={'space-between'}
                >
                  <Checkbox 
                    isChecked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    colorScheme="purple"
                  >
                    <Text fontSize="sm">Remember me</Text>
                  </Checkbox>
                  <Link as={RouterLink} to="/forgot-password" color={accentColor} fontSize="sm">
                    Forgot password?
                  </Link>
                </Stack>
                
                <Button
                  type="submit"
                  size="lg"
                  colorScheme="purple"
                  isLoading={isSubmitting}
                  loadingText="Signing in"
                  bgGradient={buttonGradient}
                  _hover={{
                    bgGradient: buttonHoverGradient,
                  }}
                  w="full"
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </form>
          
          <Divider my={6} />
          
          <HStack justify="center" spacing={1}>
            <Text fontSize="sm" color={subtleTextColor}>Don't have an account?</Text>
            <Link as={RouterLink} to="/register" color={accentColor} fontWeight="medium" fontSize="sm">
              Sign up
            </Link>
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Login; 