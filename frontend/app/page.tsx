import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050b14] text-white selection:bg-green-500/30">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/10 bg-[#050b14]/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="DealNest Logo"
              width={150}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-green-400 transition-colors">Services</a>
            <a href="#how-it-works" className="hover:text-green-400 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-green-400 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-white text-gray-300 transition-colors">Sign in</Link>
            <Link href="/register">
              <Button className="bg-green-500 hover:bg-green-400 text-black font-semibold rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-green-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Escrow payments upgraded
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Secure payments for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
              Nigerian creators.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            DealNest is the safest way to hire or get hired. We hold the funds until the job is done right. No more stories.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 pb-12">
            <Link href="/register">
              <Button size="lg" className="bg-green-500 hover:bg-green-400 text-black h-14 px-8 rounded-full text-lg font-semibold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all">
                Create Account <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
                <Zap className="mr-2 w-5 h-5 fill-white/20" /> How it works
              </Button>
            </Link>
          </div>

          {/* Hero Image / UI Mockup */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-transparent to-transparent z-10 h-full w-full" />
            <div className="border border-white/10 bg-[#0A101A]/50 backdrop-blur-xl rounded-2xl p-4 overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8">
                <div className="space-y-6 text-left">
                  <div className="bg-[#111827] border border-white/5 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400 text-sm">Escrow Balance</span>
                      <span className="text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded">Active</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">₦450,000.00</div>
                    <div className="text-sm text-gray-500">Held for "E-commerce Website Redesign"</div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-[#111827] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center">
                      <Shield className="w-6 h-6 text-green-500 mb-2" />
                      <span className="text-sm font-medium">Safe</span>
                    </div>
                    <div className="flex-1 bg-[#111827] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center">
                      <Zap className="w-6 h-6 text-yellow-500 mb-2" />
                      <span className="text-sm font-medium">Fast</span>
                    </div>
                  </div>
                </div>

                {/* Fake Mobile UI */}
                <div className="relative mx-auto border-gray-800 bg-gray-900 border-[8px] rounded-[2.5rem] h-[400px] w-[220px] shadow-xl flex flex-col overflow-hidden">
                  <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[11px] top-[72px] rounded-s-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[11px] top-[124px] rounded-s-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[11px] top-[178px] rounded-s-lg"></div>
                  <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[11px] top-[142px] rounded-e-lg"></div>
                  <div className="rounded-[2rem] overflow-hidden w-full h-full bg-[#050b14] relative">
                    {/* Mobile Header */}
                    <div className="h-14 bg-green-600 flex items-center justify-center text-sm font-bold">DealNest Mobile</div>
                    <div className="p-4 space-y-4">
                      <div className="h-24 bg-[#111827] rounded-xl border border-white/10 p-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 mb-2"></div>
                        <div className="h-3 w-2/3 bg-gray-700 rounded"></div>
                      </div>
                      <div className="h-10 bg-green-600 rounded-lg w-full"></div>
                      <div className="space-y-2">
                        <div className="h-10 bg-[#111827] rounded-lg w-full border border-white/5"></div>
                        <div className="h-10 bg-[#111827] rounded-lg w-full border border-white/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Social Proof */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider">Trusted by hustlers from</p>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-50">
            {/* Placeholders for logos */}
            <h3 className="text-xl font-bold text-gray-400">Lagos<span className="text-green-500">Devs</span></h3>
            <h3 className="text-xl font-bold text-gray-400">Abuja<span className="text-green-500">Creatives</span></h3>
            <h3 className="text-xl font-bold text-gray-400">Tech<span className="text-green-500">Cabal</span></h3>
            <h3 className="text-xl font-bold text-gray-400">Pay<span className="text-green-500">Stack</span></h3>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24" id="features">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to <span className="text-green-500">deal safe.</span></h2>
            <p className="text-gray-400">We protect both the client and the freelancer. Funds are only released when you say so.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Escrow Protection", desc: "Your money is held in a secure vault until the work is approved." },
              { icon: CheckCircle, title: "Instant Release", desc: "Once approved, funds are sent instantly to your bank account." },
              { icon: Zap, title: "Dispute Resolution", desc: "We mediate fairly if things go wrong, protecting both parties." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-[#0A101A] border border-white/5 hover:border-green-500/30 transition-all hover:-translate-y-1">
                <feature.icon className="w-12 h-12 text-green-500 mb-6" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5" id="how-it-works">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple. Transparent. <span className="text-green-500">Secure.</span></h2>
            <p className="text-gray-400">Whether you're hiring or working, we've streamlined the process.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* For Clients */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 inline-block">For Clients</h3>
              {[
                { step: "1", title: "Post a Deal", desc: "Describe your project and set a fixed price." },
                { step: "2", title: "Fund Escrow", desc: "Deposit funds securely. We hold them, so you're protected." },
                { step: "3", title: "Approve & Release", desc: "Review the work. Only release payment when you're 100% satisfied." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 2 && <div className="absolute left-[19px] top-[40px] bottom-[-20px] w-0.5 bg-gray-800"></div>}
                  <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center font-bold text-green-500 shrink-0 relative z-10">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* For Freelancers */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 inline-block">For Freelancers</h3>
              {[
                { step: "1", title: "Accept a Deal", desc: "Find a project that matches your skills." },
                { step: "2", title: "Start Working", desc: "See that funding is secured before you lift a finger." },
                { step: "3", title: "Get Paid Instantly", desc: "Submit work, get approved, and withdraw to your bank immediately." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 2 && <div className="absolute left-[19px] top-[40px] bottom-[-20px] w-0.5 bg-gray-800"></div>}
                  <div className="w-10 h-10 rounded-full bg-green-900/20 border border-green-500/20 flex items-center justify-center font-bold text-green-400 shrink-0 relative z-10">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24" id="pricing">
        <div className="container mx-auto px-6">
          <div className="bg-[#0A101A] border border-white/10 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-3xl font-bold mb-4">Fair Pricing for everyone.</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  We don't charge monthly subscriptions or hidden fees. We only make money when you do.
                </p>
                <ul className="space-y-4">
                  {[
                    "No pickup fees",
                    "No withdrawal fees",
                    "Free dispute resolution",
                    "24/7 dedicated support"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#050b14] p-8 rounded-2xl border border-white/5 text-center shadow-2xl relative">
                <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">Flat Platform Fee</div>
                <div className="text-6xl font-extrabold text-white mb-2">5%</div>
                <p className="text-gray-500 text-sm">per completed deal</p>
                <div className="mt-8 pt-6 border-t border-white/5">
                  <p className="text-xs text-gray-400">
                    * Fees can be split or paid by the client.<br />
                    Capped at ₦5,000 for high-value deals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white/[0.02] border-t border-white/5" id="faq">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is my money safe?", a: "Absolutely. Funds are held in a secure escrow account and are only released to the freelancer when you approve the work. If you're not satisfied, you can open a dispute." },
              { q: "How do I get paid?", a: "Once the client approves your work, the funds are instantly credited to your DealNest wallet. You can withdraw to any Nigerian bank account immediately." },
              { q: "What happens if there is a dispute?", a: "We provide free dispute resolution. Our team reviews the evidence (chat history, deliverables) and makes a fair decision to either release funds or refund the client." },
              { q: "Can I use DealNest for small projects?", a: "Yes! DealNest is perfect for projects of any size, from quick logo designs to full-scale software development." }
            ].map((item, i) => (
              <div key={i} className="group border border-white/5 rounded-2xl bg-[#0A101A] overflow-hidden hover:border-green-500/30 transition-all">
                <details className="p-6 cursor-pointer">
                  <summary className="font-bold text-lg list-none flex justify-between items-center text-gray-200 group-hover:text-white transition-colors">
                    {item.q}
                    <span className="text-green-500 text-2xl font-light ml-4">+</span>
                  </summary>
                  <p className="text-gray-400 mt-4 leading-relaxed animate-in slide-in-from-top-2">
                    {item.a}
                  </p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/10 text-center text-gray-600 text-sm">
        <p>&copy; 2025 DealNest Inc. Built for the future of work.</p>
      </footer>
    </div>
  )
}
