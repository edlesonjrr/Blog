# AWS Deployment Guide - Single EC2 Instance

This guide will help you deploy your Blog application to a single AWS EC2 instance.

---

## 📋 Overview

- **1 EC2 Instance**: Runs both staging and main branches (switchable)
- **PostgreSQL**: Running in Docker on EC2
- **CI/CD**: Automatic deployment via GitHub Actions
- **Branches**: Push to `staging` or `main` triggers deployment

---

## Step 1: Create AWS EC2 Instance

### 1.1 Launch EC2 Instance

1. Go to **AWS Console** → **EC2** → **Launch Instance**

2. **Configure Instance:**
   - **Name**: `blog-devops-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**:
     - `t2.medium` (2 vCPU, 4GB RAM) - Recommended
     - `t2.small` (1 vCPU, 2GB RAM) - Minimum
     - `t3.medium` (2 vCPU, 4GB RAM) - Better performance
   - **Key Pair**: Create new or select existing
     - Download the `.pem` file and save it securely
     - Example: `blog-key.pem`

3. **Network Settings:**
   - Create new security group: `blog-security-group`
   - Add these inbound rules:
     - **SSH** (22): Your IP or 0.0.0.0/0
     - **HTTP** (80): 0.0.0.0/0
     - **HTTPS** (443): 0.0.0.0/0
     - **Custom TCP** (3000): 0.0.0.0/0 (Backend API)
     - **Custom TCP** (8080): 0.0.0.0/0 (Frontend)

4. **Storage**:
   - 20 GB gp3 SSD (default)

5. Click **Launch Instance**

### 1.2 Get Elastic IP (Optional but Recommended)

1. Go to **EC2** → **Elastic IPs** → **Allocate Elastic IP address**
2. Select the new IP → **Actions** → **Associate Elastic IP address**
3. Select your instance → **Associate**
4. Note the Elastic IP (e.g., `54.123.45.67`)

---

## Step 2: Connect to EC2 and Install Dependencies

### 2.1 Connect via SSH

```bash
# Change permissions on your key
chmod 400 blog-key.pem

# Connect to EC2
ssh -i blog-key.pem ubuntu@<YOUR_EC2_IP>
```

### 2.2 Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 2.3 Install Git

```bash
sudo apt install -y git
git --version
```

### 2.4 Logout and Login Again

```bash
exit
# Then reconnect
ssh -i blog-key.pem ubuntu@<YOUR_EC2_IP>
```

---

## Step 3: Clone Repository on EC2

```bash
# Create directory
mkdir -p /home/ubuntu/blog
cd /home/ubuntu/blog

# Clone your repository
git clone https://github.com/YOUR_USERNAME/Blog.git .

# Checkout the branch you want to deploy (staging or main)
git checkout staging
# OR
git checkout main
```

---

## Step 4: Start the Application

```bash
cd /home/ubuntu/blog

# Build and start all services
docker compose up -d

# Wait a few seconds for services to start
sleep 15

# Check if everything is running
docker compose ps

# Check logs
docker compose logs -f
```

### 4.1 Verify Deployment

```bash
# Test backend health
curl http://localhost:3000/health

# Test frontend
curl http://localhost:8080

# Access from your browser
# http://<YOUR_EC2_IP>:8080
# http://<YOUR_EC2_IP>:3000/health
```

---

## Step 5: Configure GitHub Secrets

### 5.1 Get Your SSH Private Key Content

On your local machine:

```bash
cat blog-key.pem
```

Copy the entire output including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

### 5.2 Add Secrets to GitHub

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `EC2_HOST` | Your EC2 Elastic IP or Public DNS | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_PRIVATE_KEY` | Content of your `.pem` file | `-----BEGIN RSA PRIVATE KEY-----...` |

---

## Step 6: Test CI/CD Pipeline

### 6.1 Push to Staging Branch

```bash
# On your local machine
git checkout staging
git pull origin staging

# Make a small change (e.g., update README)
echo "# Test deployment" >> test.txt
git add test.txt
git commit -m "test: CI/CD deployment"
git push origin staging
```

### 6.2 Watch GitHub Actions

1. Go to your repository → **Actions** tab
2. You should see a workflow running
3. Wait for it to complete
4. Check the logs for any errors

### 6.3 Verify on EC2

```bash
ssh -i blog-key.pem ubuntu@<YOUR_EC2_IP>
cd /home/ubuntu/blog
docker compose logs -f
```

---

## Step 7: Access Your Application

### Frontend:
```
http://<YOUR_EC2_IP>:8080
```

### Backend API:
```
http://<YOUR_EC2_IP>:3000
```

### Health Check:
```
http://<YOUR_EC2_IP>:3000/health
```

---

## 🔄 How the CI/CD Works

1. **Push to `staging` or `main` branch** on GitHub
2. **GitHub Actions triggers** the workflow
3. **Build and Test** job runs:
   - Builds Docker images
   - Starts services
   - Tests health endpoints
4. **Deploy job runs**:
   - Connects to EC2 via SSH
   - Pulls latest code
   - Rebuilds and restarts Docker containers
5. **Application updated** on EC2

---

## 🛠️ Useful Commands

### On EC2:

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f postgres

# Restart services
docker compose restart

# Stop services
docker compose down

# Start services
docker compose up -d

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d

# Clean up unused resources
docker system prune -f

# Switch branches
git fetch origin
git checkout main  # or staging
git pull origin main
docker compose down
docker compose build
docker compose up -d
```

---

## 🔒 Security Best Practices

1. **SSH Access**: Restrict SSH to your IP in security group
2. **Passwords**: Change default PostgreSQL password in production
3. **HTTPS**: Set up SSL certificate for production
4. **Firewall**: Only open necessary ports
5. **Updates**: Regularly update EC2: `sudo apt update && sudo apt upgrade -y`
6. **Backups**: Backup PostgreSQL data regularly
7. **Secrets**: Never commit `.pem` files or secrets to Git

---

## 💰 Cost Estimate

### t2.medium (Recommended):
- **On-Demand**: ~$0.0464/hour = ~$34/month
- **Free Tier**: 750 hours/month free for 12 months

### t2.small (Minimum):
- **On-Demand**: ~$0.023/hour = ~$17/month

### Cost Optimization:
- Stop instance when not in use
- Use AWS Free Tier (750 hours/month for 12 months)
- Schedule automatic shutdown during off-hours

---

## 🐛 Troubleshooting

### Port Already in Use:
```bash
sudo lsof -i :3000
sudo lsof -i :8080
# Kill the process if needed
```

### Docker Permission Denied:
```bash
sudo usermod -aG docker ubuntu
exit
# Login again
```

### Database Connection Failed:
```bash
docker compose logs postgres
docker compose restart postgres
```

### GitHub Actions SSH Failed:
- Check EC2 security group allows SSH from GitHub IPs
- Verify `EC2_SSH_PRIVATE_KEY` secret is correct
- Check EC2 instance is running

### Application Not Accessible:
```bash
# Check if services are running
docker compose ps

# Check firewall
sudo ufw status

# Check security group in AWS Console
```

---

## 📝 Next Steps

1. ✅ Set up domain name (optional)
2. ✅ Configure SSL certificate with Let's Encrypt
3. ✅ Set up CloudWatch monitoring
4. ✅ Configure automatic backups
5. ✅ Add monitoring with Zabbix and Grafana (if required)
6. ✅ Create Postman collection for API documentation

---

## 🎯 Summary

You now have:
- ✅ Blog application running on AWS EC2
- ✅ PostgreSQL database in Docker
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Automatic deployment on push to `staging` or `main`

**Access your app**: `http://<YOUR_EC2_IP>:8080`

**Any questions?** Check the troubleshooting section or AWS/Docker documentation.
