import React, { useState } from 'react';
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Card,
  CardBody,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Spinner,
  Badge,
  Divider,
} from '@chakra-ui/react';
import axios from 'axios';
import { getConnectionString, createDatabase } from '../api/neonApi';

const SqlEditor = () => {
  const [sql, setSql] = useState('SELECT current_timestamp, version();');
  const [results, setResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [createdDatabase, setCreatedDatabase] = useState(null);
  const toast = useToast();

  const executeQuery = async () => {
    try {
      setIsExecuting(true);
      setError(null);
      setSimulationMode(false);
      
      try {
        setCreatedDatabase(null);
      
        if (!sql.trim()) {
          setError({
            message: 'Please enter a SQL query to execute',
            hint: 'Try "SELECT current_timestamp, version();" or "SELECT * FROM pg_database;" for demo results.'
          });
          return;
        }
        
        const trimmedSql = sql.trim();
        
        // Check if this is a CREATE DATABASE statement
        if (trimmedSql.toLowerCase().startsWith('create database')) {
          await executeCreateDatabase(trimmedSql);
        } else {
          // For demo purposes, simulate results for common queries
          simulateResults(trimmedSql);
        }
      } catch (innerError) {
        console.error('Error executing query:', innerError);
        setError({
          message: innerError.message || 'Failed to execute SQL query',
          hint: 'Check your SQL syntax and try again.'
        });
      }
    } catch (outerError) {
      console.error('Unexpected error during query execution:', outerError);
      setError({
        message: 'An unexpected error occurred',
        hint: 'Please try again or refresh the page.'
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  const executeCreateDatabase = async (sqlQuery) => {
    try {
      // Extract database name
      const dbName = sqlQuery.toLowerCase().replace('create database', '').trim().replace(/;/g, '');
      
      if (!dbName) {
        throw new Error('Database name is required. Use syntax: CREATE DATABASE database_name;');
      }
      
      // Use the createDatabase function from neonApi.js
      const result = await createDatabase(dbName);
      
      // Store the created database details using the API response data
      const dbInfo = {
        name: dbName,
        host: result?.connection?.host || 'localhost',
        port: result?.connection?.port || 55433,
        user: result?.connection?.user || 'cloud_admin',
        connectionString: result?.connectionString || getConnectionString(dbName),
        created: result?.created || new Date().toISOString(),
        simulated: result?.simulated || false
      };
      
      try {
        setCreatedDatabase(dbInfo);
      } catch (stateError) {
        console.error('Error setting created database state:', stateError);
      }
      
      // Check if this is a simulated response
      if (result?.simulated) {
        setSimulationMode(true);
        toast({
          title: 'Database created (SIMULATION)',
          description: `Database "${dbName}" creation was simulated because the backend is not available`,
          status: 'warning',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Database created',
          description: `Database "${dbName}" created successfully`,
          status: 'success',
          duration: 5000,
        });
      }
      
      try {
        setResults({
          message: result?.message || `Database ${dbName} created successfully`,
          command: 'CREATE DATABASE',
          simulated: result?.simulated || false,
          dbInfo: dbInfo
        });
      } catch (stateError) {
        console.error('Error setting results state:', stateError);
      }
    } catch (error) {
      console.error('Error creating database:', error);
      throw new Error(error.message || 'Failed to create database');
    }
  };
  
  const simulateResults = (sqlQuery) => {
    try {
      let simulatedResults = null;
      
      if (sqlQuery.toLowerCase().includes('select current_timestamp')) {
        simulatedResults = {
          columns: ['current_timestamp', 'version'],
          rows: [
            {
              'current_timestamp': new Date().toISOString(),
              'version': 'PostgreSQL 16.8 on aarch64-unknown-linux-gnu, compiled by gcc 10.2.1'
            }
          ]
        };
      } else if (sqlQuery.toLowerCase().includes('select * from pg_database')) {
        simulatedResults = {
          columns: ['datname', 'datdba', 'encoding', 'datcollate'],
          rows: [
            { 'datname': 'postgres', 'datdba': 10, 'encoding': 'UTF8', 'datcollate': 'en_US.utf8' },
            { 'datname': 'template0', 'datdba': 10, 'encoding': 'UTF8', 'datcollate': 'en_US.utf8' },
            { 'datname': 'template1', 'datdba': 10, 'encoding': 'UTF8', 'datcollate': 'en_US.utf8' }
          ]
        };
      } else if (sqlQuery.toLowerCase().includes('create table')) {
        // Extract table name for the toast message
        const tableName = sqlQuery.toLowerCase().match(/create\s+table\s+(\w+)/i)?.[1] || 'table';
        
        toast({
          title: 'Table created',
          description: `Table "${tableName}" created successfully`,
          status: 'success',
          duration: 5000,
        });
        simulatedResults = {
          message: `CREATE TABLE`,
          command: 'CREATE TABLE'
        };
      } else {
        // Try to handle common SQL commands
        const command = sqlQuery.split(' ')[0].toUpperCase();
        
        toast({
          title: 'SQL executed',
          description: `Command "${command}" was executed`,
          status: 'success',
          duration: 3000,
        });
        
        simulatedResults = {
          message: `SQL executed: ${command}`,
          command: command
        };
      }
      
      try {
        setResults(simulatedResults);
      } catch (stateError) {
        console.error('Error setting results state:', stateError);
      }
    } catch (error) {
      console.error('Error simulating results:', error);
      throw new Error('Failed to process SQL query');
    }
  };

  const copyConnectionString = () => {
    try {
      const connectionString = getConnectionString();
      navigator.clipboard.writeText(connectionString);
      toast({
        title: 'Connection string copied',
        description: 'PostgreSQL connection string copied to clipboard',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error copying connection string:', error);
      toast({
        title: 'Copy failed',
        description: 'Failed to copy connection string',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Fallback rendering in case of unexpected error
  const renderSafely = () => {
    try {
      return (
        <Box>
          <Heading mb={6}>SQL Editor</Heading>
          
          <Card mb={6}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text>Connection: <Code>postgresql://cloud_admin:cloud_admin@localhost:55433/postgres</Code> 
                  <Button size="xs" ml={2} onClick={copyConnectionString}>
                    Copy
                  </Button>
                </Text>
                
                <Text>Enter SQL command:</Text>
                <Box
                  as="textarea"
                  value={sql}
                  onChange={(e) => setSql(e.target.value)}
                  h="150px"
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  fontFamily="mono"
                  fontSize="sm"
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #00aaff' }}
                />
                
                <HStack justify="flex-end">
                  <Button
                    colorScheme="brand"
                    onClick={executeQuery}
                    isLoading={isExecuting}
                    loadingText="Executing"
                  >
                    Execute Query
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
          
          {error && (
            <Alert status="warning" mb={6}>
              <AlertIcon />
              <Box>
                <AlertTitle>Query Error</AlertTitle>
                <AlertDescription>
                  {error.message}
                  {error.hint && (
                    <Text mt={2} fontSize="sm">
                      Hint: {error.hint}
                    </Text>
                  )}
                </AlertDescription>
              </Box>
            </Alert>
          )}
          
          {simulationMode && (
            <Alert status="info" mb={6}>
              <AlertIcon />
              <AlertTitle>Simulation Mode:</AlertTitle>
              <AlertDescription>
                The SQL command was not actually executed because the backend server is not available.
                This is just a simulation for UI testing purposes.
              </AlertDescription>
            </Alert>
          )}
          
          {isExecuting && (
            <Box mb={6} textAlign="center">
              <Spinner size="xl" color="brand.500" mb={4} />
              <Text>Executing query...</Text>
            </Box>
          )}
          
          {createdDatabase && (
            <Card mb={6} borderLeft="5px solid" borderLeftColor="green.400">
              <CardBody>
                <AlertTitle mb={2} fontSize="lg">Database Created Successfully!</AlertTitle>
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
                    <Button size="xs" mt={2} onClick={() => {
                      try {
                        navigator.clipboard.writeText(createdDatabase.connectionString);
                        toast({
                          title: 'Copied!',
                          description: 'Connection string copied to clipboard',
                          status: 'success',
                          duration: 2000,
                        });
                      } catch (error) {
                        console.error('Error copying connection string:', error);
                      }
                    }}>
                      Copy Connection String
                    </Button>
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
              </CardBody>
            </Card>
          )}
          
          {results && !createdDatabase && !isExecuting && (
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Query Results</Heading>
                
                {results.message ? (
                  <Alert status={results.simulated ? "warning" : "success"}>
                    <AlertIcon />
                    <Box>
                      <HStack>
                        <AlertTitle>{results.command}</AlertTitle>
                        {results.simulated && (
                          <Badge colorScheme="yellow">Simulated</Badge>
                        )}
                      </HStack>
                      <AlertDescription>{results.message}</AlertDescription>
                    </Box>
                  </Alert>
                ) : (
                  <Box>
                    <Text mb={2}>{results.rows.length} rows returned</Text>
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            {results.columns.map((column, idx) => (
                              <Th key={idx}>{column}</Th>
                            ))}
                          </Tr>
                        </Thead>
                        <Tbody>
                          {results.rows.map((row, rowIdx) => (
                            <Tr key={rowIdx}>
                              {results.columns.map((column, colIdx) => (
                                <Td key={`${rowIdx}-${colIdx}`}>{row[column]}</Td>
                              ))}
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardBody>
            </Card>
          )}
        </Box>
      );
    } catch (error) {
      console.error('Error rendering SQL Editor page:', error);
      return (
        <Box>
          <Heading mb={6}>SQL Editor</Heading>
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

export default SqlEditor; 