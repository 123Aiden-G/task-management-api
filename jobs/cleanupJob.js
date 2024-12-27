const { Task } = require('../models/task');
const { User } = require('../models/user');
const schedule = require('node-schedule');

const cleanupJob = () => {
    // Schedule the job to run daily at midnight
    schedule.scheduleJob('0 0 * * *', async function() {
        try {
            // Update status of tasks past their due date
            const updateResult = await Task.updateMany(
                { dueDate: { $lt: new Date() }, status: { $ne: 'completed' }, deleted: false },
                { $set: { status: 'overdue' } }
            );
            console.log(`Updated ${updateResult.nModified} tasks to overdue status.`);

            // Permanently delete user accounts and associated tasks after 30 days of soft deletion
            const usersToDelete = await User.find({ deleted: true, deletedAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) } });
            for (const user of usersToDelete) {
                await Task.deleteMany({ assignedTo: user._id });
                await User.deleteOne({ _id: user._id });
                console.log(`Permanently deleted user ${user._id} and associated tasks.`);
            }
        } catch (error) {
            console.error('Error during cleanup job:', error);
        }
    });
};

module.exports = cleanupJob;
