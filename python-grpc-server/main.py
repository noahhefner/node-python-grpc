from concurrent import futures
import logging
import os

import grpc
import helloworld_pb2
import helloworld_pb2_grpc


class Greeter(helloworld_pb2_grpc.GreeterServicer):
    def SayHello(self, request, context):
        return helloworld_pb2.HelloReply(message="Hello, %s!" % request.name)


def serve():

    uds_path = "/tmp/grpc_greeter.sock"

    if os.path.exists(uds_path):
        os.remove(uds_path)
        print(f"Removed existing UDS file: {uds_path}")

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    helloworld_pb2_grpc.add_GreeterServicer_to_server(Greeter(), server)

    server.add_insecure_port(f"unix:///{uds_path}")

    server.start()
    print(f"Server started, listening on Unix Domain Socket: {uds_path}")

    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        print("Server interrupted. Shutting down...")
        server.stop(0)
    finally:
        if os.path.exists(uds_path):
            os.remove(uds_path)
            print(f"Removed UDS file on shutdown: {uds_path}")


if __name__ == "__main__":
    logging.basicConfig()
    serve()
