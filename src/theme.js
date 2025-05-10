import { extendTheme } from '@chakra-ui/react';

// Define the Apployd DB brand colors
const colors = {
  brand: {
    50: '#e6f9ff',
    100: '#bfebff',
    200: '#96dcff',
    300: '#6dcdff',
    400: '#44bfff',
    500: '#00aaff', // Primary brand color
    600: '#0088d4',
    700: '#0066a8',
    800: '#00447d',
    900: '#002252',
  },
  // Adding a teal palette for Apployd DB-specific UI elements (legacy key 'neon' for compatibility)
  apployd: {
    50: '#e2f8f5',
    100: '#c0f0e6',
    200: '#9de8d7',
    300: '#7ae0c8',
    400: '#57d8b9',
    500: '#34d0aa',
    600: '#28a987',
    700: '#1c8264',
    800: '#105c41',
    900: '#04351e',
  },
  neon: {
    50: '#e2f8f5',
    100: '#c0f0e6',
    200: '#9de8d7',
    300: '#7ae0c8',
    400: '#57d8b9',
    500: '#34d0aa',
    600: '#28a987',
    700: '#1c8264',
    800: '#105c41',
    900: '#04351e',
  }
};

// Global styles
const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
  }),
};

// Component overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: '500',
      borderRadius: 'md',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
        },
      }),
      outline: (props) => ({
        borderColor: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        color: props.colorScheme === 'brand' ? 'brand.500' : undefined,
      }),
    },
    defaultProps: {
      colorScheme: 'brand',
    },
  },
  Card: {
    baseStyle: (props) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        boxShadow: 'sm',
        borderRadius: 'lg',
      }
    }),
  },
  Tabs: {
    variants: {
      line: (props) => ({
        tablist: {
          borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
        },
        tab: {
          color: props.colorMode === 'dark' ? 'gray.400' : 'gray.600',
          _selected: {
            color: props.colorMode === 'dark' ? 'brand.300' : 'brand.600',
            borderColor: props.colorMode === 'dark' ? 'brand.300' : 'brand.600',
          },
          _hover: {
            color: props.colorMode === 'dark' ? 'brand.200' : 'brand.700',
          },
        },
      }),
    },
  },
  Table: {
    sizes: {
      md: {
        th: {
          fontSize: 'sm',
          textTransform: 'uppercase',
          letterSpacing: 'wider',
          fontWeight: 'semibold',
          color: 'gray.600',
          _dark: {
            color: 'gray.400'
          },
        },
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'md',
    },
  },
  Modal: {
    baseStyle: (props) => ({
      dialog: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
      },
    }),
  },
};

// Customize the theme
const theme = extendTheme({
  colors,
  styles,
  components,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    mono: `'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

export default theme; 