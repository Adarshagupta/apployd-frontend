import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Select,
  Flex,
  Spacer,
  HStack,
  VStack,
  Badge,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  useColorModeValue,
  Code,
  Icon,
} from '@chakra-ui/react';
import { 
  TbFlask, 
  TbUpload, 
  TbLink, 
  TbFileSearch, 
  TbAlertTriangle 
} from 'react-icons/tb';
import { experimentalApi } from '../api/apiClient';
import { getTenants, getTimelines } from '../api/neonApi';

const Experiments = () => {
  const [tenants, setTenants] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedTimeline, setSelectedTimeline] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);
  const [walInspectResult, setWalInspectResult] = useState(null);
  const [operationResult, setOperationResult] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  
  // Import form
  const [importData, setImportData] = useState({
    sourceUrl: '',
    format: 'tar',
    skipExisting: true
  });
  
  // Attach form
  const [attachData, setAttachData] = useState({
    storage: '',
    tenant: ''
  });
  
  // WAL inspect form
  const [walInspectParams, setWalInspectParams] = useState({
    startLsn: '',
    endLsn: '',
    limit: '100'
  });
  
  const codeBg = useColorModeValue('gray.50', 'gray.700');
  
  // Fetch data on load
  useEffect(() => {
    fetchData();
  }, []);
  
  // Fetch timelines when tenant changes
  useEffect(() => {
    if (selectedTenant) {
      fetchTimelinesForTenant(selectedTenant);
    } else {
      setTimelines([]);
      setSelectedTimeline('');
    }
  }, [selectedTenant]);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tenantsData = await getTenants();
      setTenants(tenantsData);
      
      if (tenantsData.length > 0) {
        setSelectedTenant(tenantsData[0].id);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError('Failed to fetch tenant data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTimelinesForTenant = async (tenantId) => {
    try {
      const timelinesData = await getTimelines(tenantId);
      setTimelines(timelinesData);
      
      if (timelinesData.length > 0) {
        setSelectedTimeline(timelinesData[0].timeline_id);
      } else {
        setSelectedTimeline('');
      }
    } catch (err) {
      console.error(`Error fetching timelines for tenant ${tenantId}:`, err);
      setTimelines([]);
      setSelectedTimeline('');
      toast({
        title: 'Error fetching timelines',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleImportSubmit = async () => {
    if (!selectedTenant || !selectedTimeline) {
      toast({
        title: 'Missing selection',
        description: 'Please select a tenant and timeline',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!importData.sourceUrl) {
      toast({
        title: 'Missing data',
        description: 'Please provide a source URL',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsOperationInProgress(true);
    setOperationResult(null);
    
    try {
      const response = await experimentalApi.importTimeline(
        selectedTenant,
        selectedTimeline,
        {
          source_url: importData.sourceUrl,
          format: importData.format,
          skip_existing: importData.skipExisting
        }
      );
      
      setOperationResult({
        success: true,
        data: response.data,
        message: 'Timeline import started successfully'
      });
      
      toast({
        title: 'Import started',
        description: 'Timeline import operation has been initiated',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error importing timeline:', err);
      
      setOperationResult({
        success: false,
        error: err.message,
        message: 'Timeline import failed'
      });
      
      toast({
        title: 'Import failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsOperationInProgress(false);
    }
  };
  
  const handleAttachSubmit = async () => {
    if (!selectedTenant) {
      toast({
        title: 'Missing selection',
        description: 'Please select a tenant',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!attachData.storage) {
      toast({
        title: 'Missing data',
        description: 'Please provide storage configuration',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsOperationInProgress(true);
    setOperationResult(null);
    
    try {
      const response = await experimentalApi.attachTenant(
        selectedTenant,
        {
          storage: attachData.storage,
          tenant: attachData.tenant || selectedTenant
        }
      );
      
      setOperationResult({
        success: true,
        data: response.data,
        message: 'Tenant attachment successful'
      });
      
      toast({
        title: 'Tenant attached',
        description: 'Tenant attachment completed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error attaching tenant:', err);
      
      setOperationResult({
        success: false,
        error: err.message,
        message: 'Tenant attachment failed'
      });
      
      toast({
        title: 'Attachment failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsOperationInProgress(false);
    }
  };
  
  const handleWalInspectSubmit = async () => {
    if (!selectedTenant || !selectedTimeline) {
      toast({
        title: 'Missing selection',
        description: 'Please select a tenant and timeline',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsOperationInProgress(true);
    setWalInspectResult(null);
    
    try {
      const params = {};
      
      if (walInspectParams.startLsn) {
        params.start_lsn = walInspectParams.startLsn;
      }
      
      if (walInspectParams.endLsn) {
        params.end_lsn = walInspectParams.endLsn;
      }
      
      if (walInspectParams.limit) {
        params.limit = walInspectParams.limit;
      }
      
      const response = await experimentalApi.inspectWal(
        selectedTenant,
        selectedTimeline,
        params
      );
      
      setWalInspectResult(response.data);
      
      toast({
        title: 'WAL inspection complete',
        description: 'Retrieved WAL records successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error inspecting WAL:', err);
      
      toast({
        title: 'WAL inspection failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsOperationInProgress(false);
    }
  };
  
  return (
    <Box>
      <HStack mb={4}>
        <Heading>Experimental Features</Heading>
        <Badge colorScheme="purple" fontSize="0.8em" px={2} py={1}>Beta</Badge>
      </HStack>
      
      <Alert status="warning" mb={6}>
        <AlertIcon />
        <Box>
          <AlertTitle>Experimental Features</AlertTitle>
          <AlertDescription>
            These features are experimental and may change or be removed in future versions.
            Use with caution in production environments.
          </AlertDescription>
        </Box>
      </Alert>
      
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <FormControl mb={6}>
        <FormLabel>Select Tenant</FormLabel>
        <Select 
          value={selectedTenant} 
          onChange={(e) => setSelectedTenant(e.target.value)}
          isDisabled={isLoading || tenants.length === 0}
          placeholder={isLoading ? 'Loading...' : 'Select tenant'}
        >
          {tenants.map(tenant => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.id} {tenant.state?.slug ? `(${tenant.state.slug})` : ''}
            </option>
          ))}
        </Select>
        <FormHelperText>
          Choose a tenant to work with
        </FormHelperText>
      </FormControl>
      
      <FormControl mb={6}>
        <FormLabel>Select Timeline</FormLabel>
        <Select 
          value={selectedTimeline} 
          onChange={(e) => setSelectedTimeline(e.target.value)}
          isDisabled={isLoading || timelines.length === 0}
          placeholder={selectedTenant ? (timelines.length === 0 ? 'No timelines available' : 'Select timeline') : 'Select tenant first'}
        >
          {timelines.map(timeline => (
            <option key={timeline.timeline_id} value={timeline.timeline_id}>
              {timeline.timeline_id} {timeline.state ? `(${timeline.state})` : ''}
            </option>
          ))}
        </Select>
        <FormHelperText>
          Choose a timeline to operate on
        </FormHelperText>
      </FormControl>
      
      <Tabs colorScheme="purple" variant="enclosed" mb={6}>
        <TabList>
          <Tab><Icon as={TbUpload} mr={2} />Timeline Import</Tab>
          <Tab><Icon as={TbLink} mr={2} />Tenant Attachment</Tab>
          <Tab><Icon as={TbFileSearch} mr={2} />WAL Inspection</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            <Card mb={6}>
              <CardHeader>
                <HStack>
                  <Icon as={TbFlask} boxSize={5} color="purple.500" />
                  <Heading size="md">Timeline Import</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Source URL</FormLabel>
                    <Input 
                      value={importData.sourceUrl}
                      onChange={(e) => setImportData({...importData, sourceUrl: e.target.value})}
                      placeholder="s3://bucket/path or http://example.com/file.tar"
                    />
                    <FormHelperText>
                      URL to the source file or directory to import
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Format</FormLabel>
                    <Select 
                      value={importData.format}
                      onChange={(e) => setImportData({...importData, format: e.target.value})}
                    >
                      <option value="tar">TAR</option>
                      <option value="directory">Directory</option>
                    </Select>
                    <FormHelperText>
                      Format of the import source
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Skip Existing Files</FormLabel>
                    <input 
                      type="checkbox" 
                      checked={importData.skipExisting}
                      onChange={(e) => setImportData({...importData, skipExisting: e.target.checked})}
                    />
                  </FormControl>
                  
                  <Flex mt={4}>
                    <Spacer />
                    <Button 
                      leftIcon={<TbUpload />}
                      colorScheme="purple" 
                      onClick={handleImportSubmit}
                      isLoading={isOperationInProgress}
                      isDisabled={!selectedTenant || !selectedTimeline}
                    >
                      Import Timeline
                    </Button>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel px={0}>
            <Card mb={6}>
              <CardHeader>
                <HStack>
                  <Icon as={TbFlask} boxSize={5} color="purple.500" />
                  <Heading size="md">Tenant Attachment</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Storage Configuration</FormLabel>
                    <Textarea 
                      value={attachData.storage}
                      onChange={(e) => setAttachData({...attachData, storage: e.target.value})}
                      placeholder="{endpoint='http://minio:9000',bucket_name='neon',bucket_region='eu-north-1',prefix_in_bucket='/tenant/'}"
                      rows={4}
                    />
                    <FormHelperText>
                      Storage configuration for the tenant (S3 compatible)
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Target Tenant ID (Optional)</FormLabel>
                    <Input 
                      value={attachData.tenant}
                      onChange={(e) => setAttachData({...attachData, tenant: e.target.value})}
                      placeholder="Leave empty to use selected tenant"
                    />
                    <FormHelperText>
                      Specify a tenant ID to use for attachment (defaults to selected tenant)
                    </FormHelperText>
                  </FormControl>
                  
                  <Flex mt={4}>
                    <Spacer />
                    <Button 
                      leftIcon={<TbLink />}
                      colorScheme="purple" 
                      onClick={handleAttachSubmit}
                      isLoading={isOperationInProgress}
                      isDisabled={!selectedTenant}
                    >
                      Attach Tenant
                    </Button>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel px={0}>
            <Card mb={6}>
              <CardHeader>
                <HStack>
                  <Icon as={TbFlask} boxSize={5} color="purple.500" />
                  <Heading size="md">WAL Inspection</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Start LSN (Optional)</FormLabel>
                    <Input 
                      value={walInspectParams.startLsn}
                      onChange={(e) => setWalInspectParams({...walInspectParams, startLsn: e.target.value})}
                      placeholder="e.g., 0/1A58D40"
                    />
                    <FormHelperText>
                      Starting LSN for inspection (leave empty to start from beginning)
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>End LSN (Optional)</FormLabel>
                    <Input 
                      value={walInspectParams.endLsn}
                      onChange={(e) => setWalInspectParams({...walInspectParams, endLsn: e.target.value})}
                      placeholder="e.g., 0/1B58D40"
                    />
                    <FormHelperText>
                      Ending LSN for inspection (leave empty to go to the end)
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Limit</FormLabel>
                    <Input 
                      value={walInspectParams.limit}
                      onChange={(e) => setWalInspectParams({...walInspectParams, limit: e.target.value})}
                      placeholder="Max number of records to retrieve"
                      type="number"
                    />
                    <FormHelperText>
                      Maximum number of WAL records to retrieve
                    </FormHelperText>
                  </FormControl>
                  
                  <Flex mt={4}>
                    <Spacer />
                    <Button 
                      leftIcon={<TbFileSearch />}
                      colorScheme="purple" 
                      onClick={handleWalInspectSubmit}
                      isLoading={isOperationInProgress}
                      isDisabled={!selectedTenant || !selectedTimeline}
                    >
                      Inspect WAL
                    </Button>
                  </Flex>
                </VStack>
                
                {walInspectResult && (
                  <Box mt={6}>
                    <Divider my={4} />
                    <Heading size="sm" mb={2}>Inspection Results</Heading>
                    <Box overflowX="auto">
                      <Code p={4} borderRadius="md" bg={codeBg} display="block" width="100%" whiteSpace="pre-wrap">
                        {JSON.stringify(walInspectResult, null, 2)}
                      </Code>
                    </Box>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {operationResult && (
        <Card mb={6}>
          <CardHeader>
            <Heading size="md">Operation Result</Heading>
          </CardHeader>
          <CardBody>
            <Alert 
              status={operationResult.success ? 'success' : 'error'} 
              mb={4}
            >
              <AlertIcon />
              <AlertTitle mr={2}>
                {operationResult.message}
              </AlertTitle>
            </Alert>
            
            {operationResult.data && (
              <Box mt={4}>
                <Heading size="sm" mb={2}>Response Data</Heading>
                <Box overflowX="auto">
                  <Code p={4} borderRadius="md" bg={codeBg} display="block" width="100%" whiteSpace="pre-wrap">
                    {JSON.stringify(operationResult.data, null, 2)}
                  </Code>
                </Box>
              </Box>
            )}
            
            {operationResult.error && (
              <Box mt={4}>
                <Heading size="sm" mb={2}>Error Details</Heading>
                <Text color="red.500">{operationResult.error}</Text>
              </Box>
            )}
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default Experiments; 