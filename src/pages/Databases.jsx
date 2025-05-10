import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  HStack,
  VStack,
  Flex,
  Badge,
  useToast,
  Skeleton,
  Card,
  CardBody,
  CardHeader,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Tooltip,
  Divider,
  useColorModeValue,
  Container,
  InputGroup,
  InputLeftElement,
  Progress,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
} from '@chakra-ui/react';
import { 
  HiRefresh, 
  HiExternalLink, 
  HiPlus, 
  HiTrash, 
  HiDatabase, 
  HiClock, 
  HiServer,
  HiSearch,
  HiClipboardCopy
} from 'react-icons/hi';
import { getTenants, getTimelines, createDatabase, getConnectionString, executeSql, neonApi } from '../api/neonApi';
import DatabaseStatus from '../components/DatabaseStatus';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const Databases = () => {
  const [tenantsData, setTenantsData] = useState([]);
  const [timelinesData, setTimelinesData] = useState([]);
  const [databasesData, setDatabasesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [newDbName, setNewDbName] = useState('');
  const [selectedDb, setSelectedDb] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableBg = useColorModeValue('white', 'gray.800');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('purple.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
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
  const inputBg = useColorModeValue('purple.50', 'gray.700');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get tenants
      const tenants = await getTenants();
      setTenantsData(tenants);
      
      // Get timelines for all tenants
      let timelines = [];
      for (const tenant of tenants) {
        try {
          const tenantTimelines = await getTimelines(tenant.id);
          // Add tenant info to each timeline
          timelines = [...timelines, ...tenantTimelines.map(timeline => ({
            ...timeline,
            tenantId: tenant.id
          }))];
        } catch (error) {
          console.error(`Error fetching timelines for tenant ${tenant.id}:`, error);
        }
      }
      
      setTimelinesData(timelines);
      
      // Get databases
      try {
        const databases = await neonApi.getDatabases();
        setDatabasesData(databases);
      } catch (error) {
        console.error('Error fetching databases:', error);
      }
      
      // Show warning if no data was found
      if (tenants.length === 0 && !error) {
        setError('No tenant data available. Backend services might not be running.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to connect to backend services.');
      toast({
        title: 'Error fetching data',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateDatabase = async () => {
    if (!newDbName || newDbName.trim() === '') {
      toast({
        title: 'Database name required',
        description: 'Please enter a valid database name',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setIsCreating(true);
      
      const result = await neonApi.createDatabase(newDbName);
      
      // Refresh the database list
      await fetchData();
      
      onCreateClose();
      setNewDbName('');
      
      toast({
        title: 'Database created',
        description: result.message || 'Database created successfully',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Error creating database',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDatabase = async () => {
    if (!selectedDb) return;
    
    try {
      setIsDeleting(true);
      
      // Determine the source and connection details
      const connection = selectedDb.source === 'neon' 
        ? { host: 'localhost', port: 55433, user: 'cloud_admin', password: 'cloud_admin', database: 'postgres' }
        : { host: 'localhost', port: 5432, user: 'prazwolgupta', password: '', database: 'postgres' };
      
      // Execute the drop database command
      const result = await executeSql(`DROP DATABASE ${selectedDb.name};`, connection);
      
      // Refresh the database list
      await fetchData();
      
      onDeleteClose();
      setSelectedDb(null);
      
      toast({
        title: 'Database deleted',
        description: `Database ${selectedDb.name} deleted successfully`,
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting database',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const copyConnectionString = (dbName = 'postgres', user = 'cloud_admin', port = 55433) => {
    const connectionString = `postgresql://${user}:cloud_admin@localhost:${port}/${dbName}`;
    navigator.clipboard.writeText(connectionString);
    toast({
      title: 'Connection string copied',
      description: 'The connection string has been copied to clipboard',
      status: 'success',
      duration: 3000,
    });
  };

  const getStatusBadge = (status) => {
    if (!status) return <Badge colorScheme="gray">Unknown</Badge>;

    switch(status.toLowerCase()) {
      case 'online':
      case 'active':
      case 'running':
        return <Badge colorScheme="green">Online</Badge>;
      case 'offline':
      case 'inactive':
        return <Badge colorScheme="red">Offline</Badge>;
      case 'pending':
      case 'creating':
        return <Badge colorScheme="yellow">Pending</Badge>;
      default:
        return <Badge colorScheme="gray">{status}</Badge>;
    }
  };

  const openDeleteModal = (database) => {
    setSelectedDb(database);
    onDeleteOpen();
  };

  const handleRefresh = async () => {
    await fetchData();
    toast({
      title: 'Data refreshed',
      status: 'success',
      duration: 2000,
    });
  };

  const filteredDatabases = databasesData.filter(db => 
    db.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          mb={6}
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg" mb={2}>Database Management</Heading>
              <Text fontSize="md">Create, manage and monitor your databases</Text>
            </Box>
            <HStack>
              <Button
                leftIcon={<HiRefresh />}
                onClick={handleRefresh}
                variant="solid"
                bg="whiteAlpha.300"
                _hover={{ bg: "whiteAlpha.400" }}
                isLoading={isLoading}
              >
                Refresh
              </Button>
              <Button
                leftIcon={<HiPlus />}
                onClick={onCreateOpen}
                bgGradient="linear(to-r, whiteAlpha.300, whiteAlpha.200)"
                _hover={{ bgGradient: "linear(to-r, whiteAlpha.400, whiteAlpha.300)" }}
                boxShadow="sm"
              >
                New Database
              </Button>
            </HStack>
          </Flex>
        </Box>
      </MotionBox>

      {/* Search and Stats */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Flex 
          justify="space-between" 
          align="center" 
          mb={6}
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 4, md: 0 }}
        >
          <InputGroup maxW={{ base: '100%', md: '320px' }}>
            <InputLeftElement pointerEvents="none">
              <HiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              bg={inputBg}
              placeholder="Search databases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="md"
            />
          </InputGroup>
          
          <HStack spacing={4}>
            <Card bg={cardBg} p={2} boxShadow="sm" minW="150px">
              <CardBody p={3}>
                <Stat>
                  <StatLabel color={subtleTextColor}>Total Databases</StatLabel>
                  <Flex align="center" mt={1}>
                    <HiDatabase size={20} color="purple" />
                    <Heading size="md" ml={2}>
                      {isLoading ? <Spinner size="sm" /> : databasesData.length}
                    </Heading>
                  </Flex>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} p={2} boxShadow="sm" minW="150px">
              <CardBody p={3}>
                <Stat>
                  <StatLabel color={subtleTextColor}>Active Tenants</StatLabel>
                  <Flex align="center" mt={1}>
                    <HiServer size={20} color="blue" />
                    <Heading size="md" ml={2}>
                      {isLoading ? <Spinner size="sm" /> : tenantsData.length}
                    </Heading>
                  </Flex>
                </Stat>
              </CardBody>
            </Card>
          </HStack>
        </Flex>
      </MotionBox>

      {/* Error alert */}
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Connection Error:</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Database Table */}
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card bg={cardBg} boxShadow="sm" mb={6} overflow="hidden">
          <CardHeader bg={tableHeaderBg} py={4}>
            <Heading size="md">Your Databases</Heading>
          </CardHeader>
          <CardBody p={0}>
            {isLoading ? (
              <Stack spacing={0}>
                {[...Array(3)].map((_, i) => (
                  <Box key={i} p={4} borderBottomWidth={i < 2 ? 1 : 0} borderColor={borderColor}>
                    <Skeleton height="20px" mb={2} />
                    <Skeleton height="15px" width="60%" />
                  </Box>
                ))}
              </Stack>
            ) : databasesData.length === 0 ? (
              <Flex direction="column" align="center" justify="center" py={10}>
                <HiDatabase size={40} opacity={0.3} />
                <Text mt={4} color={textColor}>No databases found</Text>
                <Button 
                  leftIcon={<HiPlus />} 
                  onClick={onCreateOpen} 
                  size="sm" 
                  mt={4}
                  bgGradient={buttonGradient}
                  _hover={{ bgGradient: buttonHoverGradient }}
                  color="white"
                >
                  Create your first database
                </Button>
              </Flex>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                      <Th>Size</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredDatabases.map((db) => (
                      <Tr 
                        key={db.id || db.name} 
                        _hover={{ bg: hoverBg }}
                        transition="background 0.2s"
                      >
                        <Td fontWeight="medium">{db.name}</Td>
                        <Td>{getStatusBadge(db.status || 'Active')}</Td>
                        <Td>{db.created ? new Date(db.created).toLocaleString() : 'Unknown'}</Td>
                        <Td>{db.size || 'N/A'}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="Copy Connection String" hasArrow>
                              <IconButton
                                icon={<HiClipboardCopy />}
                                size="sm"
                                aria-label="Copy connection string"
                                onClick={() => copyConnectionString(db.name)}
                                variant="ghost"
                                colorScheme="blue"
                              />
                            </Tooltip>
                            <Tooltip label="Delete Database" hasArrow>
                              <IconButton
                                icon={<HiTrash />}
                                size="sm"
                                aria-label="Delete database"
                                onClick={() => openDeleteModal(db)}
                                variant="ghost"
                                colorScheme="red"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </MotionBox>

      {/* Advanced Management Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Tabs variant="enclosed" colorScheme="purple" bg={cardBg} borderRadius="md" boxShadow="sm">
          <TabList>
            <Tab>Tenants</Tab>
            <Tab>Timelines</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Tenant ID</Th>
                      <Th>Status</Th>
                      <Th>Location</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <Tr key={i}>
                          <Td><Skeleton height="10px" width="150px" /></Td>
                          <Td><Skeleton height="10px" width="80px" /></Td>
                          <Td><Skeleton height="10px" width="120px" /></Td>
                        </Tr>
                      ))
                    ) : tenantsData.length === 0 ? (
                      <Tr>
                        <Td colSpan={3} textAlign="center" py={4}>
                          <Text color={subtleTextColor}>No tenant data available</Text>
                        </Td>
                      </Tr>
                    ) : (
                      tenantsData.map((tenant) => (
                        <Tr key={tenant.id} _hover={{ bg: hoverBg }}>
                          <Td fontFamily="mono" fontSize="xs">{tenant.id}</Td>
                          <Td>{getStatusBadge(tenant.status || 'Active')}</Td>
                          <Td>{tenant.location || 'Local'}</Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </TabPanel>
            <TabPanel>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Timeline ID</Th>
                      <Th>Tenant ID</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <Tr key={i}>
                          <Td><Skeleton height="10px" width="150px" /></Td>
                          <Td><Skeleton height="10px" width="150px" /></Td>
                          <Td><Skeleton height="10px" width="80px" /></Td>
                        </Tr>
                      ))
                    ) : timelinesData.length === 0 ? (
                      <Tr>
                        <Td colSpan={3} textAlign="center" py={4}>
                          <Text color={subtleTextColor}>No timeline data available</Text>
                        </Td>
                      </Tr>
                    ) : (
                      timelinesData.map((timeline) => (
                        <Tr key={timeline.id} _hover={{ bg: hoverBg }}>
                          <Td fontFamily="mono" fontSize="xs">{timeline.id}</Td>
                          <Td fontFamily="mono" fontSize="xs">{timeline.tenantId}</Td>
                          <Td>{getStatusBadge(timeline.status || 'Active')}</Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </MotionBox>

      {/* Create Database Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg={cardBg}>
          <ModalHeader>Create New Database</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Database Name</FormLabel>
              <Input 
                placeholder="Enter database name" 
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                bg={inputBg}
                autoFocus
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button 
              leftIcon={<HiPlus />}
              onClick={handleCreateDatabase} 
              isLoading={isCreating}
              bgGradient={buttonGradient}
              _hover={{ bgGradient: buttonHoverGradient }}
              color="white"
              mr={3}
            >
              Create
            </Button>
            <Button onClick={onCreateClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Database Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg={cardBg}>
          <ModalHeader>Delete Database</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Warning!</AlertTitle>
                <AlertDescription>
                  Are you sure you want to delete database <b>{selectedDb?.name}</b>? This action cannot be undone.
                </AlertDescription>
              </Box>
            </Alert>
          </ModalBody>

          <ModalFooter>
            <Button 
              leftIcon={<HiTrash />}
              onClick={handleDeleteDatabase} 
              isLoading={isDeleting}
              colorScheme="red"
              mr={3}
            >
              Delete
            </Button>
            <Button onClick={onDeleteClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Databases; 