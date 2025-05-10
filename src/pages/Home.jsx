import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
  Grid,
  GridItem,
  Badge,
  Image,
  IconButton,
  Avatar,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Progress,
  Input,
  Divider,
} from '@chakra-ui/react';
import { FaAws, FaGoogle, FaMicrosoft, FaApple, FaGithub, FaDatabase, FaLock, FaRocket, FaCode, FaChartLine, FaServer, FaCheck, FaArrowRight, FaChevronLeft, FaChevronRight, FaPlay, FaChartBar, FaUsers, FaQuoteLeft, FaStar, FaShieldAlt, FaCrown, FaTwitter, FaLinkedinIn, FaInstagram, FaFacebookF, FaYoutube, FaPaperPlane, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Trusted logos component
const TrustedLogos = () => (
  <HStack spacing={{ base: 8, md: 16 }} justify="center" flexWrap="wrap">
    <Box opacity={0.7} transition="opacity 0.2s" _hover={{ opacity: 1 }}>
      <Icon as={FaAws} boxSize={{ base: 6, md: 8 }} color="gray.500" />
    </Box>
    <Box opacity={0.7} transition="opacity 0.2s" _hover={{ opacity: 1 }}>
      <Icon as={FaGoogle} boxSize={{ base: 6, md: 8 }} color="gray.500" />
    </Box>
    <Box opacity={0.7} transition="opacity 0.2s" _hover={{ opacity: 1 }}>
      <Icon as={FaMicrosoft} boxSize={{ base: 6, md: 8 }} color="gray.500" />
    </Box>
    <Box opacity={0.7} transition="opacity 0.2s" _hover={{ opacity: 1 }}>
      <Icon as={FaApple} boxSize={{ base: 6, md: 8 }} color="gray.500" />
    </Box>
    <Box opacity={0.7} transition="opacity 0.2s" _hover={{ opacity: 1 }}>
      <Icon as={FaGithub} boxSize={{ base: 6, md: 8 }} color="gray.500" />
    </Box>
  </HStack>
);

// Illustration component - Figma-inspired design
const Illustration = () => (
  <Box w={{ base: '100%', md: '480px' }} h={{ base: '300px', md: '380px' }} position="relative" mt={{ base: 8, md: 0 }}>
    {/* Purple frame 1 */}
    <Box position="absolute" top="10%" left="5%" width="65%" height="55%" bg="purple.100" borderRadius="xl" boxShadow="md" zIndex={1}>
      {/* Rainbow corner */}
      <Box position="absolute" bottom="10%" left="10%" width="30%" height="30%">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path d="M0 100 A 100 100 0 0 1 100 0 L 100 100 Z" fill="#FEB2B2" />
          <path d="M15 100 A 85 85 0 0 1 100 15 L 100 100 Z" fill="#FEEBC8" />
          <path d="M30 100 A 70 70 0 0 1 100 30 L 100 100 Z" fill="#C6F6D5" />
          <path d="M45 100 A 55 55 0 0 1 100 45 L 100 100 Z" fill="#B2F5EA" />
          <path d="M60 100 A 40 40 0 0 1 100 60 L 100 100 Z" fill="#90CDF4" />
          <path d="M75 100 A 25 25 0 0 1 100 75 L 100 100 Z" fill="#D6BCFA" />
        </svg>
      </Box>
    </Box>
    
    {/* Blue frame */}
    <Box position="absolute" top="30%" right="5%" width="50%" height="65%" bg="blue.100" borderRadius="xl" boxShadow="md" zIndex={2}>
      {/* Grid pattern */}
      <Box position="absolute" top="15%" left="15%" width="70%" height="70%" opacity="0.5">
        <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#4299E1" strokeWidth="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </Box>
    </Box>
    
    {/* Green accent */}
    <Box position="absolute" bottom="15%" left="25%" width="25%" height="25%" bg="green.100" borderRadius="xl" boxShadow="md" zIndex={3} />
    
    {/* Orange circle */}
    <Box position="absolute" top="20%" left="40%" width="15%" height="15%" bg="orange.100" borderRadius="full" boxShadow="md" zIndex={4} />
  </Box>
);

// Project data for the showcase section
const projectsData = [
  {
    id: 1,
    title: 'AI Query Optimization at Scale',
    company: 'FinSight',
    testimonial: "NeonDB's AI query optimizer cut our analytics costs by 40% and made slow queries disappear overnight.",
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    person: 'Alex Kim',
    role: 'CTO',
    gradient: 'linear(to-br, blue.50, purple.50)',
    stats: {
      conversions: 99,
      engagement: 92,
      roi: 5.1
    }
  },
  {
    id: 2,
    title: 'Edge Sync for Global Apps',
    company: 'Shoply Cloud',
    testimonial: 'Edge sync made our e-commerce app 10x faster for users worldwide—no more latency complaints.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    person: 'Priya Desai',
    role: 'Lead Data Engineer',
    gradient: 'linear(to-br, green.50, blue.50)',
    icon: FaDatabase,
    stats: {
      conversions: 87,
      engagement: 95,
      roi: 4.7
    }
  },
  {
    id: 3,
    title: 'Blockchain Audit for Compliance',
    company: 'MedLedger',
    testimonial: "With blockchain-based audit logging, our healthcare compliance is bulletproof and fully transparent.",
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    person: 'Samuel Lee',
    role: 'Head of Security',
    gradient: 'linear(to-br, yellow.50, orange.50)',
    icon: FaUsers,
    stats: {
      conversions: 78,
      engagement: 88,
      roi: 4.3
    }
  },
  {
    id: 4,
    title: 'Serverless Triggers with AI Actions',
    company: 'AppNest',
    testimonial: "We automate onboarding, notifications, and more with serverless DB triggers—no backend code needed!",
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    person: 'Maria Gomez',
    role: 'VP Engineering',
    gradient: 'linear(to-br, pink.50, red.50)',
    icon: FaChartBar,
    stats: {
      conversions: 91,
      engagement: 90,
      roi: 5.0
    }
  }
];

// Main Home component
const Home = () => {
  // State for project showcase
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [visibleProjects, setVisibleProjects] = useState([0, 1]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProject, setSelectedProject] = useState(null);
  
  // State for pricing section
  const [annualBilling, setAnnualBilling] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  
  // Refs for animations
  const projectsRef = useRef(null);
  const pricingRef = useRef(null);
  
  // Auth and theme values
  const { isAuthenticated } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('purple.500', 'purple.300');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtleTextColor = useColorModeValue('gray.600', 'gray.400');
  const heroBgGradient = useColorModeValue('linear(to-br, purple.500, pink.400)', 'linear(to-br, purple.600, pink.500)');
  const inputBg = useColorModeValue('purple.50', 'gray.700');
  const buttonGradient = useColorModeValue('linear(to-r, purple.400, pink.400, blue.400)', 'linear(to-r, purple.500, pink.500, blue.500)');
  const buttonHoverGradient = useColorModeValue('linear(to-r, purple.500, pink.500, blue.500)', 'linear(to-r, purple.600, pink.600, blue.600)');
  const formBgGradient = useColorModeValue('linear(to-br, white, purple.50, blue.50)', 'linear(to-br, gray.900, purple.900)');
  const buttonBg = useColorModeValue('black', 'white');
  const buttonColor = useColorModeValue('white', 'black');
  
  // Pricing calculation with discount for annual billing
  const getPriceWithDiscount = (monthlyPrice) => {
    if (!annualBilling) return monthlyPrice;
    const annualPrice = monthlyPrice * 12 * 0.8; // 20% discount
    return (annualPrice / 12).toFixed(0);
  };
  
  // Handle project navigation
  const handlePrevProject = () => {
    setCurrentProjectIndex((prev) => {
      const newIndex = prev === 0 ? projectsData.length - 1 : prev - 1;
      updateVisibleProjects(newIndex);
      return newIndex;
    });
  };
  
  const handleNextProject = () => {
    setCurrentProjectIndex((prev) => {
      const newIndex = (prev + 1) % projectsData.length;
      updateVisibleProjects(newIndex);
      return newIndex;
    });
  };
  
  const updateVisibleProjects = (mainIndex) => {
    const nextIndex = (mainIndex + 1) % projectsData.length;
    setVisibleProjects([mainIndex, nextIndex]);
  };
  
  // Open project details modal
  const openProjectDetails = (project) => {
    setSelectedProject(project);
    onOpen();
  };

  return (
    <Box minH="100vh" bg={heroBgGradient}>
      {/* Navigation Header */}
      <Box borderBottom="1px solid" borderColor={useColorModeValue('gray.100', 'gray.800')}>
        <Container maxW="7xl">
          <Flex py={4} align="center" justify="space-between">
            {/* Logo */}
            <Flex align="center">
              <img src="/images/symbo+text-logo.png" alt="Apployd DB Logo" style={{ maxHeight: 32, marginRight: 8 }} />
            </Flex>
            
            {/* Navigation Links - Desktop */}
            <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
              <Box position="relative" _after={{
                content: '""',
                position: 'absolute',
                bottom: '-5px',
                left: 0,
                right: 0,
                height: '2px',
                bg: 'currentColor',
                borderRadius: 'full',
              }}>
                <Text fontWeight="medium">Products</Text>
              </Box>
              <Text fontWeight="medium">Solutions</Text>
              <Text fontWeight="medium">Community</Text>
              <Text fontWeight="medium">Resources</Text>
              <Text fontWeight="medium">Pricing</Text>
            </HStack>
            
            {/* Auth Buttons */}
            <HStack spacing={4}>
              <Text fontWeight="medium" display={{ base: 'none', md: 'block' }}>Contact sales</Text>
              <Button variant="outline" size="sm" rounded="md" fontWeight="medium">
                Log in
              </Button>
              <Button bg="black" color="white" size="sm" rounded="md" fontWeight="medium" _hover={{ bg: 'gray.800' }}>
                Get started for free
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
      
      <Container maxW="7xl" py={{ base: 12, md: 24 }}>
        <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" gap={{ base: 12, md: 10 }}>
          {/* Left: Headline, subheadline, CTA */}
          <VStack align="flex-start" spacing={{ base: 6, md: 8 }} maxW="lg" flex={1}>
            <Text fontSize="sm" fontWeight="bold" letterSpacing="widest" color="purple.400" textTransform="uppercase">
              Apployd DB for Modern Data
            </Text>
            <Heading 
              as="h1" 
              size="2xl" 
              fontWeight="extrabold" 
              letterSpacing="-0.04em" 
              color={textColor} 
              lineHeight="1.1"
            >
              Build beautiful, scalable serverless databases
            </Heading>
            <Text fontSize="lg" color={subtleTextColor} maxW="md">
              Apployd DB lets you branch, scale, and analyze Postgres instantly. Designed for the next generation of cloud apps.
            </Text>
            <Button
              as={RouterLink}
              to={isAuthenticated ? "/dashboard" : "/register"}
              size="md"
              height="48px"
              px={6}
              bgGradient={buttonGradient}
              _hover={{ bgGradient: buttonHoverGradient, opacity: 0.9 }}
              rounded="md"
              fontWeight="medium"
              transition="all 0.2s"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Try for free'}
            </Button>
          </VStack>

          {/* Right: Illustration */}
          <Box flex={1} display="flex" alignItems="center" justifyContent="center" w="full">
            <Illustration />
          </Box>
        </Flex>

        {/* Trusted by logos */}
        <VStack spacing={6} mt={{ base: 20, md: 32 }}>
          <Text fontSize="sm" color={subtleTextColor} letterSpacing="wide" fontWeight="medium" textAlign="center" textTransform="uppercase">
            TRUSTED BY TEAMS AT
          </Text>
          <TrustedLogos />
        </VStack>
        
        {/* Analytics Dashboard Section */}
        <Flex 
          direction="row"
          mt={20}
          mb={10}
          mx="auto"
          maxW="1200px"
          gap={8}
          flexWrap={{ base: "wrap", lg: "nowrap" }}
        >
          {/* Left Side Content */}
          <VStack align="flex-start" spacing={6} flex="1" minW={{ base: "100%", lg: "400px" }}>
            <Text 
              fontSize="sm" 
              fontWeight="bold" 
              letterSpacing="wide" 
              color="gray.500" 
              textTransform="uppercase"
            >
              YOUR ALL-IN-ONE SOLUTION
            </Text>
            
            <Heading 
              as="h2"
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="extrabold"
              lineHeight="1.1"
              letterSpacing="tight"
            >
              Streamline.<br />
              Scale. Succeed.
            </Heading>
            
            <Text fontSize="lg" color={subtleTextColor} lineHeight="tall">
              Apployd DB simplifies operations with intelligent automation and seamless integrations.
            </Text>
            
            <HStack spacing={6} pt={2}>
              <Flex align="center">
                <Flex 
                  w="18px" 
                  h="18px" 
                  bg="purple.500" 
                  justify="center" 
                  align="center" 
                  borderRadius="sm" 
                  mr={2}
                >
                  <Icon as={FaCheck} color="white" fontSize="10px" />
                </Flex>
                <Text fontWeight="medium">Hassle-Free Onboarding</Text>
              </Flex>
              
              <Flex align="center">
                <Flex 
                  w="18px" 
                  h="18px" 
                  bg="purple.500" 
                  justify="center" 
                  align="center" 
                  borderRadius="sm" 
                  mr={2}
                >
                  <Icon as={FaCheck} color="white" fontSize="10px" />
                </Flex>
                <Text fontWeight="medium">Data-Driven Insights</Text>
              </Flex>
            </HStack>
            
            <Button 
              mt={4}
              colorScheme="purple" 
              size="md" 
              px={6} 
              rightIcon={<Icon as={FaArrowRight} fontSize="12px" />}
            >
              Start your free trial
            </Button>
          </VStack>
          
          {/* Right Side Dashboard */}
          <Flex 
            flex="1.5" 
            bg="white" 
            borderRadius="lg" 
            boxShadow="xl" 
            overflow="hidden" 
            direction="column"
            position="relative"
            minW={{ base: "100%", lg: "600px" }}
          >
            {/* Floating elements */}
            <Image 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHJ4PSIxMCIgZmlsbD0iIzRGRDFDNSIvPjwvc3ZnPg==" 
              position="absolute"
              top="30px"
              right="40px"
              w="60px"
              h="60px"
              transform="rotate(15deg)"
              opacity="0.8"
              alt=""
            />
            
            <Image 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjRkY5Qzc0Ii8+PC9zdmc+" 
              position="absolute"
              bottom="60px"
              right="80px"
              w="40px"
              h="40px"
              transform="rotate(-10deg)"
              opacity="0.7"
              alt=""
            />
            
            <Image 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHJ4PSIxMCIgZmlsbD0iIzgwNUFENSIvPjwvc3ZnPg==" 
              position="absolute"
              bottom="40px"
              left="30px"
              w="50px"
              h="50px"
              transform="rotate(5deg)"
              opacity="0.6"
              alt=""
            />
            
            {/* Header */}
            <Flex p={6} align="center" justify="space-between">
              <Flex align="center">
                <Flex 
                  bg="green.50" 
                  p={2} 
                  borderRadius="md" 
                  mr={3}
                >
                  <Icon as={FaDatabase} color="green.500" boxSize={5} />
                </Flex>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Clandestine</Text>
                  <Text fontSize="sm" color="gray.500">Ads Marketing</Text>
                </VStack>
              </Flex>
              <Flex w="8px" h="8px" borderRadius="full" bg="green.400" />
            </Flex>
            
            {/* Stats Cards */}
            <Flex px={6} py={4} justify="space-between" wrap="wrap">
              <VStack align="start" mb={6} minW="150px">
                <Text fontSize="sm" color="gray.500">Total expenses</Text>
                <Heading size="lg">$25.4k</Heading>
                <Text fontSize="sm" color="red.500">-22% from last year</Text>
              </VStack>
              
              <VStack align="start" mb={6} minW="150px">
                <Text fontSize="sm" color="gray.500">Total revenue</Text>
                <Heading size="lg">$45.4k</Heading>
                <Text fontSize="sm" color="green.500">+14.5% from last year</Text>
              </VStack>
              
              <VStack align="start" mb={6} minW="150px">
                <Text fontSize="sm" color="gray.500">Total balance</Text>
                <Heading size="lg">$85.44k</Heading>
                <Text fontSize="sm" color="green.500">+14.5% from last year</Text>
              </VStack>
            </Flex>
            
            {/* Chart */}
            <Flex px={6} pb={6} h="220px" direction="column">
              {/* Chart visualization */}
              <Flex h="180px" align="flex-end" justify="space-between" mb={4}>
                {[
                  { month: 'Jan', height: 60, color: 'purple.400' },
                  { month: 'Feb', height: 80, color: 'purple.400' },
                  { month: 'Mar', height: 70, color: 'purple.400' },
                  { month: 'Apr', height: 90, color: 'green.400' },
                  { month: 'May', height: 75, color: 'purple.400' },
                  { month: 'Jun', height: 65, color: 'purple.400' },
                  { month: 'Jul', height: 95, color: 'green.400' },
                  { month: 'Aug', height: 55, color: 'purple.400' }
                ].map((item) => (
                  <VStack key={item.month} spacing={1} w="10%">
                    <Flex 
                      h={`${item.height}%`} 
                      w="70%" 
                      bg={item.color} 
                      borderTopRadius="md"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>{item.month}</Text>
                  </VStack>
                ))}
              </Flex>
              
              {/* Legend */}
              <Flex justify="center" gap={6}>
                <Flex align="center">
                  <Flex w="8px" h="8px" borderRadius="full" bg="purple.400" mr={2} />
                  <Text fontSize="xs">Net Income</Text>
                </Flex>
                <Flex align="center">
                  <Flex w="8px" h="8px" borderRadius="full" bg="green.400" mr={2} />
                  <Text fontSize="xs">High-revenue</Text>
                </Flex>
                <Flex align="center">
                  <Flex w="8px" h="8px" borderRadius="full" bg="gray.400" mr={2} />
                  <Text fontSize="xs">Gross Income</Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        
        {/* Workflow Features Section */}
        <section className="features-section" style={{ padding: "5rem 0", background: useColorModeValue('gray.50', 'gray.800') }}>
          <Container maxW="7xl">
            {/* Section Header */}
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "end" }} mb={16}>
              <div>
                <Text 
                  fontSize="sm" 
                  fontWeight="semibold" 
                  color="purple.600" 
                  mb={3}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  NEXT-GEN FEATURES
                </Text>
                <Heading 
                  as="h2" 
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                  fontWeight="medium"
                  lineHeight="1.2"
                  letterSpacing="tight"
                >
                  Smarter Workflows,<br />
                  Maximum Efficiency.
                </Heading>
              </div>
              
              <div style={{ marginTop: { base: "1.5rem", md: 0 } }}>
                <Text color={subtleTextColor} fontSize="lg">
                  We're provide Automate tasks, gain insights, and<br />
                  collaborate seamlessly—all in one place.
                </Text>
                <Button
                  mt={4}
                  colorScheme="purple"
                  size="md"
                  rightIcon={<Icon as={FaArrowRight} fontSize="sm" />}
                >
                  Explore Features
                </Button>
              </div>
            </Flex>
            
            {/* Feature Cards */}
            <Grid 
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} 
              gap={8}
            >
              {/* Card 1: AI-Powered Query Optimization */}
              <div className="feature-card" style={{ 
                background: "white", 
                borderRadius: "0.5rem", 
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                padding: "1.5rem",
                transition: "all 0.3s"
              }}>
                <Heading as="h3" fontSize="2xl" fontWeight="semibold" mb={3}>
                  AI-Powered Query Optimization
                </Heading>
                <Text color={subtleTextColor} mb={4}>
                  Automate repetitive tasks and focus on high-impact work.
                </Text>
                <Button 
                  variant="link" 
                  colorScheme="purple" 
                  rightIcon={<Icon as={FaArrowRight} fontSize="xs" />}
                >
                  Learn more
                </Button>
                
                <div style={{ 
                  marginTop: "1.5rem", 
                  paddingTop: "1.5rem", 
                  borderTop: "1px solid", 
                  borderColor: "gray.100" 
                }}>
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Automation Time Saved
                  </Text>
                  <Heading fontSize="2xl" fontWeight="semibold">
                    2m 03s - 3m 22s
                  </Heading>
                  <Text fontSize="sm" color="green.500" mb={4}>
                    +2.5% from last year
                  </Text>
                  
                  {/* Task Items */}
                  <Flex direction="column" gap={3}>
                    <Flex align="center" p={2} bg="blue.50" borderRadius="md">
                      <Flex 
                        w="24px" 
                        h="24px" 
                        bg="blue.100" 
                        borderRadius="full" 
                        justify="center" 
                        align="center"
                        mr={3}
                      >
                        <Text fontSize="xs" fontWeight="bold">1</Text>
                      </Flex>
                      <Text fontSize="sm">New Request Received</Text>
                    </Flex>
                    
                    <Flex align="center" p={2} bg="purple.50" borderRadius="md">
                      <Flex 
                        w="24px" 
                        h="24px" 
                        bg="purple.100" 
                        borderRadius="full" 
                        justify="center" 
                        align="center"
                        mr={3}
                      >
                        <Text fontSize="xs" fontWeight="bold">2</Text>
                      </Flex>
                      <Text fontSize="sm">Add Admin to Assign Task</Text>
                    </Flex>
                  </Flex>
                </div>
              </div>
              
              {/* Card 2: Insights & Analytics */}
              <div className="feature-card" style={{ 
                background: "white", 
                borderRadius: "0.5rem", 
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                padding: "1.5rem",
                transition: "all 0.3s"
              }}>
                <Heading as="h3" fontSize="2xl" fontWeight="semibold" mb={3}>
                  Insights & Analytics
                </Heading>
                <Text color={subtleTextColor} mb={4}>
                  Make data-driven decisions with real-time, actionable analytics.
                </Text>
                <Button 
                  variant="link" 
                  colorScheme="purple" 
                  rightIcon={<Icon as={FaArrowRight} fontSize="xs" />}
                >
                  Learn more
                </Button>
                
                <div style={{ 
                  marginTop: "1.5rem", 
                  paddingTop: "1.5rem", 
                  borderTop: "1px solid", 
                  borderColor: "gray.100" 
                }}>
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Insights Support Time
                  </Text>
                  <Flex justify="space-between" align="baseline" mb={6}>
                    <div>
                      <Heading fontSize="2xl" fontWeight="semibold">
                        12.76% - 25%
                      </Heading>
                      <Text fontSize="sm" color="red.500">
                        -3.5% from last year
                      </Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Heading fontSize="2xl" fontWeight="semibold">
                        5m 30s
                      </Heading>
                      <Text fontSize="sm" color="green.500">
                        +15.8% from last year
                      </Text>
                    </div>
                  </Flex>
                  
                  {/* Simple Bar Chart */}
                  <div style={{ height: "100px" }}>
                    <Flex h="full" align="flex-end" justify="space-between">
                      {[12, 18, 15, 25, 20, 30, 22, 35, 28, 40].map((height, i) => (
                        <div 
                          key={i} 
                          style={{ 
                            height: `${height * 2}px`,
                            width: "8%",
                            background: i === 6 ? "#805AD5" : "#D6BCFA",
                            borderTopLeftRadius: "2px",
                            borderTopRightRadius: "2px"
                          }}
                        />
                      ))}
                    </Flex>
                    <Flex justify="space-between" mt={2}>
                      <Text fontSize="xs" color="gray.500">Min: 12.33%</Text>
                      <Text fontSize="xs" color="gray.500">Max: 22.05%</Text>
                    </Flex>
                  </div>
                </div>
              </div>
              
              {/* Card 3: Workflow Automation */}
              <div className="feature-card" style={{ 
                background: "white", 
                borderRadius: "0.5rem", 
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                padding: "1.5rem",
                transition: "all 0.3s"
              }}>
                <Heading as="h3" fontSize="2xl" fontWeight="semibold" mb={3}>
                  Workflow Automation
                </Heading>
                <Text color={subtleTextColor} mb={4}>
                  Streamline processes, eliminate manual work, and accelerate productivity.
                </Text>
                <Button 
                  variant="link" 
                  colorScheme="purple" 
                  rightIcon={<Icon as={FaArrowRight} fontSize="xs" />}
                >
                  Learn more
                </Button>
                
                <div style={{ 
                  marginTop: "1.5rem", 
                  paddingTop: "1.5rem", 
                  borderTop: "1px solid", 
                  borderColor: "gray.100" 
                }}>
                  <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    {/* Stat 1 */}
                    <div>
                      <Flex align="center" mb={2}>
                        <div style={{ 
                          width: "36px", 
                          height: "36px", 
                          borderRadius: "50%", 
                          background: "#FEEBC8", 
                          marginRight: "0.5rem",
                          overflow: "hidden",
                          position: "relative"
                        }}>
                          <div style={{ 
                            width: "100%", 
                            height: "100%", 
                            background: "#ED8936", 
                            borderRadius: "50%", 
                            opacity: "0.8"
                          }} />
                        </div>
                        <Text fontSize="xs" color="gray.500">Check-in</Text>
                      </Flex>
                      <Heading fontSize="2xl" fontWeight="semibold">50K+</Heading>
                      <Text fontSize="xs" color="green.500">+4.5% from last year</Text>
                    </div>
                    
                    {/* Stat 2 */}
                    <div>
                      <Flex align="center" mb={2}>
                        <div style={{ 
                          width: "36px", 
                          height: "36px", 
                          borderRadius: "50%", 
                          background: "#BEE3F8", 
                          marginRight: "0.5rem",
                          overflow: "hidden",
                          position: "relative"
                        }}>
                          <div style={{ 
                            width: "100%", 
                            height: "100%", 
                            background: "#3182CE", 
                            borderRadius: "50%", 
                            opacity: "0.8"
                          }} />
                        </div>
                        <Text fontSize="xs" color="gray.500">Meeting Summary</Text>
                      </Flex>
                      <Heading fontSize="2xl" fontWeight="semibold">98%</Heading>
                      <Text fontSize="xs" color="green.500">+2.3% from last year</Text>
                    </div>
                    
                    {/* Stat 3 */}
                    <div>
                      <Flex align="center" mb={2}>
                        <div style={{ 
                          width: "36px", 
                          height: "36px", 
                          borderRadius: "50%", 
                          background: "#E9D8FD", 
                          marginRight: "0.5rem",
                          overflow: "hidden",
                          position: "relative"
                        }}>
                          <div style={{ 
                            width: "100%", 
                            height: "100%", 
                            background: "#805AD5", 
                            borderRadius: "50%", 
                            opacity: "0.8"
                          }} />
                        </div>
                        <Text fontSize="xs" color="gray.500">Deliverables</Text>
                      </Flex>
                      <Heading fontSize="2xl" fontWeight="semibold">30%</Heading>
                      <Text fontSize="xs" color="green.500">+6.8% from last year</Text>
                    </div>
                    
                    {/* Stat 4 */}
                    <div>
                      <Flex align="center" mb={2}>
                        <div style={{ 
                          width: "36px", 
                          height: "36px", 
                          borderRadius: "50%", 
                          background: "#C6F6D5", 
                          marginRight: "0.5rem",
                          overflow: "hidden",
                          position: "relative"
                        }}>
                          <div style={{ 
                            width: "100%", 
                            height: "100%", 
                            background: "#38A169", 
                            borderRadius: "50%", 
                            opacity: "0.8"
                          }} />
                        </div>
                        <Text fontSize="xs" color="gray.500">Meeting Summary</Text>
                      </Flex>
                      <Heading fontSize="2xl" fontWeight="semibold">2.8k+</Heading>
                      <Text fontSize="xs" color="green.500">+3.2% from last year</Text>
                    </div>
                  </Grid>
                </div>
              </div>
            </Grid>
          </Container>
        </section>
        
      </Container>
      
      {/* Pricing and Testimonials Section */}
      <Box
        as="section"
        py={20}
        bg={useColorModeValue('gray.50', 'gray.800')}
        ref={pricingRef}
      >
        <Container maxW="7xl">
          <Flex direction="column" align="center" mb={10}>
            <Badge colorScheme="purple" fontSize="sm" px={3} py={1} mb={3} borderRadius="full">
              Pricing & Plans
            </Badge>
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              textAlign="center"
              mb={4}
            >
              Choose the Perfect Plan for Your Business
            </Heading>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              textAlign="center"
              maxW="2xl"
              color={useColorModeValue('gray.600', 'gray.400')}
              mb={8}
            >
              Flexible pricing options designed to scale with your business needs. Start with our free tier and upgrade as you grow.
            </Text>
            
            {/* Billing Toggle */}
            <Flex 
              align="center" 
              bg={useColorModeValue('gray.100', 'gray.700')} 
              p={1} 
              borderRadius="full"
              position="relative"
              mb={10}
            >
              <Box 
                position="absolute" 
                h="85%" 
                w="48%" 
                bg={useColorModeValue('white', 'gray.600')} 
                borderRadius="full"
                left={annualBilling ? "50%" : "1%"}
                transition="left 0.2s ease"
                boxShadow="sm"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                borderRadius="full" 
                px={6} 
                py={5}
                onClick={() => setAnnualBilling(false)}
                color={!annualBilling ? "purple.500" : "gray.500"}
                fontWeight={!annualBilling ? "bold" : "medium"}
                zIndex={1}
              >
                Monthly
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                borderRadius="full" 
                px={6} 
                py={5}
                onClick={() => setAnnualBilling(true)}
                color={annualBilling ? "purple.500" : "gray.500"}
                fontWeight={annualBilling ? "bold" : "medium"}
                zIndex={1}
              >
                Annual
                <Badge ml={2} colorScheme="green" variant="solid" fontSize="xs">
                  Save 20%
                </Badge>
              </Button>
            </Flex>
          </Flex>
          
          {/* Pricing Tiers */}
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
            gap={8}
            mb={20}
          >
            {/* Starter Plan */}
            <Box
              borderWidth="1px"
              borderRadius="xl"
              overflow="hidden"
              bg={useColorModeValue('white', 'gray.700')}
              p={6}
              position="relative"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-8px)', boxShadow: 'xl' }}
              onMouseEnter={() => setHoveredPlan('starter')}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <Flex position="absolute" top={3} right={3}>
                <Icon as={FaShieldAlt} color="blue.400" />
              </Flex>
              
              <Flex direction="column" h="full">
                <Flex align="center" mb={2}>
                  <Text fontWeight="bold" fontSize="xl">Starter</Text>
                  <Icon as={FaStar} color="gray.400" ml={2} />
                </Flex>
                <Text color={useColorModeValue('gray.600', 'gray.400')} mb={6}>Perfect for small businesses</Text>
                
                <Flex align="baseline" mb={6}>
                  <Text fontSize="5xl" fontWeight="bold">$0</Text>
                  <Text ml={2} fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>/month</Text>
                </Flex>
                
                <VStack align="start" spacing={4} mb={8}>
                  <Flex align="center">
                    <Icon as={FaCheck} color="green.500" mr={2} />
                    <Text>Up to 5 projects</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaCheck} color="green.500" mr={2} />
                    <Text>Basic analytics</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaCheck} color="green.500" mr={2} />
                    <Text>24/7 support</Text>
                  </Flex>
                </VStack>
                
                <Button
                  colorScheme="purple"
                  variant="outline"
                  size="lg"
                  mt="auto"
                  w="full"
                  _hover={{ bg: 'purple.50' }}
                >
                  Get Started
                </Button>
              </Flex>
            </Box>
            
            {/* Pro Plan */}
            <Box
              borderWidth="1px"
              borderRadius="xl"
              overflow="hidden"
              bg={useColorModeValue('white', 'gray.700')}
              p={6}
              position="relative"
              transition="all 0.3s"
              transform={hoveredPlan === 'pro' ? 'scale(1.08)' : 'scale(1.05)'}
              boxShadow="xl"
              zIndex={1}
              _hover={{ boxShadow: '2xl' }}
              onMouseEnter={() => setHoveredPlan('pro')}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <Badge
                colorScheme="purple"
                position="absolute"
                top={4}
                right={4}
                px={2}
                py={1}
                borderRadius="md"
              >
                Popular
              </Badge>
              
              <Flex direction="column" h="full">
                <Flex align="center" mb={2}>
                  <Text fontWeight="bold" fontSize="xl">Pro</Text>
                  <Icon as={FaCrown} color="yellow.400" ml={2} />
                </Flex>
                <Text color={useColorModeValue('gray.600', 'gray.400')} mb={6}>For growing businesses</Text>
                
                <Flex align="baseline" mb={6}>
                  <Text fontSize="5xl" fontWeight="bold">${getPriceWithDiscount(49)}</Text>
                  <Text ml={2} fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>/month</Text>
                </Flex>
                
                {annualBilling && (
                  <Badge colorScheme="green" mb={4} p={1} borderRadius="md" textAlign="center">
                    Billed annually at ${(49 * 12 * 0.8).toFixed(0)}/year
                  </Badge>
                )}
                
                <VStack align="start" spacing={4} mb={8}>
                  <Flex align="center">
                    <Icon as={FaCheck} color="green.500" mr={2} />
                    <Text>Unlimited projects</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaCheck} color="green.500" mr={2} />
                    <Text>Advanced analytics</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaCheck} color="green.500" mr={2} />
                    <Text>Priority support</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaCheck} color="green.500" mr={2} />
                    <Text>Custom integrations</Text>
                  </Flex>
                </VStack>
                
                <Button
                  colorScheme="purple"
                  size="lg"
                  mt="auto"
                  w="full"
                  _hover={{ bg: 'purple.600' }}
                >
                  Start Free Trial
                </Button>
              </Flex>
            </Box>
            
            {/* Enterprise Plan */}
            <Box
              borderWidth="1px"
              borderRadius="xl"
              overflow="hidden"
              bg={useColorModeValue('white', 'gray.700')}
              p={6}
              position="relative"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-8px)', boxShadow: 'xl' }}
              onMouseEnter={() => setHoveredPlan('enterprise')}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <Flex position="absolute" top={3} right={3}>
                <Icon as={FaRocket} color="purple.400" />
              </Flex>
              
              <Flex direction="column" h="full">
                <Flex align="center" mb={2}>
                  <Text fontWeight="bold" fontSize="xl">Enterprise</Text>
                  <Icon as={FaServer} color="purple.400" ml={2} />
                </Flex>
                <Text color={useColorModeValue('gray.600', 'gray.400')} mb={6}>For large organizations</Text>
                
                <Flex align="baseline" mb={6}>
                  <Text fontSize="5xl" fontWeight="bold">${getPriceWithDiscount(199)}</Text>
                  <Text ml={2} fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>/month</Text>
                </Flex>
                
                {annualBilling && (
                  <Badge colorScheme="green" mb={4} p={1} borderRadius="md" textAlign="center">
                    Billed annually at ${(199 * 12 * 0.8).toFixed(0)}/year
                  </Badge>
                )}
                
                <VStack align="start" spacing={4} mb={8}>
                  <Flex align="center">
                    <Icon as={FaCheck} color="green.500" mr={2} />
                    <Text>Unlimited everything</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaCheck} color="green.500" mr={2} />
                    <Text>Dedicated account manager</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaCheck} color="green.500" mr={2} />
                    <Text>Custom reporting</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaCheck} color="green.500" mr={2} />
                    <Text>SLA guarantees</Text>
                  </Flex>
                </VStack>
                
                <Button
                  colorScheme="purple"
                  variant="outline"
                  size="lg"
                  mt="auto"
                  w="full"
                  _hover={{ bg: 'purple.50' }}
                >
                  Contact Sales
                </Button>
              </Flex>
            </Box>
          </Grid>
          
          {/* Testimonials */}
          <Box mt={20}>
            <Flex direction="column" align="center" mb={12}>
              <Badge colorScheme="green" fontSize="sm" px={3} py={1} mb={3} borderRadius="full">
                Testimonials
              </Badge>
              <Heading
                as="h2"
                fontSize={{ base: "3xl", md: "4xl" }}
                textAlign="center"
                mb={4}
              >
                What Our Clients Say
              </Heading>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                textAlign="center"
                maxW="2xl"
                color={useColorModeValue('gray.600', 'gray.400')}
              >
                Don't just take our word for it. See what our clients have to say about their experience.
              </Text>
            </Flex>
            
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={8}
            >
              {/* Testimonial 1 */}
              <Box
                bg={useColorModeValue('white', 'gray.700')}
                p={8}
                borderRadius="lg"
                boxShadow="md"
                position="relative"
              >
                <Icon
                  as={FaQuoteLeft}
                  position="absolute"
                  top={4}
                  left={4}
                  color="purple.100"
                  fontSize="4xl"
                  opacity={0.6}
                />
                
                <Text fontSize="lg" mb={6} pt={6}>
                  "The analytics dashboard has transformed how we track and optimize our marketing campaigns. The ROI metrics alone paid for the subscription in the first month."
                </Text>
                
                <Flex align="center">
                  <Avatar src="https://randomuser.me/api/portraits/men/75.jpg" mr={4} />
                  <Box>
                    <Text fontWeight="bold">David Wilson</Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>Marketing Director, TechFlow</Text>
                  </Box>
                </Flex>
              </Box>
              
              {/* Testimonial 2 */}
              <Box
                bg={useColorModeValue('white', 'gray.700')}
                p={8}
                borderRadius="lg"
                boxShadow="md"
                position="relative"
              >
                <Icon
                  as={FaQuoteLeft}
                  position="absolute"
                  top={4}
                  left={4}
                  color="purple.100"
                  fontSize="4xl"
                  opacity={0.6}
                />
                
                <Text fontSize="lg" mb={6} pt={6}>
                  "We've tried several analytics platforms, but none have been as intuitive and comprehensive as this one. The team's support has been exceptional throughout our onboarding."
                </Text>
                
                <Flex align="center">
                  <Avatar src="https://randomuser.me/api/portraits/women/32.jpg" mr={4} />
                  <Box>
                    <Text fontWeight="bold">Sarah Johnson</Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>CEO, Innovate Inc.</Text>
                  </Box>
                </Flex>
              </Box>
              
              {/* Testimonial 3 */}
              <Box
                bg={useColorModeValue('white', 'gray.700')}
                p={8}
                borderRadius="lg"
                boxShadow="md"
                position="relative"
              >
                <Icon
                  as={FaQuoteLeft}
                  position="absolute"
                  top={4}
                  left={4}
                  color="purple.100"
                  fontSize="4xl"
                  opacity={0.6}
                />
                
                <Text fontSize="lg" mb={6} pt={6}>
                  "The workflow automation features have saved our team countless hours. What used to take days now happens automatically, allowing us to focus on strategy rather than execution."
                </Text>
                
                <Flex align="center">
                  <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" mr={4} />
                  <Box>
                    <Text fontWeight="bold">James Rodriguez</Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>Operations Manager, GrowthX</Text>
                  </Box>
                </Flex>
              </Box>
            </Grid>
          </Box>
        </Container>
      </Box>
      
      {/* Projects Showcase Section */}
      <Box 
        as="section" 
        bg="#000" 
        color="white" 
        h="100vh" 
        w="100%"
        ref={projectsRef}
      >
        <Container maxW="7xl">
          <Flex justify="space-between" align="center" mb={10} pt={16}>
            <Heading 
              as="h2" 
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="medium"
              lineHeight="1.2"
              maxW="md"
            >
              Our Projects: Vision to Reality
              <Text fontSize="lg" mt={4} fontWeight="normal" color="gray.300">
                Browse through our portfolio of successful client projects
              </Text>
            </Heading>
            
            <Flex gap={2}>
              <IconButton
                aria-label="Previous project"
                icon={<Icon as={FaChevronLeft} />}
                variant="outline"
                colorScheme="whiteAlpha"
                rounded="full"
                size="lg"
                onClick={handlePrevProject}
              />
              <IconButton
                aria-label="Next project"
                icon={<Icon as={FaChevronRight} />}
                variant="outline"
                colorScheme="whiteAlpha"
                rounded="full"
                size="lg"
                onClick={handleNextProject}
              />
            </Flex>
          </Flex>
          
          {/* Project Cards */}
          <Flex gap={6} overflow="hidden">
            {visibleProjects.map((index) => {
              const project = projectsData[index];
              return (
                <Flex 
                  key={project.id}
                  direction="column" 
                  bg="white" 
                  color="black" 
                  borderRadius="lg" 
                  overflow="hidden"
                  w="full"
                  maxW="600px"
                  p={0}
                  transition="transform 0.3s ease"
                  _hover={{ transform: 'translateY(-8px)' }}
                  boxShadow="xl"
                >
                  <Flex 
                    direction="column" 
                    justify="space-between" 
                    p={8} 
                    h="full"
                    bgGradient={project.gradient}
                  >
                    <Box mb={8}>
                      <Text 
                        fontSize="xl" 
                        fontWeight="bold" 
                        mb={6}
                        p={2}
                        bg="white"
                        display="inline-block"
                        borderRadius="md"
                      >
                        {project.icon ? <Icon as={project.icon} mr={1} /> : null} {project.company}
                      </Text>
                      
                      <Text fontSize="lg" fontStyle="italic" mb={6}>
                        "{project.testimonial}"
                      </Text>
                      
                      <Button 
                        variant="solid" 
                        bg="black" 
                        color="white" 
                        size="sm"
                        rightIcon={<Icon as={FaArrowRight} fontSize="xs" />}
                        onClick={() => openProjectDetails(project)}
                      >
                        View details
                      </Button>
                    </Box>
                    
                    <Flex align="center">
                      <Avatar size="sm" src={project.avatar} mr={3} />
                      <Text fontWeight="medium">{project.person}, {project.role}</Text>
                    </Flex>
                  </Flex>
                  
                  <Box p={8}>
                    <Heading as="h3" fontSize="2xl" fontWeight="bold" mb={4}>
                      {project.title}
                    </Heading>
                    
                    {/* Project metrics */}
                    <Flex justify="space-between" mt={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Conversions</Text>
                        <Flex align="center">
                          <Text fontSize="xl" fontWeight="bold" mr={2}>{project.stats.conversions}%</Text>
                          <Progress value={project.stats.conversions} size="xs" colorScheme="green" w="60px" borderRadius="full" />
                        </Flex>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Engagement</Text>
                        <Flex align="center">
                          <Text fontSize="xl" fontWeight="bold" mr={2}>{project.stats.engagement}%</Text>
                          <Progress value={project.stats.engagement} size="xs" colorScheme="blue" w="60px" borderRadius="full" />
                        </Flex>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">ROI</Text>
                        <Flex align="center">
                          <Text fontSize="xl" fontWeight="bold">{project.stats.roi}x</Text>
                        </Flex>
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
              );
            })}
          </Flex>
          
          {/* Project navigation dots */}
          <Flex justify="center" mt={8}>
            {projectsData.map((_, index) => (
              <Box 
                key={index}
                w="10px"
                h="10px"
                borderRadius="full"
                bg={visibleProjects.includes(index) ? "white" : "whiteAlpha.400"}
                mx={1}
                cursor="pointer"
                onClick={() => {
                  setCurrentProjectIndex(index);
                  updateVisibleProjects(index);
                }}
                transition="all 0.2s"
                _hover={{ transform: 'scale(1.2)' }}
              />
            ))}
          </Flex>
        </Container>
      </Box>
      
      {/* Project Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader borderBottomWidth="1px">
            {selectedProject?.title}
            <Text fontSize="sm" fontWeight="normal" mt={1} color="gray.500">
              {selectedProject?.company} • Case Study
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {selectedProject && (
              <>
                <Flex mb={6} align="center">
                  <Avatar src={selectedProject.avatar} size="md" mr={4} />
                  <Box>
                    <Text fontWeight="bold">{selectedProject.person}</Text>
                    <Text fontSize="sm" color="gray.500">{selectedProject.role}</Text>
                  </Box>
                </Flex>
                
                <Text fontStyle="italic" fontSize="lg" mb={6}>
                  "{selectedProject.testimonial}"
                </Text>
                
                <Heading size="md" mb={4}>Project Metrics</Heading>
                
                <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={6}>
                  <Box p={4} borderWidth="1px" borderRadius="lg">
                    <Flex align="center" mb={2}>
                      <Icon as={FaChartLine} color="green.500" mr={2} />
                      <Text fontWeight="medium">Conversions</Text>
                    </Flex>
                    <Text fontSize="2xl" fontWeight="bold">{selectedProject.stats.conversions}%</Text>
                    <Progress value={selectedProject.stats.conversions} size="sm" colorScheme="green" mt={2} borderRadius="full" />
                  </Box>
                  
                  <Box p={4} borderWidth="1px" borderRadius="lg">
                    <Flex align="center" mb={2}>
                      <Icon as={FaUsers} color="blue.500" mr={2} />
                      <Text fontWeight="medium">Engagement</Text>
                    </Flex>
                    <Text fontSize="2xl" fontWeight="bold">{selectedProject.stats.engagement}%</Text>
                    <Progress value={selectedProject.stats.engagement} size="sm" colorScheme="blue" mt={2} borderRadius="full" />
                  </Box>
                  
                  <Box p={4} borderWidth="1px" borderRadius="lg">
                    <Flex align="center" mb={2}>
                      <Icon as={FaChartBar} color="purple.500" mr={2} />
                      <Text fontWeight="medium">ROI</Text>
                    </Flex>
                    <Text fontSize="2xl" fontWeight="bold">{selectedProject.stats.roi}x</Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>Return on investment</Text>
                  </Box>
                </Grid>
                
                <Button leftIcon={<Icon as={FaPlay} />} colorScheme="red" variant="solid" size="md" width="full">
                  Watch Project Video
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Footer Section */}
      <Box
        as="footer"
        bg={heroBgGradient}
        color={textColor}
        py={16}
      >
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={10}>
            {/* Company Info */}
            <Box>
              <Flex align="center" mb={6}>
                <img src="/images/symbo+text-logo.png" alt="Apployd DB Logo" style={{ maxHeight: 32, marginRight: 8 }} />
              </Flex>
              
              <Text color="gray.400" mb={6}>
                Empowering businesses with intelligent analytics and automation solutions that drive growth and efficiency.
              </Text>
              
              <Flex gap={4}>
                <IconButton
                  aria-label="Twitter"
                  icon={<Icon as={FaTwitter} />}
                  size="sm"
                  colorScheme="twitter"
                  variant="ghost"
                  rounded="full"
                  _hover={{ bg: 'whiteAlpha.200' }}
                />
                <IconButton
                  aria-label="LinkedIn"
                  icon={<Icon as={FaLinkedinIn} />}
                  size="sm"
                  colorScheme="linkedin"
                  variant="ghost"
                  rounded="full"
                  _hover={{ bg: 'whiteAlpha.200' }}
                />
                <IconButton
                  aria-label="Instagram"
                  icon={<Icon as={FaInstagram} />}
                  size="sm"
                  colorScheme="pink"
                  variant="ghost"
                  rounded="full"
                  _hover={{ bg: 'whiteAlpha.200' }}
                />
                <IconButton
                  aria-label="Facebook"
                  icon={<Icon as={FaFacebookF} />}
                  size="sm"
                  colorScheme="facebook"
                  variant="ghost"
                  rounded="full"
                  _hover={{ bg: 'whiteAlpha.200' }}
                />
                <IconButton
                  aria-label="YouTube"
                  icon={<Icon as={FaYoutube} />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  rounded="full"
                  _hover={{ bg: 'whiteAlpha.200' }}
                />
              </Flex>
            </Box>
            
            {/* Quick Links */}
            <Box>
              <Heading as="h4" fontSize="lg" mb={6}>Quick Links</Heading>
              <VStack align="start" spacing={3}>
                <Text as={RouterLink} to="/about" color="gray.400" _hover={{ color: 'white' }}>
                  About Us
                </Text>
                <Text as={RouterLink} to="/services" color="gray.400" _hover={{ color: 'white' }}>
                  Services
                </Text>
                <Text as={RouterLink} to="/case-studies" color="gray.400" _hover={{ color: 'white' }}>
                  Case Studies
                </Text>
                <Text as={RouterLink} to="/blog" color="gray.400" _hover={{ color: 'white' }}>
                  Blog
                </Text>
                <Text as={RouterLink} to="/careers" color="gray.400" _hover={{ color: 'white' }}>
                  Careers
                </Text>
                <Text as={RouterLink} to="/contact" color="gray.400" _hover={{ color: 'white' }}>
                  Contact Us
                </Text>
              </VStack>
            </Box>
            
            {/* Contact Info */}
            <Box>
              <Heading as="h4" fontSize="lg" mb={6}>Contact Us</Heading>
              <VStack align="start" spacing={4}>
                <Flex align="center">
                  <Icon as={FaMapMarkerAlt} color="purple.400" mr={3} />
                  <Text color="gray.400">123 Innovation Drive, San Francisco, CA 94103</Text>
                </Flex>
                <Flex align="center">
                  <Icon as={FaPhone} color="purple.400" mr={3} />
                  <Text color="gray.400">+1 (555) 123-4567</Text>
                </Flex>
                <Flex align="center">
                  <Icon as={FaEnvelope} color="purple.400" mr={3} />
                  <Text color="gray.400">info@neonanalytics.com</Text>
                </Flex>
              </VStack>
            </Box>
            
            {/* Newsletter */}
            <Box>
              <Heading as="h4" fontSize="lg" mb={6}>Subscribe to Our Newsletter</Heading>
              <Text color="gray.400" mb={4}>
                Stay updated with the latest trends, tips, and insights in analytics and automation.
              </Text>
              
              <Flex mb={4}>
                <Input 
                  placeholder="Your email address" 
                  bg={inputBg} 
                  border={0} 
                  _focus={{ bg: 'whiteAlpha.200' }}
                  _placeholder={{ color: 'gray.400' }}
                  color={textColor}
                />
                <IconButton
                  aria-label="Subscribe"
                  icon={<Icon as={FaPaperPlane} />}
                  colorScheme="purple"
                  ml={2}
                />
              </Flex>
              
              <Text fontSize="sm" color="gray.500">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </Text>
            </Box>
          </Grid>
          
          <Divider my={10} borderColor="gray.700" />
          
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align={{ base: 'center', md: 'center' }}
            textAlign={{ base: 'center', md: 'left' }}
          >
            <Text color="gray.500" fontSize="sm">
              © {new Date().getFullYear()} Apployd DB. All rights reserved.
            </Text>
            
            <HStack spacing={6} mt={{ base: 4, md: 0 }}>
              <Text as={RouterLink} to="/privacy" fontSize="sm" color="gray.500" _hover={{ color: 'gray.300' }}>
                Privacy Policy
              </Text>
              <Text as={RouterLink} to="/terms" fontSize="sm" color="gray.500" _hover={{ color: 'gray.300' }}>
                Terms of Service
              </Text>
              <Text as={RouterLink} to="/cookies" fontSize="sm" color="gray.500" _hover={{ color: 'gray.300' }}>
                Cookie Policy
              </Text>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
