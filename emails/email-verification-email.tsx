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

interface EmailVerificationEmailProps {
  userName: string;
  verificationUrl: string;
  expiresIn: string;
}

export const EmailVerificationEmail = ({
  userName = 'John Doe',
  verificationUrl = 'https://cryptvest.com/verify-email?token=abc123',
  expiresIn = '24 hours',
}: EmailVerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address to complete registration</Preview>
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
        
        <Heading style={h1}>Verify Your Email Address</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          Welcome to CryptVest! To complete your registration and secure your account, 
          please verify your email address by clicking the button below.
        </Text>
        
        <Section style={buttonContainer}>
          <Link href={verificationUrl} style={button}>
            Verify Email Address
          </Link>
        </Section>
        
        <Text style={text}>
          This verification link will expire in <strong>{expiresIn}</strong> for security reasons.
        </Text>
        
        <Text style={text}>
          Once verified, you'll have full access to:
        </Text>
        
        <ul style={list}>
          <li style={listItem}>Secure cryptocurrency investments</li>
          <li style={listItem}>Real-time portfolio tracking</li>
          <li style={listItem}>Advanced trading features</li>
          <li style={listItem}>24/7 customer support</li>
        </ul>
        
        <Section style={warningBox}>
          <Text style={warningText}>
            ⚠️ <strong>Important:</strong> If you didn't create an account with CryptVest, 
            please ignore this email. Your email address will not be verified.
          </Text>
        </Section>
        
        <Text style={text}>
          If you're having trouble with the button above, copy and paste the URL below into your web browser:
        </Text>
        
        <Text style={urlText}>
          {verificationUrl}
        </Text>
        
        <Text style={text}>
          If you have any questions or need assistance, please contact our support team.
        </Text>
        
        <Text style={text}>
          Best regards,<br />
          The CryptVest Team
        </Text>
        
        <Section style={footer}>
          <Text style={footerText}>
            This is an automated verification email. Please do not reply to this email.
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
  color: '#3b82f6',
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

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  color: '#92400e',
  fontSize: '16px',
  margin: '0',
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

const urlText = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  color: '#1f2937',
  fontSize: '14px',
  fontFamily: 'monospace',
  padding: '12px',
  margin: '16px 0',
  wordBreak: 'break-all' as const,
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
