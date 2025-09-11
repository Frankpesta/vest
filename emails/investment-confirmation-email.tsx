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

interface InvestmentConfirmationEmailProps {
  userName: string;
  planName: string;
  amount: string;
  currency: string;
  usdValue: string;
  expectedReturn: string;
  duration: string;
  apy: string;
  investmentTime: string;
  status: 'pending' | 'active' | 'confirmed';
}

export const InvestmentConfirmationEmail = ({
  userName = 'John Doe',
  planName = 'Crypto Staking Pro',
  amount = '1.0',
  currency = 'ETH',
  usdValue = '$3,400.00',
  expectedReturn = '$612.00',
  duration = '365 days',
  apy = '18%',
  investmentTime = '2024-01-15 10:30:00 UTC',
  status = 'confirmed',
}: InvestmentConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Investment confirmed - {planName} - {amount} {currency}</Preview>
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
        
        <Heading style={h1}>Investment Confirmed! 🚀</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          Congratulations! Your investment has been successfully confirmed and is now active.
        </Text>
        
        <Section style={infoBox}>
          <Text style={infoTitle}>Investment Details</Text>
          
          <Text style={infoLabel}>Investment Plan:</Text>
          <Text style={infoValue}>{planName}</Text>
          
          <Text style={infoLabel}>Amount Invested:</Text>
          <Text style={infoValue}>{amount} {currency} ({usdValue})</Text>
          
          <Text style={infoLabel}>Expected Return:</Text>
          <Text style={infoValue}>{expectedReturn}</Text>
          
          <Text style={infoLabel}>APY:</Text>
          <Text style={infoValue}>{apy}</Text>
          
          <Text style={infoLabel}>Duration:</Text>
          <Text style={infoValue}>{duration}</Text>
          
          <Text style={infoLabel}>Status:</Text>
          <Text style={statusValue(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
          
          <Text style={infoLabel}>Investment Date:</Text>
          <Text style={infoValue}>{investmentTime}</Text>
        </Section>
        
        <Text style={text}>
          Your investment is now generating returns! You can track your progress 
          and view detailed analytics in your dashboard.
        </Text>
        
        <Section style={buttonContainer}>
          <Link href="https://cryptvest.com/dashboard/investments" style={button}>
            View Investment
          </Link>
        </Section>
        
        <Text style={text}>
          <strong>What happens next?</strong>
        </Text>
        
        <ul style={list}>
          <li style={listItem}>Your investment starts earning returns immediately</li>
          <li style={listItem}>You'll receive regular updates on performance</li>
          <li style={listItem}>Returns are calculated and added to your balance daily</li>
          <li style={listItem}>You can track progress in real-time</li>
        </ul>
        
        <Text style={text}>
          Need help or have questions? Our investment specialists are here to assist you.
        </Text>
        
        <Text style={text}>
          Best regards,<br />
          The CryptVest Investment Team
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

const infoBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#3b82f6',
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
  color: status === 'active' ? '#059669' : status === 'confirmed' ? '#d97706' : '#dc2626',
  fontSize: '16px',
  margin: '0 0 8px 0',
  fontWeight: 'bold',
});

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
