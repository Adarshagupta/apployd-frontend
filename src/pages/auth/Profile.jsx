import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  HStack,
  VStack,
  Avatar,
  FormErrorMessage,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth/authApi';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Initialize profile data with current user data
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        companyName: currentUser.companyName || '',
      });
    }
  }, [currentUser]);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const validateProfile = () => {
    const errors = {};
    
    if (!profileData.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!profileData.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (!profileData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!profileData.companyName) {
      errors.companyName = 'Company name is required';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) return;
    
    setLoading(true);
    
    try {
      await authApi.updateProfile(profileData);
      
      setSuccessMessage('Profile updated successfully');
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    setLoading(true);
    
    try {
      await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      // Reset password fields after successful change
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccessMessage('Password changed successfully');
      
      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Password Change Failed',
        description: error.message || 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxW="lg" py={12}>
      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={8}
        boxShadow="lg"
      >
        <VStack spacing={8} align="stretch">
          <VStack spacing={4}>
            <Heading size="lg">Your Profile</Heading>
            
            <Avatar
              size="xl"
              name={`${profileData.firstName} ${profileData.lastName}`}
              src=""
              bg="blue.500"
            />
            
            <Text fontSize="lg">
              {profileData.firstName} {profileData.lastName}
            </Text>
            <Text fontSize="md" color="gray.500">
              {profileData.email}
            </Text>
          </VStack>
          
          <Divider />
          
          {successMessage && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              {successMessage}
            </Alert>
          )}
          
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>Profile Information</Tab>
              <Tab>Change Password</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <form onSubmit={handleUpdateProfile}>
                  <Stack spacing={4}>
                    <HStack>
                      <FormControl id="firstName" isInvalid={profileErrors.firstName}>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                        />
                        <FormErrorMessage>{profileErrors.firstName}</FormErrorMessage>
                      </FormControl>
                      
                      <FormControl id="lastName" isInvalid={profileErrors.lastName}>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                        />
                        <FormErrorMessage>{profileErrors.lastName}</FormErrorMessage>
                      </FormControl>
                    </HStack>
                    
                    <FormControl id="email" isInvalid={profileErrors.email}>
                      <FormLabel>Email address</FormLabel>
                      <Input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                      />
                      <FormErrorMessage>{profileErrors.email}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl id="companyName" isInvalid={profileErrors.companyName}>
                      <FormLabel>Company Name</FormLabel>
                      <Input
                        type="text"
                        name="companyName"
                        value={profileData.companyName}
                        onChange={handleProfileChange}
                      />
                      <FormErrorMessage>{profileErrors.companyName}</FormErrorMessage>
                    </FormControl>
                    
                    <Button
                      type="submit"
                      colorScheme="blue"
                      isLoading={loading}
                      loadingText="Updating"
                      mt={4}
                    >
                      Update Profile
                    </Button>
                  </Stack>
                </form>
              </TabPanel>
              
              <TabPanel>
                <form onSubmit={handleChangePassword}>
                  <Stack spacing={4}>
                    <FormControl id="currentPassword" isInvalid={passwordErrors.currentPassword}>
                      <FormLabel>Current Password</FormLabel>
                      <Input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                      <FormErrorMessage>{passwordErrors.currentPassword}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl id="newPassword" isInvalid={passwordErrors.newPassword}>
                      <FormLabel>New Password</FormLabel>
                      <Input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                      <FormErrorMessage>{passwordErrors.newPassword}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl id="confirmPassword" isInvalid={passwordErrors.confirmPassword}>
                      <FormLabel>Confirm New Password</FormLabel>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                      <FormErrorMessage>{passwordErrors.confirmPassword}</FormErrorMessage>
                    </FormControl>
                    
                    <Button
                      type="submit"
                      colorScheme="blue"
                      isLoading={loading}
                      loadingText="Changing Password"
                      mt={4}
                    >
                      Change Password
                    </Button>
                  </Stack>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </Container>
  );
};

export default Profile; 