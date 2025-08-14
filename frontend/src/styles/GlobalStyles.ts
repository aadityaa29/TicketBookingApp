import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f5f5f5;
    color: #333;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul, ol {
    list-style: none;
  }

  button {
    border: none;
    outline: none;
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea, select {
    outline: none;
    font-family: inherit;
  }

  .react-toastify__toast {
    font-family: 'Roboto', sans-serif;
  }
`;

// Color palette inspired by BookMyShow
export const colors = {
  primary: '#DC3545', // Red
  primaryDark: '#C82333',
  primaryLight: '#E45A6A',
  secondary: '#007BFF',
  secondaryDark: '#0056B3',
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  dark: '#343A40',
  light: '#F8F9FA',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F8F9FA',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
  background: {
    main: '#F5F5F5',
    card: '#FFFFFF',
    dark: '#1A1A1A',
  }
};

// Common styled components
export const Container = styled.div<{ maxWidth?: string }>`
  max-width: ${props => props.maxWidth || '1200px'};
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 15px;
  }
`;

export const Card = styled.div<{ padding?: string; margin?: string }>`
  background: ${colors.white};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: ${props => props.padding || '20px'};
  margin: ${props => props.margin || '0'};
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 6px;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  width: ${props => props.fullWidth ? '100%' : 'auto'};

  ${props => {
    switch (props.size) {
      case 'small':
        return `
          padding: 8px 16px;
          font-size: 14px;
        `;
      case 'large':
        return `
          padding: 16px 32px;
          font-size: 16px;
        `;
      default:
        return `
          padding: 12px 24px;
          font-size: 14px;
        `;
    }
  }}

  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: ${colors.secondary};
          color: ${colors.white};
          border: 1px solid ${colors.secondary};

          &:hover:not(:disabled) {
            background: ${colors.secondaryDark};
            border-color: ${colors.secondaryDark};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${colors.primary};
          border: 1px solid ${colors.primary};

          &:hover:not(:disabled) {
            background: ${colors.primary};
            color: ${colors.white};
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${colors.primary};
          border: 1px solid transparent;

          &:hover:not(:disabled) {
            background: ${colors.gray[100]};
          }
        `;
      default:
        return `
          background: ${colors.primary};
          color: ${colors.white};
          border: 1px solid ${colors.primary};

          &:hover:not(:disabled) {
            background: ${colors.primaryDark};
            border-color: ${colors.primaryDark};
          }
        `;
    }
  }}
`;

export const Input = styled.input<{ error?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.error ? colors.danger : colors.gray[300]};
  border-radius: 6px;
  font-size: 14px;
  background: ${colors.white};
  transition: border-color 0.3s ease;

  &:focus {
    border-color: ${props => props.error ? colors.danger : colors.primary};
  }

  &::placeholder {
    color: ${colors.gray[500]};
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${colors.gray[700]};
  font-size: 14px;
`;

export const ErrorText = styled.span`
  color: ${colors.danger};
  font-size: 12px;
  margin-top: 4px;
  display: block;
`;

export const Flex = styled.div<{
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: string;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: ${props => props.align || 'stretch'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || '0'};
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};
`;

export const Grid = styled.div<{ cols?: number; gap?: string; minWidth?: string }>`
  display: grid;
  grid-template-columns: repeat(${props => props.cols || 1}, 1fr);
  gap: ${props => props.gap || '20px'};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(${props => props.minWidth || '250px'}, 1fr));
  }
`;

export const Text = styled.span<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right';
}>`
  ${props => {
    switch (props.size) {
      case 'xs':
        return 'font-size: 12px;';
      case 'sm':
        return 'font-size: 14px;';
      case 'lg':
        return 'font-size: 18px;';
      case 'xl':
        return 'font-size: 24px;';
      case 'xxl':
        return 'font-size: 32px;';
      default:
        return 'font-size: 16px;';
    }
  }}

  ${props => {
    switch (props.weight) {
      case 'light':
        return 'font-weight: 300;';
      case 'medium':
        return 'font-weight: 500;';
      case 'semibold':
        return 'font-weight: 600;';
      case 'bold':
        return 'font-weight: 700;';
      default:
        return 'font-weight: 400;';
    }
  }}

  color: ${props => props.color || colors.gray[800]};
  text-align: ${props => props.align || 'left'};
`;

export const Badge = styled.span<{ variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;

  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: ${colors.secondary}20;
          color: ${colors.secondary};
        `;
      case 'success':
        return `
          background: ${colors.success}20;
          color: ${colors.success};
        `;
      case 'warning':
        return `
          background: ${colors.warning}20;
          color: #B45309;
        `;
      case 'danger':
        return `
          background: ${colors.danger}20;
          color: ${colors.danger};
        `;
      default:
        return `
          background: ${colors.primary}20;
          color: ${colors.primary};
        `;
    }
  }}
`;

export const Spinner = styled.div`
  border: 3px solid ${colors.gray[200]};
  border-top: 3px solid ${colors.primary};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  min-height: 200px;
`;
