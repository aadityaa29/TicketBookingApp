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

const RegisterContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background: ${colors.gray[100]};
`;

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 420px; // Slightly wider for more fields
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

const Register: React.FC = () => {
  const { register } = useAuth(); // Assuming you add a 'register' function to your AuthContext
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    try {
      // We don't send confirmPassword to the backend
      const { name, email, phone, password } = formData;
      await register({ name, email, phone, password });
      navigate('/'); // Navigate to home page after successful registration
    } catch (error: any) {
      console.error('Registration failed:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <Container>
        <RegisterCard>
          <Title>Create Account</Title>
          <Subtitle>Get started by creating a new account.</Subtitle>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>Full Name</Label>
              <Input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} error={!!errors.name} />
              {errors.name && <ErrorText>{errors.name}</ErrorText>}
            </InputGroup>

            <InputGroup>
              <Label>Email</Label>
              <Input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} error={!!errors.email} />
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
            </InputGroup>

            <InputGroup>
              <Label>Phone Number</Label>
              <Input type="tel" name="phone" placeholder="Enter your 10-digit phone number" value={formData.phone} onChange={handleChange} error={!!errors.phone} />
              {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
            </InputGroup>

            <InputGroup>
              <Label>Password</Label>
              <Input type="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} error={!!errors.password} />
              {errors.password && <ErrorText>{errors.password}</ErrorText>}
            </InputGroup>

            <InputGroup>
              <Label>Confirm Password</Label>
              <Input type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} error={!!errors.confirmPassword} />
              {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
            </InputGroup>

            {serverError && <ErrorText>{serverError}</ErrorText>}

            <Button type="submit" fullWidth disabled={isLoading} size="large">
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </Form>

          <Flex justify="center" style={{ marginTop: '24px' }}>
            <Text size="sm" color={colors.gray[600]}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: colors.primary, fontWeight: 500, textDecoration: 'none' }}>
                Sign In
              </Link>
            </Text>
          </Flex>
        </RegisterCard>
      </Container>
    </RegisterContainer>
  );
};

export default Register;
