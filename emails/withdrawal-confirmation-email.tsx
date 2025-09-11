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

interface WithdrawalConfirmationEmailProps {
  userName: string;
  amount: string;
  currency: string;
  usdValue: string;
  walletAddress: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  withdrawalTime: string;
  estimatedArrival?: string;
}

export const WithdrawalConfirmationEmail = ({
  userName = 'John Doe',
  amount = '0.5',
  currency = 'ETH',
  usdValue = '$1,700.00',
  walletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1',
  status = 'processing',
  withdrawalTime = '2024-01-15 10:30:00 UTC',
  estimatedArrival = '2024-01-15 12:30:00 UTC',
}: WithdrawalConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Withdrawal {status} - {amount} {currency}</Preview>
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
        
        <Heading style={h1}>Withdrawal {status.charAt(0).toUpperCase() + status.slice(1)}</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          Your withdrawal request has been {status === 'completed' ? 'successfully processed' : status}.
        </Text>
        
        <Section style={infoBox}>
          <Text style={infoTitle}>Withdrawal Details</Text>
          
          <Text style={infoLabel}>Amount:</Text>
          <Text style={infoValue}>{amount} {currency}</Text>
          
          <Text style={infoLabel}>USD Value:</Text>
          <Text style={infoValue}>{usdValue}</Text>
          
          <Text style={infoLabel}>Wallet Address:</Text>
          <Text style={infoValue}>{walletAddress}</Text>
          
          <Text style={infoLabel}>Status:</Text>
          <Text style={statusValue(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
          
          <Text style={infoLabel}>Request Time:</Text>
          <Text style={infoValue}>{withdrawalTime}</Text>
          
          {estimatedArrival && status === 'processing' && (
            <>
              <Text style={infoLabel}>Estimated Arrival:</Text>
              <Text style={infoValue}>{estimatedArrival}</Text>
            </>
          )}
        </Section>
        
        {status === 'processing' && (
          <Text style={text}>
            Your withdrawal is being processed and will arrive at your wallet shortly. 
            You can track the progress in your dashboard.
          </Text>
        )}
        
        {status === 'completed' && (
          <Text style={text}>
            Your withdrawal has been successfully completed! The funds should now be 
            available in your wallet.
          </Text>
        )}
        
        {status === 'failed' && (
          <Text style={text}>
            Unfortunately, your withdrawal could not be processed. Please contact 
            support for assistance.
          </Text>
        )}
        
        <Section style={buttonContainer}>
          <Link href="https://cryptvest.com/dashboard/transactions" style={button}>
            View Transaction
          </Link>
        </Section>
        
        <Text style={text}>
          If you have any questions about this withdrawal, please contact our support team.
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
  color: '#7c3aed',
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
  backgroundColor: '#faf5ff',
  border: '1px solid #e9d5ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#7c3aed',
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
  wordBreak: 'break-all' as const,
};

const statusValue = (status: string) => ({
  color: status === 'completed' ? '#059669' : status === 'processing' ? '#d97706' : status === 'failed' ? '#dc2626' : '#6b7280',
  fontSize: '16px',
  margin: '0 0 8px 0',
  fontWeight: 'bold',
});

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
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
