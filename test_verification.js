import { Resend } from 'resend';
import { sendVerificationEmail } from './utils/emailService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testVerificationEmail() {
  console.log('🧪 Testing Email Verification System...');
  console.log('📧 RESEND_API_KEY from env:', process.env.RESEND_API_KEY ? 'Found' : 'Not found');
  
  // Test email - replace with your actual email
  const testEmail = 'alamin1045@gmail.com';
  const testName = 'Test User';
  const testToken = 'test-token-123';
  
  try {
    console.log(`📤 Attempting to send verification email to: ${testEmail}`);
    
    const result = await sendVerificationEmail(testEmail, testName, testToken);
    
    if (result.success) {
      console.log('✅ Verification email sent successfully!');
      console.log('📧 Email ID:', result.emailId);
      console.log('\n🔍 Please check your email inbox and spam folder for the verification email.');
    } else {
      console.log('❌ Failed to send verification email');
      console.log('Error:', result.error);
      console.log('Details:', result.details);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Also test direct Resend API
async function testDirectResend() {
  console.log('\n🔧 Testing Direct Resend API...');
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    const result = await resend.emails.send({
      from: 'CodeConnect <no-reply@mail.codeconnect.dev>',
      to: ['alamin1045@gmail.com'],
      subject: 'Direct Resend Test - CodeConnect',
      html: `
        <h1>Direct Resend Test</h1>
        <p>This is a direct test of the Resend API service.</p>
        <p>If you receive this email, Resend is working correctly!</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
    });
    
    console.log('✅ Direct Resend test successful!');
    console.log('📧 Email ID:', result.data?.id);
    
  } catch (error) {
    console.error('❌ Direct Resend test failed:', error);
  }
}

// Run both tests
async function runTests() {
  await testDirectResend();
  await testVerificationEmail();
  
  console.log('\n📝 Test Summary:');
  console.log('1. Check your email inbox and spam folder');
  console.log('2. If no emails arrive, the API key might be invalid or restricted');
  console.log('3. The domain "mail.codeconnect.dev" might need verification in Resend');
  console.log('4. Try using "onboarding@resend.dev" for testing if custom domain fails');
}

runTests().then(() => {
  console.log('\n🎯 Email tests completed!');
}).catch(error => {
  console.error('💥 Test suite failed:', error);
});
