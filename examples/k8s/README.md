# Plain Kubernetes manifests

If you don't want to use Helm, the manifests in this directory are the rendered output of [`../helm/`](../helm/) with placeholder values. They are provided for reference and for clusters where Helm is not available.

```powershell
# Apply
kubectl apply -n mcp -f examples/k8s/

# Or render from the Helm chart with your own values
helm template mcp ../helm -f my-values.yaml > rendered.yaml
kubectl apply -n mcp -f rendered.yaml
```

> The Helm chart is the **source of truth**. These plain manifests will drift unless re-rendered.
