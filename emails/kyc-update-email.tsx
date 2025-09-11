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

interface KycUpdateEmailProps {
  userName: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  updateTime: string;
}

export const KycUpdateEmail = ({
  userName = 'John Doe',
  status = 'approved',
  rejectionReason,
  updateTime = '2024-01-15 10:30:00 UTC',
}: KycUpdateEmailProps) => (
  <Html>
    <Head />
    <Preview>KYC status update - {status}</Preview>
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
        
        <Heading style={h1}>KYC Status Update</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          Your KYC (Know Your Customer) verification status has been updated.
        </Text>
        
        <Section style={infoBox}>
          <Text style={infoTitle}>KYC Status</Text>
          
          <Text style={infoLabel}>Status:</Text>
          <Text style={statusValue(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </Text>
          
          <Text style={infoLabel}>Updated:</Text>
          <Text style={infoValue}>{updateTime}</Text>
          
          {status === 'rejected' && rejectionReason && (
            <>
              <Text style={infoLabel}>Reason:</Text>
              <Text style={rejectionValue}>{rejectionReason}</Text>
            </>
          )}
        </Section>
        
        {status === 'approved' && (
          <>
            <Text style={text}>
              🎉 Congratulations! Your identity has been successfully verified. 
              You now have full access to all platform features including:
            </Text>
            
            <ul style={list}>
              <li style={listItem}>Higher withdrawal limits</li>
              <li style={listItem}>Access to premium investment plans</li>
              <li style={listItem}>Priority customer support</li>
              <li style={listItem}>Advanced trading features</li>
            </ul>
            
            <Section style={buttonContainer}>
              <Link href="https://cryptvest.com/dashboard" style={button}>
                Access Dashboard
              </Link>
            </Section>
          </>
        )}
        
        {status === 'rejected' && (
          <>
            <Text style={text}>
              Unfortunately, your KYC verification could not be completed. 
              Please review the reason above and resubmit your documents.
            </Text>
            
            <Text style={text}>
              Common reasons for rejection include:
            </Text>
            
            <ul style={list}>
              <li style={listItem}>Blurry or unclear document images</li>
              <li style={listItem}>Expired documents</li>
              <li style={listItem}>Mismatched information</li>
              <li style={listItem}>Incomplete document submission</li>
            </ul>
            
            <Section style={buttonContainer}>
              <Link href="https://cryptvest.com/kyc" style={button}>
                Resubmit Documents
              </Link>
            </Section>
          </>
        )}
        
        {status === 'under_review' && (
          <>
            <Text style={text}>
              Your KYC documents are currently under review by our verification team. 
              This process typically takes 1-3 business days.
            </Text>
            
            <Text style={text}>
              You'll receive another email once the review is complete.
            </Text>
          </>
        )}
        
        {status === 'pending' && (
          <>
            <Text style={text}>
              Your KYC submission has been received and is pending review. 
              Our team will process your documents shortly.
            </Text>
          </>
        )}
        
        <Text style={text}>
          If you have any questions about your KYC status or need assistance, 
          please contact our support team.
        </Text>
        
        <Text style={text}>
          Best regards,<br />
          The CryptVest Compliance Team
        </Text>
        
        <Section style={footer}>
          <Text style={footerText}>
            This is an automated status update. Please keep this for your records.
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
};

const statusValue = (status: string) => ({
  color: status === 'approved' ? '#059669' : status === 'rejected' ? '#dc2626' : status === 'under_review' ? '#d97706' : '#6b7280',
  fontSize: '18px',
  margin: '0 0 8px 0',
  fontWeight: 'bold',
});

const rejectionValue = {
  color: '#dc2626',
  fontSize: '16px',
  margin: '0 0 8px 0',
  fontStyle: 'italic',
};

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
