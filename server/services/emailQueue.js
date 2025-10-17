const { sendFIRConfirmationEmail, sendPasswordResetEmail } = require('./emailService');

// Simple in-memory queue for email tasks
const emailQueue = [];
let isProcessing = false;

// Add email task to queue
const addEmailTask = (task) => {
  emailQueue.push({
    ...task,
    id: Date.now() + Math.random(),
    createdAt: new Date(),
    attempts: 0,
    maxAttempts: 3
  });
  
  // Start processing if not already running
  if (!isProcessing) {
    processEmailQueue();
  }
};

// Process email queue
const processEmailQueue = async () => {
  if (isProcessing || emailQueue.length === 0) {
    return;
  }

  isProcessing = true;
  console.log(`Processing email queue: ${emailQueue.length} emails pending`);

  while (emailQueue.length > 0) {
    const task = emailQueue.shift();
    
    try {
      let result;
      
      switch (task.type) {
        case 'fir_confirmation':
          result = await sendFIRConfirmationEmail(
            task.email,
            task.userName,
            task.crimeData
          );
          break;
          
        case 'password_reset':
          result = await sendPasswordResetEmail(
            task.email,
            task.userName,
            task.resetToken
          );
          break;
          
        default:
          console.error('Unknown email task type:', task.type);
          continue;
      }

      if (result.success) {
        console.log(`Email sent successfully: ${task.type} to ${task.email}`);
      } else {
        throw new Error(result.error || 'Email sending failed');
      }
      
    } catch (error) {
      console.error(`Email sending failed for ${task.type} to ${task.email}:`, error.message);
      
      // Retry logic
      task.attempts++;
      if (task.attempts < task.maxAttempts) {
        console.log(`Retrying email (attempt ${task.attempts + 1}/${task.maxAttempts})`);
        // Add back to queue with delay
        setTimeout(() => {
          emailQueue.unshift(task);
          if (!isProcessing) {
            processEmailQueue();
          }
        }, 5000 * task.attempts); // Exponential backoff: 5s, 10s, 15s
      } else {
        console.error(`Email permanently failed after ${task.maxAttempts} attempts: ${task.type} to ${task.email}`);
        // Could save to database for manual retry later
      }
    }
    
    // Small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  isProcessing = false;
  console.log('Email queue processing completed');
};

// Queue FIR confirmation email
const queueFIRConfirmation = (email, userName, crimeData) => {
  addEmailTask({
    type: 'fir_confirmation',
    email,
    userName,
    crimeData
  });
};

// Queue password reset email
const queuePasswordReset = (email, userName, resetToken) => {
  addEmailTask({
    type: 'password_reset',
    email,
    userName,
    resetToken
  });
};

// Get queue status
const getQueueStatus = () => {
  return {
    pending: emailQueue.length,
    processing: isProcessing,
    tasks: emailQueue.map(task => ({
      id: task.id,
      type: task.type,
      email: task.email,
      attempts: task.attempts,
      createdAt: task.createdAt
    }))
  };
};

module.exports = {
  queueFIRConfirmation,
  queuePasswordReset,
  getQueueStatus,
  processEmailQueue
};
