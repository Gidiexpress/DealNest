# DealNest Deployment Guide: Oracle Cloud Free Tier + Coolify

A step-by-step guide to deploying DealNest on Oracle Cloud's **Always Free** tier using **Coolify** for simplified management. Total cost: **$0/month forever**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Create Your Oracle Cloud Account](#part-1-create-your-oracle-cloud-account)
3. [Part 2: Create an ARM VM Instance](#part-2-create-an-arm-vm-instance)
4. [Part 3: Configure Firewall Rules](#part-3-configure-firewall-rules)
5. [Part 4: Install Coolify](#part-4-install-coolify)
6. [Part 5: Deploy DealNest](#part-5-deploy-dealnest)
7. [Part 6: Configure Domain & SSL](#part-6-configure-domain--ssl)
8. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

- A valid credit/debit card (for Oracle verification only, you won't be charged)
- A GitHub account with your DealNest repository
- A domain name (optional, but recommended for production)

---

## Part 1: Create Your Oracle Cloud Account

1. Go to [cloud.oracle.com](https://cloud.oracle.com) and click **Sign Up**.
2. Choose your **Home Region** carefully – this cannot be changed later. Recommended:
   - **Frankfurt** (EU)
   - **Johannesburg** (Africa)
   - **Phoenix** or **Ashburn** (US)
3. Complete the signup process with your credit card for verification.
4. Once verified, you'll have access to the Always Free tier.

---

## Part 2: Create an ARM VM Instance

### Step 2.1: Navigate to Compute

1. Log in to Oracle Cloud Console.
2. Click the hamburger menu (☰) → **Compute** → **Instances**.
3. Click **Create Instance**.

### Step 2.2: Configure the Instance

| Setting         | Value                                                         |
|-----------------|---------------------------------------------------------------|
| **Name**        | `dealnest-server`                                             |
| **Compartment** | (default)                                                     |
| **Placement**   | Any Availability Domain                                       |
| **Image**       | Ubuntu 22.04 (Canonical)                                      |
| **Shape**       | Click "Change Shape" → **Ampere** → **VM.Standard.A1.Flex**   |
| **OCPUs**       | 4                                                             |
| **Memory**      | 24 GB                                                         |
| **Boot Volume** | 100 GB (or up to 200 GB for free tier)                        |

### Step 2.3: Configure Networking

1. Select your VCN or let Oracle create a new one.
2. **Assign a public IPv4 address**: Yes.

### Step 2.4: Add SSH Key

1. Generate an SSH key pair if you don't have one:

   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```

2. Upload your **public key** (`.pub` file) or paste its contents.

### Step 2.5: Create the Instance

Click **Create**. Wait 2-5 minutes for the instance to be provisioned.

> **Note:** If ARM instances are unavailable, try a different Availability Domain or region.

---

## Part 3: Configure Firewall Rules

Oracle's firewall blocks most ports by default. We need to open them.

### Step 3.1: In Oracle Cloud Console

1. Go to **Networking** → **Virtual Cloud Networks**.
2. Click your VCN → **Security Lists** → **Default Security List**.
3. Click **Add Ingress Rules** and add:

| Source CIDR | Protocol | Destination Port | Description        |
|-------------|----------|------------------|--------------------|
| `0.0.0.0/0` | TCP      | 80               | HTTP               |
| `0.0.0.0/0` | TCP      | 443              | HTTPS              |
| `0.0.0.0/0` | TCP      | 8000             | Coolify Dashboard  |

### Step 3.2: On the VM (Ubuntu Firewall)

SSH into your server and run:

```bash
ssh ubuntu@<your-server-ip>

# Disable Ubuntu's internal firewall (Oracle's handles it)
sudo iptables -F
sudo netfilter-persistent save
```

---

## Part 4: Install Coolify

Coolify is a self-hosted platform that simplifies deploying apps with Docker.

### Step 4.1: Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### Step 4.2: Install Coolify

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

This takes 3-5 minutes. Once complete, Coolify will be available at:

```text
http://<your-server-ip>:8000
```

### Step 4.3: Initial Setup

1. Open the Coolify URL in your browser.
2. Create an admin account.
3. Add a **Server** → Select "Localhost" (the current machine).
4. Coolify will detect Docker and set itself up.

---

## Part 5: Deploy DealNest

### Step 5.1: Add Required Resources

In Coolify's dashboard, go to **Resources** and add:

1. **PostgreSQL**
   - Click **+ New Resource** → **Database** → **PostgreSQL 15**
   - Name: `dealnest-db`
   - Save the generated `DATABASE_URL`

2. **Redis**
   - Click **+ New Resource** → **Database** → **Redis 7**
   - Name: `dealnest-redis`
   - Save the generated `REDIS_URL`

### Step 5.2: Deploy the Backend (Django)

1. Click **+ New Resource** → **Application** → **Docker Compose**.
2. Connect your GitHub repository.
3. Set the **Base Directory** to `/backend`.
4. Add **Environment Variables**:

```env
DEBUG=False
SECRET_KEY=generate-a-secure-random-key-here
DATABASE_URL=<from-step-5.1>
REDIS_URL=<from-step-5.1>
CELERY_BROKER_URL=<same-as-REDIS_URL>
ALLOWED_HOSTS=api.yourdomain.com,your-server-ip
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

1. Set the **Start Command**: `gunicorn dealnest.wsgi:application --bind 0.0.0.0:8000`
2. Click **Deploy**.

### Step 5.3: Deploy Celery Worker

1. Duplicate the backend resource or create a new Docker Compose app.
2. Set the **Start Command**: `celery -A dealnest worker -l info`
3. Use the same environment variables.
4. Click **Deploy**.

### Step 5.4: Deploy the Frontend (Next.js)

1. Click **+ New Resource** → **Application** → **Nixpacks** (or Docker).
2. Connect your GitHub repository.
3. Set the **Base Directory** to `/frontend`.
4. Add **Environment Variables**:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

1. Coolify will auto-detect Next.js and build it.
2. Click **Deploy**.

---

## Part 6: Configure Domain & SSL

### Step 6.1: Point Your Domain

In your domain registrar (Namecheap, Cloudflare, etc.), add:

| Type | Name | Value               |
|------|------|---------------------|
| A    | `@`  | `<your-server-ip>`  |
| A    | `api`| `<your-server-ip>`  |

### Step 6.2: Enable SSL in Coolify

1. Go to each deployed resource.
2. Under **Settings** → **Domains**, enter your domain (e.g., `yourdomain.com` or `api.yourdomain.com`).
3. Enable **SSL (Let's Encrypt)**.
4. Coolify will automatically generate and renew certificates.

---

## Post-Deployment Checklist

After all services are running:

- [ ] **Run Migrations**: In Coolify, open the backend terminal and run:

  ```bash
  python manage.py migrate
  ```

- [ ] **Create Superuser**:

  ```bash
  python manage.py createsuperuser
  ```

- [ ] **Test the App**: Visit `https://yourdomain.com` and verify:
  - Homepage loads
  - Login/Register works
  - Deal creation works
  - Payments process correctly (use Paystack test mode first)

---

## Troubleshooting

| Issue                               | Solution                                                              |
|-------------------------------------|-----------------------------------------------------------------------|
| ARM instances unavailable           | Try a different Availability Domain or region                         |
| Cannot access Coolify on port 8000  | Check Oracle Security List and iptables rules                         |
| Database connection errors          | Verify `DATABASE_URL` is correct and PostgreSQL container is running  |
| Static files not loading            | Run `python manage.py collectstatic` in the backend container         |

---

## Upgrading Later

When you see demand and need more power:

1. **Vertical Scaling**: Oracle free tier is already very powerful (4 CPUs, 24GB RAM).
2. **Add Paid Resources**: Upgrade to a paid Oracle instance or migrate to a managed service.
3. **Managed Database**: Move PostgreSQL to Supabase or Oracle Autonomous DB for easier management.

---

**Congratulations!** 🎉 You now have DealNest running on Oracle Cloud for **$0/month** with automatic SSL and easy management via Coolify.
