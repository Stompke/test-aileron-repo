
const { exec } = require('child_process');
const { exit } = require('process');

exec('npx changeset publish', { encoding: 'utf8' }, ((error, stdout, stderr) => {
  if (error) {
    console.error(error);
    exitCode = 1;
    exit(1);
  }

  console.log(stdout, stderr);
}));
