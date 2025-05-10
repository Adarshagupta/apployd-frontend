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
  Icon,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  Kbd
} from '@chakra-ui/react';
import { settingsApi } from '../api/apiClient';
import { getTenants } from '../api/neonApi';
import { 
  TbSettings, 
  TbUser, 
  TbShield, 
  TbBell, 
  TbServer, 
  TbCloudUpload, 
  TbKey, 
  TbDatabase,
  TbCheck,
  TbAlertCircle,
  TbTrash,
  TbRefresh,
  TbDeviceDesktop,
  TbBrandGithub
} from 'react-icons/tb';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

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
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" px={5} py={5}>
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={6}
      >
        <Box 
          bgGradient={useColorModeValue(
            'linear(to-r, purple.500, pink.400, blue.400)',
            'linear(to-r, purple.600, pink.500, blue.500)'
          )}
          borderRadius="lg" 
          p={6} 
          color="white"
          boxShadow="md"
        >
          <Flex justify="space-between" align="center">
    <Box>
              <Heading size="lg" mb={2}>Settings</Heading>
              <Text fontSize="md">Configure your Neon environment and preferences</Text>
            </Box>
            <HStack>
              <Button
                leftIcon={<TbRefresh />}
                onClick={() => {}}
                bg="whiteAlpha.300"
                _hover={{ bg: "whiteAlpha.400" }}
              >
                Reset
              </Button>
              <Button
                leftIcon={<TbCheck />}
                onClick={handleTenantConfigUpdate}
                isLoading={isSaving}
                bg="white"
                color="purple.500"
                _hover={{ bg: "whiteAlpha.900" }}
              >
                Save Changes
              </Button>
            </HStack>
          </Flex>
        </Box>
      </MotionBox>

      {/* Settings Tabs */}
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs variant="enclosed" colorScheme="purple" bg={useColorModeValue('white', 'gray.800')} borderRadius="lg" boxShadow="sm" p={0}>
          <TabList px={4} pt={4}>
            <Tab><HStack><Icon as={TbServer} boxSize="16px" /><Text>Connection</Text></HStack></Tab>
            <Tab><HStack><Icon as={TbUser} boxSize="16px" /><Text>Account</Text></HStack></Tab>
            <Tab><HStack><Icon as={TbSettings} boxSize="16px" /><Text>Advanced</Text></HStack></Tab>
        </TabList>
        
        <TabPanels>
            {/* Connection Settings Panel */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Card bg={useColorModeValue('white', 'gray.800')} boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <CardHeader pb={0}>
                    <HStack>
                      <Icon as={TbDatabase} color="purple.500" boxSize="20px" />
                      <Heading size="md">Pageserver Connection</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Pageserver Host</FormLabel>
                        <Input 
                          bg={useColorModeValue('white', 'gray.700')}
                          name="pageserverHost" 
                          value={tenantConfig?.remote_storage_host || ''}
                          onChange={(e) => handleTenantConfigChange('remote_storage_host', e.target.value)}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Pageserver Port</FormLabel>
                        <Input 
                          bg={useColorModeValue('white', 'gray.700')}
                          name="pageserverPort" 
                          value={tenantConfig?.remote_storage_port || ''}
                          onChange={(e) => handleTenantConfigChange('remote_storage_port', e.target.value)}
                        />
                      </FormControl>
                      <Box pt={2}>
                        <Badge colorScheme="green">Connected</Badge>
                        <Text mt={1} fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                          Connection string: <Code>http://{tenantConfig?.remote_storage_host}:{tenantConfig?.remote_storage_port}</Code>
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={useColorModeValue('white', 'gray.800')} boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <CardHeader pb={0}>
                    <HStack>
                      <Icon as={TbDeviceDesktop} color="blue.500" boxSize="20px" />
                      <Heading size="md">Compute Connection</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Compute Host</FormLabel>
                        <Input 
                          bg={useColorModeValue('white', 'gray.700')}
                          name="computeHost" 
                          value={tenantConfig?.compute_host || ''}
                          onChange={(e) => handleTenantConfigChange('compute_host', e.target.value)}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Compute Port</FormLabel>
                        <Input 
                          bg={useColorModeValue('white', 'gray.700')}
                          name="computePort" 
                          value={tenantConfig?.compute_port || ''}
                          onChange={(e) => handleTenantConfigChange('compute_port', e.target.value)}
                        />
                      </FormControl>
                      <Box pt={2}>
                        <Badge colorScheme="green">Connected</Badge>
                        <Text mt={1} fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                          Connection string: <Code>http://{tenantConfig?.compute_host}:{tenantConfig?.compute_port}</Code>
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={useColorModeValue('white', 'gray.800')} boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <CardHeader pb={0}>
                    <HStack>
                      <Icon as={TbServer} color="teal.500" boxSize="20px" />
                      <Heading size="md">Safekeeper Connection</Heading>
                    </HStack>
              </CardHeader>
              <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Safekeeper Host</FormLabel>
                        <Input 
                          bg={useColorModeValue('white', 'gray.700')}
                          name="safekeeperHost" 
                          value={tenantConfig?.safekeeper_host || ''}
                          onChange={(e) => handleTenantConfigChange('safekeeper_host', e.target.value)}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Safekeeper Port</FormLabel>
                        <Input 
                          bg={useColorModeValue('white', 'gray.700')}
                          name="safekeeperPort" 
                          value={tenantConfig?.safekeeper_port || ''}
                          onChange={(e) => handleTenantConfigChange('safekeeper_port', e.target.value)}
                        />
                    </FormControl>
                      <Box pt={2}>
                        <Badge colorScheme="green">Connected</Badge>
                        <Text mt={1} fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                          Connection string: <Code>http://{tenantConfig?.safekeeper_host}:{tenantConfig?.safekeeper_port}</Code>
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={useColorModeValue('white', 'gray.800')} boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <CardHeader pb={0}>
                    <HStack>
                      <Icon as={TbCloudUpload} color="orange.500" boxSize="20px" />
                      <Heading size="md">Storage Broker</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          The Storage Broker settings are configured via environment variables.
                        </Text>
                      </Alert>
                      
                      <Box>
                        <Text fontWeight="medium">Current Configuration</Text>
                        <Code p={3} mt={2} borderRadius="md" fontSize="sm" display="block">
                          STORAGE_BROKER_HOST={tenantConfig?.remote_storage_host || 'localhost'}<br />
                          STORAGE_BROKER_PORT={tenantConfig?.remote_storage_port || '50051'}<br />
                          STORAGE_BROKER_PROTOCOL=http
                        </Code>
                      </Box>
                      
                      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                        To change these values, set the environment variables and restart the service.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>
            
            {/* Account Settings Panel */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Card bg={useColorModeValue('white', 'gray.800')} boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <CardHeader pb={0}>
                    <HStack>
                      <Icon as={TbUser} color="purple.500" boxSize="20px" />
                      <Heading size="md">User Preferences</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                        <FormLabel>Email Address</FormLabel>
                          <Input 
                          bg={useColorModeValue('white', 'gray.700')}
                          name="email" 
                          value={tenantConfig?.email || ''}
                          onChange={(e) => handleTenantConfigChange('email', e.target.value)}
                        />
                        </FormControl>
                        
                          <FormControl>
                        <FormLabel>Session Timeout (minutes)</FormLabel>
                        <Slider 
                          aria-label="session-timeout" 
                          defaultValue={tenantConfig?.session_timeout || 30}
                          min={5}
                          max={120}
                          step={5}
                          colorScheme="purple"
                          onChange={(val) => handleTenantConfigChange('session_timeout', val)}
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb boxSize={6}>
                            <Box color="purple.500" as={TbKey} />
                          </SliderThumb>
                        </Slider>
                        <Text textAlign="right" fontSize="sm" mt={1}>
                          {tenantConfig?.session_timeout || 30} minutes
                        </Text>
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="notifications" mb="0">
                          Enable Notifications
                        </FormLabel>
                        <Switch 
                          colorScheme="purple" 
                          id="notifications"
                          name="notificationsEnabled"
                          isChecked={tenantConfig?.notifications_enabled || true}
                          onChange={(e) => handleTenantConfigChange('notifications_enabled', e.target.checked)}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={useColorModeValue('white', 'gray.800')} boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <CardHeader pb={0}>
                    <HStack>
                      <Icon as={TbShield} color="green.500" boxSize="20px" />
                      <Heading size="md">Security</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Last Password Change</FormLabel>
                        <Input
                          bg={useColorModeValue('white', 'gray.700')}
                          value={tenantConfig?.last_password_change || ''}
                          isReadOnly
                        />
                          </FormControl>
                          
                          <FormControl>
                        <FormLabel>Two-Factor Authentication</FormLabel>
                        <HStack>
                          <Badge colorScheme="red">Not Configured</Badge>
                          <Button size="sm" colorScheme="purple" variant="outline">
                            Setup 2FA
                          </Button>
                        </HStack>
                          </FormControl>
                        
                        <Divider my={2} />
                      
                      <Text fontWeight="medium">Active Sessions</Text>
                      <HStack justify="space-between" bg={useColorModeValue('gray.50', 'gray.700')} p={3} borderRadius="md">
                        <VStack align="flex-start" spacing={0}>
                          <Text fontSize="sm">Current Browser</Text>
                          <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>Chrome on macOS, 192.168.1.1</Text>
                        </VStack>
                        <Badge colorScheme="green">Active</Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={useColorModeValue('white', 'gray.800')} boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} gridColumn={{ md: 'span 2' }}>
                  <CardHeader pb={0}>
                    <HStack>
                      <Icon as={TbBell} color="blue.500" boxSize="20px" />
                      <Heading size="md">Notification Settings</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="email-notifications" mb="0" fontSize="sm">
                          Email Notifications
                        </FormLabel>
                        <Switch 
                          colorScheme="purple" 
                          id="email-notifications"
                          name="emailNotifications"
                          isChecked={tenantConfig?.email_notifications || true}
                          onChange={(e) => handleTenantConfigChange('email_notifications', e.target.checked)}
                        />
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="alert-notifications" mb="0" fontSize="sm">
                          System Alerts
                        </FormLabel>
                        <Switch 
                          colorScheme="purple" 
                          id="alert-notifications"
                          name="alertNotifications"
                          isChecked={tenantConfig?.alert_notifications || true}
                          onChange={(e) => handleTenantConfigChange('alert_notifications', e.target.checked)}
                        />
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="maintenance-notifications" mb="0" fontSize="sm">
                          Maintenance Updates
                        </FormLabel>
                        <Switch 
                          colorScheme="purple" 
                          id="maintenance-notifications"
                          name="maintenanceNotifications"
                          isChecked={tenantConfig?.maintenance_notifications || true}
                          onChange={(e) => handleTenantConfigChange('maintenance_notifications', e.target.checked)}
                        />
                      </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="product-notifications" mb="0" fontSize="sm">
                          Product Updates
                          </FormLabel>
                          <Switch 
                          colorScheme="purple" 
                          id="product-notifications"
                          name="productNotifications"
                          isChecked={tenantConfig?.product_notifications || false}
                          onChange={(e) => handleTenantConfigChange('product_notifications', e.target.checked)}
                          />
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="usage-notifications" mb="0" fontSize="sm">
                          Usage Reports
                          </FormLabel>
                          <Switch 
                          colorScheme="purple" 
                          id="usage-notifications"
                          name="usageNotifications"
                          isChecked={tenantConfig?.usage_notifications || true}
                          onChange={(e) => handleTenantConfigChange('usage_notifications', e.target.checked)}
                          />
                        </FormControl>
                        
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="marketing-notifications" mb="0" fontSize="sm">
                          Marketing
                        </FormLabel>
                        <Switch 
                          colorScheme="purple" 
                          id="marketing-notifications"
                          name="marketingNotifications"
                          isChecked={tenantConfig?.marketing_notifications || false}
                          onChange={(e) => handleTenantConfigChange('marketing_notifications', e.target.checked)}
                        />
                      </FormControl>
                    </SimpleGrid>
              </CardBody>
            </Card>
              </SimpleGrid>
          </TabPanel>
          
            {/* Advanced Settings Panel */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Card bg={useColorModeValue('white', 'gray.800')} boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <CardHeader pb={0}>
                    <HStack>
                      <Icon as={TbSettings} color="purple.500" boxSize="20px" />
                      <Heading size="md">System Configuration</Heading>
                    </HStack>
              </CardHeader>
              <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Log Level</FormLabel>
                        <Select 
                          bg={useColorModeValue('white', 'gray.700')}
                          name="logLevel" 
                          value={tenantConfig?.log_level || 'info'}
                          onChange={(e) => handleTenantConfigChange('log_level', e.target.value)}
                        >
                          <option value="debug">Debug</option>
                          <option value="info">Info</option>
                          <option value="warn">Warn</option>
                          <option value="error">Error</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Max Connections</FormLabel>
                        <Input 
                          bg={useColorModeValue('white', 'gray.700')}
                          name="maxConnections" 
                          type="number"
                          value={tenantConfig?.max_connections || 50}
                          onChange={(e) => handleTenantConfigChange('max_connections', e.target.value)}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Connection Timeout (seconds)</FormLabel>
                        <Input 
                          bg={useColorModeValue('white', 'gray.700')}
                          name="timeoutSeconds" 
                          type="number"
                          value={tenantConfig?.timeout_seconds || 600}
                          onChange={(e) => handleTenantConfigChange('timeout_seconds', e.target.value)}
                        />
                      </FormControl>
                    </VStack>
              </CardBody>
            </Card>
            
                <Card bg={useColorModeValue('white', 'gray.800')} boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <CardHeader pb={0}>
                    <HStack>
                      <Icon as={TbAlertCircle} color="orange.500" boxSize="20px" />
                      <Heading size="md">Danger Zone</Heading>
                    </HStack>
              </CardHeader>
              <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Alert status="warning" borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          These actions can result in data loss or service disruption.
                        </Text>
                      </Alert>
                      
                      <Box p={4} borderWidth="1px" borderColor="red.300" borderRadius="md">
                        <Heading size="sm" mb={2} color="red.500">Reset All Data</Heading>
                        <Text mb={3} fontSize="sm">
                          This will delete all tenant data and reset the system to its initial state.
                    </Text>
                        <Button 
                          leftIcon={<TbTrash />} 
                          colorScheme="red" 
                          size="sm"
                          variant="outline"
                        >
                          Reset All Data
                        </Button>
                    </Box>
                      
                      <Box p={4} borderWidth="1px" borderColor="orange.300" borderRadius="md">
                        <Heading size="sm" mb={2} color="orange.500">Restore Factory Settings</Heading>
                        <Text mb={3} fontSize="sm">
                          This will reset all configuration to default values.
                        </Text>
                        <Button 
                          colorScheme="orange" 
                          size="sm"
                          variant="outline"
                        >
                          Restore Factory Settings
                        </Button>
                  </Box>
                    </VStack>
              </CardBody>
            </Card>
                
                <Card bg={useColorModeValue('white', 'gray.800')} boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <CardHeader pb={0}>
                    <HStack>
                      <Icon as={TbDatabase} color="blue.500" boxSize="20px" />
                      <Heading size="md">Backup Configuration</Heading>
                    </HStack>
              </CardHeader>
              <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="auto-backup" mb="0">
                          Automatic Backups
                        </FormLabel>
                        <Switch 
                          colorScheme="purple" 
                          id="auto-backup"
                          name="autoBackup"
                          isChecked={tenantConfig?.auto_backup || true}
                          onChange={(e) => handleTenantConfigChange('auto_backup', e.target.checked)}
                        />
                      </FormControl>
                      
                  <FormControl>
                        <FormLabel>Backup Frequency</FormLabel>
                        <Select 
                          bg={useColorModeValue('white', 'gray.700')}
                          defaultValue="daily"
                          isDisabled={!tenantConfig?.auto_backup}
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                        <FormLabel>Retention Period (days)</FormLabel>
                    <Input 
                          bg={useColorModeValue('white', 'gray.700')}
                          defaultValue="7"
                          isDisabled={!tenantConfig?.auto_backup}
                    />
                  </FormControl>
                      
                      <Button 
                        mt={2} 
                        w="100%" 
                        colorScheme="blue" 
                        variant="outline"
                      >
                        Backup Now
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card bg={useColorModeValue('white', 'gray.800')} boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                  <CardHeader pb={0}>
                    <HStack>
                      <Icon as={TbBrandGithub} color="gray.600" boxSize="20px" />
                      <Heading size="md">Developer Options</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="metrics-collection" mb="0">
                          Metrics Collection
                        </FormLabel>
                        <Switch 
                          colorScheme="purple" 
                          id="metrics-collection"
                          name="metricsCollection"
                          isChecked={tenantConfig?.metrics_collection || true}
                          onChange={(e) => handleTenantConfigChange('metrics_collection', e.target.checked)}
                        />
                </FormControl>
                
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="experimental-features" mb="0">
                          Experimental Features
                        </FormLabel>
                        <Switch 
                          colorScheme="purple" 
                          id="experimental-features"
                          name="experimentalFeatures"
                          isChecked={tenantConfig?.experimental_features || false}
                          onChange={(e) => handleTenantConfigChange('experimental_features', e.target.checked)}
                        />
                </FormControl>
                
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Developer CLI access is available using <Kbd>Ctrl</Kbd> + <Kbd>Alt</Kbd> + <Kbd>T</Kbd>
                        </Text>
                      </Alert>
                      
                      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                        These settings are intended for advanced users and developers. Changing them may affect system stability.
                      </Text>
                    </VStack>
              </CardBody>
            </Card>
              </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
      </MotionBox>
      
      {/* Footer Actions */}
      <Flex justify="flex-end" mt={6}>
        <HStack spacing={3}>
          <Button
            onClick={() => {}}
            bg={useColorModeValue('gray.100', 'gray.700')}
            _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
          >
            Discard Changes
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleTenantConfigUpdate}
            isLoading={isSaving}
          >
            Save All Settings
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Settings; 