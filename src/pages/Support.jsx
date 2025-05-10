import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  Icon,
  Badge,
  Link,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  useColorModeValue,
  Select,
  Divider,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spacer,
} from '@chakra-ui/react';
import { 
  TbHelpCircle,
  TbBookmark,
  TbMessage,
  TbBug,
  TbTicket,
  TbBrandGithub,
  TbBrandDiscord,
  TbMail,
  TbMessageCircle,
  TbFileText,
  TbBook,
  TbSearch,
  TbSend,
  TbCheck,
  TbQuestionMark,
  TbHeadset,
  TbChevronRight,
  TbDatabase
} from 'react-icons/tb';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const Support = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleTextColor = useColorModeValue('gray.600', 'gray.400');
  const headerBgGradient = useColorModeValue(
    'linear(to-r, purple.500, pink.400, blue.400)',
    'linear(to-r, purple.600, pink.500, blue.500)'
  );
  const buttonGradient = useColorModeValue(
    'linear(to-r, purple.400, pink.400, blue.400)',
    'linear(to-r, purple.500, pink.500, blue.500)'
  );
  const buttonHoverGradient = useColorModeValue(
    'linear(to-r, purple.500, pink.500, blue.500)',
    'linear(to-r, purple.600, pink.600, blue.600)'
  );
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const inputBg = useColorModeValue('white', 'gray.700');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Clear form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setCategory('');
      
      // Show success message
      toast({
        title: 'Support request submitted',
        description: 'We have received your request and will respond soon.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 1500);
  };

  // FAQ data
  const faqItems = [
    {
      question: 'How do I create a new database?',
      answer: 'Navigate to the Databases page and click on the "New Database" button. Enter a name for your database and click Create.'
    },
    {
      question: 'How do I connect to my database?',
      answer: 'You can find your connection string by going to the Databases page and clicking on the "Copy Connection String" button for your database.'
    },
    {
      question: 'What is a tenant in Neon?',
      answer: 'In Neon, a tenant is a logical isolation unit that contains one or more projects. Each tenant has its own dedicated resources and connection endpoints.'
    },
    {
      question: 'How do I monitor my database performance?',
      answer: 'You can monitor your database performance through the Monitoring page, which provides real-time metrics and status information for all Neon components.'
    },
    {
      question: 'How do backups work in Neon?',
      answer: 'Neon automatically manages backups through its architecture. Every write operation is recorded and can be used to restore data to any point in time.'
    },
    {
      question: 'Can I use Neon with my existing PostgreSQL tools?',
      answer: 'Yes, Neon is fully compatible with the PostgreSQL protocol, so you can use any PostgreSQL client or tool to connect to your Neon databases.'
    }
  ];

  // Documentation links
  const documentationLinks = [
    { title: 'Getting Started', icon: TbBook, url: 'https://neon.tech/docs/get-started-with-neon/introduction' },
    { title: 'API Reference', icon: TbFileText, url: 'https://neon.tech/docs/reference/api-reference' },
    { title: 'CLI Documentation', icon: TbMessageCircle, url: 'https://neon.tech/docs/reference/cli-reference' },
    { title: 'Database Concepts', icon: TbDatabase, url: 'https://neon.tech/docs/introduction/about' },
    { title: 'Connection Examples', icon: TbBrandGithub, url: 'https://neon.tech/docs/connect/connection-examples' },
    { title: 'Troubleshooting', icon: TbBug, url: 'https://neon.tech/docs/introduction/troubleshooting' }
  ];

  return (
    <Box bg={pageBg} minH="100vh" px={5} py={5}>
      {/* Header Section */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={6}
      >
        <Box 
          bgGradient={headerBgGradient}
          borderRadius="lg"
          p={6}
          color="white"
          boxShadow="md"
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg" mb={2}>Support Center</Heading>
              <Text fontSize="md">Get help, access documentation, and learn more about Neon</Text>
            </Box>
            <HStack spacing={3}>
              <Button
                leftIcon={<TbBrandGithub />}
                as="a"
                href="https://github.com/neondatabase/neon"
                target="_blank"
                bg="whiteAlpha.300"
                _hover={{ bg: "whiteAlpha.400" }}
              >
                GitHub
              </Button>
              <Button
                leftIcon={<TbBrandDiscord />}
                as="a"
                href="https://discord.gg/neon"
                target="_blank"
                bgGradient="linear(to-r, whiteAlpha.300, whiteAlpha.200)"
                _hover={{ bgGradient: "linear(to-r, whiteAlpha.400, whiteAlpha.300)" }}
              >
                Community
              </Button>
            </HStack>
          </Flex>
        </Box>
      </MotionBox>

      {/* Main Content */}
      <Tabs variant="enclosed" colorScheme="purple" bg={cardBg} borderRadius="lg" boxShadow="sm" mb={6}>
        <TabList>
          <Tab><HStack><Icon as={TbHelpCircle} boxSize="16px" /><Text>Help Center</Text></HStack></Tab>
          <Tab><HStack><Icon as={TbTicket} boxSize="16px" /><Text>Submit a Request</Text></HStack></Tab>
          <Tab><HStack><Icon as={TbQuestionMark} boxSize="16px" /><Text>FAQs</Text></HStack></Tab>
        </TabList>
        
        <TabPanels>
          {/* Help Center Panel */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Documentation Section */}
              <Card bg={cardBg} boxShadow="sm" height="100%">
                <CardHeader pb={0}>
                  <HStack spacing={2}>
                    <Icon as={TbBookmark} color="purple.500" boxSize="20px" />
                    <Heading size="md">Documentation</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {documentationLinks.map((link, index) => (
                      <Link 
                        key={index} 
                        href={link.url} 
                        isExternal 
                        _hover={{ textDecoration: 'none' }}
                      >
                        <HStack 
                          p={3} 
                          borderWidth="1px" 
                          borderRadius="md" 
                          borderColor={borderColor}
                          _hover={{ 
                            bg: useColorModeValue('purple.50', 'gray.700'),
                            borderColor: useColorModeValue('purple.200', 'purple.500')
                          }}
                          transition="all 0.2s"
                        >
                          <Icon as={link.icon} boxSize="20px" color="purple.500" />
                          <Text fontWeight="medium">{link.title}</Text>
                          <Spacer />
                          <Icon as={TbChevronRight} />
                        </HStack>
                      </Link>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              {/* Community Support Section */}
              <Card bg={cardBg} boxShadow="sm" height="100%">
                <CardHeader pb={0}>
                  <HStack spacing={2}>
                    <Icon as={TbHeadset} color="blue.500" boxSize="20px" />
                    <Heading size="md">Community & Support</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={5} align="stretch">
                    <Link 
                      href="https://github.com/neondatabase/neon/issues" 
                      isExternal
                      _hover={{ textDecoration: 'none' }}
                    >
                      <Flex 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        borderColor={borderColor}
                        _hover={{ 
                          bg: useColorModeValue('blue.50', 'gray.700'),
                          borderColor: useColorModeValue('blue.200', 'blue.500')
                        }}
                        transition="all 0.2s"
                      >
                        <Icon as={TbBug} boxSize="24px" color="blue.500" mr={4} />
                        <Box>
                          <Heading size="sm" mb={1}>Report an Issue</Heading>
                          <Text fontSize="sm" color={subtleTextColor}>Found a bug? Report it on GitHub and help us improve.</Text>
                        </Box>
                      </Flex>
                    </Link>
                    
                    <Link 
                      href="https://discord.gg/neon" 
                      isExternal
                      _hover={{ textDecoration: 'none' }}
                    >
                      <Flex 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        borderColor={borderColor}
                        _hover={{ 
                          bg: useColorModeValue('purple.50', 'gray.700'),
                          borderColor: useColorModeValue('purple.200', 'purple.500')
                        }}
                        transition="all 0.2s"
                      >
                        <Icon as={TbBrandDiscord} boxSize="24px" color="purple.500" mr={4} />
                        <Box>
                          <Heading size="sm" mb={1}>Join our Discord</Heading>
                          <Text fontSize="sm" color={subtleTextColor}>Connect with the community and get real-time help.</Text>
                        </Box>
                      </Flex>
                    </Link>
                    
                    <Link 
                      href="mailto:support@neon.tech" 
                      _hover={{ textDecoration: 'none' }}
                    >
                      <Flex 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        borderColor={borderColor}
                        _hover={{ 
                          bg: useColorModeValue('pink.50', 'gray.700'),
                          borderColor: useColorModeValue('pink.200', 'pink.500')
                        }}
                        transition="all 0.2s"
                      >
                        <Icon as={TbMail} boxSize="24px" color="pink.500" mr={4} />
                        <Box>
                          <Heading size="sm" mb={1}>Email Support</Heading>
                          <Text fontSize="sm" color={subtleTextColor}>Email our support team directly at support@neon.tech</Text>
                        </Box>
                      </Flex>
                    </Link>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
            
            {/* Status & Resources Section */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={6}>
              <Card bg={cardBg} boxShadow="sm">
                <CardHeader pb={0}>
                  <HStack spacing={2}>
                    <Badge colorScheme="green">Online</Badge>
                    <Heading size="sm">System Status</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Text fontSize="sm" color={subtleTextColor}>
                    All systems are operational. Check our status page for detailed information.
                  </Text>
                  <Button 
                    mt={4} 
                    size="sm" 
                    variant="outline" 
                    colorScheme="purple" 
                    width="full"
                    as="a"
                    href="https://status.neon.tech"
                    target="_blank"
                  >
                    Status Page
                  </Button>
                </CardBody>
              </Card>
              
              <Card bg={cardBg} boxShadow="sm">
                <CardHeader pb={0}>
                  <HStack spacing={2}>
                    <Icon as={TbSearch} color="orange.500" boxSize="16px" />
                    <Heading size="sm">Search Documentation</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <FormControl>
                    <Input 
                      placeholder="Search docs..." 
                      bg={inputBg}
                    />
                  </FormControl>
                  <Button 
                    mt={4} 
                    size="sm" 
                    colorScheme="purple" 
                    width="full"
                    bgGradient={buttonGradient}
                    _hover={{ bgGradient: buttonHoverGradient }}
                    color="white"
                  >
                    Search
                  </Button>
                </CardBody>
              </Card>
              
              <Card bg={cardBg} boxShadow="sm">
                <CardHeader pb={0}>
                  <HStack spacing={2}>
                    <Icon as={TbBook} color="blue.500" boxSize="16px" />
                    <Heading size="sm">Quick Resources</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Link color="purple.500">PostgreSQL Documentation</Link>
                    <Link color="purple.500">API Reference</Link>
                    <Link color="purple.500">Blog & Tutorials</Link>
                    <Link color="purple.500">Release Notes</Link>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Submit Request Panel */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card bg={cardBg} boxShadow="sm">
                <CardHeader pb={0}>
                  <HStack spacing={2}>
                    <Icon as={TbMessage} color="purple.500" boxSize="20px" />
                    <Heading size="md">Submit a Support Request</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handleSubmit}>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>Your Name</FormLabel>
                          <Input 
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            bg={inputBg}
                          />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Email Address</FormLabel>
                          <Input 
                            type="email" 
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            bg={inputBg}
                          />
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl isRequired>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          placeholder="Select a category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          bg={inputBg}
                        >
                          <option value="technical">Technical Issue</option>
                          <option value="billing">Billing Question</option>
                          <option value="account">Account Management</option>
                          <option value="feature">Feature Request</option>
                          <option value="other">Other</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel>Subject</FormLabel>
                        <Input 
                          placeholder="Brief description of your issue"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          bg={inputBg}
                        />
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel>Message</FormLabel>
                        <Textarea 
                          placeholder="Please provide as much detail as possible..."
                          rows={6}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          bg={inputBg}
                        />
                      </FormControl>
                      
                      <Button 
                        type="submit" 
                        colorScheme="purple" 
                        isLoading={isSubmitting}
                        leftIcon={<TbSend />}
                        bgGradient={buttonGradient}
                        _hover={{ bgGradient: buttonHoverGradient }}
                        color="white"
                        mt={2}
                      >
                        Submit Request
                      </Button>
                    </VStack>
                  </form>
                </CardBody>
              </Card>
              
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} boxShadow="sm">
                  <CardHeader pb={0}>
                    <HStack spacing={2}>
                      <Icon as={TbHeadset} color="blue.500" boxSize="20px" />
                      <Heading size="md">Contact Information</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <Icon as={TbMail} color="purple.500" />
                        <Text>support@neon.tech</Text>
                      </HStack>
                      
                      <HStack>
                        <Icon as={TbBrandDiscord} color="purple.500" />
                        <Text>Discord Community</Text>
                        <Badge colorScheme="green">Recommended</Badge>
                      </HStack>
                      
                      <HStack>
                        <Icon as={TbBrandGithub} color="purple.500" />
                        <Text>GitHub Issues</Text>
                      </HStack>
                      
                      <Divider />
                      
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <Text fontSize="sm">
                            For fastest response, please include:
                          </Text>
                          <Text fontSize="sm" mt={1}>
                            • Your database ID or name<br />
                            • Steps to reproduce the issue<br />
                            • Any error messages received
                          </Text>
                        </Box>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={cardBg} boxShadow="sm">
                  <CardHeader pb={0}>
                    <HStack spacing={2}>
                      <Icon as={TbCheck} color="green.500" boxSize="20px" />
                      <Heading size="md">Support Hours</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text fontWeight="bold">Community Support</Text>
                          <Text fontSize="sm" color={subtleTextColor}>24/7 via Discord and GitHub</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold">Email Support</Text>
                          <Text fontSize="sm" color={subtleTextColor}>Monday-Friday, 9am-5pm PT</Text>
                        </Box>
                      </SimpleGrid>
                      
                      <Alert status="success" borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Premium support plans are available for enterprise customers.
                        </Text>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </SimpleGrid>
          </TabPanel>
          
          {/* FAQs Panel */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
              <Card bg={cardBg} boxShadow="sm">
                <CardHeader>
                  <HStack spacing={2}>
                    <Icon as={TbQuestionMark} color="purple.500" boxSize="20px" />
                    <Heading size="md">Frequently Asked Questions</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Accordion allowToggle>
                    {faqItems.map((item, index) => (
                      <AccordionItem key={index} borderColor={borderColor}>
                        <h2>
                          <AccordionButton py={3}>
                            <Box flex="1" textAlign="left" fontWeight="medium">
                              {item.question}
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4} bg={useColorModeValue('gray.50', 'gray.700')}>
                          <Text color={subtleTextColor}>{item.answer}</Text>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  
                  <Flex justify="center" mt={6}>
                    <Text color={subtleTextColor} textAlign="center">
                      Can't find what you're looking for?{' '}
                      <Link color="purple.500" fontWeight="medium">
                        Contact Support
                      </Link>
                    </Text>
                  </Flex>
                </CardBody>
              </Card>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Card bg={cardBg} boxShadow="sm">
                  <CardHeader pb={0}>
                    <Heading size="sm">Popular Articles</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <Link color="purple.500">Getting Started with Neon</Link>
                      <Link color="purple.500">Connecting to Your Database</Link>
                      <Link color="purple.500">Understanding Branching</Link>
                      <Link color="purple.500">Performance Optimization</Link>
                      <Link color="purple.500">Scaling Your Database</Link>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={cardBg} boxShadow="sm">
                  <CardHeader pb={0}>
                    <Heading size="sm">Troubleshooting</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <Link color="purple.500">Connection Issues</Link>
                      <Link color="purple.500">Performance Problems</Link>
                      <Link color="purple.500">Error Messages</Link>
                      <Link color="purple.500">Query Timeout Solutions</Link>
                      <Link color="purple.500">Data Import/Export</Link>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={cardBg} boxShadow="sm">
                  <CardHeader pb={0}>
                    <Heading size="sm">Video Tutorials</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <Link color="purple.500">Neon Quickstart</Link>
                      <Link color="purple.500">Working with Branches</Link>
                      <Link color="purple.500">Schema Management</Link>
                      <Link color="purple.500">Performance Monitoring</Link>
                      <Link color="purple.500">Security Best Practices</Link>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Support; 