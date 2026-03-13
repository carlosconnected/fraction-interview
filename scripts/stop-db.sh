#!/usr/bin/env bash
set -e

docker stop fraction-postgres || true
docker rm fraction-postgres || true