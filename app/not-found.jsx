"use client";

import Link from "next/link";
import { Home, ArrowLeft, MessageCircle, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-color/5 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-primary/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="max-w-2xl w-full text-center z-10">
        {/* Large 404 with Gradient */}
        <div className="relative inline-block mb-8">
          <h1 className="text-[12rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/80 to-accent-color opacity-20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center translate-y-4">
            <div className="bg-white/80 dark:bg-bg-secondary/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-border-color transform transition-transform hover:scale-105 duration-500">
              <Search className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold text-text-primary mb-2">
                Lost in Thought?
              </h2>
              <p className="text-text-secondary text-lg">
                We couldn't find the page you're looking for. <br />
                It might have been moved or doesn't exist anymore.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-20">
          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-semibold shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-bg-secondary text-text-primary border border-border-color rounded-full font-semibold shadow-md hover:bg-hover-bg hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="mt-12 pt-8 border-t border-border-color/50 flex flex-col items-center gap-4">
          <p className="text-text-tertiary">Need immediate assistance?</p>
          <Link
            href="/induction"
            className="flex items-center gap-2 text-primary font-medium hover:underline group"
          >
            <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Talk to our support team
          </Link>
        </div>
      </div>

      {/* Subtle Bottom Text */}
      <p className="absolute bottom-8 left-0 right-0 text-center text-text-tertiary text-sm">
        &copy; {new Date().getFullYear()} Vanquish. All rights reserved.
      </p>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
