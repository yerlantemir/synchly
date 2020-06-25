const client = require('ssh2-sftp-client');
const configstore = require('conf');
const path = require('path');

const confStore = new configstore();

const init = (sftpConfig = undefined) => {

    if(!sftpConfig)
        sftpConfig = confStore.store;

    const config = {
        host: sftpConfig.sftpHost,
        port: sftpConfig.sftpPort,
        username: sftpConfig.sftpAuthUser,
        password: sftpConfig.sftpAuthPwd
    };

    return config;
};

const exists = async (sftpConfig = undefined) => {

    if(!sftpConfig)
        sftpConfig = confStore.store;
    
    const config = init(sftpConfig);
    let sftp = new client();
    let existsRes;
    let error;
    try {
        let connectRes = await sftp.connect(config);
        existsRes = await sftp.exists(sftpConfig.sftpBackupPath);
        if(!existsRes) {
            error = (new Error(`Given directory ${sftpConfig.sftpBackupPath} does not exist on the remote server`));
        } else if (existsRes != 'd') {
            error = (new Error(`Not a directory, ${sftpConfig.sftpBackupPath}`)); 
        }
    } catch (err) {
        error = err;
    } finally {
        let endRes = await sftp.end();
    }
    if(error)
        throw error;
    return existsRes;
};

const uploadFile = async (srcFileName, srcFilePath) => {
    
    const sftpConfig = confStore.store;
    
    const config = init(sftpConfig);
    let sftp = new client();
    let uploadRes;
    let error;
    try {
        const connectRes = await sftp.connect(config);
        const remoteFilePath = path.join(sftpConfig.sftpBackupPath, srcFileName);
        uploadRes = await sftp.put(srcFilePath, remoteFilePath);
    } catch (err) {
        error = err;
    } finally {
        const endRes = await sftp.end();
    }
    if(error)
        throw error;
    return uploadRes;
};

const deleteFile = async (fileName) => {
    const sftpConfig = confStore.store;
    
    const config = init(sftpConfig);
    let sftp = new client();
    let deleteRes;
    let error;
    try {
        const connectRes = await sftp.connect(config);
        const remoteFilePath = path.join(sftpConfig.sftpBackupPath, fileName);
        deleteRes = await sftp.delete(remoteFilePath);
    } catch (err) {
        error = err;
    } finally {
        const endRes = await sftp.end();
    }
    if(error)
        throw error;
    return deleteRes;
};

module.exports = {
    exists,
    uploadFile,
    deleteFile
}