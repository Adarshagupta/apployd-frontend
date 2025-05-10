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
} from '@chakra-ui/react';
import { HiRefresh, HiExternalLink, HiPlus, HiTrash, HiDatabase, HiClock, HiServer } from 'react-icons/hi';
import { getTenants, getTimelines, createDatabase, getConnectionString, executeSql, neonApi } from '../api/neonApi';
import DatabaseStatus from '../components/DatabaseStatus';

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
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableBg = useColorModeValue('white', 'gray.800');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

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
    let connectionString = getConnectionString(dbName, user, port);
    
    navigator.clipboard.writeText(connectionString);
    toast({
      title: 'Connection string copied',
      description: `Connection string for ${dbName} copied to clipboard`,
      status: 'success',
      duration: 3000,
    });
  };
  
  const getStatusBadge = (status) => {
    const colorScheme = status === 'Active' ? 'green' : status === 'Pending' ? 'yellow' : 'gray';
    return (
      <Badge 
        colorScheme={colorScheme} 
        variant="subtle" 
        px={2} 
        py={1} 
        borderRadius="full" 
        fontSize="xs"
      >
        {status}
      </Badge>
    );
  };

  const openDeleteModal = (database) => {
    setSelectedDb(database);
    onDeleteOpen();
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // First refresh the database list via the API
      await neonApi.refreshDatabases();
      
      // Then fetch the updated list with neonApi.getDatabases
      const refreshedDatabases = await neonApi.getDatabases();
      setDatabasesData(refreshedDatabases);
      
      toast({
        title: 'Databases Refreshed',
        description: 'Database list has been refreshed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error refreshing databases:', error);
      toast({
        title: 'Refresh Failed',
        description: error.message || 'Failed to refresh database list',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="1200px" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <HStack spacing={3}>
          <HiDatabase size={28} color="#66add9" />
          <Heading size="lg" fontWeight="600">Databases</Heading>
        </HStack>
        <HStack spacing={3}>
          <Button
            size="md"
            variant="outline"
            leftIcon={<HiRefresh />}
            onClick={handleRefresh}
            isLoading={isLoading}
            borderRadius="md"
            _hover={{ bg: hoverBg }}
          >
            Refresh
          </Button>
          <Button
            size="md"
            colorScheme="blue"
            leftIcon={<HiPlus />}
            onClick={onCreateOpen}
            borderRadius="md"
            bgGradient="linear(to-r, blue.400, teal.400)"
            color="white"
            _hover={{
              bgGradient: "linear(to-r, blue.500, teal.500)",
            }}
          >
            Create Database
          </Button>
        </HStack>
      </Flex>

      {/* Status indicators in a nice card */}
      <Card bg={cardBg} shadow="sm" mb={6} borderRadius="lg" borderColor={borderColor} borderWidth="1px">
        <CardBody py={3} px={4}>
          <DatabaseStatus />
        </CardBody>
      </Card>

      {error && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontWeight="600">Connection Issue</AlertTitle>
            <AlertDescription fontSize="sm">{error}</AlertDescription>
          </Box>
        </Alert>
      )}

      <Tabs 
        variant="soft-rounded" 
        colorScheme="blue" 
        mb={6} 
        isLazy 
        borderRadius="lg"
      >
        <TabList mb={4} gap={2}>
          <Tab 
            fontWeight="medium" 
            _selected={{ color: 'white', bg: 'blue.500' }} 
            py={3} 
            px={6}
            fontSize="sm"
            leftIcon={<HiDatabase />}
          >
            Databases
          </Tab>
          <Tab 
            fontWeight="medium" 
            _selected={{ color: 'white', bg: 'blue.500' }} 
            py={3} 
            px={6}
            fontSize="sm"
            leftIcon={<HiClock />}
          >
            Timelines
          </Tab>
          <Tab 
            fontWeight="medium" 
            _selected={{ color: 'white', bg: 'blue.500' }} 
            py={3} 
            px={6}
            fontSize="sm"
            leftIcon={<HiServer />}
          >
            Tenants
          </Tab>
        </TabList>

        <TabPanels>
          {/* Databases Tab */}
          <TabPanel px={0} py={2}>
            <Card 
              bg={cardBg} 
              shadow="sm" 
              borderRadius="lg" 
              overflow="hidden"
              borderColor={borderColor}
              borderWidth="1px"
            >
              <TableContainer>
                <Table variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Database Name</Th>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Owner</Th>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Size</Th>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Source</Th>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Connection</Th>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoading ? (
                      <Tr>
                        <Td colSpan={6}>
                          <VStack spacing={2} align="stretch" py={2}>
                            <Skeleton height="40px" borderRadius="md" />
                            <Skeleton height="40px" borderRadius="md" />
                            <Skeleton height="40px" borderRadius="md" />
                          </VStack>
                        </Td>
                      </Tr>
                    ) : databasesData.length === 0 ? (
                      <Tr>
                        <Td colSpan={6}>
                          <Box textAlign="center" py={8}>
                            <HiDatabase size={40} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                            <Text color="gray.500">No databases found</Text>
                            <Button 
                              mt={4} 
                              size="sm" 
                              leftIcon={<HiPlus />} 
                              onClick={onCreateOpen}
                              colorScheme="blue"
                              variant="outline"
                            >
                              Create your first database
                            </Button>
                          </Box>
                        </Td>
                      </Tr>
                    ) : (
                      databasesData.map((database) => (
                        <Tr 
                          key={`${database.source || 'unknown'}-${database.name}`}
                          _hover={{ bg: hoverBg }}
                          transition="background 0.2s"
                        >
                          <Td fontWeight="500">{database.name}</Td>
                          <Td fontSize="sm">{database.owner}</Td>
                          <Td fontSize="sm">{database.size}</Td>
                          <Td>
                            <Badge 
                              colorScheme={database.source === 'neon' ? 'teal' : 'blue'}
                              variant="subtle"
                              px={2} 
                              py={1} 
                              borderRadius="full"
                              fontSize="xs"
                            >
                              {database.source === 'neon' ? 'Apployd DB' : 'Local'}
                            </Badge>
                          </Td>
                          <Td>
                            <Tooltip label="Copy connection string" placement="top">
                              <IconButton
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                icon={<HiExternalLink />}
                                onClick={() => copyConnectionString(
                                  database.name, 
                                  database.source === 'neon' ? 'cloud_admin' : database.owner,
                                  database.source === 'neon' ? 55433 : 5432
                                )}
                                aria-label="Copy connection string"
                                borderRadius="md"
                              />
                            </Tooltip>
                          </Td>
                          <Td>
                            <Tooltip label="Delete database" placement="top">
                              <IconButton
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                icon={<HiTrash />}
                                onClick={() => openDeleteModal(database)}
                                aria-label="Delete database"
                                borderRadius="md"
                              />
                            </Tooltip>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Card>
          </TabPanel>

          {/* Timelines Tab */}
          <TabPanel px={0} py={2}>
            <Card 
              bg={cardBg} 
              shadow="sm" 
              borderRadius="lg" 
              overflow="hidden"
              borderColor={borderColor}
              borderWidth="1px"
            >
              <TableContainer>
                <Table variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Timeline ID</Th>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Status</Th>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Tenant</Th>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Connection</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoading ? (
                      <Tr>
                        <Td colSpan={4}>
                          <VStack spacing={2} align="stretch" py={2}>
                            <Skeleton height="40px" borderRadius="md" />
                            <Skeleton height="40px" borderRadius="md" />
                          </VStack>
                        </Td>
                      </Tr>
                    ) : timelinesData.length === 0 ? (
                      <Tr>
                        <Td colSpan={4}>
                          <Box textAlign="center" py={8}>
                            <HiClock size={40} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                            <Text color="gray.500">No timelines found</Text>
                          </Box>
                        </Td>
                      </Tr>
                    ) : (
                      timelinesData.map((timeline) => (
                        <Tr 
                          key={timeline.timeline_id}
                          _hover={{ bg: hoverBg }}
                          transition="background 0.2s"
                        >
                          <Td fontFamily="mono" fontSize="sm">{timeline.timeline_id}</Td>
                          <Td>{getStatusBadge(timeline.state || 'Unknown')}</Td>
                          <Td fontFamily="mono" fontSize="sm">{timeline.tenantId}</Td>
                          <Td>
                            <Tooltip label="Copy connection string" placement="top">
                              <IconButton
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                icon={<HiExternalLink />}
                                onClick={() => copyConnectionString('postgres')}
                                aria-label="Copy connection string"
                                borderRadius="md"
                              />
                            </Tooltip>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Card>
          </TabPanel>

          {/* Tenants Tab */}
          <TabPanel px={0} py={2}>
            <Card 
              bg={cardBg} 
              shadow="sm" 
              borderRadius="lg" 
              overflow="hidden"
              borderColor={borderColor}
              borderWidth="1px"
            >
              <TableContainer>
                <Table variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Tenant ID</Th>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Status</Th>
                      <Th py={4} fontSize="xs" textTransform="uppercase" color="gray.600">Physical Size</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoading ? (
                      <Tr>
                        <Td colSpan={3}>
                          <VStack spacing={2} align="stretch" py={2}>
                            <Skeleton height="40px" borderRadius="md" />
                            <Skeleton height="40px" borderRadius="md" />
                          </VStack>
                        </Td>
                      </Tr>
                    ) : tenantsData.length === 0 ? (
                      <Tr>
                        <Td colSpan={3}>
                          <Box textAlign="center" py={8}>
                            <HiServer size={40} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                            <Text color="gray.500">No tenants found</Text>
                          </Box>
                        </Td>
                      </Tr>
                    ) : (
                      tenantsData.map((tenant) => (
                        <Tr 
                          key={tenant.id}
                          _hover={{ bg: hoverBg }}
                          transition="background 0.2s"
                        >
                          <Td fontFamily="mono" fontSize="sm">{tenant.id}</Td>
                          <Td>{getStatusBadge(tenant.state?.slug || 'Unknown')}</Td>
                          <Td>{tenant.current_physical_size || 'Unknown'}</Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Create Database Modal */}
      <Modal 
        isOpen={isCreateOpen} 
        onClose={onCreateClose}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="lg" shadow="lg">
          <ModalHeader 
            borderBottomWidth="1px" 
            borderColor={borderColor}
            py={4}
            fontSize="lg"
          >
            Create New Database
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Database Name</FormLabel>
              <Input 
                placeholder="Enter database name" 
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                borderRadius="md"
                size="md"
                autoFocus
              />
            </FormControl>
          </ModalBody>
          <ModalFooter 
            borderTopWidth="1px" 
            borderColor={borderColor}
            py={4}
          >
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onCreateClose}
              borderRadius="md"
            >
              Cancel
            </Button>
            <Button 
              colorScheme="blue"
              onClick={handleCreateDatabase}
              isLoading={isCreating}
              borderRadius="md"
              bgGradient="linear(to-r, blue.400, teal.400)"
              _hover={{
                bgGradient: "linear(to-r, blue.500, teal.500)",
              }}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Database Modal */}
      <Modal 
        isOpen={isDeleteOpen} 
        onClose={onDeleteClose}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="lg" shadow="lg">
          <ModalHeader 
            borderBottomWidth="1px" 
            borderColor={borderColor}
            py={4}
            color="red.500"
            fontSize="lg"
          >
            Delete Database
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="start">
              <Text>
                Are you sure you want to delete the database <strong>{selectedDb?.name}</strong>?
              </Text>
              <Alert status="warning" borderRadius="md" size="sm">
                <AlertIcon />
                <Text fontSize="sm">This action cannot be undone and all data will be permanently lost.</Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter 
            borderTopWidth="1px" 
            borderColor={borderColor}
            py={4}
          >
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onDeleteClose}
              borderRadius="md"
            >
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDeleteDatabase}
              isLoading={isDeleting}
              borderRadius="md"
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Databases; 