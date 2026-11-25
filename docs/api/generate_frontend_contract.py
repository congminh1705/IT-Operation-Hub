"""Generate the reviewed FND-03.01 slice and compare later runtime exports."""

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DRAFT = ROOT / "docs/api/openapi.json"
OUTPUT = ROOT / "src/frontend/src/lib/api/contract.generated.ts"
OPERATIONS = {
    ("/auth/csrf", "get"): "getCsrf",
    ("/auth/login", "post"): "login",
    ("/auth/me", "get"): "getCurrentUser",
    ("/auth/logout", "post"): "logout",
    ("/auth/profile", "patch"): "updateOwnProfile",
    ("/auth/password", "post"): "changeOwnPassword",
    ("/tickets", "get"): "listTickets",
    ("/tickets/{id}", "get"): "getTicket",
}
ANNOTATIONS = {
    "description", "summary", "title", "example", "examples", "externalDocs",
}


def resolve(document: dict, reference: str) -> dict:
    if not reference.startswith("#/"):
        raise ValueError(f"Expected a local OpenAPI reference: {reference}")
    target = document
    for token in reference[2:].split("/"):
        target = target[token.replace("~1", "/").replace("~0", "~")]
    return target


def shape(document: dict, value: Any, field: str = "") -> Any:
    if isinstance(value, list):
        items = [shape(document, item) for item in value]
        if field in {"required", "enum", "oneOf", "anyOf", "parameters", "security", "type"}:
            return sorted(items, key=canonical)
        return items
    if not isinstance(value, dict):
        return value
    if "$ref" in value:
        siblings = set(value) - {"$ref"} - ANNOTATIONS
        if siblings:
            raise ValueError(f"Unsupported reference siblings: {sorted(siblings)}")
        return shape(document, resolve(document, value["$ref"]))
    if field in {"properties", "responses", "headers", "content"}:
        return {key: shape(document, item) for key, item in value.items()}
    return {
        key: shape(document, item, key)
        for key, item in value.items()
        if key not in ANNOTATIONS and not key.startswith("x-")
    }


def canonical(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


def contract(document: dict) -> dict:
    result = {}
    for (path, method), operation_id in OPERATIONS.items():
        # FastAPI may include the base path in paths instead of servers.
        if path in document["paths"]:
            if not any(server["url"] == "/api/v1" for server in document.get("servers", [])):
                raise ValueError(f"{method.upper()} {path} has no /api/v1 server")
            full_path = path
        else:
            full_path = "/api/v1" + path
        path_item = document["paths"][full_path]
        operation = path_item[method]
        if operation["operationId"] != operation_id:
            raise ValueError(f"Expected operationId {operation_id} for {full_path}")
        parameters = {}
        for parameter in [*path_item.get("parameters", []), *operation.get("parameters", [])]:
            resolved = shape(document, parameter)
            parameters[(resolved["in"], resolved["name"])] = resolved
        security = operation.get("security", document.get("security", []))
        result[operation_id] = {
            "parameters": shape(document, list(parameters.values()), "parameters"),
            "requestBody": shape(document, operation.get("requestBody")),
            "responses": shape(document, operation["responses"], "responses"),
            "security": sorted(
                (
                    sorted(
                        (shape(document, document["components"]["securitySchemes"][name]) for name in requirement),
                        key=canonical,
                    )
                    for requirement in security
                ),
                key=canonical,
            ),
        }
    return result


def ts_type(schema: dict, names: set[str]) -> str:
    if "$ref" in schema:
        reference = schema["$ref"]
        if not reference.startswith("#/components/schemas/"):
            raise ValueError(f"Unsupported schema reference: {reference}")
        name = reference.rsplit("/", 1)[1]
        names.add(name)
        return name
    for union in ("enum", "oneOf", "anyOf"):
        if union in schema:
            if union == "enum":
                return " | ".join(json.dumps(item) for item in schema[union])
            return " | ".join(ts_type(item, names) for item in schema[union])
    kind = schema["type"]
    if isinstance(kind, list):
        return " | ".join(ts_type({"type": item}, names) for item in kind)
    if kind == "array":
        return f"Array<{ts_type(schema['items'], names)}>"
    if kind == "object" and isinstance(schema.get("additionalProperties"), dict):
        return f"Record<string, {ts_type(schema['additionalProperties'], names)}>"
    if kind in {"integer", "number"}:
        return "number"
    if kind in {"boolean", "null", "string"}:
        return kind
    raise ValueError(f"Unsupported TypeScript shape: {schema}")


def generate(document: dict, selected: dict) -> str:
    schemas = document["components"]["schemas"]
    names: set[str] = set()
    for (path, method), _ in OPERATIONS.items():
        operation = document["paths"][path][method]
        for message in [operation.get("requestBody", {}), *operation["responses"].values()]:
            schema = message.get("content", {}).get("application/json", {}).get("schema")
            if schema is not None:
                ts_type(schema, names)

    blocks = {}
    while pending := sorted(names - blocks.keys()):
        name = pending[0]
        schema = schemas[name]
        if schema.get("type") == "object" and "properties" in schema:
            if schema.get("additionalProperties") is not False:
                raise ValueError(f"Expected a closed DTO for {name}")
            required = set(schema.get("required", []))
            lines = []
            for field, value in schema["properties"].items():
                mark = "" if field in required else "?"
                annotation = ts_type(value, names)
                line = f"  {field}{mark}: {annotation};"
                if len(line) > 80 and "enum" in value:
                    members = "\n".join(f"    | {json.dumps(item)}" for item in value["enum"])
                    line = f"  {field}{mark}:\n{members};"
                lines.append(line)
            blocks[name] = f"export interface {name} {{\n" + "\n".join(lines) + "\n}"
        else:
            blocks[name] = f"export type {name} = {ts_type(schema, names)};"

    op_lines = []
    for (path, method), operation_id in OPERATIONS.items():
        if not path.startswith("/auth/"):
            continue
        headers = {
            parameter["name"]
            for parameter in selected[operation_id]["parameters"]
            if parameter["in"] == "header" and parameter["required"]
        }
        known_headers = {"X-CSRF-Token", "Idempotency-Key"}
        if headers - known_headers:
            raise ValueError(f"Unsupported authentication headers: {headers - known_headers}")
        op_lines.extend([
            f"  {operation_id}: {{",
            f'    path: "/api/v1{path}",',
            f'    method: "{method.upper()}",',
            f'    csrf: {str("X-CSRF-Token" in headers).lower()},',
            f'    idempotency: {str("Idempotency-Key" in headers).lower()},',
            "  },",
        ])

    digest = hashlib.sha256(canonical(selected).encode()).hexdigest()
    header = f"// Generated by docs/api/generate_frontend_contract.py.\n// FND-03.01 wire contract SHA-256: {digest}\n"
    return "\n\n".join([
        header.rstrip(),
        *(blocks[name] for name in sorted(blocks)),
        "export const accountOperations = {\n" + "\n".join(op_lines) + "\n} as const;",
    ]) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    options = parser.add_mutually_exclusive_group()
    options.add_argument("--check", action="store_true", help="Fail when generated TypeScript is stale")
    options.add_argument("--runtime", type=Path, help="Compare an exported FastAPI OpenAPI JSON document")
    args = parser.parse_args()
    draft = json.loads(DRAFT.read_text(encoding="utf-8"))
    try:
        selected = contract(draft)
        if args.runtime:
            runtime = contract(json.loads(args.runtime.read_text(encoding="utf-8")))
            drift = [
                f"{name}.{part}"
                for name in selected
                for part, value in selected[name].items()
                if runtime[name][part] != value
            ]
            if drift:
                parser.exit(1, f"OpenAPI contract drift: {', '.join(drift)}\n")
            print(f"Runtime export matches the {len(selected)} reviewed operations.")
        else:
            expected = generate(draft, selected)
            if args.check:
                if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != expected:
                    parser.exit(1, "Generated frontend contract is stale. Regenerate and review the diff.\n")
                print(f"Generated frontend contract matches the {len(selected)} reviewed operations.")
            else:
                OUTPUT.write_bytes(expected.encode())
    except (KeyError, OSError, ValueError) as error:
        parser.exit(1, f"OpenAPI boundary: {error}\n")


if __name__ == "__main__":
    main()
