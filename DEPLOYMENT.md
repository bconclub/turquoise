# Turquoise Holidays - VPS Deployment Guide

This guide will help you deploy the Turquoise Holidays Next.js application to your VPS server with automatic deployment from GitHub.

## Prerequisites

- VPS server with Ubuntu 22.04 LTS (or similar)
- Root or sudo access
- Domain name pointing to your VPS IP (optional but recommended)
- GitHub repository with your code

## Step 1: Initial VPS Setup

### 1.1 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify installation:
```bash
node --version  # Should show v20.x.x
npm --version
```

### 1.3 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

Set up PM2 to start on boot:
```bash
pm2 startup
# Follow the instructions shown (usually involves running a sudo command)
```

### 1.4 Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 Install Git

```bash
sudo apt install git -y
```

## Step 2: Set Up SSH Key for GitHub Actions

### 2.1 Generate SSH Key Pair (on your local machine)

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/vps_deploy_key
```

This creates:
- `~/.ssh/vps_deploy_key` (private key - keep secret!)
- `~/.ssh/vps_deploy_key.pub` (public key)

### 2.2 Add Public Key to VPS

Copy the public key to your VPS:

```bash
ssh-copy-id -i ~/.ssh/vps_deploy_key.pub user@your-vps-ip
```

Or manually:
```bash
cat ~/.ssh/vps_deploy_key.pub
# Copy the output, then on VPS:
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 2.3 Test SSH Connection

```bash
ssh -i ~/.ssh/vps_deploy_key user@your-vps-ip
```

## Step 3: Clone Repository on VPS

### 3.1 Create Application Directory

```bash
mkdir -p /var/www
cd /var/www
```

### 3.2 Clone Your Repository

```bash
git clone https://github.com/yourusername/turquoise.git
cd turquoise
```

### 3.3 Set Up Environment Variables

Create `.env.local` file:

```bash
nano .env.local
```

Add your environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLAUDE_API_KEY=your-claude-api-key
# Add any other environment variables
```

Save and exit (Ctrl+X, then Y, then Enter).

### 3.4 Make Deploy Script Executable

```bash
chmod +x deploy.sh
```

## Step 4: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

1. **VPS_HOST**: Your VPS IP address or domain (e.g., `123.456.789.0` or `yourdomain.com`)
2. **VPS_USER**: SSH username (e.g., `root` or `ubuntu`)
3. **VPS_SSH_KEY**: The **private** key content (from `~/.ssh/vps_deploy_key`)
   ```bash
   cat ~/.ssh/vps_deploy_key
   # Copy the entire output including -----BEGIN and -----END lines
   ```
4. **VPS_DEPLOY_PATH**: Full path to your app directory (e.g., `/var/www/turquoise`)

## Step 5: Initial Manual Deployment

Before automatic deployment works, do an initial manual setup:

```bash
cd /var/www/turquoise
npm install
npm run build
pm2 start ecosystem.config.js
pm2 save
```

Verify it's running:
```bash
pm2 status
pm2 logs turquoise
```

Your app should now be accessible at `http://your-vps-ip:3000`

## Step 6: Configure Nginx

### 6.1 Copy Nginx Configuration

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/turquoise
```

### 6.2 Edit Configuration

```bash
sudo nano /etc/nginx/sites-available/turquoise
```

Replace `yourdomain.com` with your actual domain name.

### 6.3 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/turquoise /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

Your app should now be accessible at `http://yourdomain.com`

## Step 7: Set Up SSL Certificate (HTTPS)

### 7.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 7.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically configure Nginx.

### 7.3 Update Nginx Config for HTTPS

Edit `/etc/nginx/sites-available/turquoise` and uncomment the HTTPS server block, then comment out the HTTP redirect.

### 7.4 Auto-renewal

Certbot sets up auto-renewal automatically. Test it:

```bash
sudo certbot renew --dry-run
```

## Step 8: Test Automatic Deployment

1. Make a small change to your code
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Go to GitHub → Actions tab
4. Watch the deployment workflow run
5. Check your VPS to verify the changes are live

## Useful Commands

### PM2 Commands

```bash
pm2 status              # Check app status
pm2 logs turquoise      # View logs
pm2 restart turquoise   # Restart app
pm2 stop turquoise     # Stop app
pm2 delete turquoise   # Remove from PM2
```

### Nginx Commands

```bash
sudo nginx -t           # Test configuration
sudo systemctl reload nginx    # Reload without downtime
sudo systemctl restart nginx   # Restart Nginx
sudo systemctl status nginx    # Check status
```

### Deployment Commands

```bash
cd /var/www/turquoise
./deploy.sh             # Manual deployment
git pull origin main    # Pull latest code
npm run build           # Rebuild app
```

## Troubleshooting

### App Not Starting

1. Check PM2 logs: `pm2 logs turquoise`
2. Check if port 3000 is in use: `sudo lsof -i :3000`
3. Verify environment variables: `cat .env.local`
4. Check Node.js version: `node --version` (should be 18+)

### Nginx 502 Bad Gateway

1. Check if Next.js app is running: `pm2 status`
2. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify proxy_pass URL in Nginx config matches your app port

### GitHub Actions Deployment Fails

1. Check GitHub Actions logs in the Actions tab
2. Verify all GitHub Secrets are set correctly
3. Test SSH connection manually: `ssh -i ~/.ssh/vps_deploy_key user@vps-ip`
4. Verify deploy.sh is executable: `ls -la deploy.sh`

### Build Errors

1. Check Node.js version: `node --version`
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check for missing environment variables
4. Review build logs: `npm run build`

## Security Best Practices

1. **Firewall**: Set up UFW firewall
   ```bash
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp     # HTTP
   sudo ufw allow 443/tcp    # HTTPS
   sudo ufw enable
   ```

2. **SSH Security**: Disable password authentication, use keys only
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   sudo systemctl restart sshd
   ```

3. **Keep System Updated**: Regularly update packages
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Environment Variables**: Never commit `.env.local` to Git

## Monitoring

### Set Up PM2 Monitoring (Optional)

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### View Application Logs

```bash
pm2 logs turquoise --lines 100
tail -f logs/pm2-combined.log
```

## Next Steps

- Set up monitoring (e.g., UptimeRobot, Pingdom)
- Configure backups for your database
- Set up error tracking (e.g., Sentry)
- Configure CDN for static assets (optional)

## Support

If you encounter issues:
1. Check the logs first
2. Review this documentation
3. Check GitHub Issues
4. Review Next.js and PM2 documentation

---

**Last Updated**: January 2025
