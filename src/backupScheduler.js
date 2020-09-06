const backupDb = require('./backup');
const cron = require('node-cron');
const constants = require('./utils/constants');
const strings = require('./utils/strings');
const configstore = require('conf');

let cronScheduler = (jobNames, isDebug) => {
    console.log(strings.synchlyStartedDesc);
    
    for(let jobName in jobNames) {    
        const confStore = new configstore({configName: jobName});
        console.log(`Started Job ${jobName}`)
        // TODO: show the info of jobs started
        const backupTime = new Date(confStore.get('dbBackupTime'));
        const backupHours = backupTime.getHours();
        const backupMinutes = backupTime.getMinutes();
        const cronExp = `${backupMinutes} ${backupHours} * * *`;
        cron.schedule(cronExp, () => {
            backupDb(jobName, isDebug);
        });
    }
};

module.exports = cronScheduler;
