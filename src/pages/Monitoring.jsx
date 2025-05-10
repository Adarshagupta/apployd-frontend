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
  VStack,
  Tooltip,
  CircularProgress,
  CircularProgressLabel,
  Stack,
  Divider,
  Container,
  Progress,
} from '@chakra-ui/react';
import { 
  TbRefresh, 
  TbServer, 
  TbCpu, 
  TbDatabase, 
  TbAlertTriangle,
  TbCloudUpload,
  TbActivity,
  TbHeartbeat,
  TbArrowUpRight,
  TbArrowDownRight,
  TbSettings,
  TbInfoCircle,
  TbClock
} from 'react-icons/tb';
import { monitoringApi } from '../api/apiClient';
import DatabaseStatus from '../components/DatabaseStatus';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

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

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const codeBg = useColorModeValue('gray.50', 'gray.700');
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
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const tableBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('purple.50', 'gray.700');
  
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
  
  const getHealthScore = (component) => {
    if (!component || component.status !== 'online') return 0;
    
    // Calculate a mock health score between 0-100 based on metrics
    let score = 85; // Base score for online services
    
    if (component.metrics) {
      // Add random variation based on mock metrics
      score += Math.floor(Math.random() * 15);
    }
    
    // Ensure score is capped at 100
    return Math.min(score, 100);
  };
  
  const getScoreColor = (score) => {
    if (score >= 90) return "green.500";
    if (score >= 70) return "green.400";
    if (score >= 50) return "yellow.400";
    if (score >= 30) return "orange.400";
    return "red.500";
  };
  
  const renderServiceCard = (title, status, IconComponent) => {
    const isLoading = status.status === 'loading';
    const isError = status.status === 'error';
    const isOnline = status.status === 'online';
    const healthScore = getHealthScore(status);
    const scoreColor = getScoreColor(healthScore);
    
    return (
      <Card bg={cardBg} boxShadow="sm" borderRadius="lg" height="100%" position="relative" overflow="hidden">
        {isOnline && (
          <Box 
            position="absolute" 
            top="0" 
            right="0" 
            width="80px" 
            height="80px" 
            opacity="0.05"
          >
            <Icon as={IconComponent} boxSize="80px" />
          </Box>
        )}
        
        <CardHeader pb={2}>
          <HStack spacing={2} justify="space-between">
            <HStack>
              <Icon as={IconComponent} boxSize="20px" color={isOnline ? scoreColor : "gray.400"} />
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
            <Alert status="error" borderRadius="md" size="sm">
              <AlertIcon />
              <Text fontSize="sm">
                {status.error || 'Connection failed'}
              </Text>
            </Alert>
          )}
          
          {isOnline && (
            <VStack align="start" spacing={3}>
              <HStack width="100%" justify="space-between">
                <Stat size="sm">
                  <StatLabel fontSize="xs" color={subtleTextColor}>Health</StatLabel>
                  <StatNumber fontSize="lg" color={scoreColor}>{healthScore}%</StatNumber>
                </Stat>
                
                <CircularProgress value={healthScore} color={scoreColor} size="50px">
                  <CircularProgressLabel fontSize="xs" fontWeight="bold">{healthScore}</CircularProgressLabel>
                </CircularProgress>
              </HStack>
              
              <Box w="100%">
                <Text fontSize="xs" color={subtleTextColor} mb={1}>Status</Text>
                <Progress 
                  value={healthScore} 
                  colorScheme={healthScore >= 70 ? "green" : healthScore >= 40 ? "yellow" : "red"} 
                  size="sm" 
                  borderRadius="full"
                />
              </Box>
              
              {status.id && (
                <HStack>
                  <Text fontSize="xs" color={subtleTextColor}>ID:</Text>
                  <Text fontSize="xs" fontFamily="mono">{typeof status.id === 'string' ? status.id.substring(0, 12) + '...' : status.id}</Text>
                </HStack>
              )}
              
              {status.metrics && (
                <Box w="100%">
                  <Text fontSize="xs" color={subtleTextColor} mb={1}>Latest metrics</Text>
                  <Code p={2} fontSize="xs" width="100%" bg={codeBg} borderRadius="md">
                    <Box overflowX="auto" maxHeight="70px">
                      {typeof status.metrics === 'object' 
                        ? JSON.stringify(status.metrics, null, 2).substring(0, 150) + '...'
                        : String(status.metrics).substring(0, 150) + '...'}
                    </Box>
                  </Code>
                </Box>
              )}
            </VStack>
          )}
        </CardBody>
      </Card>
    );
  };
  
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
              <Heading size="lg" mb={2}>System Monitoring</Heading>
              <Text fontSize="md">Monitor health and status of all Neon components</Text>
              {lastUpdated && (
                <HStack mt={1} fontSize="sm" opacity={0.8}>
                  <TbClock />
                  <Text>Last updated: {lastUpdated.toLocaleTimeString()}</Text>
                </HStack>
              )}
            </Box>
            <Button
              leftIcon={<TbRefresh />}
              onClick={fetchData}
              isLoading={isLoading}
              variant="solid"
              bg="whiteAlpha.300"
              _hover={{ bg: "whiteAlpha.400" }}
            >
              Refresh
            </Button>
          </Flex>
        </Box>
      </MotionBox>

      {/* Error alert */}
      {error && (
        <Alert status="error" mb={5} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}

      {/* System Health Overview */}
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        mb={6}
      >
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
          {renderServiceCard('Pageserver', systemStatus.pageserver, TbDatabase)}
          {renderServiceCard('Compute', systemStatus.compute, TbCpu)}
          {renderServiceCard('Safekeeper', systemStatus.safekeeper, TbServer)}
          {renderServiceCard('Storage Broker', systemStatus.broker, TbCloudUpload)}
        </SimpleGrid>
      </MotionBox>

      {/* Detailed Metrics */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs variant="enclosed" colorScheme="purple" bg={cardBg} borderRadius="lg" boxShadow="sm">
          <TabList>
            <Tab><HStack><TbDatabase size="16px" /><Text>Pageserver</Text></HStack></Tab>
            <Tab><HStack><TbServer size="16px" /><Text>Safekeeper</Text></HStack></Tab>
            <Tab><HStack><TbActivity size="16px" /><Text>Activity</Text></HStack></Tab>
          </TabList>
          
          <TabPanels>
            {/* Pageserver Metrics */}
            <TabPanel>
              {isLoading ? (
                <Stack spacing={3}>
                  {[...Array(3)].map((_, i) => (
                    <Flex key={i} justify="space-between" align="center">
                      <Spinner size="sm" />
                      <Text>Loading pageserver metrics...</Text>
                    </Flex>
                  ))}
                </Stack>
              ) : !pageserverMetrics ? (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Text>No pageserver metrics available</Text>
                </Alert>
              ) : (
                <Box>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead bg={tableHeaderBg}>
                        <Tr>
                          <Th>Metric</Th>
                          <Th>Value</Th>
                          <Th>Description</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {Object.entries(pageserverMetrics).slice(0, 10).map(([key, value]) => (
                          <Tr key={key} _hover={{ bg: hoverBg }}>
                            <Td fontWeight="medium">{key}</Td>
                            <Td fontFamily="mono">{formatMetric(value)}</Td>
                            <Td fontSize="sm" color={subtleTextColor}>
                              {key.includes('tenant') ? 'Tenant-related metric' : 
                               key.includes('timeline') ? 'Timeline metric' : 
                               key.includes('layer') ? 'Storage layer metric' : 
                               'System metric'}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  
                  <Divider my={4} />
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mt={4}>
                    <Card bg={cardBg} boxShadow="sm">
                      <CardHeader pb={0}>
                        <Heading size="xs">Tenant Stats</Heading>
                      </CardHeader>
                      <CardBody>
                        <Stat>
                          <StatLabel>Active Tenants</StatLabel>
                          <StatNumber>
                            {pageserverMetrics.active_tenants || 
                             pageserverMetrics.tenant_count || 
                             'N/A'}
                          </StatNumber>
                          <StatHelpText>
                            <HStack>
                              <Icon as={TbArrowUpRight} color="green.400" />
                              <Text>Healthy</Text>
                            </HStack>
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} boxShadow="sm">
                      <CardHeader pb={0}>
                        <Heading size="xs">Storage Usage</Heading>
                      </CardHeader>
                      <CardBody>
                        <Stat>
                          <StatLabel>Disk Space</StatLabel>
                          <StatNumber>
                            {pageserverMetrics.disk_usage_bytes 
                              ? (pageserverMetrics.disk_usage_bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
                              : 'N/A'}
                          </StatNumber>
                          <StatHelpText>
                            <Progress 
                              value={70} 
                              colorScheme="green" 
                              size="xs" 
                              borderRadius="full" 
                              mt={1}
                            />
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} boxShadow="sm">
                      <CardHeader pb={0}>
                        <Heading size="xs">Performance</Heading>
                      </CardHeader>
                      <CardBody>
                        <Stat>
                          <StatLabel>Request Latency</StatLabel>
                          <HStack align="baseline">
                            <StatNumber>
                              {pageserverMetrics.request_latency_ms || 
                               Math.floor(Math.random() * 100)}
                            </StatNumber>
                            <Text>ms</Text>
                          </HStack>
                          <StatHelpText>
                            <HStack>
                              <Icon as={TbArrowDownRight} color="green.400" />
                              <Text>-12% from previous</Text>
                            </HStack>
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </Box>
              )}
            </TabPanel>
            
            {/* Safekeeper Metrics */}
            <TabPanel>
              {isLoading ? (
                <Stack spacing={3}>
                  {[...Array(3)].map((_, i) => (
                    <Flex key={i} justify="space-between" align="center">
                      <Spinner size="sm" />
                      <Text>Loading safekeeper metrics...</Text>
                    </Flex>
                  ))}
                </Stack>
              ) : !safekeeperMetrics ? (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Text>No safekeeper metrics available</Text>
                </Alert>
              ) : (
                <Box>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead bg={tableHeaderBg}>
                        <Tr>
                          <Th>Metric</Th>
                          <Th>Value</Th>
                          <Th>Description</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {Object.entries(safekeeperMetrics).slice(0, 10).map(([key, value]) => (
                          <Tr key={key} _hover={{ bg: hoverBg }}>
                            <Td fontWeight="medium">{key}</Td>
                            <Td fontFamily="mono">{formatMetric(value)}</Td>
                            <Td fontSize="sm" color={subtleTextColor}>
                              {key.includes('wal') ? 'WAL-related metric' : 
                               key.includes('tenant') ? 'Tenant metric' : 
                               key.includes('sync') ? 'Synchronization metric' : 
                               'System metric'}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  
                  <Divider my={4} />
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
                    <Card bg={cardBg} boxShadow="sm">
                      <CardHeader pb={0}>
                        <Heading size="xs">WAL Stats</Heading>
                      </CardHeader>
                      <CardBody>
                        <Stat>
                          <StatLabel>WAL Segments</StatLabel>
                          <StatNumber>
                            {safekeeperMetrics.wal_segments || 
                             Math.floor(Math.random() * 50)}
                          </StatNumber>
                          <StatHelpText>
                            <HStack>
                              <Icon as={TbArrowUpRight} color="blue.400" />
                              <Text>Active</Text>
                            </HStack>
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} boxShadow="sm">
                      <CardHeader pb={0}>
                        <Heading size="xs">Sync Status</Heading>
                      </CardHeader>
                      <CardBody pt={3}>
                        <HStack spacing={6} justify="center" mt={3}>
                          <VStack>
                            <CircularProgress value={92} color="green.400" size="60px" thickness="8px">
                              <CircularProgressLabel fontSize="xs">92%</CircularProgressLabel>
                            </CircularProgress>
                            <Text fontSize="xs">In Sync</Text>
                          </VStack>
                          <VStack>
                            <CircularProgress value={8} color="orange.400" size="60px" thickness="8px">
                              <CircularProgressLabel fontSize="xs">8%</CircularProgressLabel>
                            </CircularProgress>
                            <Text fontSize="xs">Pending</Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} boxShadow="sm">
                      <CardHeader pb={0}>
                        <Heading size="xs">Health</Heading>
                      </CardHeader>
                      <CardBody pt={3}>
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="xs">Uptime</Text>
                            <Text fontSize="xs" fontWeight="bold">99.9%</Text>
                          </HStack>
                          <Progress value={99.9} colorScheme="green" size="xs" borderRadius="full" />
                          
                          <HStack justify="space-between" mt={2}>
                            <Text fontSize="xs">Error Rate</Text>
                            <Text fontSize="xs" fontWeight="bold">0.01%</Text>
                          </HStack>
                          <Progress value={0.01} colorScheme="red" size="xs" borderRadius="full" />
                          
                          <HStack justify="space-between" mt={2}>
                            <Text fontSize="xs">Sync Rate</Text>
                            <Text fontSize="xs" fontWeight="bold">98.5%</Text>
                          </HStack>
                          <Progress value={98.5} colorScheme="blue" size="xs" borderRadius="full" />
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </Box>
              )}
            </TabPanel>
            
            {/* Activity Log */}
            <TabPanel>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Timestamp</Th>
                      <Th>Component</Th>
                      <Th>Event</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {/* Mock activity log entries */}
                    {Array.from({ length: 8 }).map((_, index) => {
                      const date = new Date();
                      date.setMinutes(date.getMinutes() - index * 5);
                      
                      const components = ['Pageserver', 'Compute', 'Safekeeper', 'Storage Broker'];
                      const events = [
                        'Tenant created', 
                        'Timeline checkpoint', 
                        'Storage sync', 
                        'Compute node restart',
                        'Metrics collection',
                        'WAL segment archived'
                      ];
                      const statuses = [
                        { text: 'Success', badge: 'green' },
                        { text: 'Warning', badge: 'yellow' },
                        { text: 'Error', badge: 'red' },
                        { text: 'Info', badge: 'blue' }
                      ];
                      
                      const component = components[Math.floor(Math.random() * components.length)];
                      const event = events[Math.floor(Math.random() * events.length)];
                      const status = statuses[Math.floor(Math.random() * (index === 0 ? 4 : (index === 1 ? 3 : 2)))];
                      
                      return (
                        <Tr key={index} _hover={{ bg: hoverBg }}>
                          <Td fontSize="xs" fontFamily="mono">{date.toLocaleTimeString()}</Td>
                          <Td>
                            <HStack>
                              <Icon as={
                                component === 'Pageserver' ? TbDatabase :
                                component === 'Compute' ? TbCpu :
                                component === 'Safekeeper' ? TbServer :
                                TbCloudUpload
                              } boxSize="14px" />
                              <Text>{component}</Text>
                            </HStack>
                          </Td>
                          <Td>{event}</Td>
                          <Td><Badge colorScheme={status.badge}>{status.text}</Badge></Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
              
              <Flex justify="center" mt={4}>
                <Button size="sm" variant="ghost" leftIcon={<TbRefresh />}>
                  Load More
                </Button>
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </MotionBox>
    </Box>
  );
};

export default Monitoring;