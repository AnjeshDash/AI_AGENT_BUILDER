# AI Agent Builder Platform

A powerful full-stack platform for building, managing, and deploying AI agents using Next.js, React, Convex, and AI SDKs.

## 🚀 Features

- **Agent Builder**: Visual workflow builder with React Flow
- **AI Integration**: Support for Google Gemini and OpenRouter APIs
- **Authentication**: Clerk-based user authentication
- **Database**: Convex for real-time data management
- **Protection**: Arcjet for rate limiting and abuse protection
- **Chat Interface**: Real-time chat UI for testing agents
- **Code Generation**: Auto-generate deployable code for your agents
- **Templates**: Pre-built agent templates to get started quickly

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- A Clerk account for authentication
- A Convex account for database
- An Arcjet account for protection
- Google Gemini API key OR OpenRouter API key

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-agent-builder-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From Clerk dashboard
   - `CLERK_SECRET_KEY`: From Clerk dashboard
   - `NEXT_PUBLIC_CONVEX_URL`: From Convex dashboard
   - `ARCJET_KEY`: From Arcjet dashboard
   - `GOOGLE_API_KEY` or `OPENROUTER_API_KEY`: Your AI API key

4. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will create the necessary database schema and functions.

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── agent-builder/       # Agent builder interface
│   ├── api/                 # API routes
│   ├── Dashboard/           # Dashboard pages
│   ├── config/              # Configuration files
│   └── context/             # React contexts
├── components/              # Reusable UI components
├── convex/                  # Convex database functions
└── public/                  # Static assets
```

## 🔧 Configuration

### Clerk Setup
1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable key and secret key to `.env.local`

### Convex Setup
1. Create an account at [convex.dev](https://convex.dev)
2. Create a new project
3. Run `npx convex dev` to deploy your schema
4. Copy the deployment URL to `.env.local`

### Arcjet Setup
1. Create an account at [arcjet.com](https://arcjet.com)
2. Get your API key
3. Add it to `.env.local`

### AI API Setup
Choose one of the following:

**Google Gemini:**
1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add `GOOGLE_API_KEY` to `.env.local`

**OpenRouter:**
1. Get API key from [OpenRouter](https://openrouter.ai)
2. Add `OPENROUTER_API_KEY` to `.env.local`

## 🚢 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Add Environment Variables**
   - Add all variables from `.env.local` to Vercel's environment variables

4. **Deploy Convex**
   ```bash
   npx convex deploy --prod
   ```

5. **Deploy**
   - Vercel will automatically deploy on push
   - Or click "Deploy" in the dashboard

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Make sure to:
- Set all environment variables
- Run `npm run build` successfully
- Deploy Convex separately

## 📚 Usage

### Creating an Agent

1. Navigate to Dashboard
2. Click "Create" button
3. Enter agent name
4. Build your workflow using the visual builder
5. Configure each node's settings
6. Click "Reboot Agent" in preview to generate agent config
7. Test your agent in the chat interface
8. Click "Publish" to generate deployable code

### Using Templates

1. Go to Dashboard
2. Click on "Templates" tab
3. Select a template
4. Customize as needed

## 🛡️ Security

- All API keys are stored server-side only
- Rate limiting via Arcjet
- Authentication via Clerk
- Secure database access via Convex

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the documentation
- Open an issue on GitHub
- Contact support

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Database by [Convex](https://convex.dev)
- Authentication by [Clerk](https://clerk.com)
- Protection by [Arcjet](https://arcjet.com)
- UI components by [Radix UI](https://radix-ui.com)
