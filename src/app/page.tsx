
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = placeholderImages.find(p => p.id === 'hero-landing');

  const features = [
    'AI-Powered Financial Advice',
    'Real-time Spending Analysis',
    'Personalized Budgeting (50/30/20 Rule)',
    'Savings Goal Tracking',
    'Interactive Fintech Dashboard',
    'Secure Authentication with Firebase',
  ];

  if (!heroImage) {
    // Handle the case where the image is not found
    return <div>Error: Hero image not found.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-background via-background/80 to-accent/10 -z-10"></div>
      
      <header className="px-4 lg:px-6 h-16 flex items-center bg-transparent backdrop-blur-sm border-b border-white/5">
        <Link href="#" className="flex items-center justify-center">
          <Image src="https://i.ibb.co/wHk5fgy/Chat-GPT-Image-Dec-24-2025-03-48-49-PM.png" alt="Salary Guider Logo" width={32} height={32} className="h-8 w-8" />
          <span className="ml-2 text-xl font-bold">Salary Guider</span>
        </Link>
        <nav className="ml-auto flex gap-2 sm:gap-4">
          <Button asChild variant="ghost">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <Link href="/login">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-secondary/20 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_650px]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl xl:text-7xl/none font-headline bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-300">
                    Take Control of Your Finances with AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Salary Guider provides personalized insights and intelligent
                    budgeting to help you achieve your financial goals.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:scale-105">
                    <Link href="/login">Sign Up for Free</Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={650}
                  height={433}
                  data-ai-hint={heroImage.imageHint}
                  className="relative mx-auto aspect-[3/2] overflow-hidden rounded-xl object-cover sm:w-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background/30 border-t border-white/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground font-semibold">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl font-headline">
                  Everything You Need to Succeed
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is packed with features designed to empower your
                  financial journey.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none pt-12">
              {features.map((feature) => (
                <div key={feature} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                  <Card className="relative h-full bg-card/80 backdrop-blur-sm border border-white/10 transition-all duration-300 group-hover:border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-start gap-4 text-lg font-medium">
                        <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-white/5">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Salary Guider. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
