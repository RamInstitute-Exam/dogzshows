import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | JuzDog',
  description: 'Privacy Policy and data protection guidelines for JuzDog.',
};

export default function PrivacyPage() {
  return (
    <PageContainer>
      <BreadcrumbBanner
        slug="privacy"
        fallbackTitle="Privacy Policy"
        fallbackSubtitle="Your privacy is critically important to us. Learn how we collect and protect your data."
        fallbackImage="/images/contact_banner.png"
      />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-card border border-border p-8 md:p-12 rounded-3xl shadow-xl">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">1. Data Collection</h2>
            <p className="text-muted-foreground mb-6">
              We collect information that you provide directly to us, such as when you create an account, register for a dog show, or contact support. This includes your name, email address, phone number, and dog registration details.
            </p>

            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">2. Use of Information</h2>
            <p className="text-muted-foreground mb-6">
              We use the information we collect to provide, maintain, and improve our services, process transactions, send notifications, and communicate with you about updates and promotional offers.
            </p>

            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">3. Data Sharing</h2>
            <p className="text-muted-foreground mb-6">
              We do not sell or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating our platform, provided they agree to keep the information confidential.
            </p>

            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">4. Security</h2>
            <p className="text-muted-foreground mb-6">
              We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure.
            </p>

            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground mb-6">
              You have the right to access, update, or delete your personal information at any time. You can manage your preferences through your account dashboard or by contacting our support team.
            </p>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Last updated: January 2026<br />
                For any privacy-related concerns, please email us at <a href="mailto:info@juzdog.co" className="text-foreground font-bold hover:underline">info@juzdog.co</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
