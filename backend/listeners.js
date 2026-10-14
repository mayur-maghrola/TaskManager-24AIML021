const taskEvents = require('./events');

// Register listener for the 'task-created' event
taskEvents.on('task-created', (task) => {
  const taskTitle = task.title || task.text || 'Untitled Task';
  const assignedUser = task.assignedUser || (task.userId && task.userId.username) || (task.userId && task.userId.email) || task.userId || 'Unassigned';
  const eventReceivedTime = new Date().toISOString();

  console.log(`[Event Handler Received] 'task-created' event triggered for "${taskTitle}" at ${eventReceivedTime}`);

  // Step 5: Artificial delay inside listener (e.g., 2000ms via setTimeout)
  // to make asynchronous background behavior visible without blocking API response.
  setTimeout(() => {
    const completionTimestamp = new Date().toISOString();
    console.log(
      `[Notification] Task "${taskTitle}" created at ${completionTimestamp} | Assigned User: ${assignedUser}`
    );
    console.log(`[Event Handler Completed] Background notification finished at ${completionTimestamp}`);
  }, 2000);
});

module.exports = taskEvents;
