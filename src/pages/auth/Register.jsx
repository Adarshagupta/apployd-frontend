import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
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
  Checkbox,
  Flex,
  Image,
  InputGroup,
  InputRightElement,
  Icon,
  VStack,
  Progress,
  ScaleFade,
  Alert,
  AlertIcon,
  Spinner
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { validateEmail } from '../../utils/validation';

const MotionBox = motion(Box);

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    agreeToTerms: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailValidating, setEmailValidating] = useState(false);
  
  const { register, sendVerificationEmail } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Theme colors
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
  
  // Update background pattern color
  const patternColor = useColorModeValue('rgba(147, 112, 219, 0.1)', 'rgba(147, 112, 219, 0.2)');
  
  // Add subtle background gradient to the form side
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
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleEmailChange = async (e) => {
    const { value } = e.target;
    
    setFormData({
      ...formData,
      email: value
    });
    
    // Clear error for this field
    if (errors.email) {
      setErrors({
        ...errors,
        email: ''
      });
    }
    
    // Only validate if there's a value and user has stopped typing (debounce)
    if (value) {
      setEmailValidating(true);
      
      // Simple validation immediately
      if (!/\S+@\S+\.\S+/.test(value)) {
        setErrors({
          ...errors,
          email: 'Please enter a valid email address'
        });
        setEmailValidating(false);
        return;
      }
      
      // Use timeout to debounce the comprehensive validation
      const debounceTimer = setTimeout(async () => {
        try {
          const validationResult = await validateEmail(value);
          
          if (!validationResult.isValid) {
            setErrors({
              ...errors,
              email: validationResult.reason
            });
          }
        } catch (error) {
          console.error('Email validation error:', error);
        } finally {
          setEmailValidating(false);
        }
      }, 600);
      
      // Clear timeout on next change
      return () => clearTimeout(debounceTimer);
    }
  };
  
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (errors.email) {
        newErrors.email = errors.email;
      }
    } else if (step === 1) {
      if (!formData.companyName) {
        newErrors.companyName = 'Company name is required';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(formStep + 1);
    }
  };
  
  const prevStep = () => {
    setFormStep(formStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(formStep) || emailValidating) return;
    
    setIsSubmitting(true);
    
    try {
      setLoading(true);
      setError('');
      
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName
      };
      
      const result = await register(userData);
      
      if (!result.success) {
        toast({
          title: 'Registration Failed',
          description: result.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Send verification email automatically
        await sendVerificationEmail();

        toast({
          title: 'Registration Successful',
          description: 'Please check your email to verify your account before accessing the dashboard.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Navigate to verification page instead of dashboard
        navigate('/verify-email');
      }
    } catch (error) {
      let errorMessage = error.message || 'An unexpected error occurred';
      
      if (errorMessage.includes('Server error')) {
        errorMessage = 'Our servers are currently experiencing issues. Please try again later.';
      } else if (errorMessage.includes('already exists')) {
        errorMessage = 'An account with this email already exists.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'The server encountered an error processing your request.';
      }
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };
  
  // Password strength indicators
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    return strength;
  };
  
  const passwordStrength = getPasswordStrength(formData.password);
  
  const getStrengthColor = (strength) => {
    if (strength < 50) return 'red.400';
    if (strength < 75) return 'yellow.400';
    return 'green.400';
  };
  
  const getStrengthText = (strength) => {
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Medium';
    return 'Strong';
  };
  
  const passwordCriteria = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'At least 1 uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'At least 1 number', met: /[0-9]/.test(formData.password) },
    { text: 'At least 1 special character', met: /[^A-Za-z0-9]/.test(formData.password) }
  ];
  
  return (
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
      {/* Left sidebar with branding and benefits */}
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
            Welcome to Neon
          </Heading>
          <Text fontSize="lg" opacity="0.9" maxW="400px">
            The serverless Postgres database with a generous free tier
          </Text>
          
          <VStack spacing={6} mt={10} align="start" maxW="400px">
            {[
              'Unlimited branches for development and testing',
              'Autoscaling compute that scales to zero',
              'Pay only for what you use with per-second billing',
              'Built-in web SQL editor and connection pooling'
            ].map((benefit, i) => (
              <HStack key={i} spacing={3}>
                <Icon as={FiCheck} color="pink.200" boxSize={5} />
                <Text>{benefit}</Text>
              </HStack>
            ))}
          </VStack>
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
          maxW="500px" 
          mx="auto"
          py={{ base: 6, md: 12 }}
          px={{ base: 6, md: 8 }}
          bg={bgColor}
          borderRadius="xl"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          {/* Progress indicator */}
          <Box mb={8}>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium" color={formStep >= 0 ? accentColor : subtleTextColor}>
                Personal Info
              </Text>
              <Text fontSize="sm" fontWeight="medium" color={formStep >= 1 ? accentColor : subtleTextColor}>
                Account Setup
              </Text>
            </HStack>
            <Progress 
              value={formStep === 0 ? 50 : 100} 
              size="sm" 
              colorScheme="purple" 
              borderRadius="full" 
              bg={inputBg}
            />
          </Box>
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              <Box textAlign="center" mb={4}>
                <Heading size="lg" fontWeight="bold" bgGradient="linear(to-r, purple.500, pink.500, blue.500)" bgClip="text">
                  {formStep === 0 ? 'Create your account' : 'Complete your profile'}
                </Heading>
                <Text mt={2} color={subtleTextColor}>
                  {formStep === 0 
                    ? 'Start your journey with Neon Postgres' 
                    : 'Just a few more details to get started'}
                </Text>
              </Box>
              
              {/* Step 1: Personal Information */}
              <ScaleFade in={formStep === 0} initialScale={0.9}>
                <Stack spacing={5} display={formStep === 0 ? 'flex' : 'none'}>
                  <HStack spacing={4}>
                    <FormControl isInvalid={errors.firstName}>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        bg={inputBg}
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        size="lg"
                        borderRadius="md"
                      />
                      <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={errors.lastName}>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        bg={inputBg}
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        size="lg"
                        borderRadius="md"
                      />
                      <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                    </FormControl>
                  </HStack>
                  
                  <FormControl isInvalid={errors.email}>
                    <FormLabel>Email address</FormLabel>
                    <InputGroup>
                      <Input
                        bg={inputBg}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleEmailChange}
                        placeholder="john.doe@example.com"
                        size="lg"
                        borderRadius="md"
                      />
                      {emailValidating && (
                        <InputRightElement>
                          <Spinner size="sm" color="blue.500" />
                        </InputRightElement>
                      )}
                    </InputGroup>
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>
                  
                  <Button
                    mt={4}
                    size="lg"
                    colorScheme="purple"
                    onClick={nextStep}
                    isDisabled={!formData.firstName || !formData.lastName || !formData.email}
                    w="full"
                    bgGradient={buttonGradient}
                    _hover={{
                      bgGradient: buttonHoverGradient,
                    }}
                  >
                    Continue
                  </Button>
                </Stack>
              </ScaleFade>
              
              {/* Step 2: Account Setup */}
              <ScaleFade in={formStep === 1} initialScale={0.9}>
                <Stack spacing={5} display={formStep === 1 ? 'flex' : 'none'}>
                  <FormControl isInvalid={errors.companyName}>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                      bg={inputBg}
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Acme Inc."
                      size="lg"
                      borderRadius="md"
                    />
                    <FormErrorMessage>{errors.companyName}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.password}>
                    <FormLabel>Password</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        bg={inputBg}
                        pr="4.5rem"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        borderRadius="md"
                      />
                      <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={toggleShowPassword}>
                          <Icon as={showPassword ? FiEyeOff : FiEye} />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                    
                    {/* Password strength meter */}
                    {formData.password && (
                      <Box mt={2}>
                        <Flex align="center" justify="space-between" mb={1}>
                          <Progress
                            value={passwordStrength}
                            size="xs"
                            colorScheme={passwordStrength < 50 ? 'red' : 
                                        passwordStrength < 75 ? 'yellow' : 'green'}
                            flex="1"
                            borderRadius="full"
                            bg={inputBg}
                          />
                          <Text fontSize="xs" ml={2} color={getStrengthColor(passwordStrength)}>
                            {getStrengthText(passwordStrength)}
                          </Text>
                        </Flex>
                        
                        <VStack align="start" spacing={0} mt={2}>
                          {passwordCriteria.map((criterion, index) => (
                            <HStack key={index} spacing={1}>
                              <Icon
                                as={criterion.met ? FiCheck : FiX}
                                color={criterion.met ? 'green.400' : 'gray.400'}
                                boxSize={3}
                              />
                              <Text fontSize="xs" color={criterion.met ? 'green.400' : 'gray.400'}>
                                {criterion.text}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={errors.confirmPassword}>
                    <FormLabel>Confirm Password</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        bg={inputBg}
                        pr="4.5rem"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        borderRadius="md"
                      />
                      <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={toggleShowConfirmPassword}>
                          <Icon as={showConfirmPassword ? FiEyeOff : FiEye} />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.agreeToTerms}>
                    <Checkbox
                      name="agreeToTerms"
                      isChecked={formData.agreeToTerms}
                      onChange={handleChange}
                      colorScheme="purple"
                      size="md"
                    >
                      <Text fontSize="sm">
                        I agree to the <Link color={accentColor} href="#" textDecoration="underline">Terms of Service</Link> and <Link color={accentColor} href="#" textDecoration="underline">Privacy Policy</Link>
                      </Text>
                    </Checkbox>
                    <FormErrorMessage>{errors.agreeToTerms}</FormErrorMessage>
                  </FormControl>
                  
                  <HStack spacing={4} mt={4}>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={prevStep}
                      flex="1"
                      borderRadius="md"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      colorScheme="purple"
                      isLoading={loading}
                      loadingText="Creating Account"
                      flex="2"
                      bgGradient={buttonGradient}
                      _hover={{
                        bgGradient: buttonHoverGradient,
                      }}
                    >
                      Create Account
                    </Button>
                  </HStack>
                </Stack>
              </ScaleFade>
            </Stack>
          </form>
          
          <Divider my={6} />
          
          <HStack justify="center" spacing={1}>
            <Text fontSize="sm" color={subtleTextColor}>Already have an account?</Text>
            <Link as={RouterLink} to="/login" color={accentColor} fontWeight="medium" fontSize="sm">
              Sign in
            </Link>
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Register; 