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
  Tooltip
} from '@chakra-ui/react';
import { FiPlay, FiSave, FiDownload, FiCopy, FiRefreshCw, FiChevronDown, FiDatabase, FiTable, FiPlus, FiTrash2, FiEdit, FiEye, FiList } from 'react-icons/fi';

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
  const bgColor = useColorModeValue('white', 'gray.700');
  const tableBgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
      <Card mb={4}>
        <CardHeader>
          <HStack justify="space-between">
            <Flex align="center">
              <FiDatabase size={20} />
              <Heading size="md" ml={2}>{database?.name || 'SQL Editor'}</Heading>
              {isLoading && <Spinner size="sm" ml={2} />}
            </Flex>
            
            <HStack>
              <Button 
                size="sm"
                leftIcon={<FiRefreshCw />} 
                onClick={fetchTables}
                isLoading={isLoadingTables}
              >
                Refresh
              </Button>
            </HStack>
          </HStack>
        </CardHeader>
        
        <CardBody>
          <Tabs isFitted variant="enclosed">
            <TabList>
              <Tab><HStack><FiPlay size={16} /><Text>Query Editor</Text></HStack></Tab>
              <Tab><HStack><FiTable size={16} /><Text>Tables</Text></HStack></Tab>
            </TabList>
            
            <TabPanels>
              {/* Query Editor Tab */}
              <TabPanel px={0}>
                <Flex direction="column" h="calc(100vh - 280px)">
                  <Textarea
                    ref={textareaRef}
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                    placeholder="Enter SQL query here..."
                    resize="none"
                    h="200px"
                    fontFamily="monospace"
                    mb={4}
                  />
                  
                  <Flex justify="space-between" mb={4}>
                    <HStack>
                      <Button
                        colorScheme="blue"
                        leftIcon={<FiPlay />}
                        onClick={executeQuery}
                        isLoading={isExecuting}
                      >
                        Execute
                      </Button>
                      
                      <Button
                        leftIcon={<FiSave />}
                        onClick={saveQuery}
                      >
                        Save Query
                      </Button>
                    </HStack>
                    
                    <Menu>
                      <MenuButton as={Button} rightIcon={<FiChevronDown />}>
                        Saved Queries
                      </MenuButton>
                      <MenuList>
                        {savedQueries.map(query => (
                          <MenuItem key={query.id} onClick={() => loadQuery(query)}>
                            {query.name}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </Flex>
                  
                  {error && (
                    <Alert status="error" mb={4}>
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}
                  
                  {results && (
                    <Box overflowX="auto" flex="1">
                      <Flex justify="space-between" mb={2}>
                        <Text fontWeight="bold">
                          {results.command} | {results.rows?.length || 0} rows
                        </Text>
                        <HStack>
                          <IconButton
                            icon={<FiCopy />}
                            size="sm"
                            aria-label="Copy results"
                            onClick={copyResults}
                          />
                          <IconButton
                            icon={<FiDownload />}
                            size="sm"
                            aria-label="Download as CSV"
                            onClick={downloadResults}
                          />
                        </HStack>
                      </Flex>
                      
                      {results.rows && results.rows.length > 0 && (
                        <Table variant="simple" size="sm" bg={bgColor}>
                          <Thead>
                            <Tr>
                              {Object.keys(results.rows[0]).map(column => (
                                <Th key={column}>{column}</Th>
                              ))}
                            </Tr>
                          </Thead>
                          <Tbody>
                            {results.rows.map((row, rowIndex) => (
                              <Tr key={rowIndex}>
                                {Object.values(row).map((cell, cellIndex) => (
                                  <Td key={cellIndex}>{String(cell !== null ? cell : 'NULL')}</Td>
                                ))}
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      )}
                    </Box>
                  )}
                </Flex>
              </TabPanel>
              
              {/* Tables Tab */}
              <TabPanel px={0}>
                <HStack spacing={4} mb={4}>
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<FiPlus />}
                    onClick={onCreateTableOpen}
                  >
                    Create Table
                  </Button>
                  
                  <Button
                    leftIcon={<FiRefreshCw />}
                    onClick={fetchTables}
                    isLoading={isLoadingTables}
                  >
                    Refresh Tables
                  </Button>
                </HStack>
                
                {tables.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    No tables found in this database. Create a new table to get started.
                  </Alert>
                ) : (
                  <Card variant="outline" boxShadow="sm">
                    <CardBody p={0}>
                      <Table variant="simple">
                        <Thead bg={tableBgColor}>
                          <Tr>
                            <Th>Table Name</Th>
                            <Th>Size</Th>
                            <Th textAlign="right">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {tables.map((table, index) => (
                            <Tr key={index}>
                              <Td fontWeight="medium">{table.name}</Td>
                              <Td>{table.size}</Td>
                              <Td textAlign="right">
                                <HStack spacing={2} justify="flex-end">
                                  <Tooltip label="View Data">
                                    <IconButton
                                      icon={<FiEye />}
                                      size="sm"
                                      onClick={() => fetchTableData(table.name)}
                                      aria-label="View table data"
                                    />
                                  </Tooltip>
                                  <Tooltip label="Query Data">
                                    <IconButton
                                      icon={<FiList />}
                                      size="sm"
                                      onClick={() => generateSelectSQL(table.name)}
                                      aria-label="Query table"
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
      
      {/* Create Table Modal */}
      <Modal isOpen={isCreateTableOpen} onClose={onCreateTableClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Table</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Data Type</FormLabel>
                    <Select
                      size="sm"
                      value={column.type}
                      onChange={(e) => updateNewColumn(index, 'type', e.target.value)}
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
              
              <Button leftIcon={<FiPlus />} onClick={addNewColumn} size="sm" alignSelf="flex-start">
                Add Column
              </Button>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={generateCreateTableSQL}>
              Generate SQL
            </Button>
            <Button variant="ghost" onClick={onCreateTableClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* View Table Modal */}
      <Modal isOpen={isViewTableOpen} onClose={onViewTableClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedTable} Table Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs isFitted>
              <TabList>
                <Tab>Data Preview</Tab>
                <Tab>Table Structure</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel px={0}>
                  {tableData?.rows && tableData.rows.length > 0 ? (
                    <Box overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            {Object.keys(tableData.rows[0]).map(column => (
                              <Th key={column}>{column}</Th>
                            ))}
                          </Tr>
                        </Thead>
                        <Tbody>
                          {tableData.rows.map((row, rowIndex) => (
                            <Tr key={rowIndex}>
                              {Object.values(row).map((cell, cellIndex) => (
                                <Td key={cellIndex}>{String(cell !== null ? cell : 'NULL')}</Td>
                              ))}
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      No data available for this table
                    </Alert>
                  )}
                </TabPanel>
                
                <TabPanel px={0}>
                  {tableStructure && tableStructure.length > 0 ? (
                    <Box>
                      <Table variant="simple" size="sm" mb={4}>
                        <Thead>
                          <Tr>
                            <Th>Column Name</Th>
                            <Th>Data Type</Th>
                            <Th>Nullable</Th>
                            <Th>Default Value</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {tableStructure.map((column, index) => (
                            <Tr key={index}>
                              <Td fontWeight="medium">{column.name}</Td>
                              <Td>{column.type}</Td>
                              <Td>{column.nullable === 'YES' ? 'YES' : 'NO'}</Td>
                              <Td>{column.default_value || '-'}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      
                      <Button onClick={loadTableStructureAsSQL} leftIcon={<FiEdit />} size="sm">
                        Load as SQL
                      </Button>
                    </Box>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      No structure information available for this table
                    </Alert>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" onClick={onViewTableClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default QueryPage; 