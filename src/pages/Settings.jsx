import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Input,
  Button,
  VStack,
  HStack,
  Flex,
  Spacer,
  Spinner,
  Divider,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Code,
  useColorModeValue,
  SimpleGrid,
  Switch,
} from '@chakra-ui/react';
import { settingsApi } from '../api/apiClient';
import { getTenants } from '../api/neonApi';

const Settings = () => {
  const [pageserverConfig, setPageserverConfig] = useState(null);
  const [computeConfig, setComputeConfig] = useState(null);
  const [tenantConfig, setTenantConfig] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  
  const codeBg = useColorModeValue('gray.50', 'gray.700');
  
  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);
  
  // Fetch data when tenant selection changes
  useEffect(() => {
    if (selectedTenant) {
      fetchTenantConfig(selectedTenant);
    }
  }, [selectedTenant]);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch tenants
      const tenantsList = await getTenants();
      setTenants(tenantsList);
      
      if (tenantsList.length > 0) {
        setSelectedTenant(tenantsList[0].id);
      }
      
      // Fetch pageserver config
      try {
        const pageserverConfigResponse = await settingsApi.getPageserverConfig();
        setPageserverConfig(pageserverConfigResponse.data);
      } catch (err) {
        console.error('Error fetching pageserver config:', err);
      }
      
      // Fetch compute config
      try {
        const computeConfigResponse = await settingsApi.getComputeConfig();
        setComputeConfig(computeConfigResponse.data);
      } catch (err) {
        console.error('Error fetching compute config:', err);
      }
    } catch (err) {
      console.error('Error fetching settings data:', err);
      setError('Failed to fetch configuration data. Some services may be unavailable.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTenantConfig = async (tenantId) => {
    if (!tenantId) return;
    
    try {
      const tenantConfigResponse = await settingsApi.getTenantConfig(tenantId);
      setTenantConfig(tenantConfigResponse.data);
    } catch (err) {
      console.error(`Error fetching config for tenant ${tenantId}:`, err);
      setTenantConfig(null);
      toast({
        title: 'Error fetching tenant configuration',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleTenantConfigUpdate = async () => {
    if (!selectedTenant || !tenantConfig) return;
    
    setIsSaving(true);
    
    try {
      await settingsApi.updateTenantConfig(selectedTenant, tenantConfig);
      
      toast({
        title: 'Configuration updated',
        description: 'Tenant configuration has been updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error updating tenant config:', err);
      
      toast({
        title: 'Error updating configuration',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle input changes for tenant config
  const handleTenantConfigChange = (field, value) => {
    if (!tenantConfig) return;
    
    setTenantConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <Box>
      <Heading mb={4}>System Settings</Heading>
      
      {error && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <Tabs colorScheme="brand" mb={6}>
        <TabList>
          <Tab>Tenant Settings</Tab>
          <Tab>System Configuration</Tab>
          <Tab>Advanced</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            <Card mb={6}>
              <CardHeader>
                <Heading size="md">Tenant Configuration</Heading>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" py={10}>
                    <Spinner />
                  </Flex>
                ) : (
                  <>
                    <FormControl mb={4}>
                      <FormLabel>Select Tenant</FormLabel>
                      <Select 
                        value={selectedTenant} 
                        onChange={(e) => setSelectedTenant(e.target.value)}
                        placeholder="Select tenant"
                      >
                        {tenants.map(tenant => (
                          <option key={tenant.id} value={tenant.id}>
                            {tenant.id} {tenant.state?.slug ? `(${tenant.state.slug})` : ''}
                          </option>
                        ))}
                      </Select>
                      <FormHelperText>
                        Choose a tenant to configure its settings
                      </FormHelperText>
                    </FormControl>
                    
                    {selectedTenant && !tenantConfig && (
                      <Flex justify="center" py={6}>
                        <Spinner />
                      </Flex>
                    )}
                    
                    {selectedTenant && tenantConfig && (
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Remote Storage</FormLabel>
                          <Input 
                            value={tenantConfig.remote_storage || ''}
                            onChange={(e) => handleTenantConfigChange('remote_storage', e.target.value)}
                            placeholder="Remote storage configuration"
                          />
                          <FormHelperText>
                            Remote storage configuration (S3 compatible)
                          </FormHelperText>
                        </FormControl>
                        
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Attachment Policy</FormLabel>
                            <Select
                              value={tenantConfig.attachment_policy || 'default'}
                              onChange={(e) => handleTenantConfigChange('attachment_policy', e.target.value)}
                            >
                              <option value="default">Default</option>
                              <option value="require_remote_storage">Require Remote Storage</option>
                              <option value="allow_without_remote_storage">Allow Without Remote Storage</option>
                            </Select>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Compaction Policy</FormLabel>
                            <Select
                              value={tenantConfig.compaction_policy || 'default'}
                              onChange={(e) => handleTenantConfigChange('compaction_policy', e.target.value)}
                            >
                              <option value="default">Default</option>
                              <option value="aggressive">Aggressive</option>
                              <option value="conservative">Conservative</option>
                            </Select>
                          </FormControl>
                        </SimpleGrid>
                        
                        <Divider my={2} />
                        
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">
                            Enable GC
                          </FormLabel>
                          <Switch 
                            isChecked={tenantConfig.gc_enabled || false}
                            onChange={(e) => handleTenantConfigChange('gc_enabled', e.target.checked)}
                          />
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">
                            Enable Remote Storage
                          </FormLabel>
                          <Switch 
                            isChecked={tenantConfig.remote_storage_enabled || false}
                            onChange={(e) => handleTenantConfigChange('remote_storage_enabled', e.target.checked)}
                          />
                        </FormControl>
                        
                        <Flex mt={4}>
                          <Spacer />
                          <Button 
                            colorScheme="brand" 
                            onClick={handleTenantConfigUpdate}
                            isLoading={isSaving}
                          >
                            Save Configuration
                          </Button>
                        </Flex>
                      </VStack>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel px={0}>
            <Card mb={6}>
              <CardHeader>
                <Heading size="md">Pageserver Configuration</Heading>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" py={10}>
                    <Spinner />
                  </Flex>
                ) : pageserverConfig ? (
                  <Box>
                    <Text mb={4}>
                      Pageserver configuration is read-only in the UI. Below is the current configuration:
                    </Text>
                    <Box overflowX="auto">
                      <Code p={4} borderRadius="md" bg={codeBg} display="block" width="100%" mb={6} whiteSpace="pre-wrap">
                        {JSON.stringify(pageserverConfig, null, 2)}
                      </Code>
                    </Box>
                  </Box>
                ) : (
                  <Text color="gray.500">
                    Pageserver configuration not available. The pageserver may not expose this information.
                  </Text>
                )}
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <Heading size="md">Compute Configuration</Heading>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" py={10}>
                    <Spinner />
                  </Flex>
                ) : computeConfig ? (
                  <Box>
                    <Text mb={4}>
                      Compute node configuration is read-only in the UI. Below is the current configuration:
                    </Text>
                    <Box overflowX="auto">
                      <Code p={4} borderRadius="md" bg={codeBg} display="block" width="100%" mb={6} whiteSpace="pre-wrap">
                        {JSON.stringify(computeConfig, null, 2)}
                      </Code>
                    </Box>
                  </Box>
                ) : (
                  <Text color="gray.500">
                    Compute configuration not available. The compute node may not expose this information or requires authentication.
                  </Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Heading size="md">Advanced Settings</Heading>
              </CardHeader>
              <CardBody>
                <Alert status="warning" mb={6}>
                  <AlertIcon />
                  <Box>
                    <Heading size="sm" mb={2}>Warning: Advanced Settings</Heading>
                    <Text>
                      These settings are for advanced users only. Improper configuration may cause system instability.
                    </Text>
                  </Box>
                </Alert>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Log Level</FormLabel>
                    <Select defaultValue="info">
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warn">Warning</option>
                      <option value="error">Error</option>
                    </Select>
                    <FormHelperText>
                      Set the logging level for the system
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Authentication Token</FormLabel>
                    <Input 
                      type="password" 
                      placeholder="Enter authentication token" 
                    />
                    <FormHelperText>
                      API authentication token (leave empty to keep current)
                    </FormHelperText>
                  </FormControl>
                </SimpleGrid>
                
                <Divider my={6} />
                
                <FormControl mb={6}>
                  <FormLabel>S3 Endpoint URL</FormLabel>
                  <Input 
                    defaultValue="http://localhost:9000" 
                    placeholder="S3 compatible endpoint URL" 
                  />
                  <FormHelperText>
                    URL for S3-compatible object storage
                  </FormHelperText>
                </FormControl>
                
                <FormControl mb={6}>
                  <FormLabel>Restore Point</FormLabel>
                  <Input 
                    placeholder="Restore point LSN or timestamp" 
                  />
                  <FormHelperText>
                    Point-in-time recovery target
                  </FormHelperText>
                </FormControl>
                
                <Flex mt={4}>
                  <Spacer />
                  <Button colorScheme="gray" mr={3}>
                    Reset
                  </Button>
                  <Button colorScheme="brand">
                    Apply Settings
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Settings; 