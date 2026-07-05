import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | JuzDog',
  description: 'Terms and Conditions for using JuzDog services.',
};

export default function TermsPage() {
  return (
    <PageContainer>
      <BreadcrumbBanner
        slug="terms"
        fallbackTitle="Terms & Conditions"
        fallbackSubtitle="Please read these terms and conditions carefully before using our services."
        fallbackImage="/images/contact_banner.png"
      />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-card border border-border p-8 md:p-12 rounded-3xl shadow-xl">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-6">
              Welcome to JuzDog. By accessing our website and using our services, you agree to be bound by these Terms and Conditions.
            </p>

            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">2. Services</h2>
            <p className="text-muted-foreground mb-6">
              JuzDog provides a modern platform for dog show management, breed registration, and premium media gallery services. We reserve the right to modify or discontinue any service at our discretion.
            </p>

            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground mb-6">
              Users must ensure that all information provided during registration or when using our platform is accurate and up-to-date. Users are responsible for maintaining the confidentiality of their account credentials.
            </p>

            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">4. Intellectual Property</h2>
            <p className="text-muted-foreground mb-6">
              All content on this platform, including but not limited to images, text, logos, and design elements, is the intellectual property of JuzDog and its media partners. Unauthorized use or distribution is strictly prohibited.
            </p>

            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">5. Photography & Videography</h2>
            <p className="text-muted-foreground mb-6">
              By participating in events managed by or affiliated with JuzDog, you consent to being photographed and recorded. These media assets may be used for promotional purposes, included in our premium media gallery, or featured in our publications. Users uploading their own photography or videography represent that they hold the necessary rights and grant JuzDog a non-exclusive license to use, display, and distribute such content on our platform.
            </p>

            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">6. E-Magazines & Publications</h2>
            <p className="text-muted-foreground mb-6">
              Our e-magazines and related digital publications are provided for informational and entertainment purposes. While we strive for accuracy, we do not guarantee the completeness or reliability of the information within. Subscriptions and single purchases of digital magazines are subject to our refund policy. Reproducing or redistributing our magazine content without explicit permission is strictly prohibited.
            </p>

            <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-6">
              JuzDog shall not be held liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services.
            </p>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Last updated: January 2026<br />
                If you have any questions about these Terms, please <a href="/contact" className="text-foreground font-bold hover:underline">contact us</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
