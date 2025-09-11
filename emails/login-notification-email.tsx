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

interface LoginNotificationEmailProps {
  userName: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  isNewDevice?: boolean;
}

export const LoginNotificationEmail = ({
  userName = 'John Doe',
  loginTime = '2024-01-15 10:30:00 UTC',
  ipAddress = '192.168.1.1',
  userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  location = 'New York, US',
  isNewDevice = false,
}: LoginNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>New login detected on your CryptVest account</Preview>
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
        
        <Heading style={h1}>New Login Detected</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          We detected a new login to your CryptVest account. Here are the details:
        </Text>
        
        <Section style={infoBox}>
          <Text style={infoLabel}>Login Time:</Text>
          <Text style={infoValue}>{loginTime}</Text>
          
          <Text style={infoLabel}>IP Address:</Text>
          <Text style={infoValue}>{ipAddress}</Text>
          
          <Text style={infoLabel}>Location:</Text>
          <Text style={infoValue}>{location}</Text>
          
          <Text style={infoLabel}>Device:</Text>
          <Text style={infoValue}>{userAgent}</Text>
        </Section>
        
        {isNewDevice && (
          <Section style={warningBox}>
            <Text style={warningText}>
              ⚠️ This appears to be a new device or browser. If this wasn't you, 
              please secure your account immediately.
            </Text>
          </Section>
        )}
        
        <Text style={text}>
          If this was you, no action is required. If you don't recognize this login, 
          please secure your account immediately by changing your password.
        </Text>
        
        <Section style={buttonContainer}>
          <Link href="https://cryptvest.com/security" style={button}>
            Secure My Account
          </Link>
        </Section>
        
        <Text style={text}>
          For your security, we recommend:
        </Text>
        
        <ul style={list}>
          <li style={listItem}>Using a strong, unique password</li>
          <li style={listItem}>Enabling two-factor authentication</li>
          <li style={listItem}>Regularly reviewing your account activity</li>
        </ul>
        
        <Text style={text}>
          If you have any concerns, please contact our support team immediately.
        </Text>
        
        <Text style={text}>
          Best regards,<br />
          The CryptVest Security Team
        </Text>
        
        <Section style={footer}>
          <Text style={footerText}>
            This is an automated security notification. Please do not reply to this email.
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
  color: '#dc2626',
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

const infoBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '8px 0 4px 0',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 16px 0',
  fontFamily: 'monospace',
};

const warningBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  color: '#dc2626',
  fontSize: '16px',
  margin: '0',
  fontWeight: 'bold',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
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
