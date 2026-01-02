"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { 
  Bot, 
  Zap, 
  Workflow, 
  Database, 
  ArrowRight, 
  Check,
  Sparkles,
  Code,
  Globe,
  Shield
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleClick = (path: string, showError = false) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSignedIn) {
      router.push("/Dashboard");
    } else if (showError) {
      toast.error("Please create an account to access the Dashboard", {
        description: "Sign up or sign in to get started",
        action: { label: "Sign Up", onClick: () => router.push("/sign-up") },
      });
    } else {
      router.push(path);
    }
  };

  const features = [
    {
      icon: Workflow,
      title: "Drag & Drop Builder",
      description: "Build complex AI agent workflows visually with our intuitive drag-and-drop interface. No coding required."
    },
    {
      icon: Bot,
      title: "AI-Powered Agents",
      description: "Create intelligent agents that can handle conversations, tasks, and workflows automatically."
    },
    {
      icon: Database,
      title: "Data Integration",
      description: "Connect your data sources, APIs, and databases to power your AI agents with real-time information."
    },
    {
      icon: Zap,
      title: "Fast & Scalable",
      description: "Deploy your agents instantly and scale them to handle millions of interactions without breaking a sweat."
    },
    {
      icon: Code,
      title: "Custom Tools",
      description: "Extend your agents with custom tools and integrations tailored to your specific needs."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and reliability to keep your agents and data safe."
    }
  ];

  const benefits = [
    "No coding skills required",
    "Deploy in minutes, not weeks",
    "Unlimited customization",
    "24/7 automated support",
    "Scalable infrastructure",
    "Real-time analytics"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Agentify</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleClick("/sign-in")}>Sign In</Button>
              <Button onClick={handleClick("/sign-up")}>Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-32 md:pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Build AI Agents Without Code
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Create Powerful AI Agents
            <span className="block text-primary mt-2">With Drag & Drop</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build, deploy, and scale AI agents visually. Connect tools, define workflows, and automate complex tasks—all without writing a single line of code.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="w-full sm:w-auto" onClick={handleClick("/sign-up")}>
              Start Building Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={handleClick("/Dashboard", true)}>
              View Dashboard
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Build AI Agents
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make AI agent creation simple, fast, and accessible to everyone.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-muted/50 rounded-3xl my-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Choose Agentify?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of developers and businesses building the next generation of AI-powered applications.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-base">{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button size="lg" onClick={handleClick("/sign-up")}>
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center">
              <div className="text-center p-8">
                <Workflow className="h-24 w-24 mx-auto mb-4 text-primary/50" />
                <p className="text-muted-foreground">Visual Workflow Builder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl mb-4">
              Ready to Build Your First AI Agent?
            </CardTitle>
            <CardDescription className="text-lg">
              Join thousands of creators building the future of AI automation
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="w-full sm:w-auto" onClick={handleClick("/sign-up")}>
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={handleClick("/sign-in")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-bold">Agentify</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Build AI agents with drag and drop. No code required.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li>
                  <button onClick={handleClick("/Dashboard", true)} className="hover:text-foreground transition-colors text-left text-sm text-muted-foreground">
                    Dashboard
                  </button>
                </li>
                <li><Link href="/Dashboard/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Support</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Agentify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
