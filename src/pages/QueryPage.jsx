import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { neonApi } from '../api/neonApi';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue
} from '@chakra-ui/react';
import { FiPlay, FiSave, FiDownload, FiCopy, FiRefreshCw, FiChevronDown } from 'react-icons/fi';

const QueryPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const queryParams = new URLSearchParams(location.search);
  const dbId = queryParams.get('dbId');
  const dbName = queryParams.get('dbName');
  
  const [database, setDatabase] = useState(null);
  const [sql, setSql] = useState('SELECT current_timestamp;');
  const [results, setResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedQueries, setSavedQueries] = useState([
    { id: 1, name: 'Get current time', sql: 'SELECT current_timestamp;' },
    { id: 2, name: 'List tables', sql: 'SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != \'pg_catalog\' AND schemaname != \'information_schema\';' },
    { id: 3, name: 'Database size', sql: 'SELECT pg_size_pretty(pg_database_size(current_database()));' }
  ]);
  
  const textareaRef = useRef(null);
  const bgColor = useColorModeValue('white', 'gray.700');

  // Redirect if no database ID is provided
  useEffect(() => {
    if (!dbId) {
      navigate('/dashboard');
    }
  }, [dbId, navigate]);

  // Get database connection details
  useEffect(() => {
    const getConnectionDetails = async () => {
      if (!dbId) return;
      
      try {
        setIsLoading(true);
        const dbConnection = await neonApi.getDatabaseConnection(dbId);
        setDatabase({
          id: dbId,
          name: dbName || 'Database',
          connection: dbConnection.connection
        });
      } catch (error) {
        toast({
          title: 'Connection error',
          description: error.message || 'Could not connect to database',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        setError(error.message || 'Connection failed');
      } finally {
        setIsLoading(false);
      }
    };

    getConnectionDetails();
  }, [dbId, dbName, toast]);

  // Execute SQL query
  const executeQuery = async () => {
    if (!sql.trim()) {
      toast({
        title: 'Empty query',
        description: 'Please enter a SQL query to execute',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      setIsExecuting(true);
      setError(null);
      
      const result = await neonApi.executeSQL(sql, database.connection);
      setResults(result);
      
      toast({
        title: 'Query executed',
        description: `${result.command} completed successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      setError(error.message || 'Query execution failed');
      setResults(null);
      
      toast({
        title: 'Query error',
        description: error.message || 'Failed to execute query',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Save current query
  const saveQuery = () => {
    if (!sql.trim()) return;
    
    const queryName = prompt('Enter a name for this query:');
    if (!queryName) return;
    
    const newQuery = {
      id: Date.now(),
      name: queryName,
      sql: sql
    };
    
    setSavedQueries([...savedQueries, newQuery]);
    
    toast({
      title: 'Query saved',
      description: `Query "${queryName}" has been saved`,
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };

  // Load a saved query
  const loadQuery = (query) => {
    setSql(query.sql);
    
    // Focus and scroll to the bottom of the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };

  // Copy results to clipboard
  const copyResults = () => {
    if (!results) return;
    
    const csvContent = results.rows.map(row => 
      Object.values(row).join(',')
    ).join('\n');
    
    navigator.clipboard.writeText(csvContent);
    
    toast({
      title: 'Copied to clipboard',
      description: 'Query results copied as CSV',
      status: 'info',
      duration: 2000,
      isClosable: true
    });
  };

  // Download results as CSV
  const downloadResults = () => {
    if (!results || !results.rows.length) return;
    
    const headers = results.fields.map(f => f.name).join(',');
    const rows = results.rows.map(row => 
      Object.values(row).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `query_results_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error && !database) {
    return (
      <Container maxW="container.xl" py={8}>
        <Card bg={bgColor} mb={6}>
          <CardBody>
            <Heading size="md" color="red.500" mb={2}>Connection Error</Heading>
            <Text>{error}</Text>
            <Button mt={4} onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Query: {database?.name}</Heading>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Flex>

      <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
        {/* Saved queries panel */}
        <Box width={{ base: '100%', lg: '25%' }}>
          <Card bg={bgColor} height="100%">
            <CardHeader pb={2}>
              <Heading size="md">Saved Queries</Heading>
            </CardHeader>
            <CardBody>
              {savedQueries.length === 0 ? (
                <Text>No saved queries yet</Text>
              ) : (
                <Flex direction="column" gap={2}>
                  {savedQueries.map(query => (
                    <Button 
                      key={query.id} 
                      variant="outline" 
                      justifyContent="flex-start" 
                      overflow="hidden" 
                      textOverflow="ellipsis" 
                      onClick={() => loadQuery(query)}
                      size="sm"
                    >
                      {query.name}
                    </Button>
                  ))}
                </Flex>
              )}
            </CardBody>
          </Card>
        </Box>

        {/* Query editor and results */}
        <Box width={{ base: '100%', lg: '75%' }}>
          <Card bg={bgColor} mb={6}>
            <CardHeader pb={2}>
              <Flex justify="space-between" align="center">
                <Heading size="md">SQL Editor</Heading>
                <Flex gap={2}>
                  <Button 
                    size="sm" 
                    leftIcon={<FiSave />} 
                    onClick={saveQuery}
                    isDisabled={!sql.trim()}
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    leftIcon={<FiPlay />} 
                    onClick={executeQuery}
                    isLoading={isExecuting}
                    loadingText="Running"
                    isDisabled={!sql.trim()}
                  >
                    Run Query
                  </Button>
                </Flex>
              </Flex>
            </CardHeader>
            <CardBody>
              <Textarea
                ref={textareaRef}
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                placeholder="Enter SQL query here..."
                size="md"
                fontFamily="monospace"
                height="200px"
                resize="vertical"
              />
            </CardBody>
          </Card>

          <Card bg={bgColor}>
            <CardHeader pb={2}>
              <Flex justify="space-between" align="center">
                <Heading size="md">Results</Heading>
                {results && results.rows && results.rows.length > 0 && (
                  <Flex gap={2}>
                    <IconButton 
                      aria-label="Copy to clipboard" 
                      icon={<FiCopy />} 
                      size="sm"
                      onClick={copyResults}
                    />
                    <IconButton 
                      aria-label="Download as CSV" 
                      icon={<FiDownload />} 
                      size="sm"
                      onClick={downloadResults}
                    />
                  </Flex>
                )}
              </Flex>
            </CardHeader>
            <CardBody>
              {isExecuting ? (
                <Flex justify="center" py={10}>
                  <Spinner />
                </Flex>
              ) : error ? (
                <Box p={4} bg="red.50" color="red.500" borderRadius="md">
                  <Text fontWeight="bold">Error:</Text>
                  <Text>{error}</Text>
                </Box>
              ) : results ? (
                <Box overflowX="auto">
                  {results.command === 'SELECT' && results.rows.length > 0 ? (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          {results.fields.map((field, i) => (
                            <Th key={i}>{field.name}</Th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {results.rows.map((row, i) => (
                          <Tr key={i}>
                            {results.fields.map((field, j) => (
                              <Td key={j}>
                                {row[field.name] !== null ? 
                                  (typeof row[field.name] === 'object' ? 
                                    JSON.stringify(row[field.name]) : 
                                    String(row[field.name])
                                  ) : 
                                  'NULL'
                                }
                              </Td>
                            ))}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Flex direction="column" align="center" py={4}>
                      <Text fontSize="lg" fontWeight="bold">
                        {results.command} completed successfully
                      </Text>
                      <Text>
                        {results.rowCount !== undefined ? 
                          `${results.rowCount} row${results.rowCount !== 1 ? 's' : ''} affected` : 
                          'Command executed'
                        }
                      </Text>
                    </Flex>
                  )}
                </Box>
              ) : (
                <Flex 
                  justify="center" 
                  align="center" 
                  direction="column"
                  height="200px"
                  color="gray.500"
                >
                  <Text>Execute a query to see results</Text>
                </Flex>
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Container>
  );
};

export default QueryPage; 