---
description: How to set up Ngrok for webhook testing on Windows
---

# Setting Up Ngrok on Windows

This workflow covers installing Chocolatey, Ngrok, and exposing your local server for webhook testing.

## 1. Install Chocolatey (Package Manager)

Open **PowerShell as Administrator** and run:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Close and reopen PowerShell after installation.

## 2. Install Ngrok

```powershell
choco install ngrok -y
```

## 3. Create Ngrok Account & Authenticate

1. Go to https://ngrok.com and create a free account
2. Copy your authtoken from the dashboard (https://dashboard.ngrok.com/get-started/your-authtoken)
3. Run this command to authenticate:

```powershell
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

## 4. Expose Your Local Server

With your Django backend running on port 8000, open a new terminal and run:

```powershell
ngrok http 8000
```

You'll see output like:
```
Forwarding   https://abc123xyz.ngrok-free.app -> http://localhost:8000
```

## 5. Configure Paystack Webhook

1. Copy the ngrok HTTPS URL (e.g., `https://abc123xyz.ngrok-free.app`)
2. Go to Paystack Dashboard → Settings → API Keys & Webhooks
3. Set the webhook URL to:
   ```
   https://abc123xyz.ngrok-free.app/api/payments/webhook/paystack/
   ```

## Notes

- Keep the ngrok terminal running while testing
- The free ngrok URL changes each restart (paid plans offer static URLs)
- Check the ngrok web interface at http://127.0.0.1:4040 to inspect requests
