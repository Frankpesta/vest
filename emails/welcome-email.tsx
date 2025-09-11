import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  verificationUrl?: string;
}

export const WelcomeEmail = ({
  userName = 'John Doe',
  userEmail = 'john@example.com',
  verificationUrl = 'https://cryptvest.com/verify-email?token=abc123',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to CryptVest - Your secure crypto investment platform</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img
            src="https://cryptvest.com/logo.png"
            width="120"
            height="40"
            alt="CryptVest"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>Welcome to CryptVest!</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          Welcome to CryptVest, your trusted partner in cryptocurrency investments. 
          We're excited to have you join our community of smart investors.
        </Text>
        
        <Text style={text}>
          Your account has been successfully created with the email: <strong>{userEmail}</strong>
        </Text>
        
        {verificationUrl && (
          <Section style={buttonContainer}>
            <Link href={verificationUrl} style={button}>
              Verify Your Email
            </Link>
          </Section>
        )}
        
        <Text style={text}>
          Here's what you can do next:
        </Text>
        
        <ul style={list}>
          <li style={listItem}>Complete your profile setup</li>
          <li style={listItem}>Verify your identity (KYC)</li>
          <li style={listItem}>Make your first deposit</li>
          <li style={listItem}>Explore our investment plans</li>
        </ul>
        
        <Text style={text}>
          If you have any questions, our support team is here to help 24/7.
        </Text>
        
        <Text style={text}>
          Best regards,<br />
          The CryptVest Team
        </Text>
        
        <Section style={footer}>
          <Text style={footerText}>
            This email was sent to {userEmail}. If you didn't create an account, please ignore this email.
          </Text>
          <Text style={footerText}>
            © 2024 CryptVest. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const list = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '8px 0',
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  marginTop: '32px',
  paddingTop: '24px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  textAlign: 'center' as const,
};
