import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Link,
  HStack,
  Divider,
  Flex,
  useColorModeValue,
  Icon,
  PinInput,
  PinInputField,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Code,
  Collapse,
  useDisclosure,
  Badge,
  Image
} from '@chakra-ui/react';
import { FiCheck, FiMail, FiLock, FiAlertTriangle, FiInfo } from 'react-icons/fi';

// Demo verification code for testing when API is not available
const DEMO_VERIFICATION_CODE = '123456';

const VerifyEmail = () => {
  const { verifyEmail, sendVerificationEmail, currentUser, emailVerified, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [status, setStatus] = useState({
    type: 'info',
    message: 'Please enter the verification code sent to your email.'
  });
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { isOpen: isHelpOpen, onToggle: onHelpToggle } = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const pinInputRef = useRef(null);
  const toast = useToast();
  
  // Theme colors (matching the Register page)
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('purple.500', 'purple.300');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtleTextColor = useColorModeValue('gray.600', 'gray.400');
  const sidebarBg = useColorModeValue('linear(to-br, purple.500, pink.400)', 'linear(to-br, purple.600, pink.500)');
  const formBgGradient = useColorModeValue(
    'linear(to-br, white, purple.50, blue.50)',
    'linear(to-br, gray.900, purple.900)'
  );
  const buttonGradient = useColorModeValue(
    'linear(to-r, purple.400, pink.400, blue.400)',
    'linear(to-r, purple.500, pink.500, blue.500)'
  );
  const buttonHoverGradient = useColorModeValue(
    'linear(to-r, purple.500, pink.500, blue.500)',
    'linear(to-r, purple.600, pink.600, blue.600)'
  );
  const pinBg = useColorModeValue('white', 'gray.700');
  const pinActiveBg = useColorModeValue('purple.50', 'gray.600');
  const alertBg = useColorModeValue('yellow.50', 'yellow.900');
  const demoBg = useColorModeValue('blue.50', 'blue.900');
  
  // Add shimmer effect to the sidebar
  const [shimmerPosition, setShimmerPosition] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerPosition(prev => (prev + 1) % 200);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // Auto-send verification code on component mount if user is logged in
  useEffect(() => {
    if (currentUser && !emailVerified) {
      handleSendVerificationCode();
    }
  }, [currentUser, emailVerified]);
  
  // Handle verification code submission
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit verification code');
      return;
    }
    
    setOtpError('');
    setVerifying(true);
    
    try {
      // In demo mode, just check against the demo code
      if (isDemoMode && otpCode === DEMO_VERIFICATION_CODE) {
        // Set localStorage flag to ensure AuthContext knows about verification
        localStorage.setItem('neon_email_verified', 'true');
        
        setStatus({
          type: 'success',
          message: 'Your email has been verified successfully in demo mode!'
        });
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
        return;
      }
      
      // Regular verification flow - call API
      const result = await verifyEmail(otpCode);
      
      if (result.success) {
        // Set localStorage flag to ensure AuthContext knows about verification
        localStorage.setItem('neon_email_verified', 'true');
        
        setStatus({
          type: 'success',
          message: 'Your email has been verified successfully!'
        });
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Invalid verification code. Please try again.'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus({
        type: 'error',
        message: error.message || 'An error occurred during email verification.'
      });
    } finally {
      setVerifying(false);
    }
  };
  
  // Handle sending verification code
  const handleSendVerificationCode = async () => {
    try {
      setLoading(true);
      
      // If we're already in demo mode, just simulate sending
      if (isDemoMode) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus({
          type: 'info',
          message: 'Demo mode: Use code 123456 to verify your email'
        });
        
        // Focus on the first PIN input field
        if (pinInputRef.current) {
          setTimeout(() => {
            pinInputRef.current.focus();
          }, 100);
        }
        
        setLoading(false);
        return;
      }
      
      // Regular API call
      const result = await sendVerificationEmail();
      
      if (result.success) {
        // Check if demo mode was auto-enabled due to email server issues
        if (result.demoMode && result.autoEnabled) {
          setIsDemoMode(true);
          localStorage.setItem('neon_demo_mode', 'true');
          
          toast({
            title: "Email delivery issue",
            description: "The verification email couldn't be sent. We've automatically enabled demo mode for testing.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          
          setStatus({
            type: 'info',
            message: 'Demo mode activated: Use code 123456 to verify your email'
          });
        } else if (result.demoMode) {
          setStatus({
            type: 'info',
            message: 'Demo mode: Use code 123456 to verify your email'
          });
        } else {
        setStatus({
          type: 'info',
          message: 'A new verification code has been sent to your email.'
        });
        }
        
        // Focus on the first PIN input field
        if (pinInputRef.current) {
          setTimeout(() => {
            pinInputRef.current.focus();
          }, 100);
        }
      } else {
        // Show error and offer demo mode
        setStatus({
          type: 'error',
          message: result.error || 'Failed to send verification code. Try using demo mode below.'
        });
        
        toast({
          title: "Email delivery issue",
          description: "The verification email couldn't be sent. You can try the demo mode to test the system.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setStatus({
        type: 'error',
        message: error.message || 'An error occurred while sending the verification code.'
      });
      
      toast({
        title: "Email delivery failed",
        description: "We couldn't send the verification email. Please try the demo mode below.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle demo mode
  const toggleDemoMode = () => {
    const newDemoMode = !isDemoMode;
    setIsDemoMode(newDemoMode);
    
    // Store demo mode in localStorage so AuthContext can access it
    localStorage.setItem('neon_demo_mode', newDemoMode.toString());
    
    if (newDemoMode) {
      setStatus({
        type: 'info',
        message: 'Demo mode activated. Use code 123456 to verify your email.'
      });
      
      toast({
        title: "Demo Mode Activated",
        description: "Use the code 123456 for testing the verification process.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } else {
      localStorage.removeItem('neon_demo_mode');
    }
  };
  
  // Load demo mode from localStorage on component mount
  useEffect(() => {
    const savedDemoMode = localStorage.getItem('neon_demo_mode') === 'true';
    if (savedDemoMode) {
      setIsDemoMode(true);
      setStatus({
        type: 'info',
        message: 'Demo mode active. Use code 123456 to verify your email.'
      });
    }
  }, []);
  
  // Handle OTP change
  const handleOtpChange = (value) => {
    setOtpCode(value);
    if (otpError) {
      setOtpError('');
    }
  };
  
  // Fill demo code
  const fillDemoCode = () => {
    setOtpCode(DEMO_VERIFICATION_CODE);
  };
  
  // Debug/force verification function
  const forceVerification = useCallback(async () => {
    try {
      setLoading(true);
      
      // Direct access to localStorage to force verification state
      localStorage.setItem('neon_email_verified', 'true');
      
      // Show verification success message
      setStatus({
        type: 'success',
        message: 'Verification forced successfully! Redirecting to dashboard...'
      });
      
      toast({
        title: "Verification Forced",
        description: "You've been verified through the debug mode. Redirecting to dashboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Reload the page after a short delay to apply the verification
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error in force verification:', error);
      setStatus({
        type: 'error',
        message: 'Failed to force verification. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // If user is already verified
  if (emailVerified) {
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
            {/* Logo */}
            <Box mb={6}>
              <Image 
                src="/images/symbo+text-logo.png" 
                alt="Neon Logo" 
                maxW="180px" 
                width="100%"
                mx="auto"
              />
            </Box>
            
            <Heading size="xl" fontWeight="bold" mb={2} bgGradient="linear(to-r, pink.100, purple.100, blue.100)" bgClip="text">
              Email Verified
            </Heading>
            <Text fontSize="lg" opacity="0.9" maxW="400px">
              You can now access all features of Neon Postgres
            </Text>
            
            <VStack spacing={6} mt={10} align="center" maxW="400px">
              <Icon as={FiCheck} color="green.300" boxSize={20} />
              <Text fontSize="xl">Your account has been successfully verified</Text>
            </VStack>
          </VStack>
        </Box>
        
        {/* Right side with content */}
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
            textAlign="center"
          >
            <VStack spacing={8}>
              <Heading size="lg" fontWeight="bold" bgGradient="linear(to-r, purple.500, pink.500, blue.500)" bgClip="text">
                Email Verified!
              </Heading>
              
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <AlertDescription>Your email has already been verified.</AlertDescription>
              </Alert>
              
              <Button 
                size="lg"
                bgGradient={buttonGradient}
                _hover={{
                  bgGradient: buttonHoverGradient,
                }}
                color="white"
                width="full"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </VStack>
          </Box>
        </Flex>
      </Flex>
    );
  }
  
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
          {/* Logo */}
          <Box mb={6}>
            <Image 
              src="/images/symbo+text-logo.png" 
              alt="Neon Logo" 
              maxW="180px" 
              width="100%"
              mx="auto"
            />
          </Box>
          
          <Heading size="xl" fontWeight="bold" mb={2} bgGradient="linear(to-r, pink.100, purple.100, blue.100)" bgClip="text">
            Verify Your Email
          </Heading>
          <Text fontSize="lg" opacity="0.9" maxW="400px">
            Enter the verification code sent to your email
          </Text>
          
          <VStack spacing={6} mt={10} align="center" maxW="400px">
            <Icon as={FiLock} color="pink.200" boxSize={20} />
            <Text fontSize="lg">We've sent a 6-digit code to your email</Text>
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
          <VStack spacing={6}>
            <Heading size="lg" fontWeight="bold" bgGradient="linear(to-r, purple.500, pink.500, blue.500)" bgClip="text">
              Email Verification
            </Heading>
            
            {isDemoMode && (
              <Alert status="info" variant="left-accent" borderRadius="md" bg={demoBg}>
                <AlertIcon />
                <Box>
                  <AlertTitle>Demo Mode Active</AlertTitle>
                  <AlertDescription display="block">
                    Use verification code: <Code fontWeight="bold" fontSize="md">{DEMO_VERIFICATION_CODE}</Code>
                    <Button 
                      size="xs" 
                      ml={2} 
                      colorScheme="blue" 
                      onClick={fillDemoCode}
                    >
                      Fill
                    </Button>
                  </AlertDescription>
                </Box>
              </Alert>
            )}
            
            {loading || verifying ? (
              <VStack spacing={4} py={8}>
                <Spinner size="xl" color="purple.500" thickness="4px" />
                <Text color={textColor}>
                  {loading ? 'Sending verification code...' : 'Verifying your code...'}
                </Text>
              </VStack>
            ) : (
              <Alert status={status.type} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>{status.type === 'success' ? 'Success!' : status.type === 'error' ? 'Error!' : status.type === 'warning' ? 'Warning!' : 'Info'}</AlertTitle>
                  <AlertDescription>{status.message}</AlertDescription>
                </Box>
              </Alert>
            )}
            
            {!loading && !verifying && status.type !== 'success' && (
              <VStack spacing={6} width="100%" pt={2}>
                <Text color={textColor}>
                  {currentUser ? (
                    `We've sent a verification code to ${currentUser.email}`
                  ) : (
                    'Please verify your email address to continue'
                  )}
                </Text>
                
                <FormControl isInvalid={!!otpError}>
                  <FormLabel fontSize="sm" fontWeight="medium" color={textColor}>
                    Enter 6-digit verification code:
                  </FormLabel>
                  <HStack spacing={2} justify="center" mt={2}>
                    <PinInput 
                      size="lg" 
                      value={otpCode}
                      onChange={handleOtpChange}
                      otp
                      isInvalid={!!otpError}
                      colorScheme="purple"
                    >
                      <PinInputField 
                        ref={pinInputRef}
                        bg={pinBg}
                        borderColor={borderColor}
                        _focus={{
                          borderColor: accentColor,
                          bg: pinActiveBg
                        }}
                      />
                      <PinInputField 
                        bg={pinBg}
                        borderColor={borderColor}
                        _focus={{
                          borderColor: accentColor,
                          bg: pinActiveBg
                        }}
                      />
                      <PinInputField 
                        bg={pinBg}
                        borderColor={borderColor}
                        _focus={{
                          borderColor: accentColor,
                          bg: pinActiveBg
                        }}
                      />
                      <PinInputField 
                        bg={pinBg}
                        borderColor={borderColor}
                        _focus={{
                          borderColor: accentColor,
                          bg: pinActiveBg
                        }}
                      />
                      <PinInputField 
                        bg={pinBg}
                        borderColor={borderColor}
                        _focus={{
                          borderColor: accentColor,
                          bg: pinActiveBg
                        }}
                      />
                      <PinInputField 
                        bg={pinBg}
                        borderColor={borderColor}
                        _focus={{
                          borderColor: accentColor,
                          bg: pinActiveBg
                        }}
                      />
                    </PinInput>
                  </HStack>
                  {otpError && <FormErrorMessage textAlign="center">{otpError}</FormErrorMessage>}
                </FormControl>
                
                <HStack spacing={4} width="full">
                  <Button 
                    size="lg"
                    bgGradient={buttonGradient}
                    _hover={{
                      bgGradient: buttonHoverGradient,
                    }}
                    color="white"
                    onClick={handleVerifyOtp}
                    isDisabled={!otpCode || otpCode.length !== 6}
                    width="full"
                  >
                    Verify Code
                  </Button>
                </HStack>
                
                <Text fontSize="sm" color={subtleTextColor}>
                  Didn't receive the code?{' '}
                  <Button 
                    variant="link" 
                    colorScheme="purple"
                    fontSize="sm"
                    onClick={handleSendVerificationCode}
                    isDisabled={loading}
                    fontWeight="semibold"
                  >
                    Resend Code
                  </Button>
                </Text>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  colorScheme={isDemoMode ? "blue" : "gray"}
                  onClick={toggleDemoMode}
                  leftIcon={<Icon as={FiInfo} />}
                >
                  {isDemoMode ? "Disable Demo Mode" : "Enable Demo Mode"}
                </Button>
                
                <Button
                  size="sm"
                  variant="link"
                  onClick={onHelpToggle}
                  leftIcon={<Icon as={FiAlertTriangle} />}
                  color={subtleTextColor}
                >
                  Not receiving emails? Click for help
                </Button>
                
                <Collapse in={isHelpOpen} animateOpacity>
                  <Box 
                    p={4} 
                    borderRadius="md" 
                    bg={alertBg} 
                    borderWidth="1px" 
                    borderColor="yellow.200"
                    mt={2}
                  >
                    <VStack align="start" spacing={3}>
                      <Heading size="sm">Email Troubleshooting</Heading>
                      
                      <VStack align="start" spacing={2} fontSize="sm">
                        <Text><strong>1. Check your spam/junk folder</strong> - Verification emails sometimes get filtered</Text>
                        <Text><strong>2. Add our email to your contacts</strong> - Mark as "not spam" if found in spam folder</Text>
                        <Text><strong>3. Check email typos</strong> - Make sure your email address was entered correctly</Text>
                        <Text><strong>4. Use Demo Mode</strong> - If you're testing the system, use demo mode with code 123456</Text>
                        <Text><strong>5. Server issues</strong> - There might be a temporary email service problem</Text>
                      </VStack>
                      
                      <HStack pt={2}>
                        <Badge colorScheme="red">API Error</Badge>
                        <Text fontSize="xs">
                          Error connecting to email service. Enable demo mode to continue.
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </Collapse>
                
                <Divider my={2} />
                
                <HStack spacing={4} width="full">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                    width="50%"
                    size="lg"
                    colorScheme="purple"
                  >
                    Back to Dashboard
                  </Button>
                  
                  <Button 
                    colorScheme="red" 
                    variant="outline" 
                    onClick={logout}
                    width="50%"
                    size="lg"
                  >
                    Logout
                  </Button>
                </HStack>
                
                {/* Add debug option */}
                {isDemoMode && (
                  <Button 
                    mt={2}
                    size="sm"
                    colorScheme="orange"
                    variant="outline"
                    onClick={forceVerification}
                    width="full"
                    leftIcon={<Icon as={FiAlertTriangle} />}
                  >
                    Debug: Force Verification
                  </Button>
                )}
              </VStack>
            )}
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default VerifyEmail;
