const fs = require('fs');
const path = require('path');
const axios = require('axios');
const async = require('async');
const { makeTimestampedId } = require('./Utils/TimestampedId');
const recursive = require('recursive-readdir');
const isDev = require('electron-is').dev();
const log = require('electron-log');

module.exports = {
  uploadLocalFile: (localFilePath, uploadOptions, onProgress) => {
    return new Promise((resolve, reject) => {
      fs.stat(localFilePath, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        if (!stats || !stats.size) {
          reject(
            new Error(
              'Unable to find the size - or empty size - for ' + localFilePath
            )
          );
          return;
        }

        const fileReadStream = fs.createReadStream(localFilePath);

        resolve(
          axios({
            method: 'PUT',
            url: uploadOptions.signedUrl,
            data: fileReadStream,
            headers: {
              'Content-Type': uploadOptions.contentType,
              'Content-Length': stats.size,
            },
            onUploadProgress: progressEvent => {
              if (!progressEvent || !progressEvent.total) {
                onProgress(0, 0);
                return;
              }

              onProgress(progressEvent.loaded, progressEvent.total);
            },
          })
        );
      });
    }).then(() => undefined);
  },
};
