import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Icon,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Button,
  Divider,
  useColorModeValue,
  Skeleton,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Link,
  Container,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Spinner,
  useDisclosure,
  useToast,
  VStack,
  Stack,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { 
  TbDatabase,
  TbServer
} from 'react-icons/tb';
import { 
  FiDatabase, 
  FiPlus, 
  FiTrash2, 
  FiSettings, 
  FiHardDrive, 
  FiCpu,
  FiZap,
  FiLink,
  FiSearch,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { neonApi } from '../api/neonApi';
import NeonLogo from '../components/NeonLogo';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [databases, setDatabases] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [newDbName, setNewDbName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDb, setSelectedDb] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCreatingDb, setIsCreatingDb] = useState(false);
  const [isDeletingDb, setIsDeletingDb] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionStatus, setConnectionStatus] = useState({});

  // Theme colors - matching the auth pages
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('purple.500', 'purple.300');
  const subtleTextColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('purple.50', 'gray.700');
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
  const tableBg = useColorModeValue('white', 'gray.800');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const tableRowHoverBg = useColorModeValue('purple.50', 'gray.700');
  
  // Fetch user's databases and usage statistics
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch databases owned by the current user
        const dbResponse = await neonApi.getDatabases();
        setDatabases(dbResponse);
        
        // Fetch usage statistics
        const usageResponse = await neonApi.getUserUsageStats();
        setUsageStats(usageResponse);
      } catch (error) {
        toast({
          title: 'Error fetching data',
          description: error.message || 'Could not load your databases',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  // Create new database
  const handleCreateDatabase = async () => {
    if (!newDbName.trim()) {
      toast({
        title: 'Invalid name',
        description: 'Please enter a valid database name',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      setIsCreatingDb(true);
      const newDb = await neonApi.createDatabase(newDbName);
      
      // Add the new database to the list
      setDatabases([...databases, newDb]);
      
      // Close modal and reset form
      onClose();
      setNewDbName('');
      
      toast({
        title: 'Database created',
        description: `${newDbName} has been created successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Refresh usage stats
      const usageResponse = await neonApi.getUserUsageStats();
      setUsageStats(usageResponse);
    } catch (error) {
      toast({
        title: 'Error creating database',
        description: error.message || 'Failed to create database',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsCreatingDb(false);
    }
  };

  // Delete database
  const handleDeleteDatabase = async (db) => {
    if (!confirm(`Are you sure you want to delete ${db.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeletingDb(true);
      setSelectedDb(db);
      
      await neonApi.deleteDatabase(db.id);
      
      // Remove the database from the list
      setDatabases(databases.filter(d => d.id !== db.id));
      
      toast({
        title: 'Database deleted',
        description: `${db.name} has been deleted successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Refresh usage stats
      const usageResponse = await neonApi.getUserUsageStats();
      setUsageStats(usageResponse);
    } catch (error) {
      toast({
        title: 'Error deleting database',
        description: error.message || 'Failed to delete database',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsDeletingDb(false);
      setSelectedDb(null);
    }
  };

  // Connect to database (redirect to query interface)
  const handleConnectToDatabase = (db) => {
    window.location.href = `/query?dbId=${db.id}&dbName=${db.name}`;
  };

  // Test database connection
  const handleTestConnection = async (db) => {
    try {
      setConnectionStatus(prev => ({ ...prev, [db.id]: 'testing' }));
      
      toast({
        title: "Testing connection...",
        status: "info",
        duration: 2000,
        isClosable: true
      });
      
      // Prepare connection info
      const connectionInfo = {
        host: db.host,
        port: db.port,
        user: db.username,
        password: db.password || '',
        database: db.name
      };
      
      // Test query
      const result = await neonApi.executeSQL("SELECT 1 as connected", connectionInfo);
      
      if (result && result.rows && result.rows[0]?.connected === 1) {
        setConnectionStatus(prev => ({ ...prev, [db.id]: 'connected' }));
        toast({
          title: "Connection successful",
          description: `Successfully connected to ${db.name}`,
          status: "success",
          duration: 3000,
          isClosable: true
        });
      } else {
        setConnectionStatus(prev => ({ ...prev, [db.id]: 'failed' }));
        throw new Error("Connection test failed");
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [db.id]: 'failed' }));
      toast({
        title: "Connection failed",
        description: error.message || "Could not connect to database",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  // Filter databases by search query
  const filteredDatabases = databases.filter(db => 
    db.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box bg={pageBg} minH="calc(100vh - 64px)" p={6}>
      {/* Simplified header */}
      <Box 
        py={6}
        mb={8}
        position="relative"
        borderRadius="lg"
        overflow="hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Heading size="lg" fontWeight="500" mb={2}>
            Welcome{currentUser?.firstName ? `, ${currentUser.firstName}` : ''}
          </Heading>
          <Text fontSize="md" opacity={0.8} mb={4}>
            Manage your Apployd DB databases and monitor usage
          </Text>
        </motion.div>
      </Box>

      {/* Usage Stats Cards */}
      {usageStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
            {/* Database Count */}
            <Card 
              bg={cardBg} 
              boxShadow="sm" 
              borderRadius="xl" 
              overflow="hidden"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            >
              <CardBody p={6}>
                <Flex align="center" mb={4}>
                  <Box
                    p={2}
                    borderRadius="lg"
                    bg="blue.50"
                    color="blue.500"
                    mr={4}
                  >
                    <Icon as={FiDatabase} w={5} h={5} />
                  </Box>
                  <Text fontWeight="medium" color="gray.500">Databases</Text>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Stat>
                    <StatNumber fontSize="3xl" fontWeight="500">{usageStats.databases.count}</StatNumber>
                    <StatHelpText m={0} fontSize="sm">of {usageStats.databases.limit} available</StatHelpText>
                  </Stat>
                  <Text
                    fontSize="sm"
                    color={usageStats.databases.count > usageStats.databases.limit * 0.8 ? "orange.500" : "green.500"}
                  >
                    {Math.floor((usageStats.databases.count / usageStats.databases.limit) * 100)}%
                  </Text>
                </Flex>
                <Progress 
                  value={(usageStats.databases.count / usageStats.databases.limit) * 100} 
                  size="xs" 
                  colorScheme={usageStats.databases.count > usageStats.databases.limit * 0.8 ? "orange" : "blue"}
                  borderRadius="full"
                  mt={2}
                />
              </CardBody>
            </Card>

            {/* Storage Usage */}
            <Card 
              bg={cardBg} 
              boxShadow="sm" 
              borderRadius="xl"
              overflow="hidden"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            >
              <CardBody p={6}>
                <Flex align="center" mb={4}>
                  <Box
                    p={2}
                    borderRadius="lg"
                    bg="purple.50"
                    color="purple.500"
                    mr={4}
                  >
                    <Icon as={FiHardDrive} w={5} h={5} />
                  </Box>
                  <Text fontWeight="medium" color="gray.500">Storage</Text>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Stat>
                    <StatNumber fontSize="3xl" fontWeight="500">
                      {usageStats.storage.used < 1000 
                        ? `${usageStats.storage.used} MB` 
                        : `${(usageStats.storage.used / 1000).toFixed(1)} GB`}
                    </StatNumber>
                    <StatHelpText m={0} fontSize="sm">
                      of {usageStats.storage.limit < 1000 
                        ? `${usageStats.storage.limit} MB` 
                        : `${(usageStats.storage.limit / 1000).toFixed(1)} GB`}
                    </StatHelpText>
                  </Stat>
                  <Text
                    fontSize="sm"
                    color={usageStats.storage.used > usageStats.storage.limit * 0.8 ? "orange.500" : "green.500"}
                  >
                    {Math.floor((usageStats.storage.used / usageStats.storage.limit) * 100)}%
                  </Text>
                </Flex>
                <Progress 
                  value={(usageStats.storage.used / usageStats.storage.limit) * 100} 
                  size="xs" 
                  colorScheme="purple"
                  borderRadius="full"
                  mt={2}
                />
              </CardBody>
            </Card>

            {/* Compute Usage */}
            <Card 
              bg={cardBg} 
              boxShadow="sm" 
              borderRadius="xl"
              overflow="hidden"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            >
              <CardBody p={6}>
                <Flex align="center" mb={4}>
                  <Box
                    p={2}
                    borderRadius="lg"
                    bg="teal.50"
                    color="teal.500"
                    mr={4}
                  >
                    <Icon as={FiCpu} w={5} h={5} />
                  </Box>
                  <Text fontWeight="medium" color="gray.500">Compute</Text>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Stat>
                    <StatNumber fontSize="3xl" fontWeight="500">{usageStats.compute.hours} hours</StatNumber>
                    <StatHelpText m={0} fontSize="sm">of {usageStats.compute.limit} hours</StatHelpText>
                  </Stat>
                  <Text
                    fontSize="sm"
                    color={usageStats.compute.hours > usageStats.compute.limit * 0.8 ? "orange.500" : "green.500"}
                  >
                    {Math.floor((usageStats.compute.hours / usageStats.compute.limit) * 100)}%
                  </Text>
                </Flex>
                <Progress 
                  value={(usageStats.compute.hours / usageStats.compute.limit) * 100} 
                  size="xs" 
                  colorScheme="teal"
                  borderRadius="full"
                  mt={2}
                />
              </CardBody>
            </Card>
          </SimpleGrid>
        </motion.div>
      )}

      {/* Database Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md" fontWeight="500">Your Databases</Heading>
          <HStack>
            <InputGroup maxW="250px" size="sm">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search databases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={inputBg}
                border="none"
                _focus={{ boxShadow: 'none', bg: inputBg }}
                borderRadius="full"
              />
            </InputGroup>
            <Button
              leftIcon={<FiPlus />}
              onClick={onOpen}
              colorScheme="purple"
              variant="solid"
              size="sm"
              borderRadius="full"
              fontWeight="medium"
            >
              New
            </Button>
          </HStack>
        </Flex>

        {databases.length === 0 ? (
          <Card p={6} bg={cardBg} boxShadow="sm" borderRadius="xl" textAlign="center">
            <CardBody>
              <VStack spacing={4}>
                <Icon as={FiDatabase} w={12} h={12} color="gray.300" />
                <Text fontSize="lg" fontWeight="medium">You don't have any Apployd DB databases yet</Text>
                <Button
                  onClick={onOpen}
                  leftIcon={<FiPlus />}
                  colorScheme="purple"
                  variant="solid"
                  borderRadius="full"
                >
                  Create New Database
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Card bg={cardBg} boxShadow="sm" borderRadius="xl" overflow="hidden">
            <TableContainer>
              <Table variant="simple">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th pl={6}>Database</Th>
                    <Th>Connection</Th>
                    <Th textAlign="right" pr={6}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredDatabases.map(db => (
                    <Tr 
                      key={db.id}
                      _hover={{ bg: tableRowHoverBg }}
                      transition="background-color 0.2s"
                    >
                      <Td pl={6}>
                        <Flex align="center">
                          <Box
                            p={2}
                            borderRadius="md"
                            bg={db.source === 'neon' ? 'purple.50' : 'blue.50'}
                            color={db.source === 'neon' ? 'purple.500' : 'blue.500'}
                            mr={3}
                          >
                            <Icon as={FiDatabase} />
                          </Box>
                          <Box>
                            <Flex align="center">
                              <Text fontWeight="medium" fontFamily="mono">{db.name}</Text>
                              {connectionStatus[db.id] === 'connected' && (
                                <Icon as={FiCheckCircle} color="green.500" ml={2} />
                              )}
                              {connectionStatus[db.id] === 'failed' && (
                                <Icon as={FiAlertCircle} color="red.500" ml={2} />
                              )}
                              {connectionStatus[db.id] === 'testing' && (
                                <Spinner size="xs" ml={2} />
                              )}
                            </Flex>
                            <Badge 
                              colorScheme={db.source === 'neon' ? 'purple' : 'blue'}
                              variant="subtle"
                              fontSize="xs"
                            >
                              {db.source === 'neon' ? 'Apployd DB' : 'Local'}
                            </Badge>
                          </Box>
                        </Flex>
                      </Td>
                      <Td>
                        <Text fontFamily="mono" fontSize="sm" color="gray.500">
                          postgresql://{db.username}@{db.host}:{db.port}/{db.name}
                        </Text>
                      </Td>
                      <Td textAlign="right" pr={6}>
                        <HStack spacing={2} justify="flex-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            leftIcon={<FiCheckCircle />}
                            onClick={() => handleTestConnection(db)}
                            isLoading={connectionStatus[db.id] === 'testing'}
                            borderRadius="full"
                          >
                            Test
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="purple"
                            leftIcon={<FiLink />}
                            onClick={() => handleConnectToDatabase(db)}
                            borderRadius="full"
                          >
                            Connect
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            leftIcon={<FiTrash2 />}
                            onClick={() => handleDeleteDatabase(db)}
                            isLoading={isDeletingDb && selectedDb?.id === db.id}
                            borderRadius="full"
                          >
                            Delete
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </motion.div>

      {/* Create Database Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader>Create New Database</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4} fontSize="sm" color={subtleTextColor}>
              Enter a name for your new database. It can contain letters, numbers, and underscores.
            </Text>
            <Input
              placeholder="database_name"
              value={newDbName}
              onChange={(e) => setNewDbName(e.target.value)}
              fontFamily="mono"
            />
          </ModalBody>

          <ModalFooter>
            <Button 
              colorScheme="gray" 
              mr={3} 
              onClick={onClose}
              borderRadius="full"
            >
              Cancel
            </Button>
            <Button 
              colorScheme="purple"
              onClick={handleCreateDatabase}
              isLoading={isCreatingDb}
              loadingText="Creating..."
              borderRadius="full"
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dashboard; 