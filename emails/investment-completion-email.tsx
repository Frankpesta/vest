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

interface InvestmentCompletionEmailProps {
  userName: string;
  planName: string;
  originalAmount: string;
  currency: string;
  totalReturn: string;
  returnPercentage: string;
  duration: string;
  completionDate: string;
}

export const InvestmentCompletionEmail = ({
  userName = 'John Doe',
  planName = 'Crypto Staking Pro',
  originalAmount = '1.0',
  currency = 'ETH',
  totalReturn = '$612.00',
  returnPercentage = '18%',
  duration = '365 days',
  completionDate = '2024-01-15 10:30:00 UTC',
}: InvestmentCompletionEmailProps) => (
  <Html>
    <Head />
    <Preview>Investment completed! {totalReturn} profit earned</Preview>
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
        
        <Heading style={h1}>🎉 Investment Completed Successfully!</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          Congratulations! Your investment has reached maturity and generated excellent returns. 
          Your profits have been added to your account balance.
        </Text>
        
        <Section style={infoBox}>
          <Text style={infoTitle}>Investment Summary</Text>
          
          <Text style={infoLabel}>Investment Plan:</Text>
          <Text style={infoValue}>{planName}</Text>
          
          <Text style={infoLabel}>Original Investment:</Text>
          <Text style={infoValue}>{originalAmount} {currency}</Text>
          
          <Text style={infoLabel}>Total Return:</Text>
          <Text style={returnValue}>{totalReturn}</Text>
          
          <Text style={infoLabel}>Return Percentage:</Text>
          <Text style={returnValue}>{returnPercentage}</Text>
          
          <Text style={infoLabel}>Duration:</Text>
          <Text style={infoValue}>{duration}</Text>
          
          <Text style={infoLabel}>Completion Date:</Text>
          <Text style={infoValue}>{completionDate}</Text>
        </Section>
        
        <Text style={text}>
          Your investment has been successfully completed and all returns have been 
          automatically added to your account balance. You can now:
        </Text>
        
        <ul style={list}>
          <li style={listItem}>Withdraw your profits to your wallet</li>
          <li style={listItem}>Reinvest in new opportunities</li>
          <li style={listItem}>View detailed performance analytics</li>
          <li style={listItem}>Explore other investment plans</li>
        </ul>
        
        <Section style={buttonContainer}>
          <Link href="https://cryptvest.com/dashboard/investments" style={button}>
            View Investment Details
          </Link>
        </Section>
        
        <Text style={text}>
          Ready for your next investment? We have exciting new opportunities available 
          with even better returns!
        </Text>
        
        <Section style={buttonContainer}>
          <Link href="https://cryptvest.com/plans" style={secondaryButton}>
            Explore New Plans
          </Link>
        </Section>
        
        <Text style={text}>
          Thank you for trusting CryptVest with your investments. We're committed to 
          helping you achieve your financial goals.
        </Text>
        
        <Text style={text}>
          Best regards,<br />
          The CryptVest Investment Team
        </Text>
        
        <Section style={footer}>
          <Text style={footerText}>
            This is an automated completion notification. Please keep this for your records.
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

const returnValue = {
  color: '#059669',
  fontSize: '18px',
  margin: '0 0 8px 0',
  fontWeight: 'bold',
};

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
  margin: '0 8px',
};

const secondaryButton = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 8px',
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
