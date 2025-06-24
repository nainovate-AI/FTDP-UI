import React, { createContext, useContext, useState, useEffect } from 'react';

interface Theme {
  colors: {
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    accent: string;
    hover: string;
  };
  shadows: {
    sm: string;
    md: string;
  };
}

const lightTheme: Theme = {
  colors: {
    background: '#ffffff',
    surface: '#ffffff',
    text: {
      primary: '#111827',
      secondary: '#374151',
      muted: '#6b7280'
    },
    border: '#e5e7eb',
    accent: '#3b82f6',
    hover: '#f9fafb'
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }
};

const darkTheme: Theme = {
  colors: {
    background: '#111827',
    surface: '#1f2937',
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      muted: '#9ca3af'
    },
    border: '#374151',
    accent: '#3b82f6',
    hover: '#374151'
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
  }
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      <div style={{ 
        backgroundColor: theme.colors.background,
        color: theme.colors.text.primary,
        minHeight: '100vh',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
