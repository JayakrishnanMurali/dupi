import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-slate-900 text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold tracking-tight text-white mb-4">
            <span className="text-blue-400">Dupi</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Generate mock APIs from TypeScript interfaces instantly
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl">
          <Link
            className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 text-white hover:bg-white/20 transition-colors border border-white/20"
            href="/create"
          >
            <h3 className="text-2xl font-bold">Create Project →</h3>
            <div className="text-lg">
              Upload TypeScript interfaces and generate mock APIs with realistic data
            </div>
          </Link>
          
          <Link
            className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 text-white hover:bg-white/20 transition-colors border border-white/20"
            href="/projects"
          >
            <h3 className="text-2xl font-bold">My Projects →</h3>
            <div className="text-lg">
              Manage and view all your active mock API projects
            </div>
          </Link>
          
          <Link
            className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 text-white hover:bg-white/20 transition-colors border border-white/20"
            href="/docs"
          >
            <h3 className="text-2xl font-bold">Documentation →</h3>
            <div className="text-lg">
              Learn how to integrate Dupi with your development workflow
            </div>
          </Link>
        </div>
        
        <div className="mt-12 text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Define Interface</h3>
              <p className="text-slate-300">Paste your TypeScript interface or upload a file</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Generate API</h3>
              <p className="text-slate-300">Get a live API endpoint with realistic mock data</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Integrate</h3>
              <p className="text-slate-300">Use the URL in your app, switch to real API when ready</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
