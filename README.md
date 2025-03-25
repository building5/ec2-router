# ec2-router

> [!CAUTION]
> These scripts are a bad idea, and no longer maintained. Really, setup a VPN.

When starting out with Amazon EC2, it usually easier to start using IP based
restrictions instead of doing the "Right Thing™" and setting up a VPN between
your network and your VPCs.

This script will walk through your EC2 inventory, and setup a bunch of static
host routes to your EC2 public addresses. This allows you to forward all of your
traffic to those EC2 instances, say, over your VPN back to your corporate
network.

But, really, you should setup a VPN.

## Usage

```bash
$ npm install -g ec2-router
$ sudo ec2-router
```

## Credentials

`ec2-router` uses all the [typical mechanisms][] for configuring your AWS
credentials.

 [typical mechanisms]: http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

 * `~/.aws/credentials`

```
# Can be configured manually, or using aws configure
[default]
aws_access_key_id = ***
aws_secret_access_key = ***
```

 * Environment Variables

```
$ sudo AWS_ACCESS_KEY_ID=*** AWS_SECRET_ACCESS_KEY=*** ec2-router
```

## Command Options

```
    --verbose                 Print additional details
    --dry-run                 Print the commands it would execute, but do not
                              execute them
    --delete                  Delete routes to EC2 instances instead of adding
                              them
    --dest [-interface tun0]  Specify the route destination
    --regions [regions]       Comma separated list of regions to query. Defaults
                              to default all regions
```

## Special Thanks

Special thanks to [Dan Jenkins][] for the initial script that this one is based
on.

 [Dan Jenkins]: https://github.com/danjenkins

## License

[MIT](./LICENSE)
