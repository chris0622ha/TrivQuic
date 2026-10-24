import Legal from '../legal-shared';
export const metadata = { title: 'Privacy Policy — TrivQuic' };
export default function PrivacyPage() {
  return <Legal title="Privacy Policy"
    intro="TrivQuic is a trivia game. This page explains what we collect, why, who receives it, and how long we keep it. Children under 13 get a limited experience described in our Children's Privacy page."
    sections={[
      { h:'1. Age check', p:['When you first open TrivQuic we ask for your birth year without suggesting an answer. If you are under 13, or skip the question, you are treated as a child: you can play, but you cannot sign in, set a name, appear on leaderboards, or use friends and duels.'] },
      { h:'2. What we collect from players 13 and older who sign in', ul:[
        'Google sign-in details: your email address and Google account ID, through Firebase Authentication. If you choose "Sign in with tqak", we receive an ID derived from your tqak account; accounts that a parent created for a child cannot sign in.',
        'Your chosen username, scores, achievements, friends, duel challenges and reports you send.',
        'Login history: the time and length of each sign-in, used for security and abuse prevention.',
        'A push-notification token, only if you turn notifications on.',
      ] },
      { h:'3. What we collect from everyone', ul:[
        'Your age-check answer, stored only in your browser.',
        'Quiz settings and progress kept in your browser (local storage).',
        'Hosting and security logs kept by our host. We do not run advertising or analytics trackers.',
      ] },
      { h:'4. Who receives data', p:['Only the service providers that run the game: Google Firebase (sign-in and database) and Vercel (hosting). They process data for us and may not use it for their own purposes. We do not sell personal information, show ads, or share it for advertising or AI training.'] },
      { h:'5. How long we keep it', ul:[
        'Account data (profile, scores, friends, achievements): until you delete your account, or after 24 months with no sign-in, whichever comes first.',
        'Login history: up to 12 months.',
        'Reports and moderation records: up to 12 months after they are resolved.',
        'Browser-stored data stays on your device until you clear it.',
        'Children\'s information is not collected on our servers.',
      ] },
      { h:'6. Security', p:['Access to the database is limited to the owner and protected by sign-in and Firebase security rules. Data is encrypted in transit. We review access and rules when features change and fix problems promptly. No system is perfectly secure.'] },
      { h:'7. Your choices', p:['You can ask us to show, correct or delete your information at any time by email, and you can clear browser data yourself. Parents can make the same requests for a child.'] },
      { h:'8. Changes', p:['If we change this policy in a way that matters, we will update the date above and, for anything affecting children, ask for parental consent where the law requires it.'] },
    ]} />;
}
