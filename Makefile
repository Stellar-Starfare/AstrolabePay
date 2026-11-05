.PHONY: all install build test lint format clean contracts test-contracts dev-frontend dev-proxy

all: build test

install:
	npm install

build:
	npm run build

test: test-contracts
	npm run test --workspaces --if-present

contracts:
	stellar contract build --manifest-path contracts/astrolabe_core/Cargo.toml

test-contracts:
	cargo test --manifest-path contracts/astrolabe_core/Cargo.toml

lint:
	npm run lint
	cargo clippy --manifest-path contracts/astrolabe_core/Cargo.toml -- -D warnings

format:
	cargo fmt --manifest-path contracts/astrolabe_core/Cargo.toml
	npx prettier --write "packages/*/src/**/*.ts" "frontend/src/**/*.{ts,tsx}"

dev-frontend:
	npm run dev:frontend

dev-proxy:
	npm run start:proxy

clean:
	rm -rf dist frontend/dist packages/*/dist target contracts/astrolabe_core/target
