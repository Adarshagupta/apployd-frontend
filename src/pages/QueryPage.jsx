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
  useColorModeValue,
  HStack,
  VStack,
  Badge,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Code,
  Tooltip,
  Tag,
  Kbd,
  InputGroup,
  InputRightElement,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FiPlay, FiSave, FiDownload, FiCopy, FiRefreshCw, FiChevronDown, FiDatabase, FiTable, FiPlus, FiTrash2, FiEdit, FiEye, FiList, FiCommand, FiInfo, FiMaximize, FiMinimize, FiZap, FiCheckSquare, FiBookmark } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
  
  // New state for table management
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [tableStructure, setTableStructure] = useState(null);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [newTableColumns, setNewTableColumns] = useState([
    { name: 'id', type: 'SERIAL', constraints: 'PRIMARY KEY' },
    { name: 'name', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
    { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP' }
  ]);
  
  // Add new states for enhanced UI
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  
  // Modal states
  const { 
    isOpen: isCreateTableOpen, 
    onOpen: onCreateTableOpen, 
    onClose: onCreateTableClose 
  } = useDisclosure();
  
  const {
    isOpen: isViewTableOpen,
    onOpen: onViewTableOpen,
    onClose: onViewTableClose
  } = useDisclosure();
  
  const textareaRef = useRef(null);
  
  // Theme colors - modernized
  const bgColor = useColorModeValue('white', 'gray.800');
  const tableBgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBgGradient = useColorModeValue(
    'linear(to-r, brand.500, purple.500)',
    'linear(to-r, brand.600, purple.600)'
  );
  const textEditorBg = useColorModeValue('gray.50', 'gray.900');
  const textEditorColor = useColorModeValue('gray.800', 'white');
  const textEditorBorder = useColorModeValue('brand.100', 'purple.800');
  const tableHeaderBg = useColorModeValue('gray.100', 'gray.700');
  const tableBorder = useColorModeValue('gray.200', 'gray.600');
  const resultCardBg = useColorModeValue('white', 'gray.800');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const accentColor = useColorModeValue('brand.500', 'brand.300');
  const tableRowHoverBg = useColorModeValue('brand.50', 'gray.700');

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

  // Fetch database tables
  const fetchTables = async () => {
    if (!database?.connection) return;
    
    try {
      setIsLoadingTables(true);
      
      const tableQuery = `
        SELECT 
          tablename AS name,
          pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) AS size,
          pg_relation_size(quote_ident(tablename)) AS raw_size
        FROM pg_catalog.pg_tables 
        WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
        ORDER BY raw_size DESC;
      `;
      
      const result = await neonApi.executeSQL(tableQuery, database.connection);
      
      if (result?.rows) {
        setTables(result.rows);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: 'Error fetching tables',
        description: error.message || 'Failed to load database tables',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoadingTables(false);
    }
  };
  
  // Fetch table data when a table is selected
  const fetchTableData = async (tableName) => {
    if (!database?.connection || !tableName) return;
    
    try {
      setIsLoadingTables(true);
      setSelectedTable(tableName);
      
      // Get table data (first 100 rows)
      const dataQuery = `SELECT * FROM "${tableName}" LIMIT 100;`;
      const dataResult = await neonApi.executeSQL(dataQuery, database.connection);
      
      if (dataResult?.rows) {
        setTableData(dataResult);
      }
      
      // Get table structure
      const structureQuery = `
        SELECT 
          column_name AS name, 
          data_type AS type,
          is_nullable AS nullable,
          column_default AS default_value
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position;
      `;
      
      const structureResult = await neonApi.executeSQL(structureQuery, database.connection);
      
      if (structureResult?.rows) {
        setTableStructure(structureResult.rows);
      }
      
      onViewTableOpen();
    } catch (error) {
      console.error('Error fetching table data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load table data',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoadingTables(false);
    }
  };

  // Create new enhanced version of executeQuery
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
      
      // Add to query history
      setQueryHistory([
        { 
          timestamp: new Date().toLocaleTimeString(), 
          sql: sql.substring(0, 80) + (sql.length > 80 ? '...' : ''),
          status: 'success'
        },
        ...queryHistory.slice(0, 9) // Keep last 10 queries
      ]);
      
      // Refresh tables list if this was a DDL command (CREATE, ALTER, DROP)
      const sqlLower = sql.toLowerCase();
      if (
        sqlLower.includes('create table') || 
        sqlLower.includes('drop table') || 
        sqlLower.includes('alter table')
      ) {
        fetchTables();
      }
      
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
      
      // Add to query history
      setQueryHistory([
        { 
          timestamp: new Date().toLocaleTimeString(), 
          sql: sql.substring(0, 80) + (sql.length > 80 ? '...' : ''),
          status: 'error'
        },
        ...queryHistory.slice(0, 9) // Keep last 10 queries
      ]);
      
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
    
    const headers = Object.keys(results.rows[0]).join(',');
    const rows = results.rows.map(row => Object.values(row).join(',')).join('\n');
    const csv = headers + '\n' + rows;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download started',
      description: 'Query results downloading as CSV',
      status: 'info',
      duration: 2000,
      isClosable: true
    });
  };

  // Add new column for table creation
  const addNewColumn = () => {
    setNewTableColumns([
      ...newTableColumns,
      { name: '', type: 'VARCHAR(255)', constraints: '' }
    ]);
  };

  // Update column in new table form
  const updateNewColumn = (index, field, value) => {
    const updatedColumns = [...newTableColumns];
    updatedColumns[index] = {
      ...updatedColumns[index],
      [field]: value
    };
    setNewTableColumns(updatedColumns);
  };

  // Remove column from new table form
  const removeNewColumn = (index) => {
    if (newTableColumns.length <= 1) return;
    const updatedColumns = newTableColumns.filter((_, i) => i !== index);
    setNewTableColumns(updatedColumns);
  };

  // Generate CREATE TABLE SQL
  const generateCreateTableSQL = () => {
    const tableName = window.prompt('Enter table name:');
    if (!tableName) return;
    
    const columnsSQL = newTableColumns
      .filter(col => col.name && col.type)
      .map(col => `  "${col.name}" ${col.type}${col.constraints ? ' ' + col.constraints : ''}`)
      .join(',\n');
    
    const sql = `CREATE TABLE "${tableName}" (\n${columnsSQL}\n);`;
    setSql(sql);
    
    // Focus and scroll
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };

  // Load table structure as SQL
  const loadTableStructureAsSQL = () => {
    if (!selectedTable || !tableStructure) return;
    
    const columnsSQL = tableStructure
      .map(col => {
        const nullable = col.nullable === 'YES' ? '' : ' NOT NULL';
        const defaultVal = col.default_value ? ` DEFAULT ${col.default_value}` : '';
        return `  "${col.name}" ${col.type}${nullable}${defaultVal}`;
      })
      .join(',\n');
    
    const sql = `CREATE TABLE "${selectedTable}" (\n${columnsSQL}\n);`;
    setSql(sql);
    onViewTableClose();
    
    // Focus and scroll
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };
  
  // Create DROP TABLE statement
  const generateDropTableSQL = (tableName) => {
    const sql = `DROP TABLE "${tableName}";`;
    setSql(sql);
    
    // Focus and scroll
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };
  
  // Generate SELECT statement
  const generateSelectSQL = (tableName) => {
    const sql = `SELECT * FROM "${tableName}" LIMIT 100;`;
    setSql(sql);
    
    // Focus and scroll
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };

  // Load database when connection is established
  useEffect(() => {
    if (database?.connection) {
      fetchTables();
    }
  }, [database]);

  // Toggle fullscreen editor
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
    <Container maxW="container.xl" py={4}>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card mb={4} boxShadow="md" borderRadius="xl" overflow="hidden">
          <Box
            bgGradient={headerBgGradient}
            color="white"
            py={3}
            px={6}
          >
          <HStack justify="space-between">
            <Flex align="center">
              <FiDatabase size={20} />
                <Heading size="md" ml={2} fontWeight="500">{database?.name || 'SQL Editor'}</Heading>
              {isLoading && <Spinner size="sm" ml={2} />}
      </Flex>

            <HStack>
                <Tooltip label="Refresh Tables">
                  <IconButton
                    icon={<FiRefreshCw />}
                onClick={fetchTables}
                isLoading={isLoadingTables}
                    variant="ghost"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    color="white"
                    aria-label="Refresh"
                  />
                </Tooltip>
                <Tag colorScheme="green" size="sm" borderRadius="full">
                  Connected
                </Tag>
            </HStack>
          </HStack>
          </Box>
        
          <CardBody p={0}>
            <Tabs variant="soft-rounded" colorScheme="brand" p={5}>
              <TabList mb={4}>
                <Tab _selected={{ bg: accentColor, color: 'white' }} px={4} fontWeight="medium">
                  <HStack><FiPlay size={16} /><Text>Query Editor</Text></HStack>
                </Tab>
                <Tab _selected={{ bg: accentColor, color: 'white' }} px={4} fontWeight="medium">
                  <HStack><FiTable size={16} /><Text>Tables</Text></HStack>
                </Tab>
            </TabList>
            
            <TabPanels>
                {/* Query Editor Tab - Enhanced */}
              <TabPanel px={0}>
                  <Grid templateColumns={isFullscreen ? "1fr" : "3fr 1fr"} gap={4}>
                    <GridItem>
                      <Card 
                        borderRadius="lg" 
                        bg={textEditorBg} 
                        boxShadow="sm"
                        borderWidth="1px"
                        borderColor={textEditorBorder}
                        mb={4}
                        position="relative"
                        overflow="hidden"
                      >
                        <Flex justify="space-between" alignItems="center" px={4} pt={3} pb={1}>
                          <HStack>
                            <Tag size="sm" colorScheme="purple">SQL</Tag>
                            <Text fontSize="sm" color="gray.500">Editor</Text>
                          </HStack>
                          <Tooltip label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                            <IconButton
                              size="sm"
                              icon={isFullscreen ? <FiMinimize /> : <FiMaximize />}
                              variant="ghost"
                              onClick={toggleFullscreen}
                              aria-label="Toggle fullscreen"
                            />
                          </Tooltip>
                        </Flex>
                        <Box px={4} pb={4}>
                  <Textarea
                    ref={textareaRef}
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                    placeholder="Enter SQL query here..."
                    resize="none"
                            h={isFullscreen ? "60vh" : "220px"}
                            fontFamily="mono"
                            fontSize="md"
                            bg={textEditorBg}
                            color={textEditorColor}
                            border="none"
                            _focus={{
                              outline: "none",
                              boxShadow: "none",
                            }}
                            sx={{
                              '&::-webkit-scrollbar': {
                                width: '8px',
                              },
                              '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: 'gray.300',
                                borderRadius: '4px',
                              },
                            }}
                  />
                        </Box>
                        <Flex justify="space-between" bg={tableBgColor} p={3} borderTop="1px" borderColor={tableBorder}>
                    <HStack>
                      <Button
                              colorScheme="brand"
                              leftIcon={<FiZap />}
                        onClick={executeQuery}
                        isLoading={isExecuting}
                              borderRadius="full"
                              size="sm"
                              fontWeight="medium"
                      >
                        Execute
                      </Button>
                      
                    <Button 
                              leftIcon={<FiBookmark />}
                        onClick={saveQuery}
                              borderRadius="full"
                              size="sm"
                              variant="outline"
                      >
                        Save Query
                      </Button>
                    </HStack>
                    
                          <Tooltip label="Keyboard shortcut: Ctrl+Enter">
                            <Kbd size="xs">⌘+Enter</Kbd>
                          </Tooltip>
                  </Flex>
                      </Card>
                  
                  {error && (
                        <Alert status="error" mb={4} borderRadius="lg">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}
                  
                  {results && (
                        <Card 
                          bg={resultCardBg} 
                          boxShadow="sm" 
                          borderRadius="lg" 
                          overflow="hidden"
                          transition="all 0.2s" 
                          _hover={{ transform: "translateY(-2px)", boxShadow: "md" }} 
                          mb={4}
                        >
                          <Box bg={accentColor} py={2} px={4}>
                            <Flex justify="space-between" align="center">
                              <HStack>
                                <Text color="white" fontWeight="medium">
                          {results.command} | {results.rows?.length || 0} rows
                        </Text>
                                {results.command === 'SELECT' && (
                                  <Tag size="sm" colorScheme="green" variant="solid">
                                    {results.rows?.length || 0} Results
                                  </Tag>
                                )}
                              </HStack>
                        <HStack>
                                <Tooltip label="Copy as CSV">
                          <IconButton
                            icon={<FiCopy />}
                            size="sm"
                                    variant="ghost"
                                    color="white"
                                    _hover={{ bg: 'whiteAlpha.200' }}
                            onClick={copyResults}
                                    aria-label="Copy results"
                          />
                                </Tooltip>
                                <Tooltip label="Download CSV">
                          <IconButton
                            icon={<FiDownload />}
                            size="sm"
                                    variant="ghost"
                                    color="white"
                                    _hover={{ bg: 'whiteAlpha.200' }}
                            onClick={downloadResults}
                                    aria-label="Download as CSV"
                          />
                                </Tooltip>
                        </HStack>
                      </Flex>
                          </Box>
                          <CardBody p={0}>
                            {results.rows && results.rows.length > 0 ? (
                              <Box overflow="auto" maxH="400px">
                                <Table variant="simple" size="sm">
                                  <Thead bg={tableHeaderBg}>
                            <Tr>
                              {Object.keys(results.rows[0]).map(column => (
                                        <Th key={column} py={3}>{column}</Th>
                              ))}
                            </Tr>
                          </Thead>
                          <Tbody>
                            {results.rows.map((row, rowIndex) => (
                                      <Tr 
                                        key={rowIndex}
                                        _hover={{ bg: tableRowHoverBg }}
                                        transition="background-color 0.2s"
                                      >
                                {Object.values(row).map((cell, cellIndex) => (
                                  <Td key={cellIndex}>{String(cell !== null ? cell : 'NULL')}</Td>
                                ))}
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                              </Box>
                            ) : (
                              <Box p={4} textAlign="center">
                                <Text>Operation completed - no rows returned</Text>
                    </Box>
                  )}
                          </CardBody>
                        </Card>
                      )}
                    </GridItem>
                    
                    {!isFullscreen && (
                      <GridItem>
                        <VStack spacing={4} align="stretch">
                          <Card boxShadow="sm" borderRadius="lg">
                            <CardHeader pb={2}>
                              <HStack>
                                <FiCommand />
                                <Heading size="sm">Saved Queries</Heading>
                              </HStack>
                            </CardHeader>
                            <CardBody pt={0}>
                              {savedQueries.length > 0 ? (
                                <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                                  {savedQueries.map(query => (
                                    <Button
                                      key={query.id}
                                      variant="ghost"
                                      justifyContent="flex-start"
                                      fontSize="sm"
                                      leftIcon={<FiCheckSquare size={14} />}
                                      onClick={() => loadQuery(query)}
                                      _hover={{ bg: cardHoverBg }}
                                      borderRadius="md"
                                      size="sm"
                                    >
                                      {query.name}
                                    </Button>
                                  ))}
                                </VStack>
                              ) : (
                                <Text fontSize="sm" color="gray.500">No saved queries</Text>
                              )}
                            </CardBody>
                          </Card>
                          
                          <Card boxShadow="sm" borderRadius="lg">
                            <CardHeader pb={2}>
                              <HStack>
                                <FiInfo />
                                <Heading size="sm">Query History</Heading>
                              </HStack>
                            </CardHeader>
                            <CardBody pt={0}>
                              {queryHistory.length > 0 ? (
                                <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                                  {queryHistory.map((entry, index) => (
                                    <Flex 
                                      key={index} 
                                      p={2} 
                                      borderRadius="md" 
                                      bg={entry.status === 'error' ? 'red.50' : 'green.50'}
                                      _dark={{
                                        bg: entry.status === 'error' ? 'red.900' : 'green.900',
                                      }}
                                      align="center"
                                      fontSize="xs"
                                    >
                                      <Badge 
                                        colorScheme={entry.status === 'error' ? 'red' : 'green'} 
                                        mr={2}
                                      >
                                        {entry.status}
                                      </Badge>
                                      <Box flex="1" isTruncated>{entry.sql}</Box>
                                      <Text color="gray.500" ml={2}>{entry.timestamp}</Text>
                </Flex>
                                  ))}
                                </VStack>
                              ) : (
                                <Text fontSize="sm" color="gray.500">No query history</Text>
                              )}
                            </CardBody>
                          </Card>
                        </VStack>
                      </GridItem>
                    )}
                  </Grid>
              </TabPanel>
              
              {/* Tables Tab */}
              <TabPanel px={0}>
                <HStack spacing={4} mb={4}>
                  <Button 
                      colorScheme="brand" 
                    leftIcon={<FiPlus />}
                    onClick={onCreateTableOpen}
                      borderRadius="full"
                  >
                    Create Table
                  </Button>
                  
                  <Button 
                    leftIcon={<FiRefreshCw />}
                    onClick={fetchTables}
                    isLoading={isLoadingTables}
                      variant="outline"
                      borderRadius="full"
                  >
                    Refresh Tables
                  </Button>
                </HStack>
                
                {tables.length === 0 ? (
                    <Alert 
                      status="info" 
                      borderRadius="lg"
                      variant="subtle"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      textAlign="center"
                      py={6}
                    >
                      <Box mb={3}>
                        <FiTable size={30} />
                      </Box>
                      <AlertIcon boxSize={5} mr={0} display="none" />
                      <Text mb={2} fontWeight="medium">No tables found in this database</Text>
                      <Text fontSize="sm">Create a new table to get started</Text>
                  </Alert>
                ) : (
                    <Card variant="outline" boxShadow="sm" borderRadius="lg" overflow="hidden">
                    <CardBody p={0}>
                      <Table variant="simple">
                          <Thead bg={tableHeaderBg}>
                          <Tr>
                            <Th>Table Name</Th>
                            <Th>Size</Th>
                            <Th textAlign="right">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {tables.map((table, index) => (
                              <Tr 
                                key={index}
                                _hover={{ bg: tableRowHoverBg }}
                                transition="background-color 0.2s"
                              >
                                <Td fontWeight="medium">
                                  <HStack>
                                    <FiTable size={14} />
                                    <Text>{table.name}</Text>
                                  </HStack>
                                </Td>
                                <Td>
                                  <Tag size="sm" colorScheme="blue" variant="subtle">
                                    {table.size}
                                  </Tag>
                                </Td>
                              <Td textAlign="right">
                                <HStack spacing={2} justify="flex-end">
                                  <Tooltip label="View Data">
                                    <IconButton
                                      icon={<FiEye />}
                                      size="sm"
                                      onClick={() => fetchTableData(table.name)}
                                      aria-label="View table data"
                                        variant="ghost"
                                        colorScheme="blue"
                                    />
                                  </Tooltip>
                                  <Tooltip label="Query Data">
                                    <IconButton
                                      icon={<FiList />}
                                      size="sm"
                                      onClick={() => generateSelectSQL(table.name)}
                                      aria-label="Query table"
                                        variant="ghost"
                                        colorScheme="brand"
                                    />
                                  </Tooltip>
                                  <Tooltip label="Drop Table">
                                    <IconButton
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={() => generateDropTableSQL(table.name)}
                                      aria-label="Drop table"
                                    />
                                  </Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Card>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
            </CardBody>
          </Card>
      </motion.div>

      {/* Create Table Modal */}
      <Modal isOpen={isCreateTableOpen} onClose={onCreateTableClose} size="xl">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader bgGradient={headerBgGradient} color="white" borderTopRadius="xl">
            Create New Table
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Text>Define your table columns:</Text>
              
              {newTableColumns.map((column, index) => (
                <HStack key={index} spacing={2}>
                  <FormControl>
                    <FormLabel fontSize="sm">Column Name</FormLabel>
                    <Input
                      size="sm"
                      value={column.name}
                      onChange={(e) => updateNewColumn(index, 'name', e.target.value)}
                      placeholder="column_name"
                      borderRadius="md"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Data Type</FormLabel>
                    <Select
                      size="sm"
                      value={column.type}
                      onChange={(e) => updateNewColumn(index, 'type', e.target.value)}
                      borderRadius="md"
                    >
                      <option value="SERIAL">SERIAL</option>
                      <option value="INTEGER">INTEGER</option>
                      <option value="BIGINT">BIGINT</option>
                      <option value="VARCHAR(255)">VARCHAR(255)</option>
                      <option value="TEXT">TEXT</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="TIMESTAMP">TIMESTAMP</option>
                      <option value="DATE">DATE</option>
                      <option value="NUMERIC">NUMERIC</option>
                      <option value="JSONB">JSONB</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Constraints</FormLabel>
                    <Input
                      size="sm"
                      value={column.constraints}
                      onChange={(e) => updateNewColumn(index, 'constraints', e.target.value)}
                      placeholder="NOT NULL, PRIMARY KEY, etc."
                      borderRadius="md"
                    />
                  </FormControl>
                  
                  <IconButton
                    icon={<FiTrash2 />}
                    aria-label="Remove column"
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    alignSelf="flex-end"
                    onClick={() => removeNewColumn(index)}
                    isDisabled={newTableColumns.length <= 1}
                  />
                </HStack>
              ))}
              
              <Button leftIcon={<FiPlus />} onClick={addNewColumn} size="sm" alignSelf="flex-start" borderRadius="md">
                Add Column
              </Button>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onCreateTableClose} borderRadius="full">
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={generateCreateTableSQL} borderRadius="full">
              Generate SQL
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* View Table Modal */}
      <Modal isOpen={isViewTableOpen} onClose={onViewTableClose} size="6xl">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader bgGradient={headerBgGradient} color="white" borderTopRadius="xl">
            {selectedTable} Table Data
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={4}>
            <Tabs colorScheme="brand" variant="soft-rounded">
              <TabList mb={4}>
                <Tab _selected={{ bg: accentColor, color: 'white' }} px={4} fontWeight="medium">Data Preview</Tab>
                <Tab _selected={{ bg: accentColor, color: 'white' }} px={4} fontWeight="medium">Table Structure</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel px={0}>
                  {tableData?.rows && tableData.rows.length > 0 ? (
                    <Box overflowX="auto" borderRadius="lg" borderWidth="1px" borderColor={tableBorder}>
                    <Table variant="simple" size="sm">
                        <Thead bg={tableHeaderBg}>
                        <Tr>
                            {Object.keys(tableData.rows[0]).map(column => (
                              <Th key={column} py={3}>{column}</Th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                          {tableData.rows.map((row, rowIndex) => (
                            <Tr 
                              key={rowIndex}
                              _hover={{ bg: tableRowHoverBg }}
                              transition="background-color 0.2s"
                            >
                              {Object.values(row).map((cell, cellIndex) => (
                                <Td key={cellIndex}>{String(cell !== null ? cell : 'NULL')}</Td>
                            ))}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    </Box>
                  ) : (
                    <Alert status="info" borderRadius="lg">
                      <AlertIcon />
                      No data available for this table
                    </Alert>
                  )}
                </TabPanel>
                
                <TabPanel px={0}>
                  {tableStructure && tableStructure.length > 0 ? (
                    <Box>
                      <Card borderRadius="lg" overflow="hidden" mb={4}>
                        <Table variant="simple" size="sm">
                          <Thead bg={tableHeaderBg}>
                          <Tr>
                            <Th>Column Name</Th>
                            <Th>Data Type</Th>
                            <Th>Nullable</Th>
                            <Th>Default Value</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {tableStructure.map((column, index) => (
                              <Tr 
                                key={index}
                                _hover={{ bg: tableRowHoverBg }}
                                transition="background-color 0.2s"
                              >
                              <Td fontWeight="medium">{column.name}</Td>
                                <Td>
                                  <Badge colorScheme="purple">
                                    {column.type}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Badge colorScheme={column.nullable === 'YES' ? 'green' : 'red'} variant="subtle">
                                    {column.nullable === 'YES' ? 'YES' : 'NO'}
                                  </Badge>
                                </Td>
                              <Td>{column.default_value || '-'}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      </Card>
                      
                      <Button 
                        onClick={loadTableStructureAsSQL} 
                        leftIcon={<FiEdit />}
                        colorScheme="brand"
                        borderRadius="full"
                      >
                        Load as SQL
                      </Button>
                </Box>
              ) : (
                    <Alert status="info" borderRadius="lg">
                      <AlertIcon />
                      No structure information available for this table
                    </Alert>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" onClick={onViewTableClose} borderRadius="full">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default QueryPage; 