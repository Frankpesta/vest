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

interface DepositConfirmationEmailProps {
  userName: string;
  amount: string;
  currency: string;
  usdValue: string;
  transactionHash: string;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'completed';
  depositTime: string;
}

export const DepositConfirmationEmail = ({
  userName = 'John Doe',
  amount = '0.5',
  currency = 'ETH',
  usdValue = '$1,700.00',
  transactionHash = '0x1234...5678',
  confirmations = 12,
  status = 'confirmed',
  depositTime = '2024-01-15 10:30:00 UTC',
}: DepositConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Deposit confirmed - {amount} {currency} received</Preview>
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
        
        <Heading style={h1}>Deposit Confirmed! 🎉</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          Great news! Your deposit has been successfully confirmed and added to your account.
        </Text>
        
        <Section style={infoBox}>
          <Text style={infoTitle}>Deposit Details</Text>
          
          <Text style={infoLabel}>Amount:</Text>
          <Text style={infoValue}>{amount} {currency}</Text>
          
          <Text style={infoLabel}>USD Value:</Text>
          <Text style={infoValue}>{usdValue}</Text>
          
          <Text style={infoLabel}>Transaction Hash:</Text>
          <Text style={infoValue}>{transactionHash}</Text>
          
          <Text style={infoLabel}>Confirmations:</Text>
          <Text style={infoValue}>{confirmations}</Text>
          
          <Text style={infoLabel}>Status:</Text>
          <Text style={statusValue(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
          
          <Text style={infoLabel}>Time:</Text>
          <Text style={infoValue}>{depositTime}</Text>
        </Section>
        
        <Text style={text}>
          Your funds are now available in your account and ready for investment. 
          You can view your updated balance in your dashboard.
        </Text>
        
        <Section style={buttonContainer}>
          <Link href="https://cryptvest.com/dashboard" style={button}>
            View Dashboard
          </Link>
        </Section>
        
        <Text style={text}>
          Ready to start investing? Explore our investment plans and start growing your wealth:
        </Text>
        
        <ul style={list}>
          <li style={listItem}>Crypto Staking Plans - Up to 18% APY</li>
          <li style={listItem}>Real Estate Investment Trusts</li>
          <li style={listItem}>Forex Trading Strategies</li>
          <li style={listItem}>Retirement Planning Solutions</li>
        </ul>
        
        <Text style={text}>
          If you have any questions about your deposit or need assistance, 
          our support team is here to help.
        </Text>
        
        <Text style={text}>
          Best regards,<br />
          The CryptVest Team
        </Text>
        
        <Section style={footer}>
          <Text style={footerText}>
            This is an automated confirmation email. Please keep this for your records.
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
  color: '#059669',
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
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#059669',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const infoLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '12px 0 4px 0',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 8px 0',
  fontFamily: 'monospace',
};

const statusValue = (status: string) => ({
  color: status === 'completed' ? '#059669' : status === 'confirmed' ? '#d97706' : '#dc2626',
  fontSize: '16px',
  margin: '0 0 8px 0',
  fontWeight: 'bold',
});

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#059669',
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
