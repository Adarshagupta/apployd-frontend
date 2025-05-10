import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Flex,
  HStack,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Code,
  Button,
  Icon,
  Alert,
  AlertIcon,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { 
  TbRefresh, 
  TbServer, 
  TbCpu, 
  TbDatabase, 
  TbAlertTriangle,
  TbCloudUpload
} from 'react-icons/tb';
import { monitoringApi } from '../api/apiClient';
import DatabaseStatus from '../components/DatabaseStatus';

const Monitoring = () => {
  const [systemStatus, setSystemStatus] = useState({
    pageserver: { status: 'loading' },
    compute: { status: 'loading' },
    safekeeper: { status: 'loading' },
    broker: { status: 'loading' }
  });
  const [pageserverMetrics, setPageserverMetrics] = useState(null);
  const [safekeeperMetrics, setSafekeeperMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const codeBg = useColorModeValue('gray.50', 'gray.700');
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get overall system status
      const systemStatusData = await monitoringApi.getSystemStatus();
      setSystemStatus(systemStatusData);
      
      // Get pageserver metrics if available
      try {
        const pageserverResponse = await monitoringApi.getPageserverMetrics();
        setPageserverMetrics(pageserverResponse.data);
      } catch (err) {
        console.error('Error fetching pageserver metrics:', err);
        setPageserverMetrics(null);
      }
      
      // Get safekeeper metrics if available
      try {
        const safekeeperResponse = await monitoringApi.getSafekeeperMetrics();
        setSafekeeperMetrics(safekeeperResponse.data);
      } catch (err) {
        console.error('Error fetching safekeeper metrics:', err);
        setSafekeeperMetrics(null);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
      setError('Failed to fetch monitoring data. Some services may be unavailable.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Set up interval to refresh data every minute
    const intervalId = setInterval(fetchData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const getStatusBadge = (statusObj) => {
    let color;
    let text;
    
    // Check if we have a status object or just a string
    const status = typeof statusObj === 'object' ? statusObj.status : statusObj;
    
    switch (status) {
      case 'online':
        color = 'green';
        text = 'Online';
        break;
      case 'error':
        color = 'red';
        text = 'Error';
        break;
      case 'loading':
        color = 'blue';
        text = 'Loading';
        break;
      default:
        color = 'gray';
        text = 'Unknown';
    }
    
    return <Badge colorScheme={color}>{text}</Badge>;
  };
  
  const formatMetric = (metric) => {
    if (typeof metric === 'number') {
      // Format numbers with commas
      return metric.toLocaleString();
    }
    return metric?.toString() || 'N/A';
  };
  
  const renderServiceCard = (title, status, IconComponent) => {
    const isLoading = status.status === 'loading';
    const isError = status.status === 'error';
    const isOnline = status.status === 'online';
    
    return (
      <Card bg={cardBg} boxShadow="sm">
        <CardHeader pb={0}>
          <HStack spacing={2} justify="space-between">
            <HStack>
              <Icon as={IconComponent} boxSize="20px" />
              <Heading size="sm">{title}</Heading>
            </HStack>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              getStatusBadge(status)
            )}
          </HStack>
        </CardHeader>
        
        <CardBody>
          {isError && (
            <Text color="red.500" fontSize="sm">
              {status.error || 'Connection failed'}
            </Text>
          )}
          
          {isOnline && (
            <Box>
              {status.id && (
                <Text fontSize="sm">ID: {status.id}</Text>
              )}
              {status.metrics && (
                <Code p={2} mt={2} fontSize="xs" width="100%" bg={codeBg}>
                  <Box overflowX="auto" maxHeight="80px">
                    {typeof status.metrics === 'object' 
                      ? JSON.stringify(status.metrics, null, 2).substring(0, 200) + '...'
                      : String(status.metrics).substring(0, 200) + '...'}
                  </Box>
                </Code>
              )}
            </Box>
          )}
        </CardBody>
      </Card>
    );
  };
  
  return (
    <Box>
      <HStack mb={4} justify="space-between">
        <Heading>System Monitoring</Heading>
        <Button
          leftIcon={<TbRefresh />}
          colorScheme="brand"
          onClick={fetchData}
          isLoading={isLoading}
        >
          Refresh
        </Button>
      </HStack>
      
      <DatabaseStatus />
      
      {error && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <Text mb={4} fontSize="sm" color="gray.500">
        {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Fetching data...'}
      </Text>
      
      <Heading size="md" mb={4}>Service Status</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        {renderServiceCard('Pageserver', systemStatus.pageserver, TbServer)}
        {renderServiceCard('Compute Node', systemStatus.compute, TbCpu)}
        {renderServiceCard('Safekeeper', systemStatus.safekeeper, TbDatabase)}
        {renderServiceCard('Storage Broker', systemStatus.broker, TbCloudUpload)}
      </SimpleGrid>
      
      <Tabs colorScheme="brand" mb={6}>
        <TabList>
          <Tab>Pageserver Metrics</Tab>
          <Tab>Safekeeper Metrics</Tab>
          <Tab>Raw Data</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Heading size="md">Pageserver Metrics</Heading>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" align="center" py={10}>
                    <Spinner />
                  </Flex>
                ) : pageserverMetrics ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {pageserverMetrics.tenants && (
                      <Stat>
                        <StatLabel>Total Tenants</StatLabel>
                        <StatNumber>{pageserverMetrics.tenants.count || 0}</StatNumber>
                        <StatHelpText>Active Tenants</StatHelpText>
                      </Stat>
                    )}
                    
                    {pageserverMetrics.timelines && (
                      <Stat>
                        <StatLabel>Total Timelines</StatLabel>
                        <StatNumber>{pageserverMetrics.timelines.count || 0}</StatNumber>
                        <StatHelpText>Across All Tenants</StatHelpText>
                      </Stat>
                    )}
                    
                    {pageserverMetrics.storage && (
                      <Stat>
                        <StatLabel>Storage Usage</StatLabel>
                        <StatNumber>{pageserverMetrics.storage.usage || 'N/A'}</StatNumber>
                        <StatHelpText>Total Space Used</StatHelpText>
                      </Stat>
                    )}
                    
                    {pageserverMetrics.memory && (
                      <Stat>
                        <StatLabel>Memory Usage</StatLabel>
                        <StatNumber>{pageserverMetrics.memory.usage || 'N/A'}</StatNumber>
                        <StatHelpText>Current Memory Consumption</StatHelpText>
                      </Stat>
                    )}
                  </SimpleGrid>
                ) : (
                  <Flex direction="column" align="center" py={10}>
                    <Icon as={TbAlertTriangle} boxSize={10} color="orange.500" mb={4} />
                    <Text>No pageserver metrics available</Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      The pageserver may not expose metrics or may be unreachable
                    </Text>
                  </Flex>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Heading size="md">Safekeeper Metrics</Heading>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" align="center" py={10}>
                    <Spinner />
                  </Flex>
                ) : safekeeperMetrics ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {safekeeperMetrics.wal && (
                      <Stat>
                        <StatLabel>WAL Segments</StatLabel>
                        <StatNumber>{safekeeperMetrics.wal.segments || 0}</StatNumber>
                        <StatHelpText>Total WAL Segments</StatHelpText>
                      </Stat>
                    )}
                    
                    {safekeeperMetrics.connections && (
                      <Stat>
                        <StatLabel>Connections</StatLabel>
                        <StatNumber>{safekeeperMetrics.connections.active || 0}</StatNumber>
                        <StatHelpText>Active Connections</StatHelpText>
                      </Stat>
                    )}
                    
                    {safekeeperMetrics.storage && (
                      <Stat>
                        <StatLabel>Storage Usage</StatLabel>
                        <StatNumber>{safekeeperMetrics.storage.usage || 'N/A'}</StatNumber>
                        <StatHelpText>Total Space Used</StatHelpText>
                      </Stat>
                    )}
                  </SimpleGrid>
                ) : (
                  <Flex direction="column" align="center" py={10}>
                    <Icon as={TbAlertTriangle} boxSize={10} color="orange.500" mb={4} />
                    <Text>No safekeeper metrics available</Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      The safekeeper may not expose metrics or may be unreachable
                    </Text>
                  </Flex>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Heading size="md">Raw Monitoring Data</Heading>
              </CardHeader>
              <CardBody>
                <Box overflowX="auto">
                  <Heading size="sm" mb={2}>System Status</Heading>
                  <Code p={4} borderRadius="md" bg={codeBg} display="block" width="100%" mb={6} whiteSpace="pre-wrap">
                    {JSON.stringify(systemStatus, null, 2)}
                  </Code>
                  
                  <Heading size="sm" mb={2}>Pageserver Metrics</Heading>
                  <Code p={4} borderRadius="md" bg={codeBg} display="block" width="100%" mb={6} whiteSpace="pre-wrap">
                    {JSON.stringify(pageserverMetrics, null, 2)}
                  </Code>
                  
                  <Heading size="sm" mb={2}>Safekeeper Metrics</Heading>
                  <Code p={4} borderRadius="md" bg={codeBg} display="block" width="100%" mb={6} whiteSpace="pre-wrap">
                    {JSON.stringify(safekeeperMetrics, null, 2)}
                  </Code>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Monitoring; 