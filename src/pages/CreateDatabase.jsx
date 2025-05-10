import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Text,
  useToast,
  Select,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  RadioGroup,
  Radio,
  Stack,
  Spinner,
  Code,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import axios from 'axios';
import { getTenants, getTimelines, createTimeline, createDatabase, getDatabases, generateUUID, getConnectionString } from '../api/neonApi';

const CreateDatabase = () => {
  const [tenantsData, setTenantsData] = useState([]);
  const [timelinesData, setTimelinesData] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedTimeline, setSelectedTimeline] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [createType, setCreateType] = useState('database'); // Default to database for simplicity
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [createdDatabase, setCreatedDatabase] = useState(null);
  const [existingDatabases, setExistingDatabases] = useState([]);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Fetch databases on mount and whenever a new database is created
  useEffect(() => {
    fetchDatabases();
  }, [createdDatabase]);

  const fetchDatabases = async () => {
    try {
      setIsLoadingDatabases(true);
      const databases = await getDatabases();
      setExistingDatabases(databases);
    } catch (error) {
      console.error('Error fetching databases:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch existing databases',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoadingDatabases(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get tenants
        const tenants = await getTenants();
        console.log('Tenants fetched:', tenants);
        
        // Safely set tenants data
        try {
          setTenantsData(Array.isArray(tenants) ? tenants : []);
          
          if (Array.isArray(tenants) && tenants.length > 0) {
            setSelectedTenant(tenants[0].id);
            
            // Get timelines for the first tenant
            try {
              const timelines = await getTimelines(tenants[0].id);
              console.log('Timelines fetched:', timelines);
              
              // Safely set timelines data
              setTimelinesData(Array.isArray(timelines) ? timelines : []);
              
              if (Array.isArray(timelines) && timelines.length > 0) {
                setSelectedTimeline(timelines[0].timeline_id);
              }
            } catch (error) {
              console.error(`Error fetching timelines:`, error);
              setTimelinesData([]);
            }
          } else {
            // Set simulation mode if no tenants are available
            setError('No tenants found. Backend services might not be running.');
            setSimulationMode(true);
          }
        } catch (stateError) {
          console.error('Error updating state:', stateError);
          setError('Error occurred while updating the UI. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to connect to backend services. Please check if they are running.');
        setSimulationMode(true);
        toast({
          title: 'Error fetching data',
          description: error.message || 'Unknown error occurred',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleTenantChange = async (e) => {
    try {
      const tenantId = e.target.value;
      setSelectedTenant(tenantId);
      
      try {
        setIsLoading(true);
        setError(null);
        const timelines = await getTimelines(tenantId);
        console.log('Timelines for tenant:', timelines);
        
        // Safely set timelines data
        setTimelinesData(Array.isArray(timelines) ? timelines : []);
        
        if (Array.isArray(timelines) && timelines.length > 0) {
          setSelectedTimeline(timelines[0].timeline_id);
        } else {
          setSelectedTimeline('');
          setError(`No timelines found for tenant ${tenantId}`);
        }
      } catch (error) {
        console.error(`Error fetching timelines for tenant ${tenantId}:`, error);
        setError(`Failed to fetch timelines for tenant ${tenantId}`);
        setTimelinesData([]);
        toast({
          title: 'Error fetching timelines',
          description: error.message || 'Unknown error occurred',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in tenant change handler:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Reset any previous database creation info
      setCreatedDatabase(null);
    
      if (createType === 'branch') {
        // Create a new branch/timeline
        try {
          const newTimelineId = generateUUID();
          console.log('Creating branch with UUID:', newTimelineId);
          
          await createTimeline(selectedTenant, newTimelineId, 16, selectedTimeline);
          
          toast({
            title: 'Branch created',
            description: `New branch created with timeline ID: ${newTimelineId}`,
            status: 'success',
            duration: 5000,
          });
          
          // Refresh timelines
          const timelines = await getTimelines(selectedTenant);
          setTimelinesData(Array.isArray(timelines) ? timelines : []);
        } catch (branchError) {
          console.error('Error creating branch:', branchError);
          throw new Error(branchError.message || 'Failed to create branch');
        }
      } else if (createType === 'database') {
        // Database creation logic
        try {
          if (!databaseName || databaseName.trim() === '') {
            setError('Database name is required');
            setIsSubmitting(false);
            return;
          }
          
          // Check if database name already exists
          const dbExists = existingDatabases.some(db => db.name.toLowerCase() === databaseName.toLowerCase());
          if (dbExists) {
            setError(`Database '${databaseName}' already exists. Please choose a different name.`);
            setIsSubmitting(false);
            return;
          }
          
          console.log('Creating database:', databaseName);
          
          // Create the database
          const result = await createDatabase(databaseName);
          console.log('Database creation result:', result);
          
          // Provide fallback values for all fields to prevent undefined/null errors
          const dbInfo = {
            name: databaseName,
            host: result?.connection?.host || 'localhost',
            port: result?.connection?.port || 55433,
            user: result?.connection?.user || 'cloud_admin',
            connectionString: result?.connectionString || `postgresql://cloud_admin:cloud_admin@localhost:55433/${databaseName}`,
            created: result?.created || new Date().toISOString(),
            simulated: result?.simulated || false
          };
          
          console.log('Setting created database info:', dbInfo);
          setCreatedDatabase(dbInfo);
          
          // Refresh the list of databases
          fetchDatabases();
          
          // Check if this was a simulated response
          if (result?.simulated) {
            setSimulationMode(true);
            toast({
              title: 'Database created (SIMULATION)',
              description: `Database "${databaseName}" creation was simulated because the backend is not available`,
              status: 'warning',
              duration: 8000,
              isClosable: true,
            });
          } else {
            toast({
              title: 'Database created',
              description: `Database "${databaseName}" created successfully`,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          }
        } catch (dbError) {
          console.error('Error creating database via API:', dbError);
          // Check if error is due to database already existing
          if (dbError.message?.includes('already exists')) {
            setError(`Database '${databaseName}' already exists. Please choose a different name.`);
          } else {
            setError(dbError.message || 'Failed to create database. Make sure the database server is running.');
          }
          toast({
            title: 'Error creating database',
            description: dbError.message || 'Unknown error occurred',
            status: 'error',
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Unexpected error during form submission:', error);
      setError('An unexpected error occurred. Please try again.');
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleViewDatabases = () => {
    fetchDatabases();
    onOpen();
  };

  // Fallback rendering in case of unexpected error
  const renderSafely = () => {
    try {
      return (
        <Box>
          <Heading mb={6}>Create Database</Heading>
          
          {error && (
            <Alert status="warning" mb={6}>
              <AlertIcon />
              <AlertTitle>Warning:</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {simulationMode && (
            <Alert status="info" mb={6}>
              <AlertIcon />
              <AlertTitle>Simulation Mode:</AlertTitle>
              <AlertDescription>
                The database was not actually created because the backend server is not available.
                This is just a simulation for UI testing purposes.
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            mb={4} 
            colorScheme="blue" 
            variant="outline" 
            size="sm" 
            onClick={handleViewDatabases}
          >
            View Existing Databases
          </Button>
          
          {createdDatabase && (
            <Card mb={6} borderLeft="5px solid" borderLeftColor="green.400">
              <CardBody>
                <Heading mb={2} fontSize="lg">Database Created Successfully!</Heading>
                <Divider mb={4} />
                <VStack spacing={3} align="stretch">
                  <Box>
                    <Text fontWeight="bold">Database Name:</Text>
                    <Code p={2} borderRadius="md" bg="gray.50" fontSize="md" width="100%">
                      {createdDatabase.name}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">Connection Details:</Text>
                    <Code p={2} borderRadius="md" bg="gray.50" fontSize="md" width="100%" display="block">
                      Host: {createdDatabase.host}<br />
                      Port: {createdDatabase.port}<br />
                      User: {createdDatabase.user}<br />
                    </Code>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">Connection String:</Text>
                    <Code p={2} borderRadius="md" bg="gray.50" fontSize="md" width="100%" overflowX="auto" display="block">
                      {createdDatabase.connectionString}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">PostgreSQL Command Line:</Text>
                    <Code p={2} borderRadius="md" bg="gray.50" fontSize="md" width="100%" overflowX="auto" display="block">
                      psql {createdDatabase.connectionString}
                    </Code>
                  </Box>
                  
                  {createdDatabase.simulated && (
                    <Alert status="info" size="sm">
                      <AlertIcon />
                      <Text fontSize="sm">
                        This is a simulated database. In simulation mode, the database doesn't actually exist.
                      </Text>
                    </Alert>
                  )}
                </VStack>
                
                <Button 
                  mt={4} 
                  size="sm" 
                  colorScheme="gray" 
                  onClick={() => {
                    try {
                      setCreatedDatabase(null);
                      setDatabaseName('');
                    } catch (e) {
                      console.error('Error clearing form:', e);
                    }
                  }}
                >
                  Create Another Database
                </Button>
              </CardBody>
            </Card>
          )}
          
          <Card mb={6}>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <RadioGroup onChange={setCreateType} value={createType} colorScheme="brand">
                  <Stack direction="row" spacing={5}>
                    <Radio value="branch">Create Branch (Timeline)</Radio>
                    <Radio value="database">Create Database</Radio>
                  </Stack>
                </RadioGroup>
                
                {createType === 'branch' && (
                  <>
                    <FormControl isRequired>
                      <FormLabel>Tenant</FormLabel>
                      <Select 
                        value={selectedTenant} 
                        onChange={handleTenantChange}
                        isDisabled={isLoading || tenantsData.length === 0}
                      >
                        {tenantsData.length === 0 ? (
                          <option value="">No tenants available</option>
                        ) : (
                          tenantsData.map((tenant) => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.id}
                            </option>
                          ))
                        )}
                      </Select>
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Parent Timeline (Branch From)</FormLabel>
                      <Select 
                        value={selectedTimeline} 
                        onChange={(e) => setSelectedTimeline(e.target.value)}
                        isDisabled={isLoading || timelinesData.length === 0}
                      >
                        {timelinesData.length === 0 ? (
                          <option value="">No timelines available</option>
                        ) : (
                          timelinesData.map((timeline) => (
                            <option key={timeline.timeline_id} value={timeline.timeline_id}>
                              {timeline.timeline_id}
                            </option>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </>
                )}
                
                {createType === 'database' && (
                  <FormControl isRequired>
                    <FormLabel>Database Name</FormLabel>
                    <Input 
                      placeholder="Enter database name" 
                      value={databaseName} 
                      onChange={(e) => setDatabaseName(e.target.value)}
                    />
                  </FormControl>
                )}
                
                {createType === 'database' && (
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>SQL Command</AlertTitle>
                      <AlertDescription>
                        The following SQL command will be executed:
                        <Text fontFamily="mono" mt={2} p={2} bg="gray.50" borderRadius="md">
                          CREATE DATABASE {databaseName || 'your_database_name'};
                        </Text>
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
                
                {isSubmitting && (
                  <Box textAlign="center" py={4}>
                    <Spinner size="md" color="brand.500" />
                    <Text mt={2}>
                      {createType === 'branch' ? 'Creating branch...' : 'Creating database...'}
                    </Text>
                  </Box>
                )}
                
                <Button 
                  colorScheme="brand" 
                  type="submit" 
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  isDisabled={
                    (createType === 'branch' && (!selectedTenant || !selectedTimeline)) ||
                    (createType === 'database' && (!databaseName))
                  }
                >
                  {createType === 'branch' ? 'Create Branch' : 'Create Database'}
                </Button>
              </VStack>
            </CardBody>
          </Card>
          
          {/* Modal to display existing databases */}
          <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Existing Databases</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                {isLoadingDatabases ? (
                  <Box textAlign="center" py={4}>
                    <Spinner size="md" />
                    <Text mt={2}>Loading databases...</Text>
                  </Box>
                ) : existingDatabases.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>No Databases</AlertTitle>
                      <AlertDescription>
                        No databases found. Create your first database!
                      </AlertDescription>
                    </Box>
                  </Alert>
                ) : (
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Size</Th>
                        <Th>Owner</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {existingDatabases.map((db) => (
                        <Tr key={db.name}>
                          <Td>{db.name}</Td>
                          <Td>{db.size}</Td>
                          <Td>{db.owner}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>
      );
    } catch (error) {
      console.error('Error rendering Create Database page:', error);
      return (
        <Box>
          <Heading mb={6}>Create Database</Heading>
          <Alert status="error" mb={6}>
            <AlertIcon />
            <AlertTitle>Error:</AlertTitle>
            <AlertDescription>
              An error occurred while loading this page. Please refresh and try again.
            </AlertDescription>
          </Alert>
          <Button 
            colorScheme="blue" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </Box>
      );
    }
  };

  return renderSafely();
};

export default CreateDatabase; 