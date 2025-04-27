import React from 'react';
import { FaDiscord, FaGithub, FaCode, FaPalette, FaUserCircle, FaBell } from 'react-icons/fa';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="card p-6 sticky top-8">
            <nav className="space-y-2">
              <a href="#account" className="flex items-center gap-3 text-xl font-medium p-3 bg-gray-800 rounded">
                <FaUserCircle />
                <span>Account</span>
              </a>
              <a href="#discord" className="flex items-center gap-3 text-xl font-medium p-3 hover:bg-gray-800 rounded">
                <FaDiscord />
                <span>Discord Integration</span>
              </a>
              <a href="#github" className="flex items-center gap-3 text-xl font-medium p-3 hover:bg-gray-800 rounded">
                <FaGithub />
                <span>GitHub Integration</span>
              </a>
              <a href="#editor" className="flex items-center gap-3 text-xl font-medium p-3 hover:bg-gray-800 rounded">
                <FaCode />
                <span>Editor Preferences</span>
              </a>
              <a href="#appearance" className="flex items-center gap-3 text-xl font-medium p-3 hover:bg-gray-800 rounded">
                <FaPalette />
                <span>Appearance</span>
              </a>
              <a href="#notifications" className="flex items-center gap-3 text-xl font-medium p-3 hover:bg-gray-800 rounded">
                <FaBell />
                <span>Notifications</span>
              </a>
            </nav>
          </div>
        </div>
        
        <div className="md:col-span-2 space-y-8">
          {/* Account Settings */}
          <section id="account" className="card p-6">
            <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
            
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                  GD
                </div>
                <div>
                  <h3 className="text-xl font-medium">Profile Picture</h3>
                  <p className="text-gray-300 text-sm">Recommended size: 500x500 pixels</p>
                </div>
                <button className="btn-secondary ml-auto px-4 py-2">Upload</button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-discord-blurple"
                    placeholder="Your name"
                    defaultValue="Guest Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-discord-blurple"
                    placeholder="Your email"
                    defaultValue="guest@example.com"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-4">Password</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-discord-blurple"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-discord-blurple"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="btn-primary px-6 py-2">Save Changes</button>
            </div>
          </section>
          
          {/* Discord Integration */}
          <section id="discord" className="card p-6">
            <h2 className="text-2xl font-semibold mb-6">Discord Integration</h2>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-medium">Connect Discord Account</h3>
                <p className="text-gray-300">Link your Discord account to easily test and deploy bots</p>
              </div>
              <button className="btn-discord px-6 py-2 flex items-center gap-2">
                <FaDiscord />
                <span>Connect</span>
              </button>
            </div>
            
            <h3 className="text-xl font-medium mb-4">Bot Tokens</h3>
            <p className="text-gray-300 mb-4">Manage your Discord bot tokens for testing and deployment</p>
            
            <div className="card bg-gray-800 p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Server Helper</h4>
                  <p className="text-sm text-gray-400">Added on April 26, 2025</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary text-sm px-3 py-1">Edit</button>
                  <button className="btn-secondary text-sm px-3 py-1 text-red-500">Remove</button>
                </div>
              </div>
            </div>
            
            <button className="btn-secondary px-4 py-2">+ Add New Bot Token</button>
          </section>
          
          {/* GitHub Integration */}
          <section id="github" className="card p-6">
            <h2 className="text-2xl font-semibold mb-6">GitHub Integration</h2>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-medium">Connect GitHub Account</h3>
                <p className="text-gray-300">Connect your GitHub account to push generated bot code directly to repositories</p>
              </div>
              <button className="btn-github px-6 py-2 flex items-center gap-2 bg-gray-800">
                <FaGithub />
                <span>Connect</span>
              </button>
            </div>
            
            <h3 className="text-xl font-medium mb-4">Repository Settings</h3>
            <p className="text-gray-300 mb-4">Default repository settings for bot exports</p>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Default Visibility
                </label>
                <select className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-discord-blurple">
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Default Repository Name Format
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-discord-blurple"
                  placeholder="discord-bot-{name}"
                  defaultValue="discord-bot-{name}"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="btn-primary px-6 py-2">Save Changes</button>
            </div>
          </section>
          
          {/* Editor Preferences */}
          <section id="editor" className="card p-6">
            <h2 className="text-2xl font-semibold mb-6">Editor Preferences</h2>
            
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Code Editor Theme
                </label>
                <select className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-discord-blurple">
                  <option>Discord Dark</option>
                  <option>Night Owl</option>
                  <option>GitHub Dark</option>
                  <option>Dracula</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Font Size
                </label>
                <select className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-discord-blurple">
                  <option>12px</option>
                  <option>14px</option>
                  <option>16px</option>
                  <option>18px</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wrap-lines"
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700"
                  defaultChecked
                />
                <label htmlFor="wrap-lines" className="text-sm font-medium">
                  Wrap long lines
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-line-numbers"
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700"
                  defaultChecked
                />
                <label htmlFor="show-line-numbers" className="text-sm font-medium">
                  Show line numbers
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="btn-primary px-6 py-2">Save Changes</button>
            </div>
          </section>
          
          {/* Other settings sections can be added here */}
        </div>
      </div>
    </div>
  );
}