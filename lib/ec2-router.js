// Copyright 2015, David M. Lee, II

import AWS from 'aws-sdk';
import program from 'commander';
import _ from 'lodash';
import async from 'async';
import routeMakers from './route-makers';
import {spawn} from 'child_process';

const ALL_REGIONS = [
  'us-east-1',
  'us-west-2',
  'us-west-1',
  'eu-west-1',
  'eu-central-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'sa-east-1',
];

program
  .version(require('../package.json').version)
  .option('--verbose', 'Print additional details')
  .option('--dry-run', 'Print the commands it would execute, but do not execute them')
  .option('--delete', 'Delete routes to EC2 instances instead of adding them')
  .option('--dest [-interface tun0]', 'Specify the route destination')
  .option('--regions [regions]', 'Comma separated list of regions to query. Defaults to default all regions', val => val.split(','), ALL_REGIONS)
  .parse(process.argv);

function fail(...msg) {
  msg.unshift(`${program.name()}:`);
  console.error.apply(console, msg);
  process.exit(1);
}

const unknownRegions = _.difference(program.regions, ALL_REGIONS);
if (!_.isEmpty(unknownRegions)) {
  fail('Unknown regions: ' + unknownRegions.join(', '));
}

const routeMaker = routeMakers({dest: program.dest, verbose: program.verbose});
let route = routeMaker.add.bind(routeMaker);
if (program.delete) {
  route = routeMaker.del.bind(routeMaker);
}

async.map(program.regions, (region, done) => {
  const ec2 = new AWS.EC2({region});
  ec2.describeInstances({}, (err, data) => {
    if (err) { return done(err); }

    const publicAddresses = _(data.Reservations)
      .map(reservation => reservation.Instances)
      .flatten()
      .filter(instance => instance.PublicIpAddress)
      .map(instance => instance.PublicIpAddress)
      .value();

    done(null, publicAddresses);
  });
}, (err, groupedAddresses) => {
  if (err) { fail('Error getting addresses', err.stack); }
  const commands = _.flatten(groupedAddresses).map(route);
  if (program.dryRun) {
    commands.forEach(command => {
      console.log(`${command.command} ${command.args.join(' ')}`);
    });
  } else {
    async.eachSeries(commands, (command, next) => {
      console.log(`+${command.command} ${command.args.join(' ')}`);
      const exe = spawn(command.command, command.args, {
        stdio: 'inherit',
      });
      exe.on('close', code => {
        if (code !== 0) {
          console.error(`${command.command} failed with ${code}`);
          process.exit(1);
        }
        next();
      });
    }, (execErr) => {
      if (execErr) { fail('Error setting routes', execErr.stack); }
      console.log('done');
    });
  }
});
