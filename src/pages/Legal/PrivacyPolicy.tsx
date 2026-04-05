import React from 'react';
import { Shield, Lock, Eye, FileText, Smartphone, Globe, Mail, MapPin, Phone, CreditCard } from 'lucide-react';

const PrivacyPolicy = () => {
    const sections = [
        {
            title: "1. Introduction",
            icon: <Shield className="w-6 h-6 text-blue-500" />,
            content: "Welcome to ai for job (\"we,\" \"our,\" or \"us\"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-powered interview platform."
        },
        {
            title: "2. Information We Collect",
            icon: <Eye className="w-6 h-6 text-blue-500" />,
            content: (
                <div className="space-y-4">
                    <p>We collect personal information that you voluntarily provide to us when you register on the platform, upload a resume, participate in Ai for jobs, or contact us. This may include:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <li className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm">Name, email, and contact details</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm">Professional resumes & skills</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm">Interview audio recordings</span>
                        </li>
                        <li className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm">Usage data and analytics</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "3. Payment Processing",
            icon: <CreditCard className="w-6 h-6 text-blue-500" />,
            content: "We use third-party payment processors to handle all monetary transactions. Currently, we utilize Razorpay and Stripe. These processors collect and store your credit card information and other payment details. Their use of your personal information is governed by their respective privacy policies, which we recommend you review."
        },
        {
            title: "4. How We Use Your Information",
            icon: <Globe className="w-6 h-6 text-blue-500" />,
            content: (
                <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span>To provide and maintain our Ai for job services.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span>To analyze resume quality and provide improvement suggestions.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span>To evaluate interview performance and provide feedback.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span>To process transactions and manage subscriptions via Stripe and Razorpay.</span>
                    </li>
                </ul>
            )
        },
        {
            title: "5. Data Security",
            icon: <Lock className="w-6 h-6 text-blue-500" />,
            content: "We implement industry-standard security measures, including SSL encryption and secure server architecture, to protect your data. Your payment information is never stored on our servers; it is handled entirely by our secure payment partners, Stripe and Razorpay."
        },
        {
            title: "6. Cookie Policy",
            icon: <Smartphone className="w-6 h-6 text-blue-500" />,
            content: "We use cookies to enhance your experience, analyze site traffic, and remember your settings. You can control cookie preferences through your browser settings. By continuing to use our platform, you consent to our use of cookies as described in this policy."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-blue-500/5 blur-[120px] rounded-full opacity-50 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 mb-6 shadow-sm">
                        <Shield className="w-3.5 h-3.5 mr-2 text-blue-500" />
                        <span className="text-sm font-semibold tracking-wide">PRIVACY CENTER</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                        Privacy <span className="text-blue-600">Policy</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                        Your trust is our most important asset. Learn how we handle your data with transparency and care.
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

                        {/* Footer Contact Card */}
                        <div className="mt-20 p-8 rounded-3xl bg-blue-600 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-4">Questions about your privacy?</h3>
                                <p className="text-blue-100 mb-8 max-w-md">Our legal team is here to help and clarify any concerns you might have regarding your data.</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                        <MapPin className="w-5 h-5 text-blue-200" />
                                        <span className="text-sm font-medium">Sonepat, Haryana</span>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                        <Mail className="w-5 h-5 text-blue-200" />
                                        <span className="text-sm font-medium">info@aiforjob.ai</span>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                        <Phone className="w-5 h-5 text-blue-200" />
                                        <span className="text-sm font-medium">+91 83077 17793</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
