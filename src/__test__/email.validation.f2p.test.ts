/**
 * Tests for email validation fixes in sendEmail functions
 */
import { sendEmail, sendEmailWithAttachments } from '../email/sendEmail';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
  }))
}));

describe('sendEmail validation', () => {
  it('should throw error when emailOptions is null', async () => {
    await expect(sendEmail(null as any)).rejects.toThrow('Email recipient (to) is required');
  });

  it('should throw error when to field is missing', async () => {
    await expect(sendEmail({ subject: 'Test', message: 'Test message' })).rejects.toThrow('Email recipient (to) is required');
  });

  it('should throw error when subject is missing', async () => {
    await expect(sendEmail({ to: 'test@example.com', message: 'Test message' })).rejects.toThrow('Email subject is required');
  });

  it('should throw error when message is missing', async () => {
    await expect(sendEmail({ to: 'test@example.com', subject: 'Test' })).rejects.toThrow('Email message is required');
  });

  it('should work with valid options', async () => {
    await expect(sendEmail({ 
      to: 'test@example.com', 
      subject: 'Test', 
      message: 'Test message' 
    })).resolves.not.toThrow();
  });
});

describe('sendEmailWithAttachments validation', () => {
  it('should throw error when attachment is missing', async () => {
    await expect(sendEmailWithAttachments({ 
      to: 'test@example.com', 
      subject: 'Test', 
      message: 'Test message' 
    })).rejects.toThrow('Attachment path is required');
  });

  it('should work with valid options including attachment', async () => {
    await expect(sendEmailWithAttachments({ 
      to: 'test@example.com', 
      subject: 'Test', 
      message: 'Test message',
      attachment: '/path/to/file.pdf'
    })).resolves.not.toThrow();
  });
});
