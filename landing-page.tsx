import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Zap, Shield, BarChart3, Twitter, Facebook, Instagram, Linkedin, Github } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">StreamLine</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="/integrations" className="text-sm font-medium hover:text-primary">
              Integrations
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary hidden sm:block">
              Log in
            </Link>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 gradient-bg">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                    Streamline Your Workflow with Our Powerful SaaS Solution
                  </h1>
                  <p className="max-w-[600px] text-gray-200 md:text-xl">
                    Boost productivity, reduce costs, and scale your business with our all-in-one platform designed for
                    modern teams.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    <Link href="/demo">Request Demo</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="/placeholder.svg?height=550&width=550"
                width={550}
                height={550}
                alt="Dashboard Preview"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-white">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white">
                  Everything you need to succeed
                </h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed">
                  Our platform provides all the tools you need to streamline your workflow, collaborate with your team,
                  and grow your business.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <Card className="bg-background border-gray-800">
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-white">Advanced Analytics</CardTitle>
                  <CardDescription className="text-gray-400">
                    Gain valuable insights with our powerful analytics dashboard. Track performance, identify trends,
                    and make data-driven decisions.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-background border-gray-800">
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-white">Enterprise Security</CardTitle>
                  <CardDescription className="text-gray-400">
                    Keep your data safe with our enterprise-grade security features. End-to-end encryption, role-based
                    access control, and more.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-background border-gray-800">
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-white">Seamless Integration</CardTitle>
                  <CardDescription className="text-gray-400">
                    Connect with your favorite tools and services. Our platform integrates with over 100+ apps and
                    services out of the box.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-white">Testimonials</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white">
                  Trusted by thousands of companies
                </h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed">
                  Don't just take our word for it. Here's what our customers have to say about StreamLine.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
              <Card className="bg-secondary border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    "StreamLine has completely transformed how our team works. The analytics dashboard alone has helped
                    us increase our productivity by 30%."
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-4">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width={40}
                      height={40}
                      alt="Sarah Johnson"
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Sarah Johnson</p>
                      <p className="text-xs text-gray-400">CEO, TechCorp</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              <Card className="bg-secondary border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    "The seamless integration with our existing tools made the transition to StreamLine incredibly
                    smooth. Our team was up and running in no time."
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-4">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width={40}
                      height={40}
                      alt="Michael Chen"
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Michael Chen</p>
                      <p className="text-xs text-gray-400">CTO, InnovateCo</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-white">Pricing</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white">
                  Simple, transparent pricing
                </h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed">
                  Choose the plan that's right for you and your team. All plans include a 14-day free trial.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <Card className="bg-background border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Starter</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$29</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <CardDescription className="text-gray-400">
                    Perfect for small teams just getting started.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Up to 5 team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Basic analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">5GB storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Email support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
                </CardFooter>
              </Card>
              <Card className="border-primary bg-background">
                <CardHeader>
                  <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-white mb-2">Popular</div>
                  <CardTitle className="text-white">Professional</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$79</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <CardDescription className="text-gray-400">Ideal for growing teams that need more.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Up to 20 team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">20GB storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Custom integrations</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
                </CardFooter>
              </Card>
              <Card className="bg-background border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Enterprise</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$199</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <CardDescription className="text-gray-400">
                    For large organizations with specific needs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Unlimited team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Custom analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Unlimited storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">24/7 dedicated support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Advanced security features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-gray-300">Custom deployment options</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90">Contact Sales</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 gradient-bg">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white">
                  Ready to streamline your workflow?
                </h2>
                <p className="max-w-[600px] text-gray-200 md:text-xl/relaxed">
                  Join thousands of teams that use StreamLine to boost productivity and scale their business.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                  <Link href="/signup">Start Your Free Trial</Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link href="/demo">Schedule a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-800 py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-white">StreamLine</span>
          </div>
          <p className="text-center text-sm text-gray-400 md:text-left">
            &copy; {new Date().getFullYear()} StreamLine, Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-gray-400 hover:text-white">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
