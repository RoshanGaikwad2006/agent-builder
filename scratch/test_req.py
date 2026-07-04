import urllib.request
import urllib.error

url = "http://localhost:8080/agents/6a47c680e2c79e123b54aee4"
print(f"Sending GET request to {url} ...")

req = urllib.request.Request(
    url,
    method="GET",
    headers={
        "Origin": "http://localhost:5173",
        "Authorization": "Bearer invalid-token-spec"
    }
)

try:
    response = urllib.request.urlopen(req, timeout=3)
    print("STATUS:", response.status)
    print("HEADERS:")
    for k, v in response.getheaders():
        print(f"  {k}: {v}")
except urllib.error.HTTPError as e:
    print("HTTPError encountered:", e.code, e.reason)
    print("Response headers:")
    for k, v in e.headers.items():
         print(f"  {k}: {v}")
except urllib.error.URLError as e:
    print("URLError encountered:", e)
except Exception as e:
    print("Unexpected exception:", e)
