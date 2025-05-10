import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  Heading,
  Text,
  VStack,
  Link,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token from URL query parameters
  const [token, setToken] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('purple.500', 'purple.300');
  
  // Get token from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [location.search]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await resetPassword(token, formData.password);
      
      if (result.success) {
        setIsSuccess(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again later.');
    } finally {
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
            <Heading as="h1" size="xl" mb={2}>
              Reset Your Password
            </Heading>
            <Text color="gray.600">
              {!isSuccess 
                ? "Enter your new password below."
                : "Your password has been successfully reset!"}
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
          
          {isSuccess ? (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Your password has been reset successfully. You will be redirected to the login page shortly.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            !error && token && (
              <Box as="form" onSubmit={handleSubmit} w="full">
                <VStack spacing={4}>
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel>New Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        size="lg"
                      />
                      <InputRightElement>
                        <Button 
                          size="sm" 
                          onClick={toggleShowPassword}
                          bg="transparent"
                          _hover={{ bg: 'transparent' }}
                        >
                          <Icon as={showPassword ? FiEyeOff : FiEye} />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                    
                    {/* Password strength meter */}
                    {formData.password && (
                      <Box mt={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Progress
                            value={passwordStrength}
                            size="xs"
                            colorScheme={
                              passwordStrength < 50 ? 'red' : 
                              passwordStrength < 75 ? 'yellow' : 'green'
                            }
                            flex="1"
                            borderRadius="full"
                          />
                          <Text fontSize="xs" ml={2} color={getStrengthColor(passwordStrength)}>
                            {getStrengthText(passwordStrength)}
                          </Text>
                        </Box>
                        
                        <VStack align="start" spacing={1} mt={1}>
                          {passwordCriteria.map((criterion, index) => (
                            <Box key={index} display="flex" alignItems="center">
                              <Icon
                                as={criterion.met ? FiCheck : FiX}
                                color={criterion.met ? 'green.500' : 'gray.400'}
                                mr={2}
                                boxSize={3}
                              />
                              <Text fontSize="xs" color={criterion.met ? 'green.500' : 'gray.500'}>
                                {criterion.text}
                              </Text>
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel>Confirm New Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        size="lg"
                      />
                      <InputRightElement>
                        <Button 
                          size="sm" 
                          onClick={toggleShowConfirmPassword}
                          bg="transparent"
                          _hover={{ bg: 'transparent' }}
                        >
                          <Icon as={showConfirmPassword ? FiEyeOff : FiEye} />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="purple"
                    size="lg"
                    w="full"
                    mt={4}
                    isLoading={loading}
                    loadingText="Resetting"
                  >
                    Reset Password
                  </Button>
                </VStack>
              </Box>
            )
          )}
          
          <Box textAlign="center" w="full" pt={4}>
            <Text fontSize="sm">
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

export default ResetPassword; 