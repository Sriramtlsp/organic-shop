# Server Hosting & Deployment Guide

## 🚀 Quick Start Deployment Options

### Option 1: Heroku (Recommended for Beginners)

#### Prerequisites
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Create a [Heroku account](https://signup.heroku.com/)
3. Install [Git](https://git-scm.com/) if not already installed

#### Step-by-Step Deployment

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create your-organic-shop-name
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-atlas-connection-string"
   heroku config:set JWT_SECRET="your-super-secret-jwt-key"
   heroku config:set SESSION_SECRET="your-session-secret-key"
   heroku config:set NODE_ENV="production"
   ```

5. **Deploy to Heroku**
   ```bash
   git push heroku main
   ```

6. **Open Your App**
   ```bash
   heroku open
   ```

### Option 2: Railway (Modern & Easy)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**
   - Go to Railway dashboard
   - Add your environment variables in the Variables tab

### Option 3: Render (Free Tier Available)

1. **Connect GitHub Repository**
   - Push your code to GitHub
   - Connect your GitHub account to Render

2. **Create Web Service**
   - Select your repository
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Add Environment Variables**
   - Add all your `.env` variables in Render dashboard

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier available)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password

### Step 3: Update Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/organic-shop?retryWrites=true&w=majority
```

## 🔧 VPS Deployment (DigitalOcean/AWS)

### Step 1: Create VPS Instance
1. Create a Ubuntu 20.04+ droplet
2. Connect via SSH

### Step 2: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Web Server)
sudo apt install nginx -y
```

### Step 3: Deploy Application
```bash
# Clone your repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Install dependencies
npm install

# Create .env file with production values
nano .env

# Start with PM2
pm2 start server.js --name "organic-shop"
pm2 startup
pm2 save
```

### Step 4: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/organic-shop
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/organic-shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas database created
- [ ] Dependencies updated (`npm install`)
- [ ] Application tested locally
- [ ] Git repository initialized
- [ ] Procfile created (for Heroku)
- [ ] Package.json engines specified

## 🔍 Troubleshooting

### Common Issues

1. **Port Issues**
   - Ensure your server uses `process.env.PORT || 3000`
   - Check if port is available

2. **Database Connection**
   - Verify MongoDB connection string
   - Check network access in MongoDB Atlas

3. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json

## 💰 Cost Estimates

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Heroku | 550 hours/month | $7+/month |
| Railway | $5 credit | Pay-as-you-go |
| Render | 750 hours/month | $7+/month |
| DigitalOcean | None | $4+/month |
| AWS | 12 months free | Varies |

## 📞 Support

If you encounter issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review hosting platform documentation

Happy deploying! 🎉
