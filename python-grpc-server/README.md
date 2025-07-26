Install dependencies:

```sh
uv sync
```

Generate Python code from `.proto` files:

```sh
uv run -m grpc_tools.protoc -I ../protos --python_out=. --pyi_out=. --grpc_python_out=. ../protos/helloworld.proto
```

Run the server:

```sh
uv run main.py
```
