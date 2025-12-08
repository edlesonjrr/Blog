# AWS Deployment Plan

This document outlines the steps to deploy the Blog application to AWS EC2 instances.

## Architecture Overview

- **Staging Environment**: EC2 instance for testing (triggered by `staging` branch)
- **Production Environment**: EC2 instance for production (triggered by `main` branch)
- **Database**: PostgreSQL running in Docker on each EC2 instance
- **CI/CD**: GitHub Actions for automated deployment

---

## Prerequisites

### 1. AWS Account Setup
- Create an AWS account if you don't have one
- Set up billing alerts to avoid unexpected charges

### 2. IAM User for CI/CD
1. Go to AWS IAM Console
2. Create a new user: `github-actions-blog`
3. Attach policies:
   - `AmazonEC2FullAccess` (or create custom policy with minimal permissions)
4. Generate Access Keys:
   - Save `AWS_ACCESS_KEY_ID`
   - Save `AWS_SECRET_ACCESS_KEY`

---

## EC2 Instance Setup

### Step 1: Launch EC2 Instances

You'll need **2 EC2 instances** (one for staging, one for production):

#### Instance Configuration:
- **AMI**: Ubuntu Server 22.04 LTS
- **Instance Type**: t2.medium (minimum) or t3.medium (recommended)
  - 2 vCPUs, 4 GB RAM
  - For cost optimization, you can use t2.micro for staging
- **Storage**: 20 GB gp3 SSD
- **Security Group**: Create a new security group with these rules:
  - SSH (22): Your IP address
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
  - Custom TCP (3000): 0.0.0.0/0 (Backend API)
  - Custom TCP (8080): 0.0.0.0/0 (Frontend)
  - PostgreSQL (5433): 0.0.0.0/0 (if you need external access to DB)

#### Create Key Pair:
- Create a new key pair or use existing one
- Download the `.pem` file and keep it secure
- This will be used as `EC2_SSH_PRIVATE_KEY` in GitHub Secrets

### Step 2: Connect to EC2 and Install Dependencies

Connect to each EC2 instance:
```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Run these commands on each instance:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install -y git

# Logout and login again to apply docker group changes
exit
```

### Step 3: Clone Repository on EC2

Connect again and clone the repository:

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>

# Create directory
mkdir -p /home/ubuntu/blog
cd /home/ubuntu/blog

# Clone repository
git clone https://github.com/YOUR_USERNAME/Blog.git .

# For staging server, checkout staging branch
git checkout staging

# For production server, checkout main branch
git checkout main
```

### Step 4: Configure Environment Variables

On each EC2 instance, create a `.env` file if needed for sensitive data:

```bash
cd /home/ubuntu/blog
nano .env
```

Add any environment-specific variables.

### Step 5: Initial Deployment

Start the application manually for the first time:

```bash
cd /home/ubuntu/blog
docker-compose up -d
```

Verify the deployment:
```bash
docker-compose ps
curl http://localhost:3000/health
curl http://localhost:8080
```

---

## GitHub Secrets Configuration

Add these secrets to your GitHub repository:

### Go to: Repository → Settings → Secrets and variables → Actions → New repository secret

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | IAM user access key | AKIAIOSFODNN7EXAMPLE |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key | wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY |
| `AWS_REGION` | AWS region | us-east-1 |
| `STAGING_EC2_HOST` | Staging EC2 public IP/hostname | 54.123.45.67 |
| `PRODUCTION_EC2_HOST` | Production EC2 public IP/hostname | 34.123.45.67 |
| `EC2_USER` | EC2 SSH username | ubuntu |
| `EC2_SSH_PRIVATE_KEY` | Content of your .pem file | -----BEGIN RSA PRIVATE KEY----- ... |

### How to add SSH Private Key:
```bash
cat your-key.pem
# Copy the entire output including the BEGIN and END lines
```

---

## Elastic IP (Optional but Recommended)

To avoid IP changes when instances restart:

1. Go to EC2 → Elastic IPs
2. Allocate 2 new Elastic IPs (one for each environment)
3. Associate them with your EC2 instances
4. Update GitHub secrets with the Elastic IPs

---

## Domain Configuration (Optional)

If you have a domain:

1. Go to Route 53 (or your DNS provider)
2. Create A records:
   - `staging.yourdomain.com` → Staging EC2 IP
   - `yourdomain.com` or `www.yourdomain.com` → Production EC2 IP

3. Update security groups to allow HTTPS (443)

4. Install SSL certificate using Let's Encrypt:
```bash
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com
```

---

## Testing the CI/CD Pipeline

### Test Staging Deployment:
```bash
git checkout dev
# Make some changes
git add .
git commit -m "Test staging deployment"
git push origin dev

# Merge to staging
git checkout staging
git merge dev
git push origin staging
```

The GitHub Actions workflow will:
1. Build and test the application
2. Deploy to the staging EC2 instance

### Test Production Deployment:
```bash
git checkout staging
# Test everything works
git checkout main
git merge staging
git push origin main
```

The GitHub Actions workflow will:
1. Build and test the application
2. Deploy to the production EC2 instance

---

## Monitoring Deployment

### Check GitHub Actions:
- Go to your repository → Actions tab
- Watch the workflow progress
- Check logs if there are errors

### Check on EC2:
```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
cd /home/ubuntu/blog
docker-compose logs -f
```

---

## Cost Estimation

### EC2 Instances (t3.medium):
- Staging: ~$30/month
- Production: ~$30/month

### Cost Optimization Tips:
- Use t2.micro for staging (~$8/month)
- Stop staging instance when not in use
- Use AWS Free Tier (750 hours/month of t2.micro for 12 months)

---

## Troubleshooting

### SSH Connection Issues:
```bash
# Ensure proper permissions on key file
chmod 400 your-key.pem

# Check security group allows your IP
# Update security group if your IP changed
```

### Docker Permission Errors:
```bash
# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu
# Logout and login again
```

### Port Already in Use:
```bash
# Check what's using the port
sudo lsof -i :3000
# Stop the conflicting service or use different ports
```

### Database Connection Issues:
```bash
# Check if postgres container is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

---

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use AWS Secrets Manager** for sensitive data in production
3. **Enable MFA** on AWS account
4. **Regularly update** EC2 instances: `sudo apt update && sudo apt upgrade`
5. **Use HTTPS** in production with SSL certificates
6. **Restrict SSH access** to specific IP addresses
7. **Use strong passwords** for database
8. **Enable CloudWatch** for monitoring and alerts
9. **Regular backups** of PostgreSQL data
10. **Use IAM roles** with minimum required permissions

---

## Next Steps

1. ✅ Create AWS account
2. ✅ Launch EC2 instances (staging and production)
3. ✅ Configure security groups
4. ✅ Install Docker and dependencies on EC2
5. ✅ Clone repository on EC2 instances
6. ✅ Configure GitHub Secrets
7. ✅ Test manual deployment on EC2
8. ✅ Test CI/CD pipeline with a push to staging
9. ✅ Test CI/CD pipeline with a push to main
10. ✅ (Optional) Configure domain and SSL

---

## Support Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PostgreSQL on Docker](https://hub.docker.com/_/postgres)
