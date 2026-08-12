import { LegalPage } from '@/components/legal-page';

export default function Privacy() {
    return (
        <LegalPage title="Privacy Policy">
            <p>
                Your privacy is the foundation of OurSanad. Everything you share with us — your account details, your questionnaire answers, your
                session notes — is treated as strictly confidential.
            </p>
            <h2>What we collect</h2>
            <p>
                We collect the information you give us when you create an account (name, email, phone, date of birth), your onboarding preferences,
                and your booking history. We use it for one purpose: connecting you with the right specialist and running your sessions smoothly.
            </p>
            <h2>What we never do</h2>
            <p>
                We never sell your data. We never share what you tell your specialist with anyone outside the clinical team supervising your care.
                Session content stays between you, your specialist, and their certified supervisor.
            </p>
            <h2>Your control</h2>
            <p>
                You can update or delete your account at any time from your settings. If you delete your account, your personal data is removed from
                our systems except where the law requires us to keep it.
            </p>
            <h2>Questions</h2>
            <p>
                Write to us at <a href="mailto:hello@oursanad.com">hello@oursanad.com</a> — a human reads every message.
            </p>
        </LegalPage>
    );
}
