import React from 'react';
import { Cookie, Settings, Shield, Globe, Eye, FileText, Smartphone } from 'lucide-react';

const CookiePolicy = () => {
    const sections = [
        {
            title: "1. What Are Cookies?",
            icon: <Cookie className="w-6 h-6 text-blue-500" />,
            content: "Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently, as well as to provide reporting information and personalized experiences."
        },
        {
            title: "2. How We Use Cookies",
            icon: <Globe className="w-6 h-6 text-blue-500" />,
            content: (
                <div className="space-y-4">
                    <p>We use cookies for several important reasons, including:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <li className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm"><strong>Essential Cookies:</strong> Necessary for the website to function properly.</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm"><strong>Performance Cookies:</strong> Help us understand how visitors interact with the site.</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm"><strong>Functional Cookies:</strong> Allow the site to remember your choices and preferences.</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm"><strong>Targeting Cookies:</strong> Used to deliver relevant advertisements.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "3. Third-Party Cookies",
            icon: <Eye className="w-6 h-6 text-blue-500" />,
            content: "In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service, deliver advertisements on and through the service, and so on. These third parties include analytics providers and payment processors."
        },
        {
            title: "4. Your Choices Regarding Cookies",
            icon: <Settings className="w-6 h-6 text-blue-500" />,
            content: (
                <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span>You can choose to accept or decline cookies through your browser settings.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span>Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span>Please note that if you choose to decline cookies, you may not be able to fully experience the interactive features of our services or websites you visit.</span>
                    </li>
                </ul>
            )
        },
        {
            title: "5. Updates to This Policy",
            icon: <FileText className="w-6 h-6 text-blue-500" />,
            content: "We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-500/5 blur-[120px] rounded-full opacity-50 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 mb-6 shadow-sm">
                        <Cookie className="w-3.5 h-3.5 mr-2 text-blue-500" />
                        <span className="text-sm font-semibold tracking-wide">COOKIE POLICY</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                        Cookie <span className="text-blue-600">Policy</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                        Learn how we use cookies to improve your experience on our platform.
                    </p>
                    <p className="mt-8 text-sm font-medium text-gray-400 uppercase tracking-widest">
                        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sticky Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-32 space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-4">Contents</h4>
                            {sections.map((section, idx) => (
                                <a
                                    key={idx}
                                    href={`#section-${idx}`}
                                    className="block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                >
                                    {section.title.split('. ')[1]}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-16">
                        {sections.map((section, idx) => (
                            <section key={idx} id={`section-${idx}`} className="scroll-mt-32 group">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        {section.title}
                                    </h2>
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 leading-relaxed pl-16">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
