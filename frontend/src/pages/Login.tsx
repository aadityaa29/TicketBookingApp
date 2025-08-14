import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { 
  Container, 
  Card, 
  Button, 
  Input, 
  Label, 
  ErrorText, 
  Text, 
  Flex, 
  colors 
} from '../styles/GlobalStyles';

const LoginContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background: ${colors.gray[50]};
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  padding: 40px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
  color: ${colors.gray[800]};
`;

const Subtitle = styled.p`
  color: ${colors.gray[600]};
  text-align: center;
  margin-bottom: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Container>
        <LoginCard>
          <Title>Sign In</Title>
          <Subtitle>Welcome back! Please sign in to your account.</Subtitle>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
              />
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
            </InputGroup>

            <InputGroup>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
              />
              {errors.password && <ErrorText>{errors.password}</ErrorText>}
            </InputGroup>

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              size="large"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form>

          <Flex justify="center" style={{ marginTop: '24px' }}>
            <Text size="sm" color={colors.gray[600]}>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: colors.primary, 
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                Sign up
              </Link>
            </Text>
          </Flex>
        </LoginCard>
      </Container>
    </LoginContainer>
  );
};

export default Login;
