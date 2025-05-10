/**
 * Validation utility functions
 */

/**
 * Validates an email address
 * Uses RFC 5322 compliant regex for email validation
 * 
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isEmailValid = (email) => {
  if (!email) return false;
  
  // RFC 5322 compliant regex for email validation
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

/**
 * Checks if email is from a disposable/temporary email provider
 * 
 * @param {string} email - The email to check
 * @returns {boolean} - Whether the email is from a known disposable provider
 */
export const isDisposableEmail = (email) => {
  if (!email) return false;
  
  const disposableDomains = [
    'mailinator.com', 'temp-mail.org', 'guerrillamail.com', 'tempmail.com',
    'fakeinbox.com', 'sharklasers.com', 'armyspy.com', 'cuvox.de',
    'dayrep.com', 'einrot.com', 'fleckens.hu', 'gustr.com',
    'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
    'yopmail.com', '10minutemail.com', 'mailnesia.com', 'tempr.email'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
};

/**
 * Validates email domain has valid MX records
 * Note: This is a mock implementation. In a real app, this would need to be done server-side.
 * 
 * @param {string} email - The email to validate
 * @returns {Promise<boolean>} - Whether the domain has valid MX records
 */
export const hasMxRecords = async (email) => {
  // This is a mock implementation since browser JS can't check MX records
  // In a real app, this would be an API call to the backend
  return Promise.resolve(true);
};

/**
 * Comprehensive email validation
 * 
 * @param {string} email - The email to validate
 * @returns {Promise<Object>} - Validation result with reason if invalid
 */
export const validateEmail = async (email) => {
  if (!isEmailValid(email)) {
    return { 
      isValid: false, 
      reason: 'Please enter a valid email address' 
    };
  }
  
  if (isDisposableEmail(email)) {
    return { 
      isValid: false, 
      reason: 'Disposable email addresses are not allowed' 
    };
  }
  
  try {
    const hasMx = await hasMxRecords(email);
    if (!hasMx) {
      return { 
        isValid: false, 
        reason: 'Email domain appears to be invalid' 
      };
    }
  } catch (error) {
    console.error('Error checking MX records:', error);
  }
  
  return { isValid: true };
}; 