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

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiresIn: string;
  ipAddress?: string;
  userAgent?: string;
}

export const PasswordResetEmail = ({
  userName = 'John Doe',
  resetUrl = 'https://cryptvest.com/reset-password?token=abc123',
  expiresIn = '1 hour',
  ipAddress = '192.168.1.1',
  userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your CryptVest password</Preview>
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
        
        <Heading style={h1}>Password Reset Request</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          We received a request to reset your password for your CryptVest account. 
          If you made this request, click the button below to reset your password.
        </Text>
        
        <Section style={buttonContainer}>
          <Link href={resetUrl} style={button}>
            Reset My Password
          </Link>
        </Section>
        
        <Text style={text}>
          This link will expire in <strong>{expiresIn}</strong> for security reasons.
        </Text>
        
        {(ipAddress || userAgent) && (
          <Section style={infoBox}>
            <Text style={infoTitle}>Request Details</Text>
            {ipAddress && (
              <>
                <Text style={infoLabel}>IP Address:</Text>
                <Text style={infoValue}>{ipAddress}</Text>
              </>
            )}
            {userAgent && (
              <>
                <Text style={infoLabel}>Device:</Text>
                <Text style={infoValue}>{userAgent}</Text>
              </>
            )}
          </Section>
        )}
        
        <Section style={warningBox}>
          <Text style={warningText}>
            ⚠️ <strong>Security Notice:</strong>
          </Text>
          <Text style={warningText}>
            If you didn't request this password reset, please ignore this email. 
            Your password will remain unchanged.
          </Text>
        </Section>
        
        <Text style={text}>
          For your security, we recommend:
        </Text>
        
        <ul style={list}>
          <li style={listItem}>Using a strong, unique password</li>
          <li style={listItem}>Enabling two-factor authentication</li>
          <li style={listItem}>Not sharing your password with anyone</li>
          <li style={listItem}>Logging out from shared devices</li>
        </ul>
        
        <Text style={text}>
          If you're having trouble with the button above, copy and paste the URL below into your web browser:
        </Text>
        
        <Text style={urlText}>
          {resetUrl}
        </Text>
        
        <Text style={text}>
          If you have any questions or need assistance, please contact our support team.
        </Text>
        
        <Text style={text}>
          Best regards,<br />
          The CryptVest Security Team
        </Text>
        
        <Section style={footer}>
          <Text style={footerText}>
            This is an automated security email. Please do not reply to this email.
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

const infoTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const infoLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '8px 0 4px 0',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '0 0 8px 0',
  fontFamily: 'monospace',
  wordBreak: 'break-all' as const,
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
  margin: '0 0 8px 0',
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
