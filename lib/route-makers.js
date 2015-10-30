// Copyright 2015, David M. Lee, II

import os from 'os';

class Linux {
  constructor({dest, verbose}) {
    this.dest = (dest || 'dev tun0').split(' ');
    this.verbose = verbose || false;
  }

  add(address) {
    const spawn = {
      command: 'route',
      args: [
        'add',
        '-host',
        address,
      ],
    };
    spawn.args.push(...this.dest);
    if (this.verbose) {
      spawn.args.unshift('-v');
    }
    return spawn;
  }

  del(address) {
    const spawn = {
      command: 'route',
      args: [
        'delete',
        '-host',
        address,
      ],
    };
    if (this.verbose) {
      spawn.args.unshift('-v');
    }
    return spawn;
  }
}

class Darwin {
  constructor({dest, verbose}) {
    this.dest = (dest || '-interface tun0').split(' ');
    this.verbose = verbose || false;
  }

  add(address) {
    const spawn = {
      command: 'route',
      args: [
        'add',
        '-host',
        address,
      ],
    };
    spawn.args.push(...this.dest);
    if (this.verbose) {
      spawn.args.unshift('-v');
    }
    return spawn;
  }

  del(address) {
    const spawn = {
      command: 'route',
      args: [
        'delete',
        '-host',
        address,
      ],
    };
    if (this.verbose) {
      spawn.args.unshift('-v');
    }
    return spawn;
  }
}

export default function route({dest, verbose, platform}) {
  switch (platform || os.platform()) {
  case 'darwin':
    return new Darwin({dest, verbose});
  case 'linux':
    return new Linux({dest, verbose});
  default:
    throw new Error(`Unknown platform: ${platform}`);
  }
}
