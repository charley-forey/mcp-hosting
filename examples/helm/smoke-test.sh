#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-mcp-smoke}"
RELEASE="${RELEASE:-mcp}"
IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-ghcr.io/your-org/mcp-reference-server}"
IMAGE_TAG="${IMAGE_TAG:-0.1.0}"
LOCAL_PORT="${LOCAL_PORT:-18080}"
SKIP_KIND_CREATE="${SKIP_KIND_CREATE:-false}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CHART_DIR="${REPO_ROOT}/examples/helm"

require_tool() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required tool not on PATH: $1" >&2
    exit 1
  fi
}

require_tool kubectl
require_tool helm
require_tool curl

if [[ "${SKIP_KIND_CREATE}" != "true" ]]; then
  require_tool kind
  echo "[smoke] creating kind cluster (${NAMESPACE})"
  kind create cluster --name "${NAMESPACE}" >/dev/null 2>&1 || true

  echo "[smoke] installing ingress-nginx"
  kubectl apply -f https://kind.sigs.k8s.io/examples/ingress/deploy-ingress-nginx.yaml >/dev/null
  kubectl wait \
    --namespace ingress-nginx \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=120s
fi

echo "[smoke] helm upgrade --install"
helm upgrade --install "${RELEASE}" "${CHART_DIR}" \
  -n "${NAMESPACE}" --create-namespace \
  --set image.repository="${IMAGE_REPOSITORY}" \
  --set image.tag="${IMAGE_TAG}" \
  --set ingress.enabled=false \
  --set autoscaling.enabled=false \
  --set podDisruptionBudget.enabled=false \
  --set networkPolicy.enabled=false \
  --set observability.metrics.serviceMonitor.enabled=false \
  --wait --timeout 3m

SERVICE_NAME="$(kubectl -n "${NAMESPACE}" get svc -l "app.kubernetes.io/instance=${RELEASE}" -o jsonpath='{.items[0].metadata.name}')"
if [[ -z "${SERVICE_NAME}" ]]; then
  echo "[smoke] FAIL: unable to discover service name for release ${RELEASE}" >&2
  exit 1
fi

echo "[smoke] port-forwarding svc/${SERVICE_NAME} to localhost:${LOCAL_PORT}"
kubectl -n "${NAMESPACE}" port-forward "svc/${SERVICE_NAME}" "${LOCAL_PORT}:80" >/tmp/mcp-smoke-portforward.log 2>&1 &
PF_PID=$!
trap 'kill "${PF_PID}" >/dev/null 2>&1 || true' EXIT
sleep 3

BODY='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}'

echo "[smoke] POST http://localhost:${LOCAL_PORT}/mcp"
HTTP_CODE="$(curl -sS -o /tmp/mcp-smoke-response.json -w "%{http_code}" \
  -X POST "http://localhost:${LOCAL_PORT}/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Method: initialize" \
  --data "${BODY}")"

echo "[smoke] HTTP ${HTTP_CODE}"
head -c 400 /tmp/mcp-smoke-response.json || true
echo

if [[ "${HTTP_CODE}" != "200" ]]; then
  echo "[smoke] FAIL: expected HTTP 200, got ${HTTP_CODE}" >&2
  exit 1
fi

echo "[smoke] PASS"
