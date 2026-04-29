import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, FileText, Mic, Share2, Search, Star, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-gray-900">AwesomeWork</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/search" className="text-sm text-gray-600 hover:text-gray-900">
            Search candidates
          </Link>
          <Link
            to="/start"
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight">
            Your career deserves better than a resume
          </h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
            AwesomeWork turns your resume and a 20-minute interview into a verified, searchable
            career profile that tells your real story.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mt-8">
            <Link
              to="/start"
              className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              Start your profile <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/search"
              className="px-7 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors text-lg"
            >
              Search candidates
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="w-6 h-6 text-blue-600" />,
                step: 1,
                title: "Upload your resume",
                desc: "We extract your work history automatically.",
              },
              {
                icon: <Mic className="w-6 h-6 text-blue-600" />,
                step: 2,
                title: "Tell your story",
                desc: "A 20-minute voice interview surfaces your real contributions.",
              },
              {
                icon: <Share2 className="w-6 h-6 text-blue-600" />,
                step: 3,
                title: "Share a verified profile",
                desc: "Get a shareable link backed by evidence and peer references.",
              },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  {icon}
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Step {step}
                </span>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Works */}
      <section className="px-4 py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: <Star className="w-5 h-5 text-amber-500" />,
                title: "Real signal, not buzzwords",
                desc: "Interview-extracted stories reveal what you actually did — not what you think recruiters want to hear.",
              },
              {
                icon: <Shield className="w-5 h-5 text-green-500" />,
                title: "Evidence-backed claims",
                desc: "Attach files, links, or context to every claim so your achievements are verifiable, not just asserted.",
              },
              {
                icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
                title: "Peer references in context",
                desc: "References answer questions about your specific contributions, not generic letters.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 space-y-3 border">
                <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Recruiters */}
      <section className="px-4 py-20 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">For recruiters & talent teams</h2>
          <p className="text-gray-400 text-lg">Search across verified profiles in plain English.</p>

          <div className="bg-gray-800 rounded-xl p-4 text-left max-w-xl mx-auto">
            <div className="flex items-center gap-3 bg-gray-700 rounded-lg px-4 py-2.5">
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm">PM who scaled a product 0→1</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
            {[
              {
                name: "Jordan Kim",
                title: "Product Manager",
                snippet: "Led 0→1 launch of payments feature at Series B fintech, growing to $2M ARR.",
                score: 94,
              },
              {
                name: "Alex Chen",
                title: "Senior PM",
                snippet: "Owned product roadmap at B2B SaaS startup, drove 3× revenue growth in 18 months.",
                score: 88,
              },
            ].map((c) => (
              <div key={c.name} className="bg-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.title}</p>
                  </div>
                  <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full font-medium">
                    {c.score}% match
                  </span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{c.snippet}</p>
              </div>
            ))}
          </div>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Try the search <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="font-bold text-gray-900">AwesomeWork</span>
        </div>
        <p className="text-sm text-gray-400">The career profile a resume can't replace.</p>
      </footer>
    </div>
  );
}
