var PROTO_PATH = __dirname + '/../protos/helloworld.proto'; // Corrected path concatenation

var parseArgs = require('minimist');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

// Define the Unix Domain Socket path - MUST MATCH YOUR SERVER'S UDS PATH
const UDS_PATH = '/tmp/grpc_greeter.sock';

function main() {
  var argv = parseArgs(process.argv.slice(2), {
    string: 'target'
  });
  var target;

  // If a target is provided as a command-line argument, use it.
  // Otherwise, default to the UDS_PATH.
  if (argv.target) {
    target = argv.target;
  } else {
    // Default to the Unix Domain Socket path
    // The 'unix:///' prefix is crucial for gRPC to recognize it as a UDS
    target = `unix://${UDS_PATH}`;
    console.log(`No target specified, defaulting to UDS: ${target}`);
  }

  var client = new hello_proto.Greeter(target,
                                       grpc.credentials.createInsecure());
  var user;
  if (argv._.length > 0) {
    user = argv._[0];
  } else {
    user = 'world';
  }

  client.sayHello({name: user}, function(err, response) {
    if (err) {
      console.error('Error:', err.message);
      // More detailed error handling for UDS issues
      if (err.code === grpc.status.UNAVAILABLE) {
        console.error('Server is unavailable. Is the UDS server running and accessible?');
      } else if (err.code === grpc.status.UNIMPLEMENTED) {
        console.error('Method not implemented or service not found.');
      }
    } else {
      console.log('Greeting:', response.message);
    }
    // It's good practice to gracefully shut down the client channel
    client.close();
  });
}

main();
