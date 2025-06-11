import React from 'react';
import { Button } from './ui/button';
import { Github, Linkedin, Mail } from 'lucide-react';

export const MeetCreator = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">About Jobtrcker</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Jobtrcker is a free, anonymous job-tracking platform designed to help job seekers stay organized, 
            share advice, and connect through real, unfiltered experiences.
          </p>
        </div>

        {/* Creator Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Built by One, Guided by AI</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Hi, I'm <span className="font-semibold text-blue-600 dark:text-blue-400">John Mark Papelirin</span> — 
              a 24-year-old Full Stack Web Developer from Catbalogan City, Samar.
            </p>
            
            <p className="text-gray-600 dark:text-gray-300">
              I created Jobtrcker from the ground up with the help of Cursor, an AI pair programmer that helped 
              speed up the development process. From design to deployment, this project reflects my passion for 
              solving problems through code, building meaningful tools, and learning by doing.
            </p>
            
            <p className="text-gray-600 dark:text-gray-300">
              I graduated from Samar State University with a Bachelor of Science in Computer Engineering.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-4 pt-4">
            <a 
              href="https://github.com/ZapChainDev" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Github className="h-5 w-5" />
              </Button>
            </a>
            <a 
              href="https://www.linkedin.com/in/john-mark-papelirin-124085253/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Linkedin className="h-5 w-5" />
              </Button>
            </a>
            <a 
              href="mailto:papelirinjohnmarkdote@gmail.com"
            >
              <Button variant="outline" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Mail className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Why Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Why I Built Jobtrcker</h2>
          
          <p className="text-gray-600 dark:text-gray-300">
            Job hunting is stressful — juggling applications, interviews, and rejections can be draining. 
            I wanted a tool that felt personal, pressure-free, and supportive.
          </p>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Jobtrcker lets you:</h3>
            
            <div className="grid gap-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📋</span>
                <p className="text-gray-600 dark:text-gray-300">Track applications easily</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💬</span>
                <p className="text-gray-600 dark:text-gray-300">Talk in real-time through anonymous global chat</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🧠</span>
                <p className="text-gray-600 dark:text-gray-300">Share experiences via a simple, text-only forum</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 